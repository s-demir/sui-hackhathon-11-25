import { useState, useEffect } from 'react';
// importlar kaldırıldı
import { jwtToAddress } from '@mysten/zklogin';

export interface ZkLoginState {
  isLoading: boolean;
  userAddress: string | null;
  email: string | null;
  provider: 'google' | '42' | null;
  error: string | null;
}

export const useZkLogin = () => {
  const [state, setState] = useState<ZkLoginState>({
    isLoading: false,
    userAddress: null,
    email: null,
    provider: null,
    error: null,
  });

  // Google OAuth login
  const loginWithGoogle = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Generate state for OAuth
      const state = Math.random().toString(36).substring(7);
      const nonce = Math.random().toString(36).substring(7);

      // Store state and provider
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_nonce', nonce);
      sessionStorage.setItem('provider', 'google');

      // Redirect to OAuth backend server
      const oauthServerUrl = import.meta.env.VITE_OAUTH_SERVER_URL || 'http://localhost:3001';
      window.location.href = `${oauthServerUrl}/auth/google?state=${state}&nonce=${nonce}`;
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to login with Google',
      });
    }
  };

  // 42 École OAuth login
  const loginWith42 = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Generate state for OAuth
      const state = Math.random().toString(36).substring(7);

      // Store state and provider
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('provider', '42');

      // Redirect to OAuth backend server
      const oauthServerUrl = import.meta.env.VITE_OAUTH_SERVER_URL || 'http://localhost:3001';
      window.location.href = `${oauthServerUrl}/auth/42?state=${state}`;
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to login with 42',
      });
    }
  };

  // Handle OAuth callback
  const handleCallback = async (jwt: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });

      // Get stored data
      const ephemeralKeyPairStr = sessionStorage.getItem('ephemeralKeyPair');
      const randomness = sessionStorage.getItem('randomness');

      if (!ephemeralKeyPairStr || !randomness) {
        throw new Error('Missing authentication data');
      }

      // Decode JWT to get email
      const jwtPayload = JSON.parse(atob(jwt.split('.')[1]));
      const email = jwtPayload.email;

      // Generate zkLogin address
      const userAddress = jwtToAddress(jwt, BigInt(randomness));

      setState({
        isLoading: false,
        userAddress,
        email,
        provider: sessionStorage.getItem('provider') as 'google' | '42',
        error: null,
      });

      // Clean up session storage
      sessionStorage.removeItem('ephemeralKeyPair');
      sessionStorage.removeItem('randomness');
      sessionStorage.removeItem('provider');
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to handle callback',
      });
    }
  };

  const logout = () => {
    setState({
      isLoading: false,
      userAddress: null,
      email: null,
      provider: null,
      error: null,
    });
    sessionStorage.clear();
  };

  return {
    ...state,
    loginWithGoogle,
    loginWith42,
    handleCallback,
    logout,
  };
};
