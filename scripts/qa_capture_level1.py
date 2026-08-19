import time
from playwright.sync_api import sync_playwright
from PIL import Image
from pathlib import Path

OUT_DIR = Path('/home/ubuntu/qa_level1_captures')
OUT_DIR.mkdir(parents=True, exist_ok=True)

states = [
    (0, "level1_qa_00_records_golden_hour.png"),
    (5, "level1_qa_05_records_golden_waking_crossfade.png"),
    (10, "level1_qa_10_records_waking_sunset.png"),
    (15, "level1_qa_15_records_waking_dusk_crossfade.png"),
    (20, "level1_qa_20_records_dusk_opening.png"),
    (25, "level1_qa_25_records_full_night.png"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Exact mobile viewport matching required QA specs (390x844 mobile container)
    context = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    page = context.new_page()

    for records, filename in states:
        url = f"https://3000-ii2ajrebt3duqjw537oe6-59829d5f.us4.manus.computer/?worldRecords={records}&visualFreeze=1&hideHud=1&frameOff=1#minigame"
        page.goto(url, wait_until="networkidle")
        time.sleep(1.5)
        
        # Target strictly the game viewport / arcade cabinet container
        el = page.locator(".game-viewport").first
        if el.count() == 0:
            el = page.locator(".arcade-cabinet-bezel").first
            
        if el.count() > 0:
            screenshot_path = OUT_DIR / filename
            el.screenshot(path=str(screenshot_path))
            print(f"Captured state {records} records -> {screenshot_path.name}")
        else:
            print(f"WARNING: Game viewport not found for state {records}, capturing fallback viewport region")
            page.screenshot(path=str(OUT_DIR / filename), clip={"x": 0, "y": 0, "width": 390, "height": 844})

    browser.close()
print("QA capture complete.")
