# Fostier Index — Particle Field Spec (replaces the prism)

The owner found the prism hero tacky: the floating UI chips, the prism itself (it read as a black box) and the laser rays. This spec replaces all three and keeps scroll-driven 3D. Everything else in `dark-prism-redesign-spec.md` stands: palette, type, copy, sections, bilingual pages and the email-based consultation form.

## Removed

- The prism, the light rays, the exit beam, the floor and the horizon glow.
- The floating query pill ("Best immigration advisor in Hong Kong?") and the "[1] Your firm" chip.
- The "Free consultation" button in the header. The hero CTA is enough.

## The visual: fine jade dust

- Thousands of tiny, soft particles in depth on the green-black ground. Jade tones, from deep jade to pale jade-white. Pure space, no ground.
- **One subtle hint:** a single point, bright jade-white, shines more than the rest. There are no text labels in the 3D.
- **Pointer:** particles gently part around the cursor (or a finger) and drift back.

## Scroll: a clear change per scene; the swarm flows between them

Every particle travels to its next place, with slight per-particle delays and a curved path, so the change ripples like a murmuration.

1. **Hero: scatter.** A full-screen field, densest around the centre, drifting slowly. The bright point sits in the dense part, clear of the headline.
2. **Services: three clusters, each level with its service row** (desktop: in the empty left column; they move with the rows as you scroll). Each cluster's form hints at its service:
   - **Diagnostic:** a loose cluster beside two smaller ones (you versus two competitors). The bright point becomes the core of the main cluster.
   - **Rebuild:** an ordered 3D lattice (structure) that turns slowly.
   - **Authority:** concentric rings spreading out (reach), tilted toward the viewer.
3. **Consultation: one point.** Everything collapses into a single bright point with a fine halo, opposite the form (right side on desktop).

## Phones

- The same story with fewer particles.
- The visual sits above the text: the service clusters side by side at the top of the services scene, and the final point above the form.
- A light veil keeps text readable over the particles.

## Fallbacks

- **Reduced motion:** no drifting and no animated travel. Each scene shows its own state when you get there.
- **No WebGL:** the page shows a soft jade glow.

## Implementation notes

- Three.js r149 (already self-hosted). One `THREE.Points` with a custom shader.
- Each particle carries attributes:
  - hero position (unit Gaussian, scaled by layout uniforms)
  - cluster index and offset
  - final-point offset
  - delay, curl direction, size and colour
- Cluster centres and the final point come from the live DOM positions (the service rows and the form panel), unprojected onto the z=0 plane each frame.
- Pointer repulsion is done in screen space in the vertex shader.
- The bright point is a separate glow sprite that follows the same three states.

## Status

Built. It replaces `prism.js` with `site/assets/field.js`. Checked at 1440px and 390px in both languages.
