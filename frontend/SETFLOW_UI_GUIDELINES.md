# SETFLOW UI GUIDELINES: ANALOG HERITAGE

## 1. THE CORE PHILOSOPHY
Setflow is NOT a modern app; it is a piece of high-end studio hardware. 
- **NO** flat, sterile backgrounds.
- **NO** generic "minimalist" white/grey space.
- **NO** simulation of textures via SVGs/Lines.
- **YES** to tactile surfaces, physical depth, grit, and analog warmth.

## 2. VISUAL LAWS
### A. Depth & Layering
- All interactive elements must have a physical presence.
- **Inset Elements:** Use deep inner shadows (`box-shadow: inset ...`) to create the effect of a cutout in a metal chassis.
- **Raised Elements:** Use subtle outer shadows and hard edges to simulate buttons/knobs.
- **Overlay:** A subtle "Grain/Noise" layer must be applied over the entire UI to kill the digital smoothness.

### B. The Signal Flow (Backgrounds)
- Backgrounds are composed of real image assets (`/assets/images/backgrounds/`).
- Transitions between images must be handled via `linear-gradient` masks (Blending).
- The "Flow" is a living element: slow, pulsing animations on the gradients to simulate an active electrical signal.

### C. Typography & LED Feedback
- **Technical Fonts:** Use the Manifest's Mono and Sans-Serif fonts for a "Technical Manual" look.
- **Hardware Feedback:** LEDs are the primary state indicators. 
    - Red = Standby/Awaiting.
    - Green = Active/Ready.
    - Amber = Warning/Highlight.

## 3. IMPLEMENTATION MANDATE
Whenever updating the UI, the engineer MUST:
1. Reference `SETFLOW_MANIFEST.md` for color tokens.
2. Reference `SETFLOW_UI_GUIDELINES.md` for the tactile feel.
3. Prioritize "Haptic Experience" over "Clean UI".
