import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractInfo from '../lib/contract-info.json';

export const useContract = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const web3Signer = web3Provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractInfo.contractAddress,
          contractInfo.abi,
          web3Signer
        );

        setProvider(web3Provider);
        setSigner(web3Signer);
        setContract(contractInstance);

        try {
          const address = await web3Signer.getAddress();
          setUserAddress(address);
        } catch (error) {
          console.log('Wallet not connected');
        }
      }
    };

    initContract();
  }, []);

  return { provider, signer, contract, userAddress };
};
