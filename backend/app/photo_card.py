from PIL import Image, ImageDraw, ImageFont
import math
import io
import os

# ---------------------------------------------------------------------------
# Robust font loading
#
# NOTE: "arial.ttf" / "arialbd.ttf" do NOT exist on most Linux/server setups.
# The original code wrapped all four truetype() calls in a single try/except,
# so the FIRST failed load dropped EVERY font to PIL's ~10px bitmap default --
# which is why the title was tiny, the name was scattered, and the meals text
# overlapped. We try a list of candidates per font and fall back gracefully.
# Liberation Sans is metric-compatible with Arial, so it's the preferred sub.
# ---------------------------------------------------------------------------

_SANS = [
    "Arial.ttf", "arial.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
_SANS_BOLD = [
    "Arial Bold.ttf", "arialbd.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def _load_font(candidates, size):
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    print("WARNING: no TrueType font found; falling back to bitmap default.")
    return ImageFont.load_default()


def _fit_font(draw, text, candidates, max_size, max_width, min_size=20):
    """Return the largest font (<= max_size) whose text fits within max_width."""
    size = max_size
    while size > min_size:
        font = _load_font(candidates, size)
        if draw.textlength(text.upper(), font=font) <= max_width:
            return font
        size -= 2
    return _load_font(candidates, min_size)


# ---------------------------------------------------------------------------
# Curved ribbon text — characters rotated tangent to the arc
#
# Each glyph is rendered onto a small RGBA tile, rotated by the tangent angle
# at its position on a circular arc, then composited back onto the card.
# This gives the "carved into the ribbon" look where letters follow the curve.
#
# Arc shape: ∩ (center is the topmost point, edges dip down slightly).
# Radius controls tightness: larger radius = flatter, more subtle curve.
# ---------------------------------------------------------------------------

def draw_curved_text(img, draw, text, center_x, center_y, font, fill):
    if not text:
        return
    text = text.upper()

    widths = [draw.textlength(ch, font=font) for ch in text]
    tracking = max(2, int(font.size * 0.04))
    total = sum(widths) + tracking * (len(text) - 1)

    # Radius chosen so the arc subtends a gentle curve matching the ribbon band.
    # total * 3.2 keeps the peak-to-edge drop at ≈ 5% of text width — subtle.
    radius = total * 3.2

    x = center_x - total / 2
    for ch, w in zip(text, widths):
        cx = x + w / 2
        offset = cx - center_x

        # Clamp offset to valid asin range
        clamped = max(-radius * 0.98, min(radius * 0.98, offset))
        angle = math.asin(clamped / radius)  # angle from vertical axis

        # Circular arc: ∩ shape — center at top, edges lower
        px = center_x + radius * math.sin(angle)
        py = center_y + radius * (1.0 - math.cos(angle))

        # Render glyph to a transparent tile
        bb = font.getbbox(ch)
        ch_w = max(bb[2] - bb[0], 1)
        ch_h = max(bb[3] - bb[1], 1)
        pad = 10
        tile = Image.new("RGBA", (ch_w + pad * 2, ch_h + pad * 2), (0, 0, 0, 0))
        ImageDraw.Draw(tile).text((pad - bb[0], pad - bb[1]), ch, font=font, fill=fill)

        # Rotate tile by the tangent angle (negative = clockwise in PIL coords)
        rotated = tile.rotate(-math.degrees(angle), expand=True,
                              resample=Image.Resampling.BICUBIC)

        paste_x = int(px - rotated.width / 2)
        paste_y = int(py - rotated.height / 2)
        img.paste(rotated, (paste_x, paste_y), rotated)

        x += w + tracking


# ---------------------------------------------------------------------------
# Card generator
# ---------------------------------------------------------------------------

def generate_contribution_card(restaurant_name: str, meals_donated: str,
                               template_path: str = None) -> bytes:
    if template_path is None:
        assets_dir = os.path.join(os.path.dirname(__file__), "assets")
        template_path = os.path.join(assets_dir, "award_template.png")

    img = Image.open(template_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    width, _ = img.size

    WHITE = (255, 255, 255)
    DARK_GREEN = (23, 63, 53)
    SHADOW = (0, 0, 0, 110)
    shadow = 3

    def centered(text, font, y, fill, with_shadow=False):
        x = (width - draw.textlength(text, font=font)) / 2
        if with_shadow:
            draw.text((x + shadow, y + shadow), text, font=font, fill=SHADOW)
        draw.text((x, y), text, font=font, fill=fill)

    # 1) Title
    centered("This recognition is presented to", _load_font(_SANS, 47), 200, WHITE)

    # 2) Restaurant name — curved, sitting on the ribbon (band center ~y=500)
    name_font = _fit_font(draw, restaurant_name, _SANS_BOLD,
                          max_size=82, max_width=720)
    draw_curved_text(img, draw, restaurant_name, width // 2, 470, name_font, DARK_GREEN)

    # 3) Meals block — centered in the teal gap between ribbon and trophy
    num_font = _load_font(_SANS_BOLD, 100)
    lbl_font = _load_font(_SANS, 50)
    block_center_y = 775
    nb = draw.textbbox((0, 0), meals_donated, font=num_font)
    lb = draw.textbbox((0, 0), "meals donated", font=lbl_font)
    num_h, lbl_h = nb[3] - nb[1], lb[3] - lb[1]
    gap = 18
    top = block_center_y - (num_h + gap + lbl_h) / 2
    centered(meals_donated, num_font, top - nb[1], WHITE, with_shadow=True)
    centered("meals donated", lbl_font, top + num_h + gap - lb[1], WHITE, with_shadow=True)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.read()


# ---------------------------------------------------------------------------
# Standalone entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    restaurant_name = "BBQ Mania"
    meals_donated = "12"
    output_image = "../../frontend/public/award_certificate.png"

    data = generate_contribution_card(restaurant_name, meals_donated)
    with open(output_image, "wb") as f:
        f.write(data)
    print(f"Saved to {output_image}")
