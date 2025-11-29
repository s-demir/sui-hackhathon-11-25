import { Container, Heading, Text, Flex, Card } from "@radix-ui/themes";
import { RateUser } from "../components/RateUser";
import { useCurrentAccount } from "@mysten/dapp-kit";

export function RatePage() {
  const account = useCurrentAccount();

  if (!account) {
    return (
      <Container size="3" style={{ padding: "40px 20px" }}>
        <Card>
          <Flex direction="column" align="center" gap="4" style={{ padding: "40px" }}>
            <Text size="6">🔒</Text>
            <Heading size="5">Wallet Not Connected</Heading>
            <Text color="gray">Please connect your wallet to rate users</Text>
          </Flex>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="3" style={{ padding: "40px 20px" }}>
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Heading size="7">⭐ Rate a User</Heading>
          <Text color="gray">Give feedback and help build trust in the community</Text>
        </Flex>

        <RateUser />
      </Flex>
    </Container>
  );
}
