import React from 'react';

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

interface ProjectDirectoryProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export default function ProjectDirectory({ projects, onProjectClick }: ProjectDirectoryProps) {
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

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-600">Try adjusting your search or category filter</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          All Projects ({projects.length})
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Sort by:</span>
          <select className="border border-gray-300 rounded px-3 py-1">
            <option>Highest Rated</option>
            <option>Most Reviews</option>
            <option>Recently Added</option>
            <option>Alphabetical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div
            key={project.id}
            className="bg-white rounded-lg p-6 shadow-md cursor-pointer hover:shadow-lg transition-shadow border hover:border-blue-200"
            onClick={() => onProjectClick(project)}
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getCategoryIcon(project.category)}</span>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.category}</p>
                </div>
              </div>
              {project.featured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4 text-sm leading-relaxed">
              {project.description}
            </p>

            {/* Rating */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold">{project.rating}</span>
                <span className="text-gray-500 text-sm">({project.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {project.tags.slice(0, 3).map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="text-gray-500 text-xs">+{project.tags.length - 3} more</span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">by {project.builder}</span>
              <span className="text-gray-500">
                {new Date(project.launchDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
