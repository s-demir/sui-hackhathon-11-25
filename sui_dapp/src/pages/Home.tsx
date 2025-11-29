import { Container, Heading, Text, Button, Flex, Card } from "@radix-ui/themes";
import { ConnectButton } from "@mysten/dapp-kit";
import { Link } from "react-router-dom";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { REGISTRY_ID } from "../constants";

export function Home() {
    // Wallet bağlantı fonksiyonu
    const handleWalletConnect = () => {
      // Mysten dapp-kit ile bağlantı için genellikle Navbar'da ConnectButton kullanılıyor
      // Home'da doğrudan bağlantı için window.dispatchEvent ile Navbar'daki ConnectButton'u tetikleyebiliriz
      window.dispatchEvent(new Event('open_wallet_modal'));
    }
  const account = useCurrentAccount();

  // Fetch registry data for stats
  const { data: registryData } = useSuiClientQuery(
    "getObject",
    {
      id: REGISTRY_ID,
      options: { showContent: true },
    }
  );

  const registryContent = registryData?.data?.content as any;
  const usernameList = registryContent?.fields?.username_list || [];
  const totalUsers = usernameList.length;

  return (
    <Container size="4">
      {/* Hero Section */}
      <Flex direction="column" align="center" gap="6" style={{ padding: "80px 20px" }}>
        <Heading size="9" align="center" style={{ maxWidth: "800px" }}>
          Build Trust on the Blockchain
        </Heading>
        <Text size="5" align="center" color="gray" style={{ maxWidth: "600px" }}>
          ftSui is a decentralized reputation system where your trust score is permanently recorded on ftSui Network
        </Text>
        
        <Flex gap="4" mt="4" wrap="wrap" justify="center">
          {account ? (
            <>
              <Link to="/dashboard">
                <Button size="4" style={{ cursor: "pointer" }}>
                  Go to Dashboard →
                </Button>
              </Link>
              <Link to="/explore">
                <Button size="4" variant="soft" style={{ cursor: "pointer" }}>
                  Explore Users
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button 
                size="4"
                style={{
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  minWidth: "300px",
                  minHeight: "60px",
                  padding: "0 40px",
                  fontSize: "20px",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s",
                  marginRight: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                }}
                onClick={() => window.location.href = '/login'}
              >
                <Flex align="center" gap="2">
                  <Text size="5">🔐</Text>
                  <Text>Login with Email</Text>
                </Flex>
              </Button>
              <ConnectButton
                style={{
                  background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
                  color: "white",
                  minWidth: "300px",
                  minHeight: "60px",
                  padding: "0 40px",
                  fontSize: "20px",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s",
                  marginLeft: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                connectText={
                  <Flex align="center" gap="2" style={{ height: "60px", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "28px", marginRight: "8px", filter: "none", display: "flex", alignItems: "center" }}>👛</span>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "20px", letterSpacing: "0.5px", filter: "none", display: "flex", alignItems: "center" }}>Connect Wallet</span>
                  </Flex>
                }
              />
            </>
          )}
        </Flex>
      </Flex>

      {/* Features */}
      <Flex direction="column" gap="4" style={{ padding: "40px 0" }}>
        <Heading size="7" align="center" mb="4">
          How It Works
        </Heading>
        
        <Flex gap="4" wrap="wrap" justify="center">
          <Card style={{ flex: "1", minWidth: "280px", maxWidth: "350px" }}>
            <Flex direction="column" gap="3">
              <Text size="8">1️⃣</Text>
              <Heading size="5">Create Profile</Heading>
              <Text color="gray">
                Register with a unique username and start with 100 trust score
              </Text>
            </Flex>
          </Card>

          <Card style={{ flex: "1", minWidth: "280px", maxWidth: "350px" }}>
            <Flex direction="column" gap="3">
              <Text size="8">2️⃣</Text>
              <Heading size="5">Build Reputation</Heading>
              <Text color="gray">
                Receive ratings from others. Each rating creates a permanent NFT card
              </Text>
            </Flex>
          </Card>

          <Card style={{ flex: "1", minWidth: "280px", maxWidth: "350px" }}>
            <Flex direction="column" gap="3">
              <Text size="8">3️⃣</Text>
              <Heading size="5">Earn Trust</Heading>
              <Text color="gray">
                Your trust score reflects your reputation - transparent and immutable
              </Text>
            </Flex>
          </Card>
        </Flex>
      </Flex>

      {/* Stats Section */}
      <Flex direction="column" gap="6" mt="8">
        <Heading size="7" align="center">
          Network Statistics
        </Heading>
        
        <Flex gap="4" wrap="wrap" justify="center">
          <Card style={{ 
            flex: "1", 
            minWidth: "200px", 
            maxWidth: "250px",
            background: "var(--blue-a2)",
            border: "2px solid var(--blue-a4)",
            transition: "transform 0.2s",
          }}>
            <Flex direction="column" align="center" gap="2" p="4">
              <Text size="8">👥</Text>
              <Heading size="8" style={{ color: "var(--blue-11)" }}>
                {totalUsers}
              </Heading>
              <Text size="2" color="gray" weight="bold">
                Registered Users
              </Text>
            </Flex>
          </Card>

          <Card style={{ 
            flex: "1", 
            minWidth: "200px", 
            maxWidth: "250px",
            background: "var(--green-a2)",
            border: "2px solid var(--green-a4)",
            transition: "transform 0.2s",
          }}>
            <Flex direction="column" align="center" gap="2" p="4">
              <Text size="8">⭐</Text>
              <Heading size="8" style={{ color: "var(--green-11)" }}>
                ∞
              </Heading>
              <Text size="2" color="gray" weight="bold">
                Ratings Given
              </Text>
            </Flex>
          </Card>

          <Card style={{ 
            flex: "1", 
            minWidth: "200px", 
            maxWidth: "250px",
            background: "var(--purple-a2)",
            border: "2px solid var(--purple-a4)",
            transition: "transform 0.2s",
          }}>
            <Flex direction="column" align="center" gap="2" p="4">
              <Text size="8">🔒</Text>
              <Heading size="8" style={{ color: "var(--purple-11)" }}>
                100%
              </Heading>
              <Text size="2" color="gray" weight="bold">
                On-Chain
              </Text>
            </Flex>
          </Card>
        </Flex>

        <Card style={{ padding: "40px", marginTop: "20px" }}>
          <Flex direction="column" align="center" gap="4">
            <Heading size="6">Join the Trust Network</Heading>
            <Text size="3" color="gray" align="center">
              Powered by Sui Blockchain • Decentralized • Transparent • Permanent
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}
