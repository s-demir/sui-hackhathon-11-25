import { Container, Heading, Text, Flex } from "@radix-ui/themes";
import { UserList } from "../components/UserList";
import { ProfileList } from "../components/ProfileList";
import { ViewProfile } from "../components/ViewProfile";

export function Explore() {
  return (
    <Container size="4" style={{ padding: "40px 20px" }}>
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="2">
          <Heading size="7">🔍 Explore Users</Heading>
          <Text color="gray">Search and discover users on the ftSui network</Text>
        </Flex>

        <ViewProfile />
        <UserList />
        <ProfileList />
      </Flex>
    </Container>
  );
}
