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

// Error Boundary Component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Caught error:', error);
      setError(new Error(error.message));
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-red-800 font-semibold">Something went wrong:</h3>
        <pre className="text-red-600 text-sm mt-2">{error?.message}</pre>
        <button 
          onClick={() => setHasError(false)} 
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

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

  // Fetch reviews function
  const fetchReviews = async () => {
    if (!publicClient) return;
    
    setIsLoading(true);
    console.log('Fetching reviews for project:', projectId);
    
    try {
      const contractAddress = contractInfo.contractAddress as `0x${string}`;
      console.log('Using contract address:', contractAddress);
      
      console.log('Testing contract connection...');
      console.log('Calling getProjectReviews with projectId:', parseInt(projectId));
      
      const reviewIds = await publicClient.readContract({
        address: contractAddress,
        abi: contractInfo.abi,
        functionName: 'getProjectReviews',
        args: [BigInt(parseInt(projectId))],
      }) as readonly bigint[];
      
      console.log('Retrieved review IDs:', reviewIds);
      
      if (reviewIds.length === 0) {
        console.log('No review IDs found for this project');
        setReviews([]);
        return;
      }
      
      const reviewsData: Review[] = [];

      for (let i = 0; i < reviewIds.length; i++) {
        try {
          console.log(`Fetching review data for ID: ${reviewIds[i]}`);
          const review = await publicClient.readContract({
            address: contractAddress,
            abi: contractInfo.abi,
            functionName: 'reviews',
            args: [reviewIds[i]],
          }) as any[];
          
          console.log('Raw review data:', review);
          
          // Access array indices instead of object properties
          // Array structure: [id, projectId, reviewer, rating, comment, timestamp, helpfulVotes, isActive]
          const isActive = review[7];
          
          if (isActive) {
            reviewsData.push({
              id: Number(review[0]),           // id at index 0
              rating: Number(review[3]),       // rating at index 3
              comment: String(review[4]),      // comment at index 4
              reviewer: String(review[2]),     // reviewer at index 2 (FIXED: ensure string)
              timestamp: Number(review[5]),    // timestamp at index 5
              helpfulVotes: Number(review[6])  // helpfulVotes at index 6
            });
          }
        } catch (error) {
          console.error(`Error fetching review ${reviewIds[i]}:`, error);
        }
      }

      // Sort by newest first
      reviewsData.sort((a, b) => b.timestamp - a.timestamp);
      console.log('Final processed reviews:', reviewsData);
      setReviews(reviewsData);

    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (error instanceof Error) {
        if (error.message.includes('ContractFunctionZeroDataError')) {
          console.error('Contract function returned no data - check if contract is deployed on this network');
        } else if (error.message.includes('ContractFunctionExecutionError')) {
          console.error('Contract function execution failed - check function signature and arguments');
        }
      }
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
    <ErrorBoundary>
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
        
        {reviews.map((review) => {
          // Add safety checks
          if (!review || typeof review.id === 'undefined') {
            console.warn('Skipping invalid review:', review);
            return null;
          }

          return (
            <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {/* Review Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <StarRating 
                    rating={review.rating || 0} 
                    readOnly={true} 
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {review.rating || 0}/5
                  </span>
                  <span className="text-sm text-gray-600">
                    by {review.reviewer && typeof review.reviewer === 'string' 
                        ? `${review.reviewer.slice(0, 6)}...${review.reviewer.slice(-4)}`
                        : 'Unknown'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {review.timestamp ? new Date(review.timestamp * 1000).toLocaleDateString() : 'Unknown date'}
                </span>
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 mb-3">{review.comment || 'No comment'}</p>

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
                  <span>Helpful ({review.helpfulVotes || 0})</span>
                </button>
                {!isConnected && (
                  <span className="text-xs text-gray-500">Connect wallet to vote</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ErrorBoundary>
  );
}
