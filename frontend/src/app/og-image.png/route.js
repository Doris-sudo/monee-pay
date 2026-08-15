import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0E1A",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(0, 212, 170, 0.15), transparent 70%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: "bold",
              color: "#0A0E1A",
            }}
          >
            M
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            MoneePay
          </span>
        </div>
        <h1
          style={{
            fontSize: "52px",
            fontWeight: "900",
            margin: "0 0 16px 0",
            letterSpacing: "-1px",
          }}
        >
          Trustless Commerce on Quai Network
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#94A3B8",
            maxWidth: "800px",
            margin: 0,
          }}
        >
          Smart-contract-powered escrow payment platform built for Quai & Farcaster.
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
