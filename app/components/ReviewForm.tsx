import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import contractInfo from '../lib/contract-info.json';
import StarRating from './StarRating';
import { useToast } from './Toast';

interface ReviewFormProps {
  projectId: string;
  onReviewSubmitted: () => void;
  onClose?: () => void;
}

export default function ReviewForm({ projectId, onReviewSubmitted, onClose }: ReviewFormProps) {
  const { showToast } = useToast();
  const { address, isConnected } = useAccount();
  
  // Wagmi hooks for contract interaction
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash) {
      console.log('Review submitted successfully:', hash);
      showToast('🎉 Review submitted successfully! You earned 0.00001 ETH! 💰', 'success');
      setRating(0);
      setComment('');
      onReviewSubmitted();
      
      if (onClose) onClose();
    }
  }, [isSuccess, hash, showToast, onReviewSubmitted, onClose]);

  // Handle errors
  useEffect(() => {
    if (writeError || receiptError) {
      const err = writeError || receiptError;
      console.error("Review submission failed:", err);

      let errorMessage = "❌ Failed to submit review. Please try again.";

      if (typeof err === "object" && err !== null) {
        const errorObj = err as { message?: string; cause?: { reason?: string }; reason?: string };

        // Check for specific contract errors
        const reason = errorObj.cause?.reason || errorObj.reason || errorObj.message;

        if (reason?.includes("Already reviewed")) {
          errorMessage = "❌ You have already reviewed this project";
        } else if (reason?.includes("Cannot review own project")) {
          errorMessage = "❌ You cannot review your own project";
        } else if (reason?.includes("Comment too short")) {
          errorMessage = "❌ Review comment must be at least 10 characters";
        } else if (reason?.includes("insufficient funds")) {
          errorMessage = "❌ Insufficient ETH balance for gas fees";
        } else if (reason?.includes("user rejected") || reason?.includes("User rejected")) {
          errorMessage = "❌ Transaction cancelled by user";
        } else if (reason) {
          errorMessage = `❌ ${reason}`;
        }
      }

      setError(errorMessage);
    }
  }, [writeError, receiptError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters');
      return;
    }

    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setError('');

    try {
      console.log('Submitting review for project:', projectId);
      
      writeContract({
        address: contractInfo.contractAddress as `0x${string}`,
        abi: contractInfo.abi,
        functionName: 'submitReview',
        args: [
          parseInt(projectId),
          rating,
          comment,
        ],
        gas: BigInt(400000), // Set gas limit
      });

    } catch (err: unknown) {
      console.error("Review submission failed:", err);

      let errorMessage = "❌ Failed to submit review. Please try again.";

      if (typeof err === "object" && err !== null) {
        const errorObj = err as { message?: string };
        if (errorObj.message) {
          errorMessage = `❌ ${errorObj.message}`;
        }
      }
      
      setError(errorMessage);
    }
  };

  // Clear error when modal closes
  useEffect(() => {
    if (!onClose) { // Only clear error if this is not in a modal
      setError('');
    }
  }, [onClose]);

  const getRatingLabel = (rating: number) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[rating] || '';
  };

  // Determine if form is submitting
  const isSubmitting = isPending || isConfirming;

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Leave a Review</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        )}
      </div>

      {/* Wallet Connection Check */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-yellow-800 text-sm flex items-center">
            <span className="mr-2">⚠️</span>
            Please connect your wallet to submit a review
          </p>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <p className="text-green-800 text-sm flex items-center">
          <span className="mr-2">💰</span>
          <strong>Earn 0.00001 ETH </strong> for submitting a quality review!
        </p>
        <p className="text-green-700 text-xs mt-1">
          Reviews are rewarded automatically from the contract balance
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Star Rating - Using the StarRating component */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating *
          </label>
          <div className="flex flex-col items-start space-y-2">
            <StarRating 
              rating={rating} 
              onRatingChange={setRating} 
              size="lg" 
            />
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {getRatingLabel(rating)}
              </p>
            )}
            {rating === 0 && (
              <p className="text-sm text-gray-400">
                Click to select a rating
              </p>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review * <span className="text-green-600 text-xs">(Get paid for quality reviews!)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Share your experience with this project... What did you like? Any suggestions for improvement? (Detailed reviews help the community!)"
            required
          />
          <p className={`text-xs mt-1 ${
            comment.length < 10 ? 'text-red-500' : 
            comment.length > 200 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {comment.length}/200 characters (minimum 10)
          </p>
        </div>

        {/* Transaction Status */}
        {hash && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-xs">
            💡 <strong>Tip:</strong> Great reviews mention specific features, usability, performance, and overall experience. Quality reviews earn you ETH rewards!
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || comment.trim().length < 10 || !isConnected}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⏳</span>
              {isPending ? 'Submitting Review...' : 'Confirming...'}
            </span>
          ) : !isConnected ? (
            <span className="flex items-center justify-center">
              <span className="mr-2">🔗</span>
              Connect Wallet First
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <span className="mr-2">💰</span>
              {`Submit ${rating > 0 ? `${rating}-Star` : ''} Review & Earn ETH`}
            </span>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Rewards are paid automatically if contract has sufficient balance
      </p>
    </div>
  );
}