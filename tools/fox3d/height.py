"""Campo de altura da raposa: silhueta inflada + relevo tirado do sombreamento da arte original.
Unidades = unidades do viewBox do SVG (541.33 x 940.33)."""
import numpy as np, sys, json
from PIL import Image
from scipy import ndimage as ndi

P = dict(S=3, Tf=14.0, Tb=13.0, r=13.0, A=34.0, Ab=8.0,
         k_detail=7.0, s1=4.5, s2=20.0, k_low=5.0, s_low=30.0, gamma=0.85, fade=28.0)
if len(sys.argv) > 1: P.update(json.loads(sys.argv[1]))
S = P['S']

mask_img = np.asarray(Image.open('mask.png').convert('L')).astype(np.float32) / 255.0
alpha = 1.0 - mask_img                      # 1 dentro da raposa
lum = np.asarray(Image.open('lum.png').convert('L')).astype(np.float32) / 255.0

inside = alpha > 0.5
d_in = ndi.distance_transform_edt(inside)
d_out = ndi.distance_transform_edt(~inside)
d = (d_in - d_out) / S                       # distância com sinal, em unidades
d = ndi.gaussian_filter(d, 0.8 * S)

# Sombreamento só dentro da silhueta, estendido para fora para o filtro não puxar a borda
Lm = np.where(inside, lum, np.nan)
idx = ndi.distance_transform_edt(~inside, return_distances=False, return_indices=True)
Lfill = lum[tuple(idx)]
Lfill = np.where(inside, lum, Lfill)
g1 = ndi.gaussian_filter(Lfill, P['s1'] * S)
g2 = ndi.gaussian_filter(Lfill, P['s2'] * S)
detail = g1 - g2
detail /= (np.percentile(np.abs(detail[inside]), 98) + 1e-6)
low = ndi.gaussian_filter(Lfill, P['s_low'] * S)
low = (low - low[inside].mean()) / (low[inside].std() + 1e-6)

# Inflação "Poisson" (sem vinco no eixo medial): resolve -lap(u)=1 dentro, u=0 na borda, em 1 px/unidade
import scipy.sparse as sp, scipy.sparse.linalg as spl
small = np.asarray(Image.fromarray((inside * 255).astype(np.uint8)).resize((inside.shape[1] // S, inside.shape[0] // S), Image.BILINEAR)) > 127
ids = -np.ones(small.shape, int); ids[small] = np.arange(small.sum())
n = small.sum(); rows = [np.arange(n)]; cols = [np.arange(n)]; vals = [np.full(n, 4.0)]
yy, xx = np.nonzero(small)
for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
    y2, x2 = yy + dy, xx + dx
    ok = (y2 >= 0) & (y2 < small.shape[0]) & (x2 >= 0) & (x2 < small.shape[1])
    nb = np.full(n, -1); nb[ok] = ids[y2[ok], x2[ok]]
    m2 = nb >= 0
    rows.append(np.arange(n)[m2]); cols.append(nb[m2]); vals.append(np.full(m2.sum(), -1.0))
Amat = sp.csr_matrix((np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))), shape=(n, n))
u = np.zeros(small.shape); u[small] = spl.spsolve(Amat.tocsc(), np.ones(n))
q = np.sqrt(u); q = q / q.max()
q = np.asarray(Image.fromarray(q.astype(np.float32)).resize((inside.shape[1], inside.shape[0]), Image.BICUBIC))
q = ndi.gaussian_filter(np.clip(q, 0, None), 1.0 * S)
dd = np.clip(d - P['r'], 0, None)
fade = 1 - np.exp(-(dd / P['fade']) ** 2)    # relevo nasce suave depois da borda arredondada
infl = P['A'] * q ** P['gamma']
front = P['Tf'] + fade * (infl + P['k_detail'] * detail + P['k_low'] * low * 0.5)
back = P['Tb'] + fade * P['Ab'] * q ** P['gamma']
front = np.maximum(front, P['r'] + 0.5)
back = np.maximum(back, P['r'] + 0.5)

np.savez_compressed('field.npz', d=d.astype(np.float32), front=front.astype(np.float32),
                    back=back.astype(np.float32), inside=inside, P=json.dumps(P))

# Prévia: hillshade da frente
z = np.where(inside, front, 0)
gy, gx = np.gradient(z * S)
n = np.dstack([-gx, -gy, np.full_like(z, 1.0)])
n /= np.linalg.norm(n, axis=2, keepdims=True)
l = np.array([0.5, -0.6, 0.62]); l /= np.linalg.norm(l)
sh = np.clip((n @ l), 0, 1)
img = np.where(inside, 40 + 200 * sh, 246).astype(np.uint8)
Image.fromarray(img).resize((541, 940), Image.LANCZOS).save('hillshade.png')
print('front range', front[inside].min(), front[inside].max(), 'dmax', d.max())
