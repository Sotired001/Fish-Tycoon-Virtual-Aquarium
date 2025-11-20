from playwright.sync_api import sync_playwright, expect
import time

def verify_features(page):
    # 1. Load the game
    page.goto("http://localhost:3001")

    # Wait for game to load
    page.wait_for_selector("canvas")

    # 2. Open Shop
    # Try clicking the shop button.
    page.locator("button").filter(has_text="Shop").click()


    # 3. Verify New Upgrades in UPGRADES tab
    # Click EQUIPMENT tab (I named it "Equipment" in ShopModal.tsx)
    page.locator("button").filter(has_text="Equipment").click()

    # Scroll down the modal content to ensure elements are visible
    # The modal content is in a div with class 'overflow-y-auto'
    # We can just scroll the specific elements into view or programmatically scroll.

    # Check for Heater
    heater = page.locator("text=Water Heater")
    heater.scroll_into_view_if_needed()
    expect(heater).to_be_visible()

    # Check for Filter
    filter_item = page.locator("text=Power Filter")
    filter_item.scroll_into_view_if_needed()
    expect(filter_item).to_be_visible()

    # Check for Lights
    lights = page.locator("text=Grow Lights")
    lights.scroll_into_view_if_needed()
    expect(lights).to_be_visible()

    # Take screenshot of Shop with new upgrades
    page.screenshot(path="verification/shop_equipment.png")

    # Close shop
    page.keyboard.press("Escape")

    # Wait a bit for fish to move
    time.sleep(2)

    # Take screenshot of tank
    page.screenshot(path="verification/tank_view.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_features(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
