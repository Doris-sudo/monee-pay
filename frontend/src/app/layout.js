import { Inter, Outfit } from "next/font/google";
import "./globals.css";

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

export const metadata = {
  title: "MoneePay — Trustless Commerce on Quai Network",
  description:
    "Escrow-powered payments on Quai Network. Buy with confidence and get paid with certainty using programmable smart contract escrow.",
  keywords: ["Quai Network", "Escrow", "Crypto Payouts", "Qi Token", "WQI", "Blockchain Payments"],
  authors: [{ name: "MoneePay Team" }],
  openGraph: {
    title: "MoneePay — Trustless Commerce on Quai Network",
    description: "Smart-contract-powered escrow payment platform built on Quai Network.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
