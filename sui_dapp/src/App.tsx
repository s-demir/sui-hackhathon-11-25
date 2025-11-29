import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { OwnedObjects } from "./OwnedObjects";
import { CreateProfile } from "./components/CreateProfile";
import { RateUser } from "./components/RateUser";
import { ViewProfile } from "./components/ViewProfile";
import { ReputationCards } from "./components/ReputationCards";
import { ProfileList } from "./components/ProfileList";
import { UserList } from "./components/UserList";

function App() {
  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>🎯 SuiSoul Trust System</Heading>
        </Box>
        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: "var(--gray-a2)", minHeight: 500 }}
        >
          <OwnedObjects />
          <CreateProfile />
          <UserList />
          <ProfileList />
          <RateUser />
          <ViewProfile />
          <ReputationCards />
        </Container>
      </Container>
    </>
  );
}

export default App;
