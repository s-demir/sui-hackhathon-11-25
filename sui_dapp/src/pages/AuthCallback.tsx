import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Heading, Text, Spinner } from '@radix-ui/themes';
import { useZkLogin } from '../hooks/useZkLogin';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { handleCallback } = useZkLogin();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get JWT from URL (Google uses id_token in hash, 42 uses code in query)
        const hash = window.location.hash.substring(1);
        const query = new URLSearchParams(window.location.search);
        
        const idToken = new URLSearchParams(hash).get('id_token');
        const code = query.get('code');

        if (idToken) {
          // Google login
          await handleCallback(idToken);
          navigate('/create-profile');
        } else if (code) {
          // 42 login - need to exchange code for JWT
          const response = await fetch('/api/42/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });
          
          const data = await response.json();
          if (data.jwt) {
            await handleCallback(data.jwt);
            navigate('/create-profile');
          } else {
            throw new Error('Failed to get JWT from 42');
          }
        } else {
          throw new Error('No authentication token found');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/', { 
          state: { 
            error: error instanceof Error ? error.message : 'Authentication failed' 
          } 
        });
      }
    };

    processCallback();
  }, [handleCallback, navigate]);

  return (
    <Container size="1" style={{ textAlign: 'center', marginTop: '100px' }}>
      <Spinner size="3" />
      <Heading size="6" style={{ marginTop: '20px' }}>
        Processing authentication...
      </Heading>
      <Text size="2" color="gray">
        Please wait while we complete your login.
      </Text>
    </Container>
  );
}
