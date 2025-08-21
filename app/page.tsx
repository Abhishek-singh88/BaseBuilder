'use client';

import React, { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import ProjectDirectory from './components/ProjectDirectory';
import ProjectModal from './components/ProjectModal';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import SubmitProject from './components/SubmitProject';
import { ethers } from 'ethers';
import contractInfo from './lib/contract-info.json';
import StarRating from './components/StarRating';
import { Project } from './types';


export default function HomePage() {
  const { context, isFrameReady, setFrameReady } = useMiniKit();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false);

  // Wallet connection states
  const [connectedWallet, setConnectedWallet] = useState<string>('');
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  // Check for connected wallet
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setConnectedWallet(accounts[0]);
          }
        } catch (error) {
          console.log('No wallet connected:', error);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setConnectedWallet(accounts[0]);
        } else {
          setConnectedWallet('');
          setShowWalletMenu(false);
        }
      });
    }

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.wallet-dropdown-container')) {
        setShowWalletMenu(false);
      }
    };

    if (showWalletMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWalletMenu]);

  // Fetch projects from smart contract
  useEffect(() => {
    async function fetchProjectsFromBlockchain() {
      setIsLoading(true);
      console.log('Starting to fetch projects from blockchain...');

      try {
        // Create provider for reading data (no wallet needed for reading)
        const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');

        // Create contract instance
        const contract = new ethers.Contract(
          contractInfo.contractAddress,
          contractInfo.abi,
          provider
        );

        console.log('Connected to contract:', contractInfo.contractAddress);

        // Get all project IDs
        const projectIds = await contract.getAllProjects();
        console.log('Found project IDs:', projectIds.length, projectIds);

        const projectsData: Project[] = [];

        // If no projects exist, show mock data for demo
        if (projectIds.length === 0) {
          console.log('No projects found in contract, showing demo data');
          const mockProjects: Project[] = [
            {
              id: 'demo-1',
              name: 'Aerodrome Finance',
              description: 'Next-generation AMM designed for the Base ecosystem',
              category: 'DeFi',
              rating: 4.8,
              reviewCount: 234,
              image: '/api/placeholder/400/300',
              url: 'https://aerodrome.finance',
              tags: ['AMM', 'Trading', 'Liquidity'],
              builder: 'Aerodrome Team',
              builderAddress: '0x0000000000000000000000000000000000000000',
              launchDate: '2024-02-15',
              featured: true,
              isActive: true
            },
            {
              id: 'demo-2',
              name: 'Friend.tech',
              description: 'Social trading platform built on Base',
              category: 'Social',
              rating: 4.2,
              reviewCount: 1567,
              image: '/api/placeholder/400/300',
              url: 'https://friend.tech',
              tags: ['Social', 'Trading', 'Crypto'],
              builder: 'Friend.tech Team',
              builderAddress: '0x0000000000000000000000000000000000000000',
              launchDate: '2024-08-10',
              featured: true,
              isActive: true
            }
          ];
          setProjects(mockProjects);
          setIsLoading(false);
          return;
        }

        // Fetch each project's details
        for (let i = 0; i < projectIds.length; i++) {
          const projectId = projectIds[i];
          try {
            console.log(`Fetching project ${projectId}...`);
            const [project, averageRating] = await contract.getProject(projectId);

            console.log('Project data:', {
              id: project.id.toString(),
              name: project.name,
              isActive: project.isActive,
              category: project.category
            });

            // Only include active projects
            if (project.isActive && project.name.trim() !== '') {
              const categoryTags = {
                'DeFi': ['Finance', 'Trading', 'DeFi'],
                'Social': ['Social', 'Community', 'Network'],
                'Games': ['Gaming', 'NFT', 'Entertainment'],
                'NFTs': ['NFT', 'Art', 'Collectibles'],
                'Tools': ['Tools', 'Utility', 'Developer'],
                'Infrastructure': ['Infrastructure', 'Protocol', 'Network']
              };

              // Fixed rating scaling - ensure it's between 0 and 5
              const scaledRating = averageRating > 0 ?
                Math.min(5, Math.max(0, averageRating / 100)) : 0;

              projectsData.push({
                id: project.id.toString(),
                name: project.name,
                description: project.description,
                category: project.category,
                rating: Number(scaledRating.toFixed(1)), // Proper rating scaling
                reviewCount: project.reviewCount.toNumber(),
                image: project.imageUrl || '/api/placeholder/400/300',
                url: project.url,
                tags: categoryTags[project.category as keyof typeof categoryTags] || [project.category],
                builder: project.name + ' Team', // Fallback builder name
                builderAddress: project.builder,
                launchDate: new Date(project.timestamp.toNumber() * 1000).toLocaleDateString(),
                featured: i < 2, // Make first 2 projects featured
                isActive: project.isActive
              });
            }
          } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
          }
        }

        console.log('Successfully fetched projects:', projectsData.length);
        setProjects(projectsData);

      } catch (error) {
        console.error('Error fetching projects from blockchain:', error);

        // Fallback to mock data if blockchain fetch fails
        console.log('Falling back to demo data due to error');
        const mockProjects: Project[] = [
          {
            id: 'demo-1',
            name: 'Aerodrome Finance',
            description: 'Next-generation AMM designed for the Base ecosystem',
            category: 'DeFi',
            rating: 4.8,
            reviewCount: 234,
            image: '/api/placeholder/400/300',
            url: 'https://aerodrome.finance',
            tags: ['AMM', 'Trading', 'Liquidity'],
            builder: 'Aerodrome Team',
            builderAddress: '0x0000000000000000000000000000000000000000',
            launchDate: '2024-02-15',
            featured: true,
            isActive: true
          }
        ];
        setProjects(mockProjects);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectsFromBlockchain();
  }, [refreshToggle]); // Refetch when refreshToggle changes

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleConnectWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        alert('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      // Clear the connected wallet state
      setConnectedWallet('');
      setShowWalletMenu(false);

      // Note: There's no standard way to programmatically disconnect from MetaMask
      // The user needs to disconnect manually from their wallet
      alert('Please disconnect from your wallet extension (MetaMask, etc.) to fully disconnect.');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(connectedWallet);
    setShowWalletMenu(false);
    alert('Address copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="BaseBuilder Logo"
              className="h-20 w-20 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BaseBuilder</h1>
              <p className="text-sm text-gray-600">Discover the Best Base Apps</p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
              SHOWCASE
            </span>
          </div>

          {/* Enhanced wallet connection display */}
          <div className="flex items-center space-x-4">
            {connectedWallet ? (
              <div className="relative wallet-dropdown-container">
                {/* Connected Wallet Display - Clickable */}
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  {/* Wallet Info */}
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex flex-col">
                      <span className="text-xs text-green-700 font-medium">Connected</span>
                      <span className="text-xs text-green-600 font-mono">
                        {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Arrow */}
                  <div className="text-gray-400">
                    <svg
                      className={`w-4 h-4 transition-transform ${showWalletMenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Wallet Dropdown Menu */}
                {showWalletMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">W</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Wallet Connected</p>
                          <p className="text-sm text-gray-500 font-mono break-all">{connectedWallet}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleCopyAddress}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <span className="text-gray-400">📋</span>
                        <span className="text-gray-700">Copy Address</span>
                      </button>

                      <button
                        onClick={handleDisconnectWallet}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      >
                        <span>🔌</span>
                        <span>Disconnect Wallet</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Farcaster User (if available) */}
                {context?.user && (
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {context.user.displayName?.[0] || '👤'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Farcaster</span>
                      <span className="text-sm text-gray-700">
                        {context.user.displayName || `FID: ${context.user.fid}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>🔗</span>
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            The Product Hunt for Base
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Discover, review, and showcase the best applications in the Base ecosystem
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 justify-center max-w-4xl mx-auto">
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          </div>
        </div>

        {/* Submit Project Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            🚀 Submit Your Project
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Projects...</h3>
            <p className="text-gray-600">Fetching latest projects from Base blockchain</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-4">Be the first to submit a project to the Base ecosystem!</p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Submit First Project
            </button>
          </div>
        )}

        {/* Featured Projects */}
        {!isLoading && selectedCategory === 'All' && searchQuery === '' && projects.filter(p => p.featured).length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🔥 Featured Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.filter(p => p.featured).map(project => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow border-l-4 border-blue-500"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StarRating rating={project.rating} readOnly={true} />
                      <span className="font-semibold">{project.rating}</span>
                      <span className="text-gray-500 text-sm">({project.reviewCount})</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">by {project.builder}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Directory */}
        {!isLoading && (
          <ProjectDirectory
            projects={filteredProjects}
            onProjectClick={setSelectedProject}
          />
        )}

        {/* Stats Section */}
        {!isLoading && projects.length > 0 && (
          <div className="mt-12 bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Base Ecosystem Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{projects.length}</div>
                <div className="text-sm text-gray-600">Projects Listed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {projects.reduce((sum, p) => sum + p.reviewCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(projects.map(p => p.category)).size}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {projects.length > 0 ? (projects.reduce((sum, p) => sum + p.rating, 0) / projects.length).toFixed(1) : '0'}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Submit Project Modal */}
      <SubmitProject
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSuccess={() => {
          // Trigger refresh of projects from blockchain
          setRefreshToggle(prev => !prev);
        }}
      />
    </div>
  );
}
