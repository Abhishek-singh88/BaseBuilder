import React, { useState } from 'react';
import { ethers } from 'ethers';
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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

    setIsSubmitting(true);
    setError('');

    try {
      if (!window.ethereum) throw new Error('Wallet not found');
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        contractInfo.contractAddress,
        contractInfo.abi,
        signer
      );

      const tx = await contract.submitReview(
        parseInt(projectId),
        rating,
        comment,
        { gasLimit: 400000 }
      );

      await tx.wait();
      
      showToast('🎉 Review submitted successfully!', 'success');
      setRating(0);
      setComment('');
      onReviewSubmitted();
      
      if (onClose) onClose();

      } catch (err: unknown) {
  console.error("Review submission failed:", err);

  // Narrow the type
  if (typeof err === "object" && err !== null && "reason" in err) {
    const reason = (err as { reason?: string }).reason;

    if (reason?.includes("Already reviewed")) {
      setError("❌ You have already reviewed this project");
    } else if (reason?.includes("Cannot review own project")) {
      setError("❌ You cannot review your own project");
    } else if (reason?.includes("Comment too short")) {
      setError("❌ Review comment must be at least 10 characters");
    } else if (reason?.includes("insufficient funds")) {
      setError("❌ Insufficient ETH balance for gas fees");
    } else if (reason) {
      setError(`❌ ${reason}`);
    } else {
      setError("❌ Failed to submit review. Please try again.");
    }
  } else {
    setError("❌ Failed to submit review. Please try again.");
  }
}

      finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[rating] || '';
  };

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
            Your Review *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Share your experience with this project... What did you like? Any suggestions for improvement?"
            required
          />
          <p className={`text-xs mt-1 ${
            comment.length < 10 ? 'text-red-500' : 
            comment.length > 200 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {comment.length}/200 characters (minimum 10)
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Review Guidelines */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-xs">
            💡 <strong>Tip:</strong> Great reviews mention specific features, usability, performance, and overall experience.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⏳</span>
              Submitting Review...
            </span>
          ) : (
            `Submit ${rating > 0 ? `${rating}-Star` : ''} Review`
          )}
        </button>
      </form>
    </div>
  );
}
