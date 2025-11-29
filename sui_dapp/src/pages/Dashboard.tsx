import { Container, Heading, Text, Flex, Card } from "@radix-ui/themes";
import { MyProfile } from "../components/MyProfile";
import { CreateProfile } from "../components/CreateProfile";
import { useCurrentAccount } from "@mysten/dapp-kit";

export function Dashboard() {
  const account = useCurrentAccount();

  if (!account) {
    return (
      <Container size="3" style={{ padding: "40px 20px" }}>
        <Card>
          <Flex direction="column" align="center" gap="4" style={{ padding: "40px" }}>
            <Text size="6">🔒</Text>
            <Heading size="5">Wallet Not Connected</Heading>
            <Text color="gray">Please connect your wallet to view your dashboard</Text>
          </Flex>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="3" style={{ padding: "40px 20px" }}>
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Heading size="7">📊 My Dashboard</Heading>
          <Text color="gray">Manage your profile and view your reputation</Text>
        </Flex>

        <CreateProfile />
        <MyProfile />
      </Flex>
    </Container>
  );
}
