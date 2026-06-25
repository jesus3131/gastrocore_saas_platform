---
name: Pro-Service Hospitality Logic
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#00311f'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a31'
  on-tertiary-container: '#27c38a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  gutter: 16px
---

## Brand & Style

The design system is engineered for the high-stakes environment of B2B restaurant management. The brand personality is **authoritative, precise, and reliable**, reflecting an "enterprise-grade" backbone that supports mission-critical operations. It targets restaurateurs, procurement managers, and floor staff who require clarity under pressure.

The design style is **Corporate Modern with a focus on Information Density**. It prioritizes utility and speed of recognition. By utilizing a refined version of functional minimalism, the system minimizes cognitive load in busy kitchen or POS environments while maintaining a sophisticated aesthetic for executive-level financial reporting. The interface communicates stability through structured layouts and a restrained but purposeful use of depth.

## Colors

The palette is anchored by **Cobalt Blue (#1E3A8A)**, used for primary actions and navigational landmarks to evoke professional trust. **Slate Grey (#334155)** serves as the foundation for technical interfaces, secondary text, and iconography, providing a neutral backdrop that doesn't compete with data visualizations.

**Emerald Green (#10B981)** is used surgically to denote profitability, successful synchronization, and "In Stock" statuses. For the background, a palette of cool grays (Slate 50 to 200) is used to differentiate "Surface" layers from the "App Background." Contrast ratios must strictly adhere to WCAG AA standards to ensure legibility in high-glare environments typical of commercial kitchens.

## Typography

This design system utilizes **Inter** for all UI elements to take advantage of its high x-height and excellent legibility in dense data environments. For financial figures, quantities, and SKU numbers within dashboards, **JetBrains Mono** is introduced as a secondary font to ensure tabular alignment and numerical clarity.

Hierarchies are strictly enforced through weight rather than just size. Headlines use Semi-Bold (600) to stand out against data-heavy backgrounds. All "Label" roles should utilize slightly increased letter spacing (0.05em) when set in uppercase to maintain readability at small scales.

## Layout & Spacing

The system employs a **12-column fluid grid** for dashboard views and a **fixed-width centered container** for administrative settings. The spacing rhythm is based on a **4px baseline shift**, ensuring that every element—from icons to buttons—is aligned to a consistent mathematical scale.

- **Desktop (1280px+):** 12 columns, 24px gutters, 40px side margins.
- **Tablet (768px - 1279px):** 8 columns, 16px gutters, 24px side margins.
- **Mobile (<767px):** 4 columns, 12px gutters, 16px side margins.

Data tables should use "Condensed" (8px vertical padding) and "Comfortable" (16px vertical padding) modes to allow users to toggle between high-density inventory views and readable report summaries.

## Elevation & Depth

To maintain a professional, "enterprise-grade" feel, this design system uses **Tonal Layering** rather than heavy shadows. Depth is communicated through subtle border-bottoms and background color shifts (e.g., a Slate 50 card on a White background).

When elevation is required for modals or popovers, use **Ambient Shadows**: ultra-soft, low-opacity (#000000 at 8%) with a large blur radius and no spread. This simulates a natural light source without cluttering the interface with dark edges. Hover states on interactive cards should transition from a "flat" state to a "subtle lift" (2px Y-offset) to provide tactile feedback.

## Shapes

The design system utilizes a **Rounded (0.5rem)** logic for primary UI elements. This balances the professional "square" nature of enterprise software with the modern warmth of hospitality tools.

- **Small elements (Buttons, Checkboxes):** 4px (Soft) to maintain precision.
- **Medium elements (Cards, Input Fields):** 8px (Rounded) for a approachable feel.
- **Large elements (Modals, Sidebars):** 16px (Rounded-LG) to clearly distinguish structural overlays.
- **Status Pills:** Fully rounded (Pill-shaped) to differentiate status indicators from actionable buttons.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Cobalt Blue (#1E3A8A) with white text. 8px border radius.
- **Secondary Action:** Ghost style with Slate Grey borders (1px solid) and text.
- **Input Fields:** Use 1px Slate 200 borders. On focus, the border transitions to Cobalt Blue with a 2px "focus ring" at 20% opacity.

### Data Cards
Cards must have a 1px Slate 100 border and no shadow by default. Headers within cards should have a subtle background tint (Slate 50) to separate "Title/Metadata" from "Content/Values."

### Status Indicators (Feedback)
- **Active:** Emerald Green background (10% opacity) with Emerald Green text.
- **Agotado (Out of Stock):** Soft Red background with bold red text.
- **En Proceso (In Progress):** Cobalt Blue background (10% opacity) with Cobalt Blue text and a subtle pulse animation for the icon.

### Data Tables
Tables are the heart of the system. Use sticky headers, zebra-striping (Slate 50) on hover, and clear alignment: text to the left, monetary values/quantities to the right. Inline actions (edit/delete) should only appear on row-hover to reduce visual noise.