# MoneePay Design System Specification

## Overview
MoneePay's design system is crafted for a high-end fintech experience on the Quai Network ecosystem. It features dark mode as the default, frosted glassmorphism elements, electric teal and cyan accents, and clear status hierarchies.

---

## 🎨 Color Palette Tokens

| Category | CSS Variable | Hex / Value | Description |
|----------|--------------|-------------|-------------|
| **Background** | `--bg-primary` | `#0A0E1A` | Main page background |
| **Surface** | `--bg-secondary` | `#0F1528` | Elevated container fill |
| **Card Fill** | `--bg-card` | `rgba(255, 255, 255, 0.03)` | Frosted glass background |
| **Primary Accent** | `--accent-teal` | `#00D4AA` | Brand primary color |
| **Secondary Accent** | `--accent-cyan` | `#00B4D8` | Secondary highlight |
| **Gradient** | `--gradient-primary` | `linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)` | Brand gradient |

---

##  typography & Fonts
- **Heading Font**: `Outfit` (var `--font-outfit`)
- **Body Font**: `Inter` (var `--font-inter`)

---

## 🧱 Component Primitives
- **Buttons**: Primary (`.btn-primary`), Outlined (`.btn-outlined`), Ghost (`.btn-ghost`)
- **Cards**: `.glass-card` with `backdrop-filter: blur(16px)`
- **Badges**: Teal, Cyan, and Warning status variants
