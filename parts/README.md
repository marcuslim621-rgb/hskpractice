# parts/ — baked mascot rig sprites

**Every PNG here is a full 400x640 canvas with the part already in its final
position.** They are pre-aligned: stack all eight at 0,0 and you get the
character. The transparent margin *is* the positioning data.

Do not crop, trim, "optimise", re-export, or read their content bounds and
reposition them. Do not size an `<img class="art">` to anything but
`400px x 640px`. If the surrounding CSS sets `width:auto`, `max-width:100%`,
`object-fit:cover`, or a flex/grid stretch, the layers scale by different
amounts and the character comes apart.

**One exception, deliberate:** `styles.css` applies a block of `transform` pose
offsets to six of the `.art` layers — longer legs, heavier sleeves, torso
lifted. That is a chosen look layered on top of the baked alignment, not a
correction to it. The baked stack is still the zero position; if you ever need
the neutral figure back, delete that block and everything lines up at 0,0.
Changing those offsets changes the pose, so re-measure where the feet land
before adjusting `.rigdock`'s `bottom`.

To show the rig smaller, scale the **whole rig** — `.rigdock` in `styles.css`
does this with a `transform:scale()` on the wrapper. Never resize the images
individually.

Pivots live on the `.slot` (in 400x640 canvas coordinates), never on the
`.art`. They are in `styles.css` under "MASCOT RIG".

`arm-r` sits at `z-index:2`, behind the body, which is a deliberate departure
from the handoff table's `5`. The raised arm reads wrong in front of the dress.
Note that `prop` is nested inside `arm-r`, so it rides that slot's stacking
context and moves with it.

## Source

Baked from the 1254x1254 source art by `chibi-rig/tools/build-parts.py`, which
crops each source to its alpha bounding box, scales it by its own factor, and
pastes it at a center point on the shared canvas. The per-part scales differ by
design — the source files were not drawn to a common scale, so **re-deriving
placement from the 1254px sources does not work**.

To change a placement, edit `chibi-rig/tools/spec.json` and re-run
`python3 tools/build-parts.py --write`, then copy the output here. Do not
hand-edit these PNGs. `chibi-rig/HANDOFF.md` has the full record.

`hair-front.png` is deliberately absent — `head.png` already contains the bangs.
