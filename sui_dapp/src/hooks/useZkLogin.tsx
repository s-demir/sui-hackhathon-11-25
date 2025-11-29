import { useState, useEffect } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/zklogin';
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
      setState({ ...state, isLoading: true, error: null });

      // Generate ephemeral keypair
      const ephemeralKeyPair = new Ed25519Keypair();
      const randomness = generateRandomness();
      const nonce = generateNonce(
        ephemeralKeyPair.getPublicKey(),
        BigInt(100), // max epoch
        randomness
      );

      // Store ephemeral keypair and randomness
      sessionStorage.setItem('ephemeralKeyPair', JSON.stringify(ephemeralKeyPair.export()));
      sessionStorage.setItem('randomness', randomness);

      // Redirect to Google OAuth
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        redirect_uri: window.location.origin + '/auth/callback',
        response_type: 'id_token',
        scope: 'openid email profile',
        nonce: nonce,
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
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
      setState({ ...state, isLoading: true, error: null });

      // Generate ephemeral keypair
      const ephemeralKeyPair = new Ed25519Keypair();
      const randomness = generateRandomness();
      const nonce = generateNonce(
        ephemeralKeyPair.getPublicKey(),
        BigInt(100),
        randomness
      );

      // Store ephemeral keypair and randomness
      sessionStorage.setItem('ephemeralKeyPair', JSON.stringify(ephemeralKeyPair.export()));
      sessionStorage.setItem('randomness', randomness);
      sessionStorage.setItem('provider', '42');

      // Redirect to 42 OAuth
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_42_CLIENT_ID || '',
        redirect_uri: window.location.origin + '/auth/callback',
        response_type: 'code',
        scope: 'public',
        state: nonce,
      });

      window.location.href = `https://api.intra.42.fr/oauth/authorize?${params.toString()}`;
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
