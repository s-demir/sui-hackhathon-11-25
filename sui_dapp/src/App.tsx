import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
<<<<<<< HEAD
import { WalletStatus } from "./WalletStatus";
=======
import { OwnedObjects } from "./OwnedObjects";
import { CreateProfile } from "./components/CreateProfile";
import { RateUser } from "./components/RateUser";
import { ViewProfile } from "./components/ViewProfile";
import { ReputationCards } from "./components/ReputationCards";
import { ProfileList } from "./components/ProfileList";
>>>>>>> sedemir

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
<<<<<<< HEAD
          <Heading>dApp Starter Template</Heading>
        </Box>

=======
          <Heading>🎯 SuiSoul Trust System</Heading>
        </Box>
>>>>>>> sedemir
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
<<<<<<< HEAD
          <WalletStatus />
=======
          <OwnedObjects />
          <CreateProfile />
          <ProfileList />
          <RateUser />
          <ViewProfile />
          <ReputationCards />
>>>>>>> sedemir
        </Container>
      </Container>
    </>
  );
}

export default App;
