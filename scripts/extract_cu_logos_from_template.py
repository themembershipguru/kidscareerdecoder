"""Copy official CU Online logo from the college project report template."""
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = Path.home() / "Downloads" / "Project Report Template (2).docx"
OUT = ROOT / "docs" / "assets" / "cu-logo-online.png"
# Legacy path used by older scripts
LEGACY = ROOT / "docs" / "assets" / "cu-logo.png"


def main():
    if not TEMPLATE.exists():
        print(f"Template not found: {TEMPLATE}")
        return 1
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(TEMPLATE) as z:
        data = z.read("word/media/image1.png")
    OUT.write_bytes(data)
    shutil.copy2(OUT, LEGACY)
    print(OUT)
    print(LEGACY)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
