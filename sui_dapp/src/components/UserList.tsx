import { useSuiClientQuery, useSuiClient } from "@mysten/dapp-kit";
import { Flex, Text, Card, Button } from "@radix-ui/themes";
import { REGISTRY_ID, PACKAGE_ID, MODULE_NAME, FUNCTIONS } from "../constants";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";

export function UserList() {
  const suiClient = useSuiClient();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'username' | 'objectId' | null>(null);

  const { data, isLoading, error, refetch } = useSuiClientQuery(
    "getObject",
    {
      id: REGISTRY_ID,
      options: {
        showContent: true,
      },
    }
  );

  const registryData = data?.data?.content as any;
  const usernameList = registryData?.fields?.username_list || [];

  const handleCopyUsername = async (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(username);
      setCopiedItem(username);
      setCopiedType('username');
      setTimeout(() => {
        setCopiedItem(null);
        setCopiedType(null);
      }, 2000);
    } catch (err) {
      console.error("Clipboard error:", err);
      alert(`Username: ${username}`);
    }
  };

  const handleCopyObjectId = async (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Get profile ID for this username
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTIONS.GET_PROFILE_BY_USERNAME}`,
        arguments: [
          tx.object(REGISTRY_ID),
          tx.pure.string(username),
        ],
      });

      const result = await suiClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
      });

      if (result.results && result.results[0]?.returnValues) {
        const returnValue = result.results[0].returnValues[0];
        if (returnValue && returnValue[0]) {
          const bytes = returnValue[0];
          const objectIdHex = Array.from(bytes)
            .map((b: number) => b.toString(16).padStart(2, "0"))
            .join("");
          const objectId = `0x${objectIdHex}`;
          
          await navigator.clipboard.writeText(objectId);
          setCopiedItem(username);
          setCopiedType('objectId');
          setTimeout(() => {
            setCopiedItem(null);
            setCopiedType(null);
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Failed to get Object ID:", err);
      alert("Failed to get Object ID");
    }
  };

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px", border: "1px solid var(--gray-a4)", borderRadius: "8px" }}>
      <Flex justify="between" align="center">
        <Text size="5" weight="bold">
          👥 Registered Users
        </Text>
        <Button
          onClick={() => refetch()}
          size="2"
          variant="soft"
          disabled={isLoading}
          style={{ cursor: isLoading ? "wait" : "pointer" }}
        >
          {isLoading ? "⏳ Loading..." : "🔄 Refresh"}
        </Button>
      </Flex>

      {isLoading && <Text size="2" color="gray">⏳ Loading...</Text>}

      {error && (
        <Text size="2" color="red">
          ❌ Error: {error.message}
        </Text>
      )}

      {!isLoading && !error && (
        <>
          <Text size="2" color="gray">
            Total {usernameList.length} users registered
          </Text>

          {usernameList.length === 0 && (
            <Flex direction="column" gap="2" style={{ background: "var(--yellow-a2)", padding: "15px", borderRadius: "4px" }}>
              <Text size="2" weight="bold">
                📭 No users yet
              </Text>
              <Text size="1" color="gray">
                Create your first profile!
              </Text>
            </Flex>
          )}

          <Flex direction="column" gap="2">
            {usernameList.map((username: string, index: number) => (
              <Card 
                key={index} 
                style={{ 
                  padding: "16px",
                  transition: "all 0.3s ease",
                  background: copiedItem === username && copiedType === 'username' ? "var(--green-a3)" : 
                              copiedItem === username && copiedType === 'objectId' ? "var(--blue-a3)" : undefined,
                  border: copiedItem === username && copiedType === 'username' ? "2px solid var(--green-9)" : 
                          copiedItem === username && copiedType === 'objectId' ? "2px solid var(--blue-9)" : "1px solid var(--gray-a4)",
                  transform: copiedItem === username ? "scale(1.02)" : "scale(1)",
                  boxShadow: copiedItem === username && copiedType === 'username' ? "0 4px 12px var(--green-a5)" : 
                              copiedItem === username && copiedType === 'objectId' ? "0 4px 12px var(--blue-a5)" : undefined,
                }}
              >
                <Flex justify="between" align="center" gap="3">
                  <Flex align="center" gap="2">
                    <Text size="6">👤</Text>
                    <Flex direction="column" gap="1">
                      <Text size="4" weight="bold">
                        @{username}
                      </Text>
                      <Text size="1" color="gray">
                        {copiedItem === username && copiedType === 'username' ? "✅ Username copied!" : 
                         copiedItem === username && copiedType === 'objectId' ? "✅ Object ID copied!" : 
                         "Click buttons to copy →"}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex align="center" gap="2">
                    <Button
                      size="2"
                      variant="soft"
                      onClick={(e) => handleCopyUsername(username, e)}
                      style={{ cursor: "pointer" }}
                    >
                      {copiedItem === username && copiedType === 'username' ? "✅" : "📋"} Username
                    </Button>
                    <Button
                      size="2"
                      variant="soft"
                      color="blue"
                      onClick={(e) => handleCopyObjectId(username, e)}
                      style={{ cursor: "pointer" }}
                    >
                      {copiedItem === username && copiedType === 'objectId' ? "✅" : "🆔"} Object ID
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Flex>
        </>
      )}
    </Flex>
  );
}
