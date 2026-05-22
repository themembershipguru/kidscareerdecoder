"""Ensure CU logo assets exist (prefer college template; else simple placeholder)."""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTRACT = ROOT / "scripts" / "extract_cu_logos_from_template.py"
OUT = ROOT / "docs" / "assets" / "cu-logo-online.png"


def placeholder():
    from PIL import Image, ImageDraw, ImageFont

    out = ROOT / "docs" / "assets" / "cu-logo.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    w, h = 800, 200
    img = Image.new("RGB", (w, h), "#8B0000")
    draw = ImageDraw.Draw(img)
    try:
        font_l = ImageFont.truetype(
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf", 36
        )
        font_s = ImageFont.truetype(
            "/System/Library/Fonts/Supplemental/Arial.ttf", 22
        )
    except OSError:
        font_l = ImageFont.load_default()
        font_s = font_l
    draw.text((40, 55), "CHANDIGARH UNIVERSITY", fill="white", font=font_l)
    draw.text((40, 110), "Mohali, Punjab  |  www.cuchd.in", fill="#f0f0f0", font=font_s)
    draw.rectangle([0, h - 8, w, h], fill="#1a1a1a")
    img.save(out, "PNG")
    if not OUT.exists():
        img.save(OUT, "PNG")
    print(out)


def main():
    rc = subprocess.run([sys.executable, str(EXTRACT)], check=False).returncode
    if rc == 0 and OUT.exists():
        print(OUT)
        return
    placeholder()


if __name__ == "__main__":
    main()
