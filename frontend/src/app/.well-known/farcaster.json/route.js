export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.moneepay.xyz";

  const manifest = {
    accountAssociation: {
      header:
        "eyJmaWQiOjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhkOGNFQTYzNjkyZTVlRDI4YjE0NmRBNjM4YjE5Qjc0ZDg0YjE1RjE5In0",
      payload: "eyJkb21haW4iOiJtb25lZXBheS54eXoifQ",
      signature:
        "MHhjMGY1NzA0ZDQ5MDcwYjhhYmEwNjhhMzU1ZGU5M2JkOTU0MTliNzJjZmIxMjVjOGZkYTJjYzdmODhlMjQ1NjA1MWYxODMzZjFiNjExYzVhNDM5ZjYwZTI5NDAwNzg2MjhkYTQ3ZmM4YWFlZTFjZDc1NGU4Yzk1NjRlMTJkMjQwYTFj",
    },
    frame: {
      version: "1",
      name: "MoneePay",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: `${appUrl}`,
      imageUrl: `${appUrl}/og-image.png`,
      buttonTitle: "Launch MoneePay Escrow",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0A0E1A",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(manifest, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
