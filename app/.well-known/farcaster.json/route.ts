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
  const URL = process.env.NEXT_PUBLIC_URL;

  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjczNDEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhEMjc4ZkZCNjVBMDYyZDA5OTRCMUI5OEIzYmQ5M0Q5NjVGMUM2ZDBBIn0",
      payload: "eyJkb21haW4iOiJmcmFtZS1leGFtcGxlLXZlcmNlbC1hcHAuanVzdGluLWtuLnZlcmNlbC5hcHAifQ",
      signature: "MHg3ZTM5YjQ3ZjkzNmI5ZjI3MDk4YTlhYWI2NDVhYzM2YzNjMmRkODUzYjNiYmQ2Mzc5M2U5ZjVhN2U4OGY0M2MyNzEwN2Q5MTc4YTg1Y2E0ZDE2NmVmZWYzY2I3YzY3NTA1Y2IzZDMzZjlkOGEzZGExZGFkMWNhMzMwOWQzOGE1YjFj"
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "BaseBuilder",
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE || "Discover the Best Base Apps",
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "The Product Hunt for Base - Discover, review, and showcase the best applications in the Base ecosystem",
      screenshotUrls: [],
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#f7f7f7",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "productivity",
      tags: [],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "The Product Hunt for Base",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "BaseBuilder",
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION || "Discover the Best Base Apps",
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
    }),
    baseBuilder: {
      allowedAddresses: ["0x6Cf4cfcb7064d9dE430508b58d772a01d888b0c73da"]
    }
  });
}
