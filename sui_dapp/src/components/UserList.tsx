import { useSuiClientQuery } from "@mysten/dapp-kit";
import { Flex, Text, Card, Button } from "@radix-ui/themes";
import { REGISTRY_ID } from "../constants";
import { useState } from "react";

export function UserList() {
  const [copiedUsername, setCopiedUsername] = useState<string | null>(null);

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

  const handleCopyUsername = async (username: string) => {
    try {
      await navigator.clipboard.writeText(username);
      setCopiedUsername(username);
      setTimeout(() => setCopiedUsername(null), 2000);
    } catch (err) {
      console.error("Clipboard error:", err);
      alert(`Username: ${username}`);
    }
  };

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px", border: "1px solid var(--gray-a4)", borderRadius: "8px" }}>
      <Flex justify="between" align="center">
        <Text size="5" weight="bold">
          👥 Kayıtlı Kullanıcılar
        </Text>
        <Button
          onClick={() => refetch()}
          size="2"
          variant="soft"
          disabled={isLoading}
          style={{ cursor: isLoading ? "wait" : "pointer" }}
        >
          {isLoading ? "⏳ Yükleniyor..." : "🔄 Yenile"}
        </Button>
      </Flex>

      {isLoading && <Text size="2" color="gray">⏳ Yükleniyor...</Text>}

      {error && (
        <Text size="2" color="red">
          ❌ Hata: {error.message}
        </Text>
      )}

      {!isLoading && !error && (
        <>
          <Text size="2" color="gray">
            Toplam {usernameList.length} kullanıcı kayıtlı
          </Text>

          {usernameList.length === 0 && (
            <Flex direction="column" gap="2" style={{ background: "var(--yellow-a2)", padding: "15px", borderRadius: "4px" }}>
              <Text size="2" weight="bold">
                📭 Henüz kullanıcı yok
              </Text>
              <Text size="1" color="gray">
                İlk profilinizi oluşturun!
              </Text>
            </Flex>
          )}

          <Flex direction="column" gap="2">
            {usernameList.map((username: string, index: number) => (
              <Card 
                key={index} 
                style={{ 
                  padding: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: copiedUsername === username ? "var(--green-a3)" : undefined,
                }}
                onClick={() => handleCopyUsername(username)}
              >
                <Flex justify="between" align="center">
                  <Text size="3" weight="bold">
                    @{username}
                  </Text>
                  <Text size="2" color="gray">
                    {copiedUsername === username ? "✅ Kopyalandı!" : "📋 Username'i Kopyala"}
                  </Text>
                </Flex>
              </Card>
            ))}
          </Flex>
        </>
      )}
    </Flex>
  );
}
