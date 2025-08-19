const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x4fd74D95eD6d7B1A1EE26EC66e616e60ffE16733";
  const GasWiseContract = await ethers.getContractFactory("BaseBuilderShowcase");
  const contract = GasWiseContract.attach(contractAddress);

  // Check contract balance first
  const balance = await ethers.provider.getBalance(contractAddress);
  console.log("Contract balance:", ethers.utils.formatEther(balance), "ETH");

  if (balance.gt(0)) {
    // Withdraw all accumulated fees
    const tx = await contract.withdraw();
    await tx.wait();
    
    console.log("✅ Fees withdrawn successfully!", tx.hash);
  } else {
    console.log("No fees to withdraw");
  }
}

main().catch(console.error);
