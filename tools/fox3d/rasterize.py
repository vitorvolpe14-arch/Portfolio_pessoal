"""Rasteriza a arte vetorizada (public/) em alta resolução: mask.png (silhueta) e lum.png (faixas de tom, sem o grão)."""
import os
from playwright.sync_api import sync_playwright
pub = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public') + '/'
S = 3  # px por unidade do viewBox
W, H = round(541.33 * S), round(940.33 * S)
black = open(pub + 'fox-vector-black.svg').read().replace(' filter="url(#vb-soft)"', '')
mask = open(pub + 'fox-vector-mask.svg').read()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': W, 'height': H})
    for svg, out in ((black, 'lum.png'), (mask, 'mask.png')):
        svg = svg.replace('<svg ', '<svg width="%d" height="%d" ' % (W, H), 1)
        pg.set_content('<html><body style="margin:0;background:#fff">%s</body></html>' % svg); pg.wait_for_timeout(300)
        pg.screenshot(path=out, clip={'x': 0, 'y': 0, 'width': W, 'height': H})
    b.close()
