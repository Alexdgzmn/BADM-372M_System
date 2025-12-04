// Utility functions for avatar handling

/**
 * Returns a data URL for a default user avatar icon
 * This creates a simple circular icon with a user silhouette
 */
export const getDefaultAvatar = (): string => {
  // SVG user icon with circle background
  const svg = `
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#4F46E5"/>
      <path d="M24 24c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0 3c-4.42 0-13 2.21-13 6.6V36h26v-2.4c0-4.39-8.58-6.6-13-6.6z" fill="white"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Gets the avatar URL, returning a default icon if no avatar is provided
 */
export const getAvatarUrl = (avatarUrl?: string | null): string => {
  return avatarUrl || getDefaultAvatar();
};
