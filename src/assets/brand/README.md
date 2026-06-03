# Howdoyoudo Brand Assets

The single source of truth for our visual identity. Import from here — never re-upload duplicates elsewhere in the codebase.

## Tagline
**Unpacking the industries we love and live in.**

## Terminology (strict)
- ✅ "Unpacking" · ✅ "Jobs" · ✅ "Howdy"
- ❌ "Decoding" · ❌ "Apply" · ❌ "Careers"

## Colours (HSL-first, hex for export)
| Token            | Hex       | HSL                  | Use |
|------------------|-----------|----------------------|-----|
| `--primary`      | `#00E600` | `120 100% 45%`       | Luminous green accent — buttons, highlights, Jobs tab |
| `--background`   | `#FFFFFF` | `0 0% 100%`          | Page background (brilliant white) |
| `--foreground`   | `#0A0A0A` | `0 0% 4%`            | Body ink |
| `--muted`        | `#555555` | `0 0% 33%`           | Secondary text |
| `--cream`        | `#FAFAF7` | `60 17% 98%`         | Print / booklet background |

## Typography
- **Display / headers**: Dela Gothic One
- **Body**: Space Grotesk
- **Marketing ads only**: Big Shoulders Bold ("Doodle Voltage")

## Aesthetic
Wobbly hand-drawn SVG doodles. Black ink on white. Luminous green for emphasis only.

## File map
```
src/assets/brand/
├── README.md               ← this file
├── tokens.json             ← machine-readable colours + fonts
├── logo-wordmark.svg       ← Howdoyoudo? wordmark with green ?
├── logo-mark.png           ← rounded-square app icon (matches Safari home-screen icon, wobbly hand-drawn)
├── logo-question-mark.png  ← standalone wobbly green ? mark (used in Hero headline)
├── howdy-mascot.png        ← character portrait (re-export from src/assets/howdy-mascot.png)
└── icons/                  ← favicons + PWA icons (re-export from /public)
```

For the downloadable brand kit, see `/mnt/documents/howdoyoudo-brand-kit.zip`.
