"""Gera a malha fechada da raposa (marching cubes) a partir de field.npz.
Laje com borda arredondada: frente = field.front, verso = field.back, raio r."""
import numpy as np, json, sys, time
from scipy import ndimage as ndi
from skimage.measure import marching_cubes

v = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
F = np.load('field.npz')
P = json.loads(str(F['P'])); S = P['S']; r = P['r']
d, front, back = F['d'], F['front'], F['back']
x0, y0, W, H = -26.67, -26.67, 541.33, 940.33
xs = np.arange(x0, x0 + W + v, v); ys = np.arange(y0, y0 + H + v, v)
zmin = -(back.max() + 3); zmax = front.max() + 3
zs = np.arange(zmin, zmax + v, v)
gx, gy = np.meshgrid(xs, ys, indexing='ij')
coords = np.array([(gy - y0) * S, (gx - x0) * S])
dd = ndi.map_coordinates(d, coords, order=1, mode='nearest')
ff = ndi.map_coordinates(front, coords, order=1, mode='nearest')
bb = ndi.map_coordinates(back, coords, order=1, mode='nearest')
t = time.time()
vol = np.empty((len(xs), len(ys), len(zs)), np.float32)
wx = (-dd + r)[:, :, None]
for k, z in enumerate(zs):
    wz = (z - (ff - r)) if z >= 0 else (-z - (bb - r))
    a = wx[:, :, 0]; b = wz
    vol[:, :, k] = np.minimum(np.maximum(a, b), 0) + np.hypot(np.maximum(a, 0), np.maximum(b, 0)) - r
print('vol', vol.shape, time.time() - t)
blur = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
if blur > 0: vol = ndi.gaussian_filter(vol, blur / v)
verts, faces, normals, _ = marching_cubes(vol, level=0.0, spacing=(v, v, v))
verts[:, 0] += x0; verts[:, 1] += y0; verts[:, 2] += zmin
print('verts', len(verts), 'faces', len(faces), time.time() - t)
np.savez('fox_mesh.npz', verts=verts.astype(np.float32), faces=faces.astype(np.int32))
