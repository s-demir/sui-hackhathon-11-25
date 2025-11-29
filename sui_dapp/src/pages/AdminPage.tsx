import { Container, Heading, Text, Flex } from "@radix-ui/themes";
import { AdminPanel } from "../components/AdminPanel";

export function AdminPage() {
  return (
    <Container size="3" style={{ padding: "40px 20px" }}>
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Heading size="7">🔒 Admin Panel</Heading>
          <Text color="gray">Manage redemption tasks and system operations</Text>
        </Flex>

        <AdminPanel />
      </Flex>
    </Container>
  );
}
