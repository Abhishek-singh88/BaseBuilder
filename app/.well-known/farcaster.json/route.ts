function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  // Hardcode your Vercel URL to match what you're submitting to Base Build
  const URL = "https://basebuilder.vercel.app";

  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjczNDEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhEMjc4ZkZCNjVBMDYyZDA5OTTRCMUI5OEIzYmQ5M0Q5NjVGMUM2ZDBBIn0",
      payload: "eyJkb21haW4iOiJmcmFtZS1leGFtcGxlLXZlcmNlbC1hcHAuanVzdGluLWtuLnZlcmNlbC5hcHAifQ",
      signature: "MHg3ZTM5YjQ3ZjkzNmI5ZjI3MDk4YTlhYWI2NDVhYzM2YzNjMmRkODUzYjNiYmQ2Mzc5M2U5ZjVhN2U4OGY0M2MyNzEwN2Q5MTc4YTg1Y2E0ZDE2NmVmZWYzY2I3YzY3NTA1Y2IzZDMzZjlkOGEzZGExZGFkMWNhMzMwOWQzOGE1YjFj"
    },
    frame: {
      version: "1", 
      name: "BaseBuilder",
      subtitle: "Discover the Best Base Apps",
      description: "The Product Hunt for Base - Discover, review, and showcase the best applications in the Base ecosystem",
      iconUrl: "https://raw.githubusercontent.com/coinbase/onchainkit/main/site/docs/public/logo/base-logo-blue.svg",
      splashImageUrl: "https://raw.githubusercontent.com/coinbase/onchainkit/main/site/docs/public/logo/base-logo-blue.svg",
      splashBackgroundColor: "#0052FF",
      homeUrl: "https://basebuilder.vercel.app",
      webhookUrl: "https://basebuilder.vercel.app/api/webhook",
      primaryCategory: "productivity",
      tagline: "The Product Hunt for Base",
      ogTitle: "BaseBuilder",
      ogDescription: "Discover the Best Base Apps",
      ogImageUrl: "https://raw.githubusercontent.com/coinbase/onchainkit/main/site/docs/public/logo/base-logo-blue.svg"
    },
    baseBuilder: {
      allowedAddresses: ["0x6Cf41cfeb7C64E950f43B0850a77a058BDaC73da"]
    }
  });
}
