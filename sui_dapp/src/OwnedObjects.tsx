import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
<<<<<<< HEAD
import { Flex, Heading, Text } from "@radix-ui/themes";
=======
import { Flex, Text, Button, Card } from "@radix-ui/themes";
import { STRUCT_TYPES } from "./constants";
>>>>>>> sedemir

export function OwnedObjects() {
  const account = useCurrentAccount();
  const { data, isPending, error } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
    },
    {
      enabled: !!account,
    },
  );

  if (!account) {
<<<<<<< HEAD
    return;
  }

  if (error) {
    return <Flex>Error: {error.message}</Flex>;
  }

  if (isPending || !data) {
    return <Flex>Loading...</Flex>;
  }

  return (
    <Flex direction="column" my="2">
      {data.data.length === 0 ? (
        <Text>No objects owned by the connected wallet</Text>
      ) : (
        <Heading size="4">Objects owned by the connected wallet</Heading>
      )}
      {data.data.map((object) => (
        <Flex key={object.data?.objectId}>
          <Text>Object ID: {object.data?.objectId}</Text>
        </Flex>
      ))}
=======
    return null;
  }

  if (error) {
    return <Text color="red">Error: {error.message}</Text>;
  }

  if (isPending || !data) {
    return <Text>Loading...</Text>;
  }

  const userProfiles = data.data.filter((obj) => 
    obj.data?.type === STRUCT_TYPES.USER_PROFILE
  );

  const reputationCards = data.data.filter((obj) =>
    obj.data?.type === STRUCT_TYPES.REPUTATION_CARD
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("✅ ID kopyalandı!");
  };

  return (
    <Flex direction="column" my="2" gap="3">
      <Text size="3" weight="bold">
        💼 Cüzdan: {account.address.slice(0, 6)}...{account.address.slice(-4)}
      </Text>

      {userProfiles.length > 0 && (
        <Flex direction="column" gap="2">
          <Text size="2" weight="bold" style={{ color: "var(--green-11)" }}>
            🎯 Profiliniz
          </Text>
          {userProfiles.map((object) => (
            <Card key={object.data?.objectId} style={{ padding: "15px", background: "var(--green-a2)" }}>
              <Flex direction="column" gap="2">
                <Text size="1" style={{ wordBreak: "break-all", fontFamily: "monospace" }}>
                  {object.data?.objectId}
                </Text>
                <Flex gap="2">
                  <Button
                    size="2"
                    onClick={() => copyToClipboard(object.data?.objectId || "")}
                    style={{ cursor: "pointer", flex: 1 }}
                  >
                    📋 Kopyala
                  </Button>
                  <Button
                    size="2"
                    variant="soft"
                    onClick={() => window.open(`https://suiscan.xyz/testnet/object/${object.data?.objectId}`, '_blank')}
                    style={{ cursor: "pointer", flex: 1 }}
                  >
                    🔍 Explorer
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}

      {reputationCards.length > 0 && (
        <Text size="2">
          📋 Aldığınız Kartlar: {reputationCards.length}
        </Text>
      )}
>>>>>>> sedemir
    </Flex>
  );
}
