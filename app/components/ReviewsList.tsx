import React, { useState, useEffect } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import contractInfo from '../lib/contract-info.json';
import StarRating from './StarRating';

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer: string;
  timestamp: number;
  helpfulVotes: number;
}

interface ReviewsListProps {
  projectId: string;
  refreshTrigger: number;
}

export default function ReviewsList({ projectId, refreshTrigger }: ReviewsListProps) {
  const { isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [publicClient, setPublicClient] = useState<any>(null);

  // Initialize public client for reading
  useEffect(() => {
    const client = createPublicClient({
      chain: base,
      transport: http()
    });
    setPublicClient(client);
  }, []);

  // Listen for new ReviewSubmitted events (simplified version)
  useEffect(() => {
    if (!publicClient) return;

    // For now, we'll rely on refreshTrigger to update reviews
    // Event listening with viem can be more complex and might not be necessary
    // if the parent component handles refresh properly
  }, [publicClient, projectId]);

  // Fetch reviews function
  const fetchReviews = async () => {
    if (!publicClient) return;
    
    setIsLoading(true);
    console.log('Fetching reviews for project:', projectId);
    
    try {
      // Get all review IDs for this project
      const reviewIds = await publicClient.readContract({
        address: contractInfo.contractAddress as `0x${string}`,
        abi: contractInfo.abi,
        functionName: 'getProjectReviews',
        args: [parseInt(projectId)],
      }) as bigint[];
      
      const reviewsData: Review[] = [];

      for (let i = 0; i < reviewIds.length; i++) {
        try {
          const review = await publicClient.readContract({
            address: contractInfo.contractAddress as `0x${string}`,
            abi: contractInfo.abi,
            functionName: 'reviews',
            args: [reviewIds[i]],
          }) as any;
          
          if (review.isActive) {
            // Add debug logging to see what rating we're getting
            console.log('Review rating from blockchain:', review.rating);
            
            reviewsData.push({
              id: Number(review.id),
              rating: Number(review.rating), // Convert BigInt to number
              comment: review.comment,
              reviewer: review.reviewer,
              timestamp: Number(review.timestamp),
              helpfulVotes: Number(review.helpfulVotes)
            });
          }
        } catch (error) {
          console.error(`Error fetching review ${reviewIds[i]}:`, error);
        }
      }

      // Sort by newest first
      reviewsData.sort((a, b) => b.timestamp - a.timestamp);
      console.log('Fetched reviews:', reviewsData);
      setReviews(reviewsData);

    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reviews on component mount and when refreshTrigger changes
  useEffect(() => {
    if (publicClient) {
      fetchReviews();
    }
  }, [publicClient, projectId, refreshTrigger]);

  const handleHelpfulVote = async (reviewId: number) => {
    try {
      if (!isConnected) {
        alert('Please connect your wallet first');
        return;
      }

      console.log('Voting helpful for review:', reviewId);
      
      writeContract({
        address: contractInfo.contractAddress as `0x${string}`,
        abi: contractInfo.abi,
        functionName: 'voteHelpful',
        args: [reviewId],
      });

      // Refresh reviews after a short delay to show updated vote count
      setTimeout(() => {
        fetchReviews();
      }, 3000);
      
    } catch (error: any) {
      console.error('Error voting helpful:', error);
      
      if (error.message?.includes('Already voted')) {
        alert('You have already voted on this review');
      } else if (error.message?.includes('user rejected') || error.message?.includes('User rejected')) {
        // User cancelled transaction, do nothing
      } else {
        alert('Failed to vote. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-gray-500">Loading reviews...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">💭</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Reviews Yet</h3>
        <p className="text-gray-600">Be the first to review this project!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Reviews ({reviews.length})
        </h3>
        <button
          onClick={fetchReviews}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          🔄 Refresh
        </button>
      </div>
      
      {reviews.map((review) => (
        <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {/* Review Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {/* FIXED: Use StarRating component instead of emoji stars */}
              <StarRating 
                rating={review.rating} 
                readOnly={true} 
              />
              <span className="text-sm font-medium text-gray-900">
                {review.rating}/5
              </span>
              <span className="text-sm text-gray-600">
                by {review.reviewer.slice(0, 6)}...{review.reviewer.slice(-4)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.timestamp * 1000).toLocaleDateString()}
            </span>
          </div>

          {/* Review Comment */}
          <p className="text-gray-700 mb-3">{review.comment}</p>

          {/* Helpful Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleHelpfulVote(review.id)}
              disabled={!isConnected}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                !isConnected 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              title={!isConnected ? 'Connect wallet to vote' : 'Vote helpful'}
            >
              <span>👍</span>
              <span>Helpful ({review.helpfulVotes})</span>
            </button>
            {!isConnected && (
              <span className="text-xs text-gray-500">Connect wallet to vote</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}