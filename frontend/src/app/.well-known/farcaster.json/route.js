export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.moneepay.xyz";

  const manifest = {
    accountAssociation: {
      header:
        "eyJmaWQiOjMzNDYxMDksInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgzMTdiMEQ5NDA4QmY5YWY4OWI4Mjc2MTI1RTM1RUU2REFjMTk1ZkNBIn0",
      payload: "eyJkb21haW4iOiJtb25lZXBheS54eXoifQ",
      signature:
        "vVRnEUrqj5YmCPLHpDL+m4Y43ILaNzDSQhoSZL7gl4ZS4DCpPYD6F/WfmyhI06BhHCKjDIaf8FDRRoYwVL1Plxs=",
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
