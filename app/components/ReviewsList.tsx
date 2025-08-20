import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractInfo from '../lib/contract-info.json';

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Initialize contract connection
  useEffect(() => {
    const initContract = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
        const contractInstance = new ethers.Contract(
          contractInfo.contractAddress,
          contractInfo.abi,
          provider
        );
        setContract(contractInstance);
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, []);

  // Listen for new ReviewSubmitted events
useEffect(() => {
  if (!contract) return;

  const handleReviewSubmitted = (
    reviewId: ethers.BigNumber,
    submittedProjectId: ethers.BigNumber,
    reviewer: string,
    rating: number,
    event: ethers.Event
  ) => {
    console.log('New review event:', {
      reviewId: reviewId.toNumber(),
      projectId: submittedProjectId.toNumber(),
      reviewer,
      rating
    });
    
    // Only refresh if this review is for the current project
    if (submittedProjectId.toNumber() === parseInt(projectId)) {
      console.log('✅ New review for current project - refreshing!');
      setTimeout(() => fetchReviews(), 2000); // Small delay to ensure blockchain is updated
    }
  };

  // Listen to ReviewSubmitted events
  contract.on('ReviewSubmitted', handleReviewSubmitted);

  // Cleanup listener on unmount
  return () => {
    contract.off('ReviewSubmitted', handleReviewSubmitted);
  };
}, [contract, projectId]);


  // Fetch reviews function
  const fetchReviews = async () => {
    if (!contract) return;
    
    setIsLoading(true);
    console.log('Fetching reviews for project:', projectId);
    
    try {
      // Get all review IDs for this project
      const reviewIds = await contract.getProjectReviews(parseInt(projectId));
      //console.log('Found review IDs:', reviewIds.map(id => id.toNumber()));
      
      const reviewsData: Review[] = [];

      for (let i = 0; i < reviewIds.length; i++) {
        try {
          const review = await contract.reviews(reviewIds[i]);
          
          if (review.isActive) {
            reviewsData.push({
              id: review.id.toNumber(),
              rating: review.rating,
              comment: review.comment,
              reviewer: review.reviewer,
              timestamp: review.timestamp.toNumber(),
              helpfulVotes: review.helpfulVotes.toNumber()
            });
          }
        } catch (error) {
          console.error(`Error fetching review ${reviewIds[i]}:`, error);
        }
      }

      // Sort by newest first
      reviewsData.sort((a, b) => b.timestamp - a.timestamp);
      console.log('Fetched reviews:', reviewsData.length);
      setReviews(reviewsData);

    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reviews on component mount and when refreshTrigger changes
  useEffect(() => {
    if (contract) {
      fetchReviews();
    }
  }, [contract, projectId, refreshTrigger]);

  const handleHelpfulVote = async (reviewId: number) => {
    try {
      if (!window.ethereum) throw new Error('Wallet not found');
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      const contractWithSigner = new ethers.Contract(
        contractInfo.contractAddress,
        contractInfo.abi,
        signer
      );

      const tx = await contractWithSigner.voteHelpful(reviewId);
      await tx.wait();
      
      // Refresh reviews to show updated vote count
      fetchReviews();
      
    } catch (error: any) {
      if (error.reason?.includes('Already voted')) {
        alert('You have already voted on this review');
      } else {
        console.error('Error voting helpful:', error);
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
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ⭐
                  </span>
                ))}
              </div>
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
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span>👍</span>
              <span>Helpful ({review.helpfulVotes})</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
