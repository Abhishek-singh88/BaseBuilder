export interface Project {
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
  builderAddress: string;
  launchDate: string;
  featured: boolean;
  isActive: boolean;
}

export interface Review {
  id: string;
  projectId: string;
  author: string;
  authorAddress: string;
  rating: number;
  comment: string;
  timestamp: string;
  helpful: number;
  isHelpful?: boolean;
}

export interface Builder {
  address: string;
  name: string;
  bio: string;
  socialHandle: string;
  projectIds: string[];
  totalProjects: number;
  isVerified: boolean;
}

export type Category = 'All' | 'DeFi' | 'Social' | 'Games' | 'NFTs' | 'Tools' | 'Infrastructure';
