# Design System — Airbnb-inspired (2026 reference)

Reference design tokens and UI patterns for agent prompts and implementation. Based on extracted public-surface conventions; verify against live product where fidelity matters.

---

## 1. Visual Theme & Atmosphere

Airbnb's 2026 design feels like a travel magazine that happens to be an app — pristine white canvases give way to full-bleed photography, and the interface itself disappears so the listings can breathe. The signature Rausch coral-pink (`#ff385c`) is used sparingly but unmistakably: search CTA, active tab indicator, primary action button, the occasional price or wishlist heart. Everything else is a disciplined grayscale, with `#222222` carrying almost every line of text.

What makes the system unmistakably Airbnb is how much faith it places in content. Property photos are displayed at hero scale, 4:3 with edge-to-edge radius treatment. Category switching happens through a tri-tab picker (Homes / Experiences / Services) that uses 3D rendered illustrated icons (a pitched-roof house, a hot-air balloon, a service bell) — physical, tactile, almost toy-like — paired with crisp Airbnb Cereal VF labels. This is the rare consumer product where 3D renders and purely typographic UI coexist without tension.

The newest surface is the Experiences product line — same chrome, but richer card density, more photography, and a center-anchored booking panel with sticky right-rail pricing. Listing detail pages (both rooms and experiences) follow a tight template: full-bleed hero image grid → overlapping rounded booking card (sticky on scroll) → amenities → reviews (Guest Favorite awards use a big centered 4.81 rating with a laurel-wreath lockup) → map → host profile → disclosures. The rhythm is consistent whether you're booking a room or a yacht tour.

### Key Characteristics

- **Rausch coral-pink (`#ff385c`)** as a single-accent brand color, used only for primary CTAs and the search button
- **Full-bleed photography** at 4:3 / 16:9 with gentle corner rounding (14–20px) as the primary visual vocabulary
- **3D rendered category icons** paired with typographic tabs — the one place the system allows illustration
- **Circular 50% icon buttons** (back arrow, share, favorite, carousel arrows) scattered throughout
- **Airbnb Cereal VF** carries every label, from 8px legal footnote to 28px section heading — a single-family system
- **Product-tier color coding:** Airbnb Plus (magenta `#92174d`), Airbnb Luxe (deep purple `#460479`), Airbnb (Rausch coral)
- **Guest Favorite award lockup** — centered giant rating number between two laurel wreaths, one of the most recognizable moments in the system
- **Sticky booking panel** with a price → dates → guests stack, pinned to the right rail on desktop, transforming to a bottom-anchored "Reserve" bar on mobile
- **Sticky bottom mobile navigation** (Explore / Wishlists / Log in) with an active-state Rausch tint

---

## 2. Color Palette & Roles

### Primary

| Token / name | Hex | CSS variable (reference) | Usage |
|--------------|-----|---------------------------|--------|
| **Rausch** | `#ff385c` | `--palette-bg-primary-core` | Primary "Reserve" button, search submit, active tab underline, wishlist heart fill, pricing emphasis — highest-visibility color on every page |

### Secondary & Accent

| Token / name | Hex | CSS variable | Usage |
|--------------|-----|--------------|--------|
| **Deep Rausch** | `#e00b41` | `--palette-bg-tertiary-core` | Pressed/active button states, gradient terminal stops |
| **Plus Magenta** | `#92174d` | `--palette-bg-primary-plus` | Airbnb Plus product tier |
| **Luxe Purple** | `#460479` | `--palette-bg-primary-luxe` | Airbnb Luxe product tier |
| **Info Blue** | `#428bff` | `--palette-text-legal` | Legal/informational links (terms, privacy, disclosures) — only non-monochrome link color |

### Surface & Background

| Name | Hex | Usage |
|------|-----|--------|
| **Canvas White** | `#ffffff` | Default page background; cards, containers, detail pages |
| **Soft Cloud** | `#f7f7f7` | Footer backgrounds, map wrappers, sections that step back from primary white |
| **Hairline Gray** | `#dddddd` | Ubiquitous 1px borders — cards, amenity rows, review panels, footer columns |

### Neutrals & Text

| Name | Hex | CSS variable | Usage |
|------|-----|--------------|--------|
| **Ink Black** | `#222222` | `--palette-text-primary` | ~90% of text: headings, body, nav, prices |
| **Charcoal** | `#3f3f3f` | `--palette-text-focused` | Focused input text, one-step-down emphasis |
| **Ash Gray** | `#6a6a6a` | `--palette-bg-tertiary-hover` | Secondary labels, subtitles under city names, muted footer links |
| **Mute Gray** | `#929292` | `--palette-text-link-disabled` | Disabled buttons, low-priority metadata |
| **Stone Gray** | `#c1c1c1` | — | Tertiary dividers, icon strokes, placeholder avatars |

### Semantic & Accent

| Name | Hex | CSS variable | Usage |
|------|-----|--------------|--------|
| **Error Red** | `#c13515` | `--palette-text-primary-error` | Validation errors, destructive warnings |
| **Deep Error** | `#b32505` | `--palette-text-secondary-error-hover` | Pressed/active error variants |
| **Translucent Black** | `rgba(0, 0, 0, 0.24)` | `--palette-text-material-disabled` | Disabled material-style labels |

### Gradient System

Used sparingly — typically wordmark and search-button branded moment only:

```css
linear-gradient(90deg, #ff385c 0%, #e00b41 50%, #92174d 100%);
```

Coral → magenta sweep is the "branded moment" — not a full surface; narrow pill fill or logo treatment only.

---

## 3. Typography Rules

### Font Family

- **Primary:** Airbnb Cereal VF (proprietary variable-weight sans-serif).
- **Fallbacks (order):** `Circular, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif`
- **Weights observed:** 500, 600, 700 — no 400 as "regular"; body weight is **500**.
- **OpenType:** `salt` (stylistic alternates) on compact 11px and 14px 600-weight labels. No ligature/fractional-numeral features observed.

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|--------|
| Section Heading | 28px / 1.75rem | 700 | 1.43 | 0 | Page-level headings |
| Subsection Heading | 22px / 1.38rem | 500 | 1.18 | -0.44px | Content dividers |
| Card Title | 21px / 1.31rem | 700 | 1.43 | 0 | Review panels, card leads |
| Listing Title | 20px / 1.25rem | 600 | 1.20 | -0.18px | Detail listing headlines |
| Subtitle Bold | 16px / 1rem | 600 | 1.25 | 0 | Host name, city name |
| Body Medium | 16px / 1rem | 500 | 1.25 | 0 | Primary body on detail pages |
| Button Large | 16px / 1rem | 500 | 1.25 | 0 | "Reserve", "Become a host" |
| Button Default | 14px / 0.88rem | 500 | 1.29 | 0 | Standard buttons |
| Link | 14px / 0.88rem | 500 | 1.43 | 0 | Nav, footer |
| Caption Medium | 14px / 0.88rem | 500 | 1.29 | 0 | Metadata, subtitles |
| Caption Bold | 14px / 0.88rem | 600 | 1.43 | 0 | `salt` — numeric stats, small emphasis |
| Caption Small | 13px / 0.81rem | 400 | 1.23 | 0 | Review dates, micro-metadata |
| Micro Default | 12px / 0.75rem | 400 | 1.33 | 0 | Footer disclaimers |
| Micro Bold | 12px / 0.75rem | 700 | 1.33 | 0 | "NEW" pills |
| Badge Uppercase | 11px / 0.69rem | 600 | 1.18 | 0 | `salt` — compact badges |
| Superscript | 8px / 0.5rem | 700 | 1.25 | 0.32px | Uppercase — price footnotes |

### Principles

- One family, many weights — identity from the family, not mixing faces.
- **500 is the new 400** — confident body texture.
- Negative tracking on display type only (20px+): ~-0.18 to -0.44px; body at 0.
- Tight line-heights for headlines (1.18–1.25); body/caption to ~1.43 for long-form.
- **No all-caps except 8px** superscript role; elsewhere sentence case + weight.

### Font Substitutes

Airbnb Cereal VF is proprietary. Closest open alternatives: Circular Std (commercial) or **Inter** (Google Fonts) with slightly reduced letter-spacing at display sizes. Documented fallbacks render acceptably on Apple platforms via system-ui / San Francisco.

---

## 4. Component Stylings

### Buttons

**Primary CTA** ("Reserve", "Search", "Add dates")

- Background: Rausch `#ff385c`
- Text: Canvas White `#ffffff`, Cereal 500, 16px
- Padding: ~14px vertical, 24px horizontal
- Radius: 8px (rect) or 50% (circular icon)
- Border: none
- Active/pressed: `transform: scale(0.92)` + focus ring `0 0 0 2px #222222`

**Secondary** ("Become a host", outlined tertiary)

- Background: `#ffffff`
- Text: Ink Black `#222222`, 500, 14–16px
- Padding: 10px 16px
- Radius: 20px (pill) or 8px (rect)
- Border: 1px solid Hairline Gray `#dddddd`

**Icon-only circular** (back, share, favorite, carousel)

- Background: `#f2f2f2` or white + 1px translucent black border
- Icon: `#222222` stroke, 16–20px
- Size: 32–44px diameter, radius 50%
- Active: `scale(0.92)`; optional `0 0 0 4px rgb(255,255,255)` ring on photos

**Disabled**

- Background: `#f2f2f2`, text Stone Gray `#c1c1c1`, opacity 0.5

**Pill tab** (Homes / Experiences / Services)

- Transparent bg; Ink Black text, 500, 16px; padding 8px 14px
- Active: 2px Ink Black underline under label
- Pair with 36–48px 3D icon above label

### Cards & Containers

**Listing card** (grid / results)

- Background: `#ffffff`; image radius 14px; 4:3 full-bleed image
- No outer padding on container; ~12px between image and metadata
- No shadow — whitespace + photo radius define separation
- Metadata: city line 1 (16px 600), distance/duration line 2 (14px 500 Ash), dates, price + per night

**Detail booking panel** (sticky right rail)

- Background `#ffffff`; radius 14–20px; border 1px `#dddddd`
- Shadow (three-layer): `rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px 0, rgba(0,0,0,0.1) 0 4px 8px 0`
- Padding 24px; width ~370px; pin ~120–140px below viewport top
- Content: price → dates → guests → primary CTA → "You won't be charged yet"

**Amenity grid rows**

- White bg; 1px Hairline at row level; 16px vertical padding per row; 24px icon + 16px 500 label

**Review card**

- White, no border; grid gaps only
- Row: 40px avatar + 16px 600 name + 14px 400 Ash date; body 14px 500 below

### Inputs & Forms

**Search bar (home)**

- White bg; 1px `#dddddd`; radius 32px (pill)
- Shadow: `rgba(0,0,0,0.04) 0 2px 6px 0`
- Three segments (Where / When / Who) with vertical dividers; 12px 500 label, 14px 500 placeholder
- Submit: 48px Rausch circular button at right

**Text input**

- White; 1px `#dddddd`; radius 8px; padding 14px 16px
- Focus: Ink Black border + `0 0 0 2px` outer ring
- Error: border `#c13515`, helper same color

**Date picker**

- 7-column grid; day cells 40–44px, circular
- Selected range: Ink Black bg, white numerals; middle dates Soft Cloud `#f7f7f7`

### Navigation

**Top nav (desktop)**

- ~80px height; white; wordmark Rausch ~102×32px
- Center: tri-tab + 3D icons; active 2px Ink underline
- Right: "Become a host", 32px globe, 36px avatar menu
- Border-bottom: 1px Hairline

**Top nav (mobile)**

- Full-width search pill: "Start your search" + magnifier
- Tri-tab below; icons ~28px
- Bottom tab bar: Explore (Rausch active) / Wishlists / Log in — 24px icons, 12px labels

**Listing detail secondary nav**

- Sticky horizontal anchors (Photos · Amenities · Reviews · Location · Host)
- Height ~56px; border-bottom Hairline

### Image Treatment

- Ratios: 4:3 (listing grids), 16:9 (experience heroes), 1:1 (avatars)
- Radius: 14px grid images, 20px detail hero frames, 50% avatars
- Detail grid: five-photo (50% large left + 2×2 right), shared 20px outer radius
- Lazy loading + blurred placeholders; carousel: 32px circular arrows, dots 12px from bottom

### Signature Components

**Guest Favorite lockup**

- Centered rating 44–56px 700; laurel SVGs ~48px tall flanking
- Below: "Guest Favorite" 12px 700 uppercase, 0.32px tracking; sub-label 14px 500 Ash
- Full-width on white, no container border

**Tri-tab category picker**

- Homes / Experiences / Services; ~48px 3D icon + 16px 500 label
- Experiences & Services: small navy "NEW" pill (12px 700 white on dark blue), top-right of icon
- Active: 2px Ink underline

**Inspiration city grid**

- 6 columns desktop, 2 mobile; text-only cells (16px 600 city, 14px 500 Ash subtitle)
- Tabbed categories with 2px underline + weight on active

**Reserve sticky card**

- Desktop: fixed below hero ~120px from top
- Mobile: full-width bottom bar, "From $X / night" + Rausch Reserve pill

**Experience host card**

- Full-width rounded container; 3:2 cover; 56px avatar overlapping cover bottom 50%
- Name 16px 700; tenure 14px 500 Ash; Rausch "Message host" pill

**"Things to know" strip**

- 3 columns: icon, 16px 600 heading, 14px 500 Ash body, "Show more" Ink underline
- Strip bordered top/bottom 1px Hairline

---

## 5. Layout Principles

### Spacing System

- **Base unit:** 8px
- **Scale (extracted):** 2, 3, 4, 5.5, 6, 8, 10, 11, 12, 15, 16, 18.5, 22, 24, 32px
- Section padding: ~48–64px desktop vertical; 24–32px mobile
- Card padding: 24px (booking/large), 16px (amenity rows), 12px (listing metadata)
- Listing gutter: 24px desktop, 16px mobile
- Stacked text rows within metadata: 4–8px

### Grid & Container

- Max width: 1760–1920px ultra-wide; ~1280px many detail pages
- Homepage grid: 6 cols ≥1760px → 5 ≥1440 → 4 ≥1128 → 3 ≥800 → 2 ≥550 → 1 below
- Detail: ~58% main / ~36% sticky panel / ~6% gutter
- Footer: 3 columns Support / Hosting / Airbnb

### Whitespace Philosophy

Dense but not cramped: group with whitespace; 24px between cards; 4–8px inside metadata blocks; booking panel uses boundary more than internal row spacing.

### Border Radius Scale

| Radius | Use |
|--------|-----|
| 4px | Inline anchors, tag chips |
| 8px | Text buttons, dropdowns, small utilities |
| 14px | Listing images, generic containers, badges |
| 20px | Primary pills, large images, booking panel |
| 32px | Search pill, XL containers |
| 50% | Circular icon buttons, avatars, wishlist hearts |

---

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| 0 | No shadow | Listing cards, body, text sections |
| 1 | `rgba(0,0,0,0.08) 0 4px 12px` | Active/pressed icon buttons |
| 2 | Three-layer stack (see booking panel) | Booking panel, modals, dropdowns |
| Focus ring | `0 0 0 2px #222222` | Buttons, focused search |
| White separator ring | `0 0 0 4px rgb(255,255,255)` | Circular controls on photography |

**Philosophy:** Layered low-opacity shadows (not single heavy drop); photography carries depth; laurel lockup and 3D category icons are the main "dimensional" accents.

---

## 7. Do's and Don'ts

### Do

- Reserve Rausch for primary actions and active-tab indicator.
- Let photography breathe — 4:3, 14–20px radius, no overlaid text/scrims.
- Use Ink Black `#222222` for text under the accent layer — not pure `#000`.
- Pair tri-tab 3D icons with flat type; don't mix illustration styles on one surface.
- Stack three low-opacity shadows for booking-panel elevation.
- Hairline `#dddddd` for card and row dividers.
- Sticky booking desktop → bottom Reserve bar mobile.
- 4–8px inside metadata groups; 24px between cards.

### Don't

- Don't add arbitrary accent colors outside Rausch / Plus / Luxe / legal blue.
- Don't put type inside photos — captions below.
- Don't use all-caps except the 8px superscript role.
- Don't square icon buttons — keep 50% circles.
- Don't shadow listing cards.
- Don't use gradient fills as large surfaces (wordmark/search moment only).
- Don't default body to 400 — use 500.
- Don't swap in a second display typeface.

---

## 8. Responsive Behavior

### Breakpoints (meaningful set)

| Name | Width | Key changes |
|------|-------|-------------|
| Ultra-wide | ≥1760px | 6-col grid; 1760–1920px max content |
| Desktop XL | 1440–1759px | 5-col; full nav; sticky booking |
| Desktop | 1128–1439px | 4-col; sticky booking |
| Laptop | 1024–1127px | 3–4 col |
| Tablet | 800–1023px | 3-col; search may collapse |
| Small tablet | 550–799px | 2-col; booking inline full-width |
| Mobile | 375–549px | 1-col; bottom tab bar |
| Small mobile | <375px | Tighter 16px padding; ~28px category icons |

### Touch Targets

≥44×44px; circular buttons 32–44px with 8–12px hit padding; primary Reserve ~48px tall; tri-tab hit area full icon+label (~64×80px per tab).

### Collapsing Strategy

- Nav: wordmark + tri-tab tablet+; mobile search pill then tabs; globe/avatar → bottom bar
- Search: three-segment desktop → single pill mobile → full-screen sheet
- Booking: sticky right ≥1128px; inline 800–1127px; bottom bar <800px
- Grid: 6 → 5 → 4 → 3 → 2 → 1
- Detail images: five-grid desktop → swipe carousel + dots mobile
- Footer: 3-col → stacked <800px

### Image Behavior

- `loading="lazy"`; blurred preview thumbs
- Responsive width params (e.g. im_w 240 / 720 / 1200 / 2400) — same crop scaled
- Carousels maintain ~4:3 display height

---

## 9. Agent Prompt Guide

### Quick Color Reference

- Primary CTA: **Rausch `#ff385c`**
- Page background: **Canvas White `#ffffff`**
- Subsurface: **Soft Cloud `#f7f7f7`**
- Text: **Ink Black `#222222`**
- Secondary text: **Ash Gray `#6a6a6a`**
- Border: **Hairline Gray `#dddddd`**
- Error: **Error Red `#c13515`**
- Info link: **Info Blue `#428bff`**
- Luxe: **Luxe Purple `#460479`**
- Plus: **Plus Magenta `#92174d`**

### Example Component Prompts

1. **Primary Reserve button:** Rausch background, white Cereal 500 at 16px, 14×24px padding, 8px radius, no shadow. Pressed: `scale(0.92)` + `0 0 0 2px #222222`.

2. **Listing card:** 4:3 image, 14px radius, no shadow; three text rows, 4px gaps: 16px 600 Ink city, 14px 500 Ash subtitle, 16px 500 Ink price with 14px "per night".

3. **Sticky booking panel:** white, 14px radius, 1px Hairline border, three-layer shadow, 24px padding, ~370px wide, ~120px below viewport top; price, dates, guests, Rausch CTA, 12px Ash disclaimer.

4. **Tri-tab picker:** Homes / Experiences / Services; ~48px 3D icons; 16px 500 labels; active 2px Ink underline; NEW pill (12px 700 white on dark navy) on Experiences & Services icons.

5. **Guest Favorite:** centered ~52px 700 rating; ~48px laurel SVGs; 12px 700 uppercase GUEST FAVORITE, 0.32px tracking; 14px 500 Ash sub-label; on white, no border.

### Iteration Guide

- Fix **one component** at a time.
- Name colors explicitly (e.g. Ink Black `#222222`).
- Mix measurements with feel ("three-layer elevation", "magazine-like").
- Default body to **500**; emphasis **600–700**; avoid 400 for "regular" body.
- Keep Rausch rare — if multiple Rausch elements per viewport, consider neutralizing extras.

### Known Gaps

- Homepage property grid: partial capture in source extraction; card specs partly inferred — verify on live site.
- Category 3D icons: raster assets; exact SVG/PNG specs not documented.
- Motion/timing: not in scope of static extraction.
- **Dark mode:** not described; light theme only.
