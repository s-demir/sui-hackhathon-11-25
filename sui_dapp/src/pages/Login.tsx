import { Button, Container, Heading, Text, Flex, Card } from '@radix-ui/themes';
import { useZkLogin } from '../hooks/useZkLogin';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Sağ alt köşede açılır/kapanır info kutusu bileşeni
function InfoCornerBox() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      position: 'fixed',
      right: 24,
      bottom: 24,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: '#e0e7ff',
          border: 'none',
          borderRadius: '50%',
          width: 36,
          height: 36,
          boxShadow: '0 2px 8px rgba(37,99,235,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
        aria-label="Show info"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6"><circle cx="12" cy="12" r="10" fill="#e0e7ff"/><text x="12" y="16" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#3b82f6">i</text></svg>
      </button>
      {open && (
        <div style={{
          marginTop: 10,
          minWidth: 320,
          maxWidth: 380,
          background: 'rgba(30,41,59,0.97)',
          border: '1px solid #334155',
          borderRadius: '10px',
          boxShadow: '0 2px 12px rgba(37,99,235,0.13)',
          padding: '18px 20px 14px 20px',
          fontFamily: 'Inter, Arial, sans-serif',
          color: '#e0e7ef',
          fontSize: 14,
          opacity: 0.97,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#3b82f6', letterSpacing: 0.05 }}>OAuth Server Required</span>
          </div>
          <div style={{ lineHeight: 1.7 }}>
            To use Google or 42 École login, start the OAuth server:<br /><br />
            <strong>Install dependencies:</strong><br />
            <code style={{ background: '#1e293b', color: '#60a5fa', borderRadius: 4, padding: '2px 6px' }}>cd oauth-server &amp;&amp; npm install</code><br /><br />
            <strong>Configure credentials:</strong><br />
            Edit <code style={{ background: '#1e293b', color: '#60a5fa', borderRadius: 4, padding: '2px 6px' }}>oauth-server/.env</code> file<br />
            • Google: <a href="https://console.cloud.google.com/" target="_blank" style={{ color: '#60a5fa', textDecoration: 'underline' }}>console.cloud.google.com</a><br />
            • 42 École: <a href="https://profile.intra.42.fr/oauth/applications" target="_blank" style={{ color: '#60a5fa', textDecoration: 'underline' }}>profile.intra.42.fr</a><br /><br />
            <strong>Start server:</strong><br />
            <code style={{ background: '#1e293b', color: '#60a5fa', borderRadius: 4, padding: '2px 6px' }}>npm start</code> (runs on port 3001)<br /><br />
            <strong>💡 Quick Start:</strong><br />
            Use <strong>Wallet Connect</strong> from the navbar
          </div>
        </div>
      )}
    </div>
  );
}

export default function Login() {
  const { loginWithGoogle, loginWith42, isLoading, error } = useZkLogin();
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    // If already connected with wallet, redirect
    if (currentAccount) {
      navigate('/dashboard');
    }
  }, [currentAccount, navigate]);

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleFortyTwoLogin = () => {
    loginWith42();
  };

  return (
    <Container size="2" style={{ marginTop: '60px' }}>
      <Flex direction="column" gap="6" align="center">
        <Heading size="8" style={{ textAlign: 'center' }}>
          Welcome to ftSui
        </Heading>
        
        <Text size="4" color="gray" style={{ textAlign: 'center', maxWidth: '500px' }}>
          Create your decentralized identity and build trust in the community
        </Text>

        {error && (
          <Card style={{ background: 'var(--red-3)', borderColor: 'var(--red-6)' }}>
            <Text color="red">{error}</Text>
          </Card>
        )}

        <Card style={{ 
          width: '100%', 
          maxWidth: '500px', 
          padding: '40px',
          background: 'var(--gray-a2)',
          border: '2px solid var(--gray-a4)',
        }}>
          <Flex direction="column" gap="5">
            <Flex direction="column" gap="2" align="center">
              <Heading size="6" style={{ textAlign: 'center' }}>
                Choose Login Method
              </Heading>
              <Text size="2" color="gray" style={{ textAlign: 'center' }}>
                Login with email or connect your wallet
              </Text>
            </Flex>

            <Button
              size="4"
              variant="surface"
              style={{ 
                width: '100%',
                cursor: 'pointer',
                background: 'white',
                color: '#4285F4',
                border: '2px solid #4285F4',
                padding: '20px',
                fontSize: '16px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#4285F4';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#4285F4';
              }}
            >
              <Flex align="center" justify="center" gap="3">
                <Text size="5">🌐</Text>
                <Text>{isLoading ? 'Connecting...' : 'Continue with Google'}</Text>
              </Flex>
            </Button>

            <Button
              size="4"
              variant="surface"
              style={{ 
                width: '100%',
                cursor: 'pointer',
                background: 'white',
                color: '#00BABC',
                border: '2px solid #00BABC',
                padding: '20px',
                fontSize: '16px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onClick={handleFortyTwoLogin}
              disabled={isLoading}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#00BABC';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#00BABC';
              }}
            >
              <Flex align="center" justify="center" gap="3">
                <Text size="5">🎓</Text>
                <Text>{isLoading ? 'Connecting...' : 'Continue with 42 École'}</Text>
              </Flex>
            </Button>

            <div style={{ 
              textAlign: 'center', 
              margin: '20px 0 10px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'var(--gray-6)',
                zIndex: 0,
              }} />
              <Text 
                size="2" 
                color="gray" 
                style={{ 
                  background: 'var(--color-background)',
                  padding: '0 15px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                or use wallet
              </Text>
            </div>

            <Text size="2" color="gray" style={{ textAlign: 'center' }}>
              Connect your Sui wallet from the navigation bar
            </Text>
          </Flex>
        </Card>

        {/* Sağ alt köşede açılır/kapanır info kutusu */}
        <InfoCornerBox />
      </Flex>
    </Container>
  );
}
