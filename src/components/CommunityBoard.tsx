import React, { useState, useEffect, useRef } from 'react';
import { Users, Trophy, Heart, MessageCircle, Share2, Flag, ChevronDown, MoreVertical, Plus, X, Image as ImageIcon, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  skill?: string;
}

interface Post {
  id: string;
  user: User;
  type: 'progress' | 'achievement' | 'struggle' | 'tip' | 'challenge_update';
  content: string;
  image?: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  tags?: string[];
  challengeId?: string;
  challengeName?: string;
}

interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

interface CommunityBoardProps {
  posts: Post[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onLikeComment: (commentId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onReportPost: (postId: string) => void;
  onSharePost: (postId: string) => void;
  onCreatePost: (post: { type: Post['type']; content: string; tags: string[]; image?: string }) => void;
  onDeletePost: (postId: string) => void;
}

export const CommunityBoard: React.FC<CommunityBoardProps> = ({
  posts,
  currentUser,
  onLikePost,
  onLikeComment,
  onAddComment,
  onReportPost,
  onSharePost,
  onCreatePost,
  onDeletePost
}) => {
  const [filter, setFilter] = useState<'all' | 'progress' | 'achievements' | 'tips' | 'challenges'>('all');
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    type: 'progress' as Post['type'],
    content: '',
    tags: '',
    image: ''
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'progress') return post.type === 'progress' || post.type === 'struggle';
    if (filter === 'achievements') return post.type === 'achievement';
    if (filter === 'tips') return post.type === 'tip';
    if (filter === 'challenges') return post.type === 'challenge_update';
    return true;
  });

  const getPostTypeColor = (type: Post['type']) => {
    switch (type) {
      case 'progress': return 'bg-blue-100 text-blue-700';
      case 'achievement': return 'bg-green-100 text-green-700';
      case 'struggle': return 'bg-orange-100 text-orange-700';
      case 'tip': return 'bg-purple-100 text-purple-700';
      case 'challenge_update': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPostTypeEmoji = (type: Post['type']) => {
    switch (type) {
      case 'progress': return '📈';
      case 'achievement': return '🏆';
      case 'struggle': return '💪';
      case 'tip': return '💡';
      case 'challenge_update': return '🎯';
      default: return '📝';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleAddComment = (postId: string) => {
    const content = newComment[postId]?.trim();
    if (content) {
      onAddComment(postId, content);
      setNewComment({ ...newComment, [postId]: '' });
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId]
    });
  };

  const handleCreatePost = () => {
    if (!newPost.content.trim()) {
      alert('Please write something before posting');
      return;
    }

    const tags = newPost.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onCreatePost({
      type: newPost.type,
      content: newPost.content.trim(),
      tags,
      image: newPost.image || undefined
    });

    // Reset form
    setNewPost({
      type: 'progress',
      content: '',
      tags: '',
      image: ''
    });
    setIsCreatePostOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
          <p className="text-white/70">Share your journey and support others</p>
        </div>
        <button
          onClick={() => setIsCreatePostOpen(true)}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {/* Create Post Modal */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-primary">Create a Post</h2>
              <button
                onClick={() => setIsCreatePostOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Post Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Post Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { value: 'progress', label: '📈 Progress', color: 'blue' },
                    { value: 'achievement', label: '🏆 Achievement', color: 'green' },
                    { value: 'struggle', label: '💪 Struggle', color: 'orange' },
                    { value: 'tip', label: '💡 Tip', color: 'purple' },
                    { value: 'challenge_update', label: '🎯 Challenge', color: 'pink' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewPost({ ...newPost, type: type.value as Post['type'] })}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        newPost.type === type.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Content */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  What's on your mind?
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your journey, ask for advice, or celebrate a win..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newPost.content.length} characters
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="coding, fitness, music (comma-separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Image URL (optional) */}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Image URL (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPost.image}
                    onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <ImageIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {newPost.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={newPost.image}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/400/300';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setIsCreatePostOpen(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.content.trim()}
                className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post to Community
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'all', label: '🌟 All Posts' },
          { id: 'progress', label: '📈 Progress' },
          { id: 'achievements', label: '🏆 Wins' },
          { id: 'tips', label: '💡 Tips' },
          { id: 'challenges', label: '🎯 Challenges' },
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id as any)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
              filter === filterOption.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-secondary hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-sm border border-secondary/10 overflow-hidden"
          >
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <img
                    src={post.user?.avatar || '/api/placeholder/40/40'}
                    alt={post.user?.name || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">
                        {post.user?.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Level {post.user?.level || 1}
                      </span>
                      {post.user?.skill && (
                        <span className="text-xs text-gray-500">
                          • {post.user.skill}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
                        {getPostTypeEmoji(post.type)} {post.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(post.timestamp)}
                      </span>
                      {post.challengeName && (
                        <span className="text-xs text-primary">
                          in {post.challengeName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Post Actions Dropdown */}
                <div className="relative dropdown-container">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === post.id ? null : post.id)}
                    className="p-2 text-secondary/60 hover:text-secondary rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openDropdown === post.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {post.user.id === currentUser.id && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this post?')) {
                              onDeletePost(post.id);
                              setOpenDropdown(null);
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Post
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onReportPost(post.id);
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Flag className="w-4 h-4" />
                        Report Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
              <p className="text-gray-700 leading-relaxed mb-3">
                {post.content}
              </p>
              
              {/* Post Image */}
              {post.image && (
                <div className="rounded-lg overflow-hidden mb-3">
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="px-6 py-3 border-t border-secondary/10 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      post.isLiked
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-secondary hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-secondary hover:bg-gray-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length}</span>
                  </button>

                  <button
                    onClick={() => onSharePost(post.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-secondary hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                <button
                  onClick={() => onReportPost(post.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="border-t border-secondary/10">
                {/* Add Comment */}
                <div className="p-4 border-b border-secondary/10 bg-gray-50/30">
                  <div className="flex gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Add an encouraging comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment({
                          ...newComment,
                          [post.id]: e.target.value
                        })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id);
                          }
                        }}
                        className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      {newComment[post.id]?.trim() && (
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="mt-2 bg-primary text-white px-4 py-1 rounded-md text-sm font-medium hover:opacity-90 transition-colors"
                        >
                          Post
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="max-h-64 overflow-y-auto">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="p-4 border-b border-secondary/5 last:border-b-0">
                      <div className="flex gap-3">
                        <img
                          src={comment.user.avatar}
                          alt={comment.user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-secondary text-sm">
                              {comment.user.name}
                            </span>
                            <span className="text-xs text-secondary/60">
                              {formatTimeAgo(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-secondary/80 mb-2">
                            {comment.content}
                          </p>
                          <button
                            onClick={() => onLikeComment(comment.id)}
                            className={`flex items-center gap-1 text-xs ${
                              comment.isLiked
                                ? 'text-red-600'
                                : 'text-secondary/60 hover:text-secondary'
                            }`}
                          >
                            <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                            <span>{comment.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-secondary/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary mb-2">
            No posts yet
          </h3>
          <p className="text-secondary/60">
            Be the first to share your progress!
          </p>
        </div>
      )}
    </div>
  );
};