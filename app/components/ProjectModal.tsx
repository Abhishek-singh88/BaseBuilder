import React, { useState } from 'react';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';
import StarRating from './StarRating';

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

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRefresh, setReviewRefresh] = useState(0);

  const handleVisitApp = () => {
    window.open(project.url, '_blank');
  };

  const handleShareToFarcaster = () => {
    const shareText = `Just discovered ${project.name} on BaseBuilder! ${project.description} Check it out: ${project.url}`;
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
    window.open(farcasterUrl, '_blank');
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'DeFi': '💰',
      'Social': '👥',
      'Games': '🎮',
      'NFTs': '🖼️',
      'Tools': '🛠️',
      'Infrastructure': '⚙️'
    };
    return icons[category] || '🌐';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {getCategoryIcon(project.category)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
              <p className="text-gray-600">{project.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  {/* Updated Star Rating Display */}
                  <div className="flex items-center space-x-3">
                    <StarRating 
                      rating={project.rating} 
                      readonly={true} 
                      size="md" 
                    />
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900">
                        {project.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {project.reviewCount} review{project.reviewCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  {project.featured && (
                    <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-200">
                      🔥 Featured
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleVisitApp}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                  >
                    🚀 Visit App
                  </button>
                  <button
                    onClick={handleShareToFarcaster}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                  >
                    📢 Share
                  </button>
                </div>
              </div>

              {/* Project Stats */}
              {project.reviewCount > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Community Rating</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const percentage = project.reviewCount > 0 ? 
                        Math.round((stars === Math.round(project.rating) ? 80 : 10)) : 0;
                      return (
                        <div key={stars} className="flex items-center space-x-2 text-sm">
                          <span className="w-8">{stars}⭐</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="w-8 text-gray-600">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                    <span 
                      key={tag} 
                      className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Builder Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Builder</h3>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {project.builder.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{project.builder}</p>
                    <p className="text-sm text-gray-600">
                      🚀 Launched {new Date(project.launchDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="bg-white hover:bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium border border-blue-200 transition-colors"
                  >
                    📝 Read Reviews
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('reviews');
                      setShowReviewForm(true);
                    }}
                    className="bg-white hover:bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium border border-blue-200 transition-colors"
                  >
                    ⭐ Leave Review
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add Review Section */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Community Reviews</h3>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  ✍️ Write Review
                </button>
              </div>

              {/* Review Form Modal */}
              {showReviewForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
                  <ReviewForm
                    projectId={project.id}
                    onReviewSubmitted={() => {
                      setReviewRefresh(prev => prev + 1);
                      setShowReviewForm(false);
                    }}
                    onClose={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              {/* Reviews List Component */}
              <ReviewsList 
                projectId={project.id} 
                refreshTrigger={reviewRefresh} 
              />

              {/* Review Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Review Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be honest and constructive in your feedback</li>
                  <li>• Focus on your actual experience with the project</li>
                  <li>• Mention specific features you liked or disliked</li>
                  <li>• Help other users make informed decisions</li>
                  <li>• Reviews are stored permanently on the blockchain</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
