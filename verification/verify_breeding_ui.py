from playwright.sync_api import sync_playwright, expect
import time

def verify_breeding_ui(page):
    # 1. Load the game
    page.goto("http://localhost:3000")
    page.wait_for_selector("canvas")

    # 2. Open Breeding Modal
    # Use explicit selector for the main menu button
    breed_btn = page.locator("button").filter(has_text="BREED").filter(has_not_text="Now").first
    breed_btn.click()
    
    # 3. Check Header with timeout
    expect(page.locator("text=Genetic Lab")).to_be_visible(timeout=5000)
    
    # 4. Check Selector Panel
    expect(page.locator("text=Select Parents")).to_be_visible()
    
    # 5. Check for Fish Cards
    if page.locator("text=Your tank is empty").is_visible():
        print("Tank is empty. Buying fish to test UI...")
        page.keyboard.press("Escape")
        time.sleep(1) # Wait for animation
        
        # Buy fish
        page.locator("button").filter(has_text="Shop").click()
        time.sleep(1)
        # Buy 2 fish
        page.locator("button").filter(has_text="Buy").first.click()
        time.sleep(0.5)
        page.locator("button").filter(has_text="Buy").first.click()
        time.sleep(0.5)
        page.keyboard.press("Escape")
        time.sleep(1)
        
        # Re-open Breeding
        breed_btn.click()
        expect(page.locator("text=Genetic Lab")).to_be_visible()

    # Now we should see fish cards
    fish_card = page.locator(".cursor-pointer").first
    expect(fish_card).to_be_visible()
    
    # 6. Select Fish
    # Click the first available fish card
    # Note: The slots are also .cursor-pointer, so we need to be careful.
    # The slots are in the left panel. The grid is in the right.
    # Let's pick a card from the grid.
    
    # We can target by class or content.
    # Fish cards have "Gen 0" or similar.
    page.locator("text=Gen 0").first.click()
    
    # Check if Parent A slot is filled
    # It should now show the fish name instead of "+"
    expect(page.locator("text=Parent A")).to_be_visible()
    
    # Take screenshot
    page.screenshot(path="verification/breeding_ui_redesign.png")
    print("Breeding UI verified.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_breeding_ui(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
