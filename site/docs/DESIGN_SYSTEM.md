# Universal Fitment — Design System v1

## Direction
Premium utility: quiet, precise, trustworthy. The UI should feel expensive because of restraint and consistency, not decoration.

## Core rules
- Compatibility and evidence outrank price visually.
- One primary action per screen.
- Status colors are reserved for compatibility, warnings, errors and verified states.
- Large tap targets and bottom navigation support one-handed iPhone use.
- Light and dark modes are equal first-class themes.
- System theme is the default.
- Dark mode uses charcoal/navy surfaces, never flat pure black everywhere.
- Motion is subtle and disabled when `prefers-reduced-motion` is enabled.

## Tokens
All UI colors come from CSS custom properties (`--bg`, `--surface`, `--text`, `--accent`, `--ok`, etc.). Components must not hard-code theme-specific colors.

## Theme behavior
User choices: Light / Dark / System. The choice is saved locally. System mode follows the OS and updates live when the OS appearance changes.

## Components
- 20–28px rounded cards with restrained shadows
- 44px minimum visual target for important icon actions
- segmented controls for compact choices
- status pills for evidence, not marketing clutter
- glass-like sticky top and bottom bars

## Typography
Native system font stack for high-quality rendering and zero font payload. Strong negative tracking on display headings, restrained weight on body copy.
