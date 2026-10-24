"""Calibra a cor do render para ficar igual à logo original (mesma distribuição de tons).
build: python3 calib.py build <tone> <render_frente.png>   -> lut_<tone>.npy
apply: python3 calib.py apply <tone> <in.png> <out.png>"""
import sys, numpy as np
from PIL import Image

def cdf_lut(src, ref):
    s = np.sort(src); r = np.sort(ref)
    q = np.linspace(0, 1, 256)
    sv = np.interp(q, np.linspace(0, 1, len(s)), s)
    rv = np.interp(q, np.linspace(0, 1, len(r)), r)
    lut = np.interp(np.arange(256), sv, rv, left=rv[0], right=rv[-1])
    return np.maximum.accumulate(lut)

def build(tone, render):
    o = np.asarray(Image.open(f'orig_{tone}.png').convert('RGBA')).astype(float)
    r = np.asarray(Image.open(render).convert('RGBA')).astype(float)
    mo, mr = o[..., 3] > 250, r[..., 3] > 250
    luts = np.stack([cdf_lut(r[..., c][mr], o[..., c][mo]) for c in range(3)])
    np.save(f'lut_{tone}.npy', luts)

def apply(tone, src, dst):
    luts = np.load(f'lut_{tone}.npy')
    a = np.asarray(Image.open(src).convert('RGBA')).copy()
    for c in range(3):
        a[..., c] = np.clip(np.round(luts[c][a[..., c]]), 0, 255).astype(np.uint8)
    Image.fromarray(a).save(dst)

if __name__ == '__main__':
    if sys.argv[1] == 'build': build(sys.argv[2], sys.argv[3])
    else: apply(sys.argv[2], sys.argv[3], sys.argv[4])
