from playwright.sync_api import sync_playwright, expect
import time
import json

def verify_phase4_features(page):
    # 1. Initial Navigate
    print("Navigating to app...")
    page.goto("http://localhost:5173/")

    # 2. Clear Storage to ensure fresh state
    print("Clearing local storage...")
    page.evaluate("window.localStorage.clear()")
    page.reload()
    page.wait_for_selector("canvas", timeout=10000)

    # 3. Verify Tutorial Overlay (Step 1)
    print("Verifying Tutorial...")
    expect(page.get_by_text("Welcome to Fish Tycoon!")).to_be_visible()
    page.screenshot(path="verification/1_tutorial.png")

    # 4. Open Shop & Verify Sorting
    print("Opening Shop...")
    page.get_by_role("button", name="SHOP").click()
    expect(page.get_by_text("Aquarium Shop")).to_be_visible()

    print("Verifying Shop Sorting...")
    expect(page.locator("select")).to_be_visible() # Sorting dropdown
    page.screenshot(path="verification/2_shop_sorting.png")

    # 5. Buy Fish
    print("Buying Goldie...")
    # Wait for button to be interactive
    buy_btn = page.get_by_role("button", name="Buy", exact=True).first
    expect(buy_btn).to_be_enabled()
    buy_btn.click(force=True) # Force click in case tutorial overlay intercepts

    # Wait for state update
    print("Waiting for purchase confirmation...")
    expect(page.get_by_text("Owned: 1")).to_be_visible(timeout=5000)
    page.screenshot(path="verification/2b_shop_bought.png")

    # Debug Storage
    storage = page.evaluate("() => localStorage.getItem('fish-tycoon-storage')")
    print(f"Storage after buy: {storage[:100]}...")

    # Close Shop
    page.get_by_role("button", name="×").click()

    # 6. Verify Encyclopedia
    print("Verifying Encyclopedia...")
    page.get_by_title("Encyclopedia").click()
    expect(page.get_by_text("Fish Encyclopedia")).to_be_visible()

    # Check for Goldie
    try:
        expect(page.get_by_text("Goldie")).to_be_visible()
        print("Goldie found in Encyclopedia!")
    except Exception as e:
        print("Goldie NOT found in Encyclopedia. Dumping content...")
        print(page.locator(".bg-slate-800").text_content())
        raise e

    page.screenshot(path="verification/3_encyclopedia.png")
    page.get_by_text("✕").click()

    # 7. Verify Statistics
    print("Verifying Statistics...")
    page.get_by_title("Statistics").click()
    expect(page.get_by_text("Statistics")).to_be_visible()
    # Check fish owned count
    expect(page.locator("text=Fish Owned").locator("..").get_by_text("1")).to_be_visible()
    page.screenshot(path="verification/4_statistics.png")
    page.get_by_text("✕").click()

    # 8. Verify Screenshot Mode
    print("Verifying Screenshot Mode...")
    page.get_by_title("Screenshot Mode").click()
    # UI Overlay buttons should be hidden
    expect(page.get_by_role("button", name="SHOP")).not_to_be_visible()
    page.screenshot(path="verification/5_screenshot_mode.png")

    # 9. Final Cleanup & Screenshot
    print("Resetting for final clean screenshot...")
    page.evaluate("window.localStorage.clear()")
    page.reload()
    page.wait_for_selector("canvas")
    page.screenshot(path="verification/verification.png")
    print("Done!")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            verify_phase4_features(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            exit(1)
        finally:
            browser.close()
