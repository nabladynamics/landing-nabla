# Spatial experience

The primary landing page at `/`, inspired by the continuous camera journey of
https://www.beyond-aero.com/. The former `/experience` route redirects home.

## Navigation and variants

Spatial has its own presentation of `/industries`, `/platform` and `/contact`.
The other designs live at `/styles/{default|deeptech|editorial|industrial|lab}`
with the same three section paths appended. The header and footer keep links
inside the active design; switching styles preserves the section being viewed.
The URL owns the selection, including on reload. Legacy `?theme=` links redirect
to the corresponding style route; old browser preferences cannot override it.

Shared page components live in `components/pages/`. All variants use the same
six real industry photographs and descriptions from `IndustriesGrid`, styled
with their own palette and typography. Spatial tokens live in `app/globals.css`;
the shared Spatial header/footer styles are scoped in
`components/experience/spatial-navigation.module.css`.

The 3D scene remains isolated in `components/experience/`, `public/experience/`
and `scripts/experience/`. Its static asset URLs have not moved.

## Implementation

Native document scrolling controls a single 3D camera across five exhibits in
one studio. There is no wheel interception, forced scroll snapping or video
scrubbing. Camera movement follows scroll on demand. While a vehicle or the cooling exhibit is visible,
illustrative flow trails advance at a capped 30 fps (24 fps on mobile).
Rendering pauses when the canvas leaves the viewport, in hidden tabs, and
when the camera rests at the engineering exhibit.
The studio uses a continuous paper-coloured floor, soft contact shadows and
subtle ground lines for depth; there are no backdrop panels behind the CADs.
Browser zoom and short windows keep the same finished 3D scene. Short windows
use a scrollable text column beside the model so copy and links remain accessible.
Reduced motion stops the automatic flow and camera easing without replacing the
models. If WebGL or asset loading fails, a text-only view preserves the content
and links; old CAD posters are never used. A skip link bypasses the journey.

Start frames the aircraft more closely from the front quarter, adapting the
distance to the available width, with a sparse, thinner and softer selection
of flow paths. Air keeps the same sparse selection with
slightly stronger strokes; other chapters retain their own flow treatment.

Each exhibit can be turned around its vertical axis by dragging horizontally
over the scene. Its flow rotates with it, while the studio and scroll camera
stay fixed. Angles persist separately during the visit; Reset view (or Home)
restores the original view. The focusable control also supports left/right
arrow keys. Vertical touch scrolling and trackpad scrolling remain native.
Interaction pauses during camera travel and is cleaned up with the scene.

The aerospace, marine and motorsport exhibits use the actual CAD supplied in
`lib/CADs/`, converted offline to lightweight display GLBs:

- Boeing 747: complete assembly STL, `assets/boeing.glb`.
- Cargo ship: assembly STEP, `assets/cargo-ship.glb`.
- Formula racing car: assembly STEP, `assets/formula-one.glb`.

The source CAD is unchanged. The optimized display geometry is served by the
website; no CAD parsing runs in the browser. All
display models use Y-up, nose -X, and a common exhibition scale, rather than
representing the relative physical sizes of the vehicles. Reproducible offline
converters live in `scripts/experience/`.

Cooling uses a detailed procedural rack-and-CDU exhibit with perforated doors,
server faceplates, a service cutaway, cable trays and restrained steel pipework.
Its locally authored material textures and studio reflections are generated
only in the browser; it needs no additional asset downloads. Static geometry
is merged by material with UVs preserved.
Animated blue supply and copper return traces follow the cooling circuit, with
subtle rack heat cues. The colours illustrate heat transport, without implying
measured temperatures. This layer rotates with the equipment and pauses with
the scene. The legend identifies the supply and return colours.

The final exhibit is a detailed engineering studio with an oak worktable,
mesh task chairs, articulated monitor arms and locally authored screen
illustrations. It uses its own UV-preserving material batches. The flow lines
are decorative; none of these scenes are Nabla simulation results.
Copy describes development goals and discloses no solver implementation.

Three.js **0.180.0** is pinned and served locally from `public/experience/vendor/`.
The two minified browser modules and MIT license come unmodified from the
official npm `three@0.180.0` package. They are loaded only on the Spatial home; no new
project dependencies or runtime CDN requests are required.
The GLTF loader and its geometry utility come from the same official package,
with only their imports adapted to the local Three.js browser module.
The ship uses the loader's native `KHR_mesh_quantization` support; no external
geometry decoder is required.

CAD assets load in parallel. The scene appears only after all models have been
parsed, finished and rendered at the current scroll position. No provisional
CAD poster or opacity fade is shown during startup.
Loading is aborted on navigation; a failed request falls back to the text-only
view. Faraway exhibit models are culled to
limit rendering work during the camera journey.

Camera framing and motion: `public/experience/scene.js`.
Pointer and keyboard rotation: `public/experience/exhibit-rotation.js`.
Body-specific illustrative flow paths: `public/experience/flow-paths.js`.
Batched streamline materials and animation: `public/experience/flow-visual.js`.
Exhibit geometry: `public/experience/models.js`.
Cooling geometry and materials: `public/experience/datacentre.js` and
`public/experience/datacentre-materials.js`.
Cooling circuit animation: `public/experience/datacentre-thermal.js`.
CAD asset mapping: `public/experience/cad-assets.js`.
Presentation finishes: `public/experience/cad-finishes.js`; these apply colour
and PBR surface treatments at load time without modifying the CAD geometry
or source files. The liveries are illustrative Nabla presentation colours.
`public/experience/studio-reflections.js` supplies their local reflection map,
without changing the lighting of the other exhibits.
Engineering studio: `public/experience/engineering-studio.js` and
`public/experience/engineering-materials.js`.
Chapter copy: `components/experience/chapters.ts`.
Journey styles are scoped in `spatial-experience.module.css`.
