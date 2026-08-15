# MoneePay Frontend Application

Frontend application for **MoneePay** — Trustless Commerce, Task Rewards, and Team Payroll built on Next.js 16 (App Router), Vanilla CSS Design System, and `@farcaster/frame-sdk`.

---

## 📁 Application Structure & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page showcasing Quai dual-ledger escrow architecture, stats, and Farcaster share CTA. |
| `/dashboard` | User & Corporate Treasury Hub dashboard with active escrows, metrics, and audit log. |
| `/order/[id]` | Escrow checkout & milestone breakdown page with release payment and dispute triggers. |
| `/order/create` | Escrow creation wizard for **Task Rewards** and **Product Sales Listings**. |
| `/payroll` | **MoneePay for Teams** — Batch corporate payroll dispatcher with CSV upload parser. |
| `/.well-known/farcaster.json` | Farcaster Frame v2 / Mini App manifest endpoint. |
| `/og-image.png`, `/icon.png`, `/splash.png` | Dynamic `next/og` `ImageResponse` asset generators. |

---

## ⚡ Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_APP_URL=https://www.moneepay.xyz
```

---

## 🎨 Design System

Styled using Vanilla CSS module primitives defined in `DESIGN_SYSTEM.md`:
- **Primary Accent**: Electric Teal (`#00D4AA`)
- **Secondary Accent**: Cyan (`#00B4D8`)
- **Background**: Dark Navy (`#0A0E1A`)
- **Glassmorphism**: Backdrop blur cards (`rgba(255, 255, 255, 0.03)`)
