from playwright.sync_api import sync_playwright, expect
import time

def verify_cure_button(page):
    # 1. Load the game
    page.goto("http://localhost:3000")
    page.wait_for_selector("canvas")

    # 2. Infect a fish manually for testing (via console)
    page.evaluate("""
        () => {
            const store = JSON.parse(localStorage.getItem('fish-tycoon-storage'));
            if (store && store.state && store.state.fish.length > 0) {
                store.state.fish[0].disease = 'ICH';
                store.state.fish[0].health = 50;
                localStorage.setItem('fish-tycoon-storage', JSON.stringify(store));
            }
        }
    """)
    page.reload()
    page.wait_for_selector("canvas")

    # 3. Open Shop -> My Tank
    page.locator("button", has_text="SHOP").click()
    page.locator("button", has_text="My Tank").click()

    # 4. Check for Cure Button
    # It should say "Need General Cure" initially because inventory is empty
    cure_btn = page.locator("button", has_text="Need General Cure")
    if cure_btn.is_visible():
        print("Found 'Need General Cure' button.")
    else:
        print("Cure button not found! Checking for 'Cure'...")
        if page.locator("button", has_text="Cure").is_visible():
             print("Found 'Cure' button (maybe inventory wasn't empty?)")
        else:
             print("No cure button visible at all.")
             page.screenshot(path="verification/no_cure_button.png")

    # 5. Buy Medicine
    page.locator("button", has_text="Supplies").click()
    page.locator("button", has_text="Buy 1").first.click() # Buy General Cure
    
    # 6. Go back to My Tank
    page.locator("button", has_text="My Tank").click()
    
    # 7. Check button again
    cure_btn_active = page.locator("button", has_text="Cure").first
    expect(cure_btn_active).to_be_visible()
    expect(cure_btn_active).to_be_enabled()
    print("Cure button is now active.")
    
    # 8. Click Cure
    cure_btn_active.click()
    
    # 9. Verify disease gone
    # The button should disappear
    expect(page.locator("button", has_text="Cure")).not_to_be_visible()
    print("Fish cured.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_cure_button(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
