import React, { useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  url: string;
  tags: string[];
  builder: string;
  launchDate: string;
  featured: boolean;
}

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      author: 'Alice.eth',
      rating: 5,
      comment: 'Amazing project! The UI is clean and transactions are fast. Highly recommend for anyone looking to trade on Base.',
      date: '2024-08-15',
      helpful: 12
    },
    {
      id: '2',
      author: 'CryptoBob',
      rating: 4,
      comment: 'Great concept and execution. Some minor bugs but overall very solid. The team is responsive to feedback.',
      date: '2024-08-10',
      helpful: 8
    }
  ];

  const handleVisitApp = () => {
    window.open(project.url, '_blank');
  };

  const handleShareToFarcaster = () => {
    const shareText = `Just discovered ${project.name} on BaseBuilder! ${project.description} Check it out: ${project.url}`;
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
    window.open(farcasterUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {project.category === 'DeFi' ? '💰' :
               project.category === 'Social' ? '👥' :
               project.category === 'Games' ? '🎮' :
               project.category === 'NFTs' ? '🖼️' :
               project.category === 'Tools' ? '🛠️' : '⚙️'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
              <p className="text-gray-600">{project.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({project.reviewCount})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Rating and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl">⭐</span>
                    <span className="text-2xl font-bold">{project.rating}</span>
                    <span className="text-gray-600">({project.reviewCount} reviews)</span>
                  </div>
                  {project.featured && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      🔥 Featured
                    </span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleVisitApp}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    🚀 Visit App
                  </button>
                  <button
                    onClick={handleShareToFarcaster}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    📢 Share
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Builder Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Builder</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">
                      {project.builder.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{project.builder}</p>
                    <p className="text-sm text-gray-600">
                      Launched {new Date(project.launchDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Write Review */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Write a Review</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} className="text-2xl text-gray-300 hover:text-yellow-500">
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Review
                    </label>
                    <textarea
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Share your experience with this app..."
                    />
                  </div>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                    Submit Review
                  </button>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{review.author}</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">⭐</span>
                          <span>{review.rating}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <button className="text-gray-600 hover:text-blue-600">
                        👍 Helpful ({review.helpful})
                      </button>
                      <button className="text-gray-600 hover:text-blue-600">
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
