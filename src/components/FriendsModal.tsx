import React, { useState } from 'react';
import { X, Search, UserPlus, Check, X as XIcon, Users, Clock } from 'lucide-react';
import { Friend, FriendRequest, UserSearchResult } from '../types';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  friendRequests: FriendRequest[];
  onSearchUsers: (query: string) => UserSearchResult[];
  onSendFriendRequest: (userId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onRemoveFriend: (friendId: string) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  friends,
  friendRequests,
  onSearchUsers,
  onSendFriendRequest,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'requests' | 'friends'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);

  if (!isOpen) return null;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      const results = onSearchUsers(query.trim());
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const pendingRequests = friendRequests.filter(req => req.status === 'pending');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-primary">Friends</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Search Users
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Requests
              {pendingRequests.length > 0 && (
                <span className="absolute top-2 right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'friends'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              My Friends ({friends.length})
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name or @nickname..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {searchQuery.trim().length < 2 && (
                <p className="text-center text-gray-500 py-8">
                  Type at least 2 characters to search for users
                </p>
              )}

              {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No users found matching "{searchQuery}"
                </p>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-primary">{user.displayName}</p>
                          <p className="text-sm text-gray-600">@{user.nickname}</p>
                          <p className="text-xs text-gray-500">Level {user.level}</p>
                        </div>
                      </div>
                      <div>
                        {user.isFriend ? (
                          <span className="text-sm text-green-600 font-medium">✓ Friends</span>
                        ) : user.hasPendingRequest ? (
                          <span className="text-sm text-gray-500">Request Sent</span>
                        ) : (
                          <button
                            onClick={() => onSendFriendRequest(user.userId)}
                            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending friend requests</p>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">{request.fromUserName}</p>
                        <p className="text-sm text-gray-600">@{request.fromUserNickname}</p>
                        <p className="text-xs text-gray-500">Level {request.fromUserLevel}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAcceptRequest(request.id)}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                        title="Accept"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onRejectRequest(request.id)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                        title="Reject"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  You haven't added any friends yet. Search for users to send friend requests!
                </p>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">{friend.displayName}</p>
                        <p className="text-sm text-gray-600">@{friend.nickname}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Level {friend.level}</span>
                          <span>•</span>
                          <span>{friend.currentStreak} day streak</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFriend(friend.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
