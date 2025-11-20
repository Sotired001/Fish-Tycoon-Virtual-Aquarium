import time
from playwright.sync_api import sync_playwright

def verify_visuals():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        try:
            page.goto("http://localhost:3000")
            # Wait for canvas to load
            page.wait_for_selector("canvas")

            # Interact to start audio context and trigger animations
            canvas = page.locator("canvas")
            canvas.click(position={"x": 300, "y": 300})

            # Move mouse to test parallax
            page.mouse.move(100, 100)
            time.sleep(0.5)
            page.mouse.move(500, 500)
            time.sleep(0.5)

            # Open Shop Modal to test pop-in
            page.get_by_role("button", name="SHOP").click()
            time.sleep(0.5)

            # Take screenshot
            page.screenshot(path="verification.png")
            print("Screenshot taken successfully")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_visuals()
