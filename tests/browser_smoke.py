"""Local browser checks. All form requests are mocked; no emails are sent."""
from pathlib import Path
import json
import mimetypes
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    options = {"headless": True}
    if os.environ.get("LUWA_BROWSER_PATH"):
        options["executable_path"] = os.environ["LUWA_BROWSER_PATH"]
    browser = pw.chromium.launch(**options)
    context = browser.new_context(service_workers="block", reduced_motion="reduce")
    context.add_init_script("window.open = url => { window.lastContactUrl = url; window.openCalls = (window.openCalls || 0) + 1; return null; };")
    page = context.new_page()
    errors = []
    requests = []
    page.on("pageerror", lambda error: errors.append(str(error)))

    def route_request(route):
        url = route.request.url
        if route.request.method == "POST":
            requests.append(url)
            route.abort()
            return
        if not url.startswith("http://luwa.local/"):
            route.abort()
            return
        filename = url.split("http://luwa.local/", 1)[1].split("?", 1)[0] or "index.html"
        file = ROOT / filename
        if file.is_file():
            route.fulfill(path=str(file), content_type=mimetypes.guess_type(str(file))[0] or "application/octet-stream")
        else:
            route.fulfill(status=404, body="Missing file")

    context.route("**/*", route_request)
    pages = ["index", "about", "services", "gallery", "blog", "contact", "privacy", "terms", "owner-guide", "analytics"]
    for width in (1440, 390):
        page.set_viewport_size({"width": width, "height": 900})
        for name in pages:
            page.goto("http://luwa.local/" + name + ".html", wait_until="networkidle")
            assert page.locator("#newsletterForm, #newsEmail").count() == 0
            if page.locator(".footer .social-pill").count():
                icon = page.locator(".footer .social-pill svg").first
                assert icon.evaluate("el => getComputedStyle(el).color") == "rgb(27, 24, 21)"
            if width == 390:
                page.locator("#menuToggle").click()
                assert page.locator("#menuToggle").get_attribute("aria-expanded") == "true"
                page.keyboard.press("Escape")
                assert page.locator("#menuToggle").get_attribute("aria-expanded") == "false"
            print("PASS page and navigation:", name, width, flush=True)

    # Both channels prepare full messages locally and preserve entered details.
    page.goto("http://luwa.local/contact.html", wait_until="networkidle")
    for key, value in {"fname":"Test", "lname":"Visitor", "email":"test@example.com", "phone":"0123456789", "message":"Local test only"}.items():
        page.locator("#" + key).fill(value)
    page.locator("#eventType").select_option(label="Wedding")
    page.locator("#enquiryForm .consent input").check()
    page.locator("#enquiryForm button[type=submit]").click()
    page.locator("#formMsg.show").wait_for()
    assert page.locator("#email").input_value() == "test@example.com"
    assert page.evaluate("window.lastContactUrl.startsWith('https://wa.me/447823683189?text=')")
    assert "Press Send" in page.locator("#formMsg").inner_text()
    assert page.locator("#formMsg a[href^='https://wa.me/']").count() == 1
    page.locator("[data-enquiry-email]").click()
    assert page.evaluate("window.lastContactUrl.startsWith('mailto:eventsbyluwa22@gmail.com?')")
    assert page.locator("#message").input_value() == "Local test only"
    assert not requests
    print("PASS enquiry WhatsApp and email drafts; preserved details; no background submission", flush=True)

    page.locator("#bbBook").click()
    page.locator("#bkName").fill("Test Visitor")
    page.locator("#bkPhone").fill("0123456789")
    page.locator("#bkEmail").fill("invalid")
    page.locator(".booking-form .consent input").check()
    count = page.evaluate("window.openCalls || 0")
    page.locator(".booking-form button[type=submit]").click()
    assert page.evaluate("window.openCalls || 0") == count
    page.locator("#bkEmail").fill("test@example.com")
    page.locator(".booking-form button[type=submit]").click()
    assert page.evaluate("window.lastContactUrl.startsWith('https://wa.me/447823683189?text=')")
    assert "Press Send" in page.locator("#bkDone").inner_text()
    page.locator("[data-booking-email]").click()
    assert page.evaluate("window.lastContactUrl.startsWith('mailto:eventsbyluwa22@gmail.com?')")
    assert page.locator("#bkName").input_value() == "Test Visitor"
    assert not requests
    page.keyboard.press("Escape")
    assert page.locator(".booking-modal").get_attribute("aria-hidden") == "true"
    print("PASS booking validation and both contact channels; no background submission", flush=True)

    page.goto("http://luwa.local/gallery.html", wait_until="networkidle")
    page.locator(".filter-row").get_by_role("button", name="Ushering", exact=True).click()
    assert page.locator(".gal-item:visible").count() > 0
    page.locator(".gal-item:visible").first.click()
    assert page.locator("#lightbox").get_attribute("aria-hidden") == "false"
    page.keyboard.press("Escape")
    assert page.locator("#lightbox").get_attribute("aria-hidden") == "true"
    assert not errors, errors
    print("PASS gallery filtering and lightbox; no JavaScript errors", flush=True)
    browser.close()
