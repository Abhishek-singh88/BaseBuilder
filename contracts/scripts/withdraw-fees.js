const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x68Bc61dE0e8AbAA547dEE2f8cAbb4A0261aB190c";

  // Create a provider manually
  const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");

  // Use deployer wallet (from Hardhat config env)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const GasWiseContract = await ethers.getContractFactory("BaseBuilderShowcase", wallet);
  const contract = GasWiseContract.attach(contractAddress);

  // Check contract balance
  const balance = await provider.getBalance(contractAddress);
  console.log("Contract balance:", ethers.utils.formatEther(balance), "ETH");

  if (balance.gt(0)) {
    const tx = await contract.withdraw();
    await tx.wait();
    console.log("✅ Fees withdrawn successfully!", tx.hash);
  } else {
    console.log("No fees to withdraw");
  }
}

main().catch(console.error);
