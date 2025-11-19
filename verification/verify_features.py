
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000")

            # Wait for game to load
            page.wait_for_timeout(2000)

            # Take screenshot of initial state
            page.screenshot(path="verification/step1_initial.png")
            print("Initial screenshot taken")

            # Wait for time to pass (simulate 10 seconds to see clock change)
            # 10s in real time = 2 hours in game time
            print("Waiting for time to pass...")
            page.wait_for_timeout(5000)

            page.screenshot(path="verification/step2_later.png")
            print("Later screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
