import React, { useState } from 'react';
import { ethers } from 'ethers';
import contractInfo from '../lib/contract-info.json';
import { useToast } from './Toast';

interface SubmitProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitProject({ isOpen, onClose, onSuccess }: SubmitProjectProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'DeFi',
    url: '',
    imageUrl: '',
    builderName: '',
    builderBio: '',
    socialHandle: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = ['DeFi', 'Social', 'Games', 'NFTs', 'Tools', 'Infrastructure'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError('');

  try {
    console.log('Starting submission...');

    // Check if wallet is available
    if (!window.ethereum) {
      throw new Error('Wallet not detected! Please install a Web3 wallet.');
    }

    // Request account access
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    
    // Check network
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.chainId);
    
    if (network.chainId !== 84532) {
      throw new Error('Please switch to Base Sepolia network (Chain ID: 84532)');
    }

    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    console.log('User address:', userAddress);

    // Create contract instance
    const contract = new ethers.Contract(
      contractInfo.contractAddress,
      contractInfo.abi,
      signer
    );

    console.log('Contract address:', contractInfo.contractAddress);

    // Submit project with better gas settings
    const tx = await contract.submitProject(
      formData.name,
      formData.description,
      formData.category,
      formData.url,
      formData.imageUrl,
      formData.builderName,
      formData.builderBio,
      formData.socialHandle,
      {
        value: ethers.utils.parseEther("0.001"),
        gasLimit: 600000, // Increased gas limit
        gasPrice: ethers.utils.parseUnits("2", "gwei") // Explicit gas price
      }
    );

    console.log('Transaction submitted:', tx.hash);
    console.log('Waiting for confirmation...');
    
    // Wait for transaction to be mined
    const receipt = await tx.wait(1); // Wait for 1 confirmation
    
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    
    showToast(`🎉 Project submitted successfully! Transaction: ${tx.hash}`, 'success');
    
    // Reset form and close
    setFormData({
      name: '',
      description: '',
      category: 'DeFi',
      url: '',
      imageUrl: '',
      builderName: '',
      builderBio: '',
      socialHandle: ''
    });
    
    onSuccess();
    onClose();

} catch (err: unknown) {
  console.error("Submission error:", err);

  let errorMessage = "Submission failed. Please try again.";

  if (typeof err === "object" && err !== null) {
    const errorObj = err as { code?: number; message?: string };

    if (errorObj.code === 4001) {
      errorMessage = "Transaction cancelled by user.";
    } else if (errorObj.code === -32602) {
      errorMessage = "Invalid parameters. Check your input data.";
    } else if (errorObj.message?.includes("user rejected")) {
      errorMessage = "Transaction rejected by user.";
    } else if (errorObj.message?.includes("insufficient funds")) {
      errorMessage =
        "Insufficient ETH balance for transaction + gas fees.";
    } else if (errorObj.message) {
      errorMessage = errorObj.message;
    }
  }
    setError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Submit Your Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Project Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Awesome Base App"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what your project does and why it's amazing..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project URL *
                  </label>
                  <input
                    type="url"
                    name="url"
                    required
                    value={formData.url}
                    onChange={handleChange}
                    className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourapp.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo/Image URL (optional)
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourapp.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Builder Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Builder Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="builderName"
                  required
                  value={formData.builderName}
                  onChange={handleChange}
                  className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (optional)
                </label>
                <textarea
                  name="builderBio"
                  rows={2}
                  value={formData.builderBio}
                  onChange={handleChange}
                  className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Social Handle (optional)
                </label>
                <input
                  type="text"
                  name="socialHandle"
                  value={formData.socialHandle}
                  onChange={handleChange}
                  className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="@yourusername"
                />
              </div>
            </div>
          </div>

          {/* Submission Fee Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-yellow-500 text-xl mr-2">💰</span>
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Submission Fee: 0.001 ETH
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  This small fee helps prevent spam submissions and keeps the directory high-quality.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-red-500 text-xl mr-2">❌</span>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Submitting...
                </span>
              ) : (
                '🚀 Submit Project (0.001 ETH)'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
