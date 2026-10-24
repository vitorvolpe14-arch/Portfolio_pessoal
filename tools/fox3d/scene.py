"""Cena do Blender para a raposa da Volpe.
Uso: blender -b --factory-startup -P scene.py -- '{"tone":"black","yaws":[0],"out":"renders/test","h":700,"samples":64}'"""
import bpy, bmesh, sys, json, math, os
import numpy as np
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
O = dict(tone='black', yaws=[0], out='renders/test', h=700, samples=64, mesh='fox_mesh.npz', save_blend='')
if argv: O.update(json.loads(argv[0]))
if 'range' in O: O['yaws'] = list(range(O['range'][0], O['range'][1] + 1, O['range'][2]))  # [de, até, passo]
HERE = os.getcwd()

import addon_utils
addon_utils.enable('cycles', default_set=True)
sc = bpy.context.scene
for ob in list(bpy.data.objects): bpy.data.objects.remove(ob)

# ---------- Malha ----------
S = 1 / 200.0
x0, y0, W, H = -26.67, -26.67, 541.33, 940.33
cx, cy = x0 + W / 2, y0 + H / 2
M = np.load(os.path.join(HERE, O['mesh']))
v = M['verts'].astype(np.float64); f = M['faces']
co = np.empty_like(v)
co[:, 0] = (v[:, 0] - cx) * S
co[:, 1] = -v[:, 2] * S
co[:, 2] = -(v[:, 1] - cy) * S
me = bpy.data.meshes.new('Fox')
me.vertices.add(len(co)); me.vertices.foreach_set('co', co.ravel().astype(np.float32))
me.loops.add(f.size); me.loops.foreach_set('vertex_index', f.ravel())
me.polygons.add(len(f)); me.polygons.foreach_set('loop_start', np.arange(0, f.size, 3));
me.update(calc_edges=True); me.validate()
fox = bpy.data.objects.new('Fox', me); sc.collection.objects.link(fox)
bm = bmesh.new(); bm.from_mesh(me)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bm.to_mesh(me); bm.free()
me.shade_smooth()
sm = fox.modifiers.new('Smooth', 'CORRECTIVE_SMOOTH')
sm.factor = 0.5; sm.iterations = 4; sm.use_only_smooth = True; sm.smooth_type = 'SIMPLE'
pivot = bpy.data.objects.new('Pivot', None); sc.collection.objects.link(pivot)
fox.parent = pivot

# ---------- Materiais ----------
def material(tone):
    m = bpy.data.materials.new('Fox_' + tone); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    bsdf = N['Principled BSDF']
    # Mesmo acabamento fosco da logo original (pedra/cerâmica com grão); a cor final é calibrada depois
    base = (0.020, 0.019, 0.018, 1) if tone == 'black' else (0.42, 0.41, 0.39, 1)
    bsdf.inputs['Base Color'].default_value = base
    bsdf.inputs['Roughness'].default_value = O.get('rough', 0.72)
    bsdf.inputs['Specular IOR Level'].default_value = 0.35
    # Grão fino de cerâmica/pedra (como a textura da arte original)
    tc = N.new('ShaderNodeTexCoord')
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 260.0
    nz.inputs['Detail'].default_value = 6.0; nz.inputs['Roughness'].default_value = 0.6
    nz2 = N.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 18.0; nz2.inputs['Detail'].default_value = 3.0
    mix = N.new('ShaderNodeMath'); mix.operation = 'MULTIPLY_ADD'; mix.inputs[1].default_value = 0.25
    L.new(tc.outputs['Object'], nz.inputs['Vector']); L.new(tc.outputs['Object'], nz2.inputs['Vector'])
    L.new(nz2.outputs['Fac'], mix.inputs[0]); L.new(nz.outputs['Fac'], mix.inputs[2])
    bump = N.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = O.get('grain', 0.16)
    bump.inputs['Distance'].default_value = 0.004
    L.new(mix.outputs[0], bump.inputs['Height'])
    L.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    # variação sutil de rugosidade
    rr = N.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = bsdf.inputs['Roughness'].default_value - 0.06
    rr.inputs['To Max'].default_value = bsdf.inputs['Roughness'].default_value + 0.06
    L.new(nz2.outputs['Fac'], rr.inputs['Value']); L.new(rr.outputs['Result'], bsdf.inputs['Roughness'])
    return m
fox.data.materials.append(material(O['tone']))

# ---------- Luzes ----------
def area(name, loc, power, size, color=(1, 1, 1), size_y=None):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = power; ld.color = color
    ld.shape = 'RECTANGLE' if size_y else 'SQUARE'; ld.size = size
    if size_y: ld.size_y = size_y
    ob = bpy.data.objects.new(name, ld); sc.collection.objects.link(ob)
    ob.location = loc
    d = (Vector((0, 0, 0)) - Vector(loc)).normalized()
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return ob
k = O.get('light', 1.0)
# Luz principal pela direita/alto, como na arte original
area('Key', (7.0, -6.5, 4.5), 2600 * k, 6.0, (1.0, 0.98, 0.95))
area('Fill', (-8.0, -5.0, 0.5), 700 * k, 7.0)
area('Top', (0.0, -1.0, 9.0), 900 * k, 5.0, size_y=6.0)
area('Rim', (-3.0, 7.0, 3.5), 900 * k, 4.0)
world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True
wn = world.node_tree.nodes; bg = wn['Background']
env = wn.new('ShaderNodeTexEnvironment')
sl = os.path.join(bpy.utils.system_resource('DATAFILES'), 'studiolights', 'world', 'studio.exr')
if os.path.exists(sl):
    env.image = bpy.data.images.load(sl); world.node_tree.links.new(env.outputs['Color'], bg.inputs['Color'])
bg.inputs['Strength'].default_value = 0.15 * O.get('light', 1.0)

# ---------- Câmera ----------
dist = 2.14 * H * S
cam_d = bpy.data.cameras.new('Cam'); cam_d.sensor_fit = 'VERTICAL'; cam_d.sensor_height = 24.0
cam_d.lens = 12.0 * dist / (H * S / 2)
cam_d.clip_start = 0.5; cam_d.clip_end = 100
cam = bpy.data.objects.new('Cam', cam_d); sc.collection.objects.link(cam)
cam.location = (0, -dist, 0); cam.rotation_euler = (math.pi / 2, 0, 0)
sc.camera = cam

# ---------- Render ----------
r = sc.render; r.engine = 'CYCLES'
sc.cycles.device = 'CPU'; sc.cycles.samples = O['samples']; sc.cycles.use_adaptive_sampling = True
sc.cycles.adaptive_threshold = 0.02; sc.cycles.use_denoising = True
try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.diffuse_bounces = 3; sc.cycles.glossy_bounces = 3
sc.cycles.transparent_max_bounces = 2
r.film_transparent = True
r.resolution_y = O['h']; r.resolution_x = round(O['h'] * W / H); r.resolution_percentage = 100
r.image_settings.file_format = 'PNG'; r.image_settings.color_mode = 'RGBA'; r.image_settings.color_depth = '8'
sc.view_settings.view_transform = 'Standard'
r.threads_mode = 'AUTO'

if O['save_blend']:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, O['save_blend']))

os.makedirs(os.path.join(HERE, O['out']), exist_ok=True)
for yaw in O['yaws']:
    pivot.rotation_euler = (0, 0, math.radians(yaw))
    r.filepath = os.path.join(HERE, O['out'], 'f_%+04d.png' % round(yaw))
    bpy.ops.render.render(write_still=True)
    print('RENDERED', yaw, flush=True)
