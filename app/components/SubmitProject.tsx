import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import contractInfo from '../lib/contract-info.json';
import { useToast } from './Toast';

interface SubmitProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitProject({ isOpen, onClose, onSuccess }: SubmitProjectProps) {
  const { showToast } = useToast();
  const { address, isConnected } = useAccount();
  
  // Wagmi hooks for contract interaction
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

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
  
  const [error, setError] = useState('');

  const categories = ['DeFi', 'Social', 'Games', 'NFTs', 'Tools', 'Infrastructure'];

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash) {
      console.log('Transaction confirmed:', hash);
      showToast(`🎉 Project submitted successfully! Transaction: ${hash}`, 'success');
      
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
    }
  }, [isSuccess, hash, showToast, onSuccess, onClose]);

  // Handle errors
  useEffect(() => {
    if (writeError || receiptError) {
      const err = writeError || receiptError;
      console.error("Submission error:", err);

      let errorMessage = "Submission failed. Please try again.";

      if (typeof err === "object" && err !== null) {
        const errorObj = err as { code?: number; message?: string; cause?: { code?: number } };

        // Handle specific error codes
        if (errorObj.code === 4001 || errorObj.cause?.code === 4001) {
          errorMessage = "Transaction cancelled by user.";
        } else if (errorObj.code === -32602) {
          errorMessage = "Invalid parameters. Check your input data.";
        } else if (errorObj.message?.includes("user rejected") || errorObj.message?.includes("User rejected")) {
          errorMessage = "Transaction rejected by user.";
        } else if (errorObj.message?.includes("insufficient funds")) {
          errorMessage = "Insufficient ETH balance for transaction + gas fees.";
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }
      }

      setError(errorMessage);
    }
  }, [writeError, receiptError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Starting submission...');

      // Check if wallet is connected
      if (!isConnected || !address) {
        throw new Error('Wallet not connected! Please connect your wallet first.');
      }

      console.log('User address:', address);
      console.log('Contract address:', contractInfo.contractAddress);

      // Submit project using Wagmi
      writeContract({
        address: contractInfo.contractAddress as `0x${string}`,
        abi: contractInfo.abi,
        functionName: 'submitProject',
        args: [
          formData.name,
          formData.description,
          formData.category,
          formData.url,
          formData.imageUrl,
          formData.builderName,
          formData.builderBio,
          formData.socialHandle,
        ],
        value: parseEther("0.001"), // 0.001 ETH submission fee
      });

      console.log('Transaction submitted');

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
          errorMessage = "Insufficient ETH balance for transaction + gas fees.";
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }
      }
      
      setError(errorMessage);
    }
  };

  // Clear error when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine if form is submitting (pending write or confirming)
  const isSubmitting = isPending || isConfirming;

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

          {/* Wallet Connection Check */}
          {!isConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-yellow-500 text-xl mr-2">⚠️</span>
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Wallet Not Connected
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Please connect your wallet to submit a project.
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Transaction Status */}
          {hash && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-blue-500 text-xl mr-2">📝</span>
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Transaction Hash: {hash}
                  </p>
                  {isConfirming && (
                    <p className="text-xs text-blue-700 mt-1">
                      ⏳ Waiting for confirmation...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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
              disabled={isSubmitting}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isConnected}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  {isPending ? 'Submitting...' : 'Confirming...'}
                </span>
              ) : !isConnected ? (
                '🔗 Connect Wallet First'
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