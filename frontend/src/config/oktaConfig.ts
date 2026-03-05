export const oktaConfig = {
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID || '',
  issuer: import.meta.env.VITE_OKTA_ISSUER || '',
  redirectUri: window.location.origin + '/login/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
  disableHttpsCheck: import.meta.env.DEV, // Only for development
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
