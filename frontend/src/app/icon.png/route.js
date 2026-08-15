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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0E1A",
          borderRadius: "24%",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            width: "300px",
            height: "300px",
            borderRadius: "60px",
            background: "linear-gradient(135deg, #00D4AA 0%, #00B4D8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "180px",
            fontWeight: "bold",
            color: "#0A0E1A",
          }}
        >
          M
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
