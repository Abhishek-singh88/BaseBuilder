export default function Head() {
  const miniAppManifest = {
    version: "1",
    imageUrl: "https://basebuilder.vercel.app/logo.png",
    button: {
      title: "🚀 Launch basebuilder",
      action: {
        type: "launch_miniapp",
        url: "https://basebuilder.vercel.app",
        name: "BaseBuilder",
        splashImageUrl: "https://basebuilder.vercel.app/logo.png",
        splashBackgroundColor: "#0052FF"
      }
    }
  };

  const manifestContent = JSON.stringify(miniAppManifest);

  return (
    <>
      <title>BaseBuilder</title>
      {/* Embed meta tags Farcaster expects */}
      <meta name="fc:miniapp" content={manifestContent} />
      <meta name="fc:frame" content={manifestContent} />
      {/* Other meta tags ... */}
    </>
  );
}
