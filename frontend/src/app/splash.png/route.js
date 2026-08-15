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
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "28px",
            background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "72px",
            fontWeight: "bold",
            color: "#0A0E1A",
            marginBottom: "24px",
          }}
        >
          M
        </div>
        <div
          style={{
            fontSize: "32px",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            color: "#00D4AA",
          }}
        >
          MoneePay
        </div>
      </div>
    ),
    {
      width: 600,
      height: 600,
    }
  );
}
