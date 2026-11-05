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
    context.add_init_script("window.open = url => { window.lastWhatsAppUrl = url; return null; };")
    page = context.new_page()
    errors = []
    requests = []
    response_mode = "rejected"
    page.on("pageerror", lambda error: errors.append(str(error)))

    def route_request(route):
        url = route.request.url
        if url.startswith("https://formsubmit.co/ajax/"):
            requests.append(route.request.post_data_json)
            body = {"success": response_mode == "accepted", "message": "Test response"}
            route.fulfill(content_type="application/json", body=json.dumps(body))
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

    # Enquiry rejection retains data; retry only resets on provider confirmation.
    page.goto("http://luwa.local/contact.html", wait_until="networkidle")
    for key, value in {"fname":"Test", "lname":"Visitor", "email":"test@example.com", "phone":"0123456789", "message":"Local test only"}.items():
        page.locator("#" + key).fill(value)
    page.locator("#eventType").select_option(label="Wedding")
    page.locator("#enquiryForm .consent input").check()
    page.locator("#enquiryForm button[type=submit]").click()
    page.locator("#formMsg.failed").wait_for()
    assert page.locator("#email").input_value() == "test@example.com"
    assert page.locator("#formMsg a[href^='https://wa.me/']").count() == 1
    response_mode = "accepted"
    page.locator("#enquiryForm button[type=submit]").click()
    page.wait_for_function("document.querySelector('#formMsg').classList.contains('show') && !document.querySelector('#formMsg').classList.contains('failed')")
    assert page.locator("#email").input_value() == ""
    print("PASS enquiry rejection, preserved details, and successful retry", flush=True)

    # Booking validates all fields and prepares WhatsApp without claiming delivery.
    page.locator("#bbBook").click()
    page.locator("#bkName").fill("Test Visitor")
    page.locator("#bkPhone").fill("0123456789")
    page.locator("#bkEmail").fill("invalid")
    page.locator(".booking-form .consent input").check()
    count = len(requests)
    page.locator(".booking-form button[type=submit]").click()
    assert len(requests) == count
    page.locator("#bkEmail").fill("test@example.com")
    page.locator(".booking-form button[type=submit]").click()
    page.wait_for_function("document.querySelector('#bkDone').textContent.includes('submitted by email')")
    assert page.evaluate("window.lastWhatsAppUrl.startsWith('https://wa.me/447823683189?text=')")
    assert "_autoresponse" not in requests[-1]
    page.keyboard.press("Escape")
    assert page.locator(".booking-modal").get_attribute("aria-hidden") == "true"
    print("PASS booking validation and WhatsApp fallback", flush=True)

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
