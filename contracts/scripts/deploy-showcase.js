const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying BaseBuilder Showcase Contract...");

  // Get the contract factory
  const BaseBuilderShowcase = await ethers.getContractFactory("BaseBuilderShowcase");
  
  // Deploy the contract
  const showcase = await BaseBuilderShowcase.deploy();
  
  // Wait for deployment to finish
  await showcase.deployed();
  
  console.log("✅ BaseBuilderShowcase deployed to:", showcase.address);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: showcase.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deploymentTime: new Date().toISOString(),
  };
  
  console.log("\n📋 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return showcase.address;
}

main()
  .then((address) => {
    console.log(`\n🎉 Deployment successful! Contract address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
