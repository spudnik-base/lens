#!/usr/bin/env python3
"""
Generate the Lens PWA icon set from a single SVG master.

Output goes to public/icons/:
  - icon-192.png         (standard)
  - icon-512.png         (standard)
  - icon-maskable-192.png (with safe area for Android adaptive icons)
  - icon-maskable-512.png
  - apple-touch-icon.png (180x180, standard)
  - og-image.png         (1200x630 Open Graph preview)
  - favicon.ico          (16/32/48 multi-size)

The master is the hand-drawn loupe motif from Section 6.3 of lens-spec.md.
Ink on cream, no gradients, no shadows, keeps the field-notebook feel.
"""
import os
from io import BytesIO
import cairosvg
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
OG_OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'og-image.png')
os.makedirs(OUT, exist_ok=True)

CREAM = '#F2E9D0'
INK = '#2A2520'

# Master SVG, the loupe on a cream square. Safe area accounts for
# Android adaptive icons which clip to circles or rounded squares.
def build_square_svg(size: int, safe_area: float) -> str:
    """safe_area: fraction of the canvas the art should occupy (0..1)."""
    # The loupe is centered within the safe area. viewBox-based so we
    # can scale cleanly.
    pad = (1.0 - safe_area) / 2.0 * 100.0
    # Loupe drawn in a 100x100 space, then offset by pad.
    # We re-use the same path geometry as components/field/Loupe.tsx,
    # remapped from 46x68 to 100x100 roughly proportional.
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="{CREAM}"/>
  <g transform="translate({pad},{pad}) scale({safe_area})">
    <g transform="translate(18, 8)">
      <circle cx="32" cy="32" r="26" fill="{CREAM}" stroke="{INK}" stroke-width="3"/>
      <circle cx="32" cy="32" r="20" fill="none" stroke="{INK}" stroke-width="1" opacity="0.35"/>
      <path d="M 18 25 Q 24 17 33 15" fill="none" stroke="{INK}" stroke-width="1.2" opacity="0.45"/>
      <line x1="50" y1="50" x2="66" y2="72" stroke="{INK}" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="60" y="68" width="14" height="22" rx="2" fill="{INK}" transform="rotate(-45 66 79)"/>
    </g>
  </g>
</svg>'''

def render_png(svg: str, size: int, out_path: str):
    png = cairosvg.svg2png(bytestring=svg.encode('utf-8'), output_width=size, output_height=size)
    with open(out_path, 'wb') as f:
        f.write(png)

def main():
    # Standard icons, art fills ~88% of the canvas.
    for size in (192, 512):
        render_png(build_square_svg(size, 0.88), size, os.path.join(OUT, f'icon-{size}.png'))
    # Maskable icons, art contained within inner 66% for safe area.
    for size in (192, 512):
        render_png(build_square_svg(size, 0.66), size, os.path.join(OUT, f'icon-maskable-{size}.png'))
    # Apple touch icon, iOS doesn't mask, use standard.
    render_png(build_square_svg(180, 0.88), 180, os.path.join(OUT, 'apple-touch-icon.png'))
    # Favicon .ico, multi-resolution.
    img16 = Image.open(BytesIO(cairosvg.svg2png(bytestring=build_square_svg(16, 0.92).encode('utf-8'), output_width=16, output_height=16)))
    img32 = Image.open(BytesIO(cairosvg.svg2png(bytestring=build_square_svg(32, 0.9).encode('utf-8'), output_width=32, output_height=32)))
    img48 = Image.open(BytesIO(cairosvg.svg2png(bytestring=build_square_svg(48, 0.88).encode('utf-8'), output_width=48, output_height=48)))
    img48.save(os.path.join(OUT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)], append_images=[img16, img32])

    # Open Graph card, 1200×630 cream paper with the loupe + wordmark.
    og_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="{CREAM}"/>
  <!-- hairline tan border inset -->
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#c8bd9e" stroke-width="1"/>
  <!-- loupe, scaled up, left side -->
  <g transform="translate(160, 180) scale(3.6)">
    <circle cx="32" cy="32" r="26" fill="{CREAM}" stroke="{INK}" stroke-width="3"/>
    <circle cx="32" cy="32" r="20" fill="none" stroke="{INK}" stroke-width="1" opacity="0.35"/>
    <path d="M 18 25 Q 24 17 33 15" fill="none" stroke="{INK}" stroke-width="1.2" opacity="0.45"/>
    <line x1="50" y1="50" x2="66" y2="72" stroke="{INK}" stroke-width="4.5" stroke-linecap="round"/>
    <rect x="60" y="68" width="14" height="22" rx="2" fill="{INK}" transform="rotate(-45 66 79)"/>
  </g>
  <!-- Wordmark -->
  <text x="520" y="300" font-family="Georgia, serif" font-style="italic" font-size="160" fill="{INK}">Lens</text>
  <text x="522" y="360" font-family="Georgia, serif" font-style="italic" font-size="34" fill="#5a544a">a Cramly study guide to the 32 linking questions</text>
  <!-- ornament -->
  <path d="M 522 400 Q 570 388 620 400 Q 670 412 720 400" fill="none" stroke="{INK}" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="620" cy="400" r="3" fill="{INK}"/>
  <!-- mono caps subject -->
  <text x="520" y="465" font-family="ui-monospace, monospace" font-size="22" fill="#8a8170" letter-spacing="4">IB BIOLOGY</text>
</svg>'''
    render_png(og_svg, 1200, OG_OUT)  # render_png uses square sizing...
    # ...so redo OG with correct aspect:
    png = cairosvg.svg2png(bytestring=og_svg.encode('utf-8'), output_width=1200, output_height=630)
    with open(OG_OUT, 'wb') as f:
        f.write(png)

    print('icons generated:', sorted(os.listdir(OUT)))
    print('og image:', OG_OUT)

if __name__ == '__main__':
    main()
