from playwright.sync_api import sync_playwright, expect
import time

def verify_shop_buttons(page):
    # 1. Load the game
    page.goto("http://localhost:3000")

    # Wait for game to load
    page.wait_for_selector("canvas")

    # 2. Open Shop
    page.locator("button").filter(has_text="Shop").click()

    # 3. Click Decorations Tab
    page.locator("button").filter(has_text="Decorations").click()

    # 4. Check for Buy buttons (Buy 1, x10, x100)
    # We check for one item, e.g., Amazon Sword
    
    # Find the container for Amazon Sword
    # It has "Amazon Sword" text.
    # We look for the buttons within that container or just generally on the page.
    
    buy1 = page.locator("button").filter(has_text="Buy 1").first
    x10 = page.locator("button").filter(has_text="x10").first
    x100 = page.locator("button").filter(has_text="x100").first
    
    expect(buy1).to_be_visible()
    expect(x10).to_be_visible()
    expect(x100).to_be_visible()
    
    # Take screenshot
    page.screenshot(path="verification/shop_buttons_check.png")
    print("Shop bulk buy buttons found.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_shop_buttons(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
