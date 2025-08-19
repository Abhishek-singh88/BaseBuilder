// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BaseBuilderShowcase is Ownable, ReentrancyGuard {
    
    struct Project {
        uint256 id;
        string name;
        string description;
        string category;
        string url;
        string imageUrl;
        address builder;
        uint256 timestamp;
        bool isActive;
        uint256 totalRating;
        uint256 reviewCount;
    }
    
    struct Review {
        uint256 id;
        uint256 projectId;
        address reviewer;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        uint256 helpfulVotes;
        bool isActive;
    }
    
    struct Builder {
        address builderAddress;
        string name;
        string bio;
        string socialHandle;
        uint256[] projectIds;
        uint256 totalProjects;
        bool isVerified;
    }
    
    // State variables
    uint256 private nextProjectId = 1;
    uint256 private nextReviewId = 1;
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Review) public reviews;
    mapping(address => Builder) public builders;
    mapping(uint256 => uint256[]) public projectReviews; // projectId => reviewIds[]
    mapping(address => mapping(uint256 => bool)) public hasReviewed; // user => projectId => bool
    mapping(address => mapping(uint256 => bool)) public helpfulVotes; // user => reviewId => bool
    
    uint256[] public allProjectIds;
    mapping(string => uint256[]) public projectsByCategory;
    
    // Constants
    uint256 public constant SUBMISSION_FEE = 0.001 ether; // Small fee to prevent spam
    uint256 public constant REVIEW_REWARD = 0.0001 ether; // Reward for quality reviews
    
    // Events
    event ProjectSubmitted(uint256 indexed projectId, address indexed builder, string name);
    event ReviewSubmitted(uint256 indexed reviewId, uint256 indexed projectId, address indexed reviewer, uint8 rating);
    event BuilderVerified(address indexed builder);
    event ProjectFeatured(uint256 indexed projectId);
    event HelpfulVoteAdded(uint256 indexed reviewId, address indexed voter);
    
    constructor() {}
    
    // Submit a new project to the showcase
    function submitProject(
        string memory _name,
        string memory _description,
        string memory _category,
        string memory _url,
        string memory _imageUrl,
        string memory _builderName,
        string memory _builderBio,
        string memory _socialHandle
    ) external payable nonReentrant {
        require(msg.value >= SUBMISSION_FEE, "Insufficient submission fee");
        require(bytes(_name).length > 0, "Project name required");
        require(bytes(_description).length > 0, "Description required");
        require(bytes(_url).length > 0, "URL required");
        
        uint256 projectId = nextProjectId++;
        
        // Create project
        projects[projectId] = Project({
            id: projectId,
            name: _name,
            description: _description,
            category: _category,
            url: _url,
            imageUrl: _imageUrl,
            builder: msg.sender,
            timestamp: block.timestamp,
            isActive: true,
            totalRating: 0,
            reviewCount: 0
        });
        
        // Update builder info
        if (builders[msg.sender].builderAddress == address(0)) {
            builders[msg.sender] = Builder({
                builderAddress: msg.sender,
                name: _builderName,
                bio: _builderBio,
                socialHandle: _socialHandle,
                projectIds: new uint256[](0),
                totalProjects: 0,
                isVerified: false
            });
        }
        
        builders[msg.sender].projectIds.push(projectId);
        builders[msg.sender].totalProjects++;
        
        // Add to category and global lists
        allProjectIds.push(projectId);
        projectsByCategory[_category].push(projectId);
        
        emit ProjectSubmitted(projectId, msg.sender, _name);
    }
    
    // Submit a review for a project
    function submitReview(
        uint256 _projectId,
        uint8 _rating,
        string memory _comment
    ) external nonReentrant {
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        require(projects[_projectId].isActive, "Project not active");
        require(!hasReviewed[msg.sender][_projectId], "Already reviewed this project");
        require(projects[_projectId].builder != msg.sender, "Cannot review own project");
        require(bytes(_comment).length > 10, "Comment too short");
        
        uint256 reviewId = nextReviewId++;
        
        // Create review
        reviews[reviewId] = Review({
            id: reviewId,
            projectId: _projectId,
            reviewer: msg.sender,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp,
            helpfulVotes: 0,
            isActive: true
        });
        
        // Update project rating
        projects[_projectId].totalRating += _rating;
        projects[_projectId].reviewCount++;
        
        // Add to project's review list
        projectReviews[_projectId].push(reviewId);
        hasReviewed[msg.sender][_projectId] = true;
        
        // Reward reviewer (if contract has balance)
        if (address(this).balance >= REVIEW_REWARD) {
            payable(msg.sender).transfer(REVIEW_REWARD);
        }
        
        emit ReviewSubmitted(reviewId, _projectId, msg.sender, _rating);
    }
    
    // Vote a review as helpful
    function voteHelpful(uint256 _reviewId) external {
        require(reviews[_reviewId].isActive, "Review not active");
        require(!helpfulVotes[msg.sender][_reviewId], "Already voted");
        require(reviews[_reviewId].reviewer != msg.sender, "Cannot vote own review");
        
        reviews[_reviewId].helpfulVotes++;
        helpfulVotes[msg.sender][_reviewId] = true;
        
        emit HelpfulVoteAdded(_reviewId, msg.sender);
    }
    
    // Get project details with calculated average rating
    function getProject(uint256 _projectId) external view returns (
        Project memory project,
        uint256 averageRating
    ) {
        project = projects[_projectId];
        averageRating = project.reviewCount > 0 ? (project.totalRating * 100) / project.reviewCount : 0;
    }
    
    // Get all project IDs (for pagination)
    function getAllProjects() external view returns (uint256[] memory) {
        return allProjectIds;
    }
    
    // Get projects by category
    function getProjectsByCategory(string memory _category) external view returns (uint256[] memory) {
        return projectsByCategory[_category];
    }
    
    // Get reviews for a project
    function getProjectReviews(uint256 _projectId) external view returns (uint256[] memory) {
        return projectReviews[_projectId];
    }
    
    // Get builder's projects
    function getBuilderProjects(address _builder) external view returns (uint256[] memory) {
        return builders[_builder].projectIds;
    }
    
    // Get top rated projects
    function getTopRatedProjects(uint256 _limit) external view returns (uint256[] memory topProjects) {
        uint256[] memory projectIds = allProjectIds;
        uint256 length = projectIds.length > _limit ? _limit : projectIds.length;
        topProjects = new uint256[](length);
        
        // Simple sorting by average rating (for first few projects)
        // In production, use more efficient sorting
        for (uint256 i = 0; i < length; i++) {
            uint256 bestProjectId = 0;
            uint256 bestRating = 0;
            
            for (uint256 j = 0; j < projectIds.length; j++) {
                if (projects[projectIds[j]].reviewCount > 0) {
                    uint256 avgRating = (projects[projectIds[j]].totalRating * 100) / projects[projectIds[j]].reviewCount;
                    if (avgRating > bestRating) {
                        bestRating = avgRating;
                        bestProjectId = projectIds[j];
                    }
                }
            }
            
            if (bestProjectId > 0) {
                topProjects[i] = bestProjectId;
                // Remove from consideration
                for (uint256 k = 0; k < projectIds.length; k++) {
                    if (projectIds[k] == bestProjectId) {
                        projectIds[k] = projectIds[projectIds.length - 1];
                        break;
                    }
                }
            }
        }
    }
    
    // Admin functions
    function verifyBuilder(address _builder) external onlyOwner {
        builders[_builder].isVerified = true;
        emit BuilderVerified(_builder);
    }
    
    function featureProject(uint256 _projectId) external onlyOwner {
        require(projects[_projectId].isActive, "Project not active");
        emit ProjectFeatured(_projectId);
    }
    
    function deactivateProject(uint256 _projectId) external onlyOwner {
        projects[_projectId].isActive = false;
    }
    
    function deactivateReview(uint256 _reviewId) external onlyOwner {
        reviews[_reviewId].isActive = false;
    }
    
    // Withdraw contract funds
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        // Implementation for emergency pause
    }
    
    // Utility functions
    function getTotalProjects() external view returns (uint256) {
        return allProjectIds.length;
    }
    
    function getTotalReviews() external view returns (uint256) {
        return nextReviewId - 1;
    }
    
    // Receive function to accept ETH for rewards
    receive() external payable {}
}
