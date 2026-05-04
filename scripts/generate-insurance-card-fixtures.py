#!/usr/bin/env python3
"""Generate sample insurance card PNGs for local testing (not real PHI)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(__file__).resolve().parent.parent / "test-documents"
W, H = 920, 580


def _try_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for name in ("Helvetica.ttc", "Arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_front() -> Image.Image:
    img = Image.new("RGB", (W, H), "#f4f7fb")
    draw = ImageDraw.Draw(img)
    font_title = _try_font(26)
    font_lg = _try_font(22)
    font_md = _try_font(17)
    font_sm = _try_font(14)

    # Header band
    draw.rectangle([0, 0, W, 140], fill="#14532d")
    draw.text((36, 28), "SOKANA SAMPLE HEALTH PLAN", fill="#ecfdf5", font=font_title)
    draw.text((36, 78), "Commercial Insurance — DEMO CARD ONLY", fill="#bbf7d0", font=font_sm)

    # Chip / photo placeholders
    draw.rounded_rectangle([36, 168, 140, 268], radius=10, fill="#d1d5db")
    draw.text((52, 208), "PHOTO", fill="#6b7280", font=font_sm)
    draw.rounded_rectangle([160, 168, 260, 268], radius=12, outline="#9ca3af", width=3)
    draw.text((178, 212), "CHIP", fill="#9ca3af", font=font_sm)

    y = 300
    draw.text((36, y), "SUBSCRIBER", fill="#64748b", font=font_sm)
    draw.text((36, y + 22), "Jordan A. Sample", fill="#0f172a", font=font_lg)
    y += 78
    draw.text((36, y), "MEMBER ID", fill="#64748b", font=font_sm)
    draw.text((36, y + 22), "XYZ123456789", fill="#0f172a", font=font_lg)
    draw.text((480, y), "GROUP", fill="#64748b", font=font_sm)
    draw.text((480, y + 22), "GRP-998877", fill="#0f172a", font=font_lg)
    y += 78
    draw.text((36, y), "PLAN / PAYER", fill="#64748b", font=font_sm)
    draw.text((36, y + 22), "Sample PPO Network", fill="#0f172a", font=font_md)

    draw.line([36, H - 52, W - 36, H - 52], fill="#cbd5e1", width=2)
    draw.text(
        (36, H - 40),
        "For development testing only — replace uploads with real member cards in production.",
        fill="#94a3b8",
        font=font_sm,
    )
    return img


def draw_back() -> Image.Image:
    img = Image.new("RGB", (W, H), "#f8fafc")
    draw = ImageDraw.Draw(img)
    font_title = _try_font(20)
    font_md = _try_font(16)
    font_sm = _try_font(14)

    draw.rectangle([0, 0, W, 72], fill="#14532d")
    draw.text((36, 22), "IMPORTANT INFORMATION (BACK OF CARD)", fill="#ecfdf5", font=font_title)

    lines = [
        "Prescription: Sample RX BIN 999999  |  PCN DEMO  |  GROUP GRP-998877",
        "",
        "Behavioral health / referral line (sample): 1-800-555-0199",
        "",
        "Copays (illustrative — not real benefits):",
        "  • Primary care  $25    • Specialist  $45    • ER  $250",
        "",
        "Claims address (sample): Sample Health Claims, PO Box 1000, Example City ST 00000",
        "",
        "This card is fictional data for software testing. It is not tied to any payer or person.",
    ]
    y = 100
    for line in lines:
        draw.text((36, y), line, fill="#334155", font=font_sm if line.startswith("  ") else font_md)
        y += 28 if line == "" else 32

    # Fake barcode blocks
    bx, by, bw, bh = 36, H - 130, W - 72, 56
    for i in range(48):
        x0 = bx + i * (bw // 48)
        w = 4 + (i % 5)
        draw.rectangle([x0, by, x0 + w, by + bh], fill="#0f172a" if i % 3 else "#334155")

    draw.text((36, H - 48), "MAG STRIPE / BARCODE AREA — TEST FIXTURE", fill="#64748b", font=font_sm)
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    front = draw_front()
    back = draw_back()
    front_path = OUT_DIR / "insurance-card-front.png"
    back_path = OUT_DIR / "insurance-card-back.png"
    front.save(front_path, "PNG", optimize=True)
    back.save(back_path, "PNG", optimize=True)
    print(f"Wrote {front_path}")
    print(f"Wrote {back_path}")


if __name__ == "__main__":
    main()
