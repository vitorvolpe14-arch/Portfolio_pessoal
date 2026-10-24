"""Renders do Blender -> quadros do site: cor calibrada com a logo original e WebP com transparência.
Uso: python3 convert.py <tone> <quality>"""
import sys, os, glob, re, numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
import calib

tone = sys.argv[1]; q = int(sys.argv[2]) if len(sys.argv) > 2 else 85
src = sorted(glob.glob(f'renders/{tone}/f_*.png'), key=lambda f: int(re.search(r'f_([+-]\d+)', f).group(1)))
front = [f for f in src if f.endswith('f_+000.png')][0]
W, H = Image.open(front).size

# Logo original no mesmo tamanho dos renders, para calibrar a cor
pub = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public') + '/'
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': W, 'height': H})
    svg = open(pub + f'fox-vector-{tone}.svg').read().replace('<svg ', '<svg width="%d" height="%d" preserveAspectRatio="none" ' % (W, H), 1)
    pg.set_content('<html><body style="margin:0;background:transparent">%s</body></html>' % svg); pg.wait_for_timeout(300)
    pg.screenshot(path=f'orig_{tone}.png', omit_background=True); b.close()
calib.build(tone, front)

out = pub + f'fox3d/{tone}'
os.makedirs(out, exist_ok=True)
total = 0
for i, f in enumerate(src):
    calib.apply(tone, f, '/tmp/_c.png')
    im = Image.open('/tmp/_c.png')
    dst = f'{out}/{i:02d}.webp'
    im.save(dst, 'WEBP', quality=q, method=6, alpha_quality=90)
    total += os.path.getsize(dst)
print(tone, len(src), 'frames', W, 'x', H, 'total KB', total // 1024, 'avg KB', total // 1024 // len(src))
