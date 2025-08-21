import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Quick check
if (!process.env.PRIVATE_KEY) {
  console.warn("⚠️  No PRIVATE_KEY found in .env");
} else {
  console.log("🔑 Loaded PRIVATE_KEY:", process.env.PRIVATE_KEY.slice(0, 6) + "..." + process.env.PRIVATE_KEY.slice(-4));
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};

export default config;
