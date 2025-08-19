import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [`e7b727ed109d20034039a504232a86bc5b5e0128db7e84b9a445c636ee0b82d5`],
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [`e7b727ed109d20034039a504232a86bc5b5e0128db7e84b9a445c636ee0b82d5`],
    }
  }
};

export default config;
