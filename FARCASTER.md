# Farcaster Deployment & Integration Guide for MoneePay

This guide explains how MoneePay is deployed as a **Farcaster Frame v2 / Mini App** on Farcaster (Warpcast).

---

## Architecture & Integration Overview

MoneePay integrates with the Farcaster Frame v2 specification:

1. **Manifest File (`/.well-known/farcaster.json`)**: Served via `src/app/.well-known/farcaster.json/route.js`. Contains domain verification signature (`accountAssociation`) and app launch settings.
2. **Meta Tags (`fc:frame`)**: Injected into `src/app/layout.js` so standard web links dynamically unfurl into interactive Farcaster Mini App frames when posted in casts.
3. **Frame SDK Client (`@farcaster/frame-sdk`)**: Initialized via `<FarcasterProvider>` component. Triggers `sdk.actions.ready()` on load to remove Warpcast's splash screen when launched inside Farcaster frame container.
4. **Cast Sharing (`<FarcasterShareButton>`)**: Enables one-click sharing of escrow orders and payment links directly to Warpcast compose feeds.

---

## Testing Locally with Farcaster Frame Tools

### 1. Start Local Dev Server
```bash
cd frontend
npm run dev
```

### 2. Expose Local Server via Tunnel (Ngrok or Cloudflare)
Farcaster clients require HTTPS URLs to load frames:
```bash
ngrok http 3000
# or
npx cloudflared tunnel --url http://localhost:3000
```
Copy your HTTPS forwarding URL (e.g., `https://abc1234.ngrok-free.app`).

### 3. Set Environment Variable
Update your `.env.local` or environment variable:
```env
NEXT_PUBLIC_APP_URL=https://abc1234.ngrok-free.app
```

### 4. Test in Warpcast Developer Portal / Frame Playground
1. Open [Warpcast Frame Developer Portal](https://warpcast.com/~/developers/frames) or [Farcaster Frame v2 Playground](https://frame-v2-demo.vercel.app).
2. Enter your tunneled URL: `https://abc1234.ngrok-free.app`
3. Verify:
   - Manifest loads correctly from `/.well-known/farcaster.json`.
   - Splash screen transitions cleanly to MoneePay interface.
   - `fc:frame` meta tag JSON is validated.

---

## Production Deployment & Domain Signing

### Step 1: Deploy Frontend to Vercel / Railway
Deploy your Next.js application to Vercel or your hosting provider:
- Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://moneepay.xyz`).

### Step 2: Generate Farcaster Account Association Signature
To verify domain ownership with your Farcaster account (FID):

Using `@farcaster/frame-node` or Warpcast Developer Portal:
1. Go to [Warpcast Developer Portal - Account Association](https://warpcast.com/~/developers).
2. Enter your production domain (`moneepay.xyz`).
3. Sign the generated payload with your Farcaster custody/signer key.
4. Copy the resulting `accountAssociation` object (containing `header`, `payload`, `signature`).
5. Update `src/app/.well-known/farcaster.json/route.js` with your production `accountAssociation` values.

---

## Sharing MoneePay on Farcaster

Users can cast MoneePay links on Warpcast by attaching the URL or clicking **Share to Farcaster** on any escrow order.

Example cast format:
```text
Check out my escrow listing on MoneePay (Quai Network)! 🔐
https://moneepay.xyz/order/82hd91
```

Warpcast automatically parses the `fc:frame` tag and displays the **Launch MoneePay Escrow** action button in the user's feed.
