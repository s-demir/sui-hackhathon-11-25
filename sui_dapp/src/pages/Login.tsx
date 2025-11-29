import { Button, Container, Heading, Text, Flex, Card } from '@radix-ui/themes';
import { useZkLogin } from '../hooks/useZkLogin';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Login() {
  const { loginWithGoogle, loginWith42, isLoading, error } = useZkLogin();
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    // If already connected with wallet, redirect
    if (currentAccount) {
      navigate('/create-profile');
    }
  }, [currentAccount, navigate]);

  return (
    <Container size="2" style={{ marginTop: '60px' }}>
      <Flex direction="column" gap="6" align="center">
        <Heading size="8" style={{ textAlign: 'center' }}>
          Welcome to SuiSoul
        </Heading>
        
        <Text size="4" color="gray" style={{ textAlign: 'center', maxWidth: '500px' }}>
          Create your decentralized identity and build trust in the community
        </Text>

        {error && (
          <Card style={{ background: 'var(--red-3)', borderColor: 'var(--red-6)' }}>
            <Text color="red">{error}</Text>
          </Card>
        )}

        <Card style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
          <Flex direction="column" gap="4">
            <Heading size="5" style={{ textAlign: 'center', marginBottom: '10px' }}>
              Choose Login Method
            </Heading>

            <Button
              size="3"
              variant="soft"
              style={{ 
                width: '100%',
                cursor: 'pointer',
                background: 'var(--blue-3)',
                color: 'var(--blue-11)',
              }}
              onClick={loginWithGoogle}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Loading...' : '🌐 Continue with Google'}
            </Button>

            <Button
              size="3"
              variant="soft"
              style={{ 
                width: '100%',
                cursor: 'pointer',
                background: 'var(--purple-3)',
                color: 'var(--purple-11)',
              }}
              onClick={loginWith42}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Loading...' : '🎓 Continue with 42 École'}
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

        <Card style={{ maxWidth: '500px', background: 'var(--gray-2)' }}>
          <Flex direction="column" gap="2">
            <Text size="2" weight="bold">ℹ️ Important:</Text>
            <Text size="2" color="gray">
              • One email = One profile<br />
              • One wallet = One profile<br />
              • Choose your login method carefully
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}
