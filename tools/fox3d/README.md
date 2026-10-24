# Logo 3D da raposa (Blender)

Gera a escultura 3D da raposa a partir da arte vetorizada (`public/fox-vector-*.svg`) e renderiza os quadros de giro usados no site (`public/fox3d/`).

1. **Relevo:** `rasterize.py` rasteriza a silhueta e as faixas de tom; `height.py` monta o volume (silhueta inflada, sem vinco no meio) e os detalhes (orelha, olho, focinho, vincos do pescoço e da cauda) a partir do sombreamento da arte.
2. **Malha:** `mesh.py` fecha a peça com frente, verso e borda arredondada (marching cubes).
3. **Blender:** `scene.py` monta a cena (material fosco com grão de pedra, luz principal pela direita como na arte, câmera com a mesma perspectiva do site) e renderiza no Cycles um quadro a cada 3°.
4. **Cor e WebP:** `convert.py` calibra a cor de cada quadro para a mesma distribuição de tons da logo vetorizada (a cor não muda) e salva em WebP com transparência.

Requisitos: Python 3 com numpy, scipy, scikit-image, Pillow e Playwright (Chromium); Blender 4.2 ou mais novo (usado o 5.x).

```bash
cd tools/fox3d && mkdir -p build && cd build
python3 ../rasterize.py
python3 ../height.py          # parâmetros podem ser trocados com JSON: python3 ../height.py '{"A":40}'
python3 ../mesh.py 1.0 3.0     # voxel (unidades do SVG) e suavização
blender -b --factory-startup -P ../scene.py -- '{"tone":"black","range":[-72,81,3],"out":"renders/black","h":1100,"samples":40}'
blender -b --factory-startup -P ../scene.py -- '{"tone":"white","range":[-39,51,3],"out":"renders/white","h":1000,"samples":40,"light":0.4}'
python3 ../convert.py black && python3 ../convert.py white
```

Os ângulos usam passos de 3°: preta de -72° a +81° (52 quadros), branca de -39° a +51° (31 quadros). Se mudar a faixa, atualize `foxFrames` em `src/fox3d.ts`.
