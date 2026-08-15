import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { FarcasterProvider } from "@/components/FarcasterProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.moneepay.xyz";

const frameMetadata = {
  version: "next",
  imageUrl: `${appUrl}/og-image.png`,
  button: {
    title: "Launch MoneePay Escrow",
    action: {
      type: "launch_frame",
      name: "MoneePay",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0A0E1A",
    },
  },
};

export const metadata = {
  title: "MoneePay — Trustless Commerce on Quai Network",
  description:
    "Escrow-powered payments on Quai Network. Buy with confidence and get paid with certainty using programmable smart contract escrow.",
  keywords: [
    "Quai Network",
    "Escrow",
    "Crypto Payouts",
    "Qi Token",
    "WQI",
    "Blockchain Payments",
    "Farcaster Frame",
  ],
  authors: [{ name: "MoneePay Team" }],
  openGraph: {
    title: "MoneePay — Trustless Commerce on Quai Network",
    description: "Smart-contract-powered escrow payment platform built on Quai Network.",
    images: [`${appUrl}/og-image.png`],
    type: "website",
  },
  other: {
    "fc:frame": JSON.stringify(frameMetadata),
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <FarcasterProvider>{children}</FarcasterProvider>
      </body>
    </html>
  );
}
