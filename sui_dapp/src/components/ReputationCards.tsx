import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { Button, Flex, Text, TextField, Card } from "@radix-ui/themes";
import { useState } from "react";
import { STRUCT_TYPES } from "../constants";

export function ReputationCards() {
  const currentAccount = useCurrentAccount();
  const [address, setAddress] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const { data, isLoading, error, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: searchAddress,
      filter: {
        StructType: STRUCT_TYPES.REPUTATION_CARD, // Sadece ReputationCard'lar
      },
      options: {
        showContent: true,  // Kart içeriğini getir (score, comment)
        showType: true,     // Tipini getir
      },
    },
    {
      enabled: !!searchAddress,
    }
  );

  const handleSearch = () => {
    if (!address.trim()) return;
    setSearchAddress(address);
  };

  const handleShowMyCards = () => {
    if (currentAccount?.address) {
      setAddress(currentAccount.address);
      setSearchAddress(currentAccount.address);
    }
  };

  const cards = data?.data || [];

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px", border: "1px solid var(--gray-a4)", borderRadius: "8px" }}>
      <Text size="5" weight="bold">
        📋 Reputation Kartları
      </Text>
      
      <Text size="2" color="gray">
        Bir kullanıcının aldığı tüm puanlama kartlarını görüntüleyin. Bu kartlar silinemeyen SBT'lerdir.
      </Text>

      {/* Address Input */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          Kullanıcı Adresi:
        </Text>
        <Flex gap="2">
          <TextField.Root
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isLoading}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading || !address.trim()}
            style={{ cursor: "pointer" }}
          >
            {isLoading ? "Yükleniyor..." : "Ara"}
          </Button>
        </Flex>
        
        {/* Kendi Kartlarımı Göster Butonu */}
        {currentAccount && (
          <Button
            onClick={handleShowMyCards}
            variant="soft"
            disabled={isLoading}
            style={{ cursor: "pointer" }}
          >
            🎯 Kendi Kartlarımı Göster
          </Button>
        )}
      </Flex>

      {/* Loading State */}
      {isLoading && (
        <Text size="2" color="gray">
          ⏳ Kartlar yükleniyor...
        </Text>
      )}

      {/* Error State */}
      {error && (
        <Flex direction="column" gap="2" style={{ background: "var(--red-a2)", padding: "10px", borderRadius: "4px" }}>
          <Text size="2" color="red" weight="bold">
            ❌ Hata
          </Text>
          <Text size="1" color="red">
            {error.message || "Kartlar yüklenemedi"}
          </Text>
        </Flex>
      )}

      {/* Success State - Cards List */}
      {data && !error && (
        <Flex direction="column" gap="3">
          <Flex justify="between" align="center">
            <Text size="3" weight="bold">
              Toplam {cards.length} kart bulundu
            </Text>
            <Button
              onClick={() => refetch()}
              variant="soft"
              size="1"
              style={{ cursor: "pointer" }}
            >
              🔄 Yenile
            </Button>
          </Flex>

          {/* Kartlar boşsa */}
          {cards.length === 0 && (
            <Flex direction="column" gap="2" style={{ background: "var(--gray-a2)", padding: "15px", borderRadius: "4px" }}>
              <Text size="2" weight="bold">
                📭 Henüz kart yok
              </Text>
              <Text size="1" color="gray">
                Bu adres henüz hiç puanlanmamış.
              </Text>
            </Flex>
          )}

          {/* Kartları listele */}
          {cards.map((card: any) => {
            const content = card.data?.content;
            const fields = content?.fields;
            const scoreGiven = fields?.score_given;
            const comment = fields?.comment;
            const objectId = card.data?.objectId;

            return (
              <Card key={objectId} style={{ padding: "15px" }}>
                <Flex direction="column" gap="2">
                  {/* Puan - Büyük ve belirgin */}
                  <Flex align="center" gap="2">
                    <Text size="6" weight="bold" style={{ color: getScoreColor(Number(scoreGiven)) }}>
                      {scoreGiven} ⭐
                    </Text>
                    <Text size="2" color="gray">
                      / 5
                    </Text>
                  </Flex>

                  {/* Yorum */}
                  <Flex direction="column" gap="1">
                    <Text size="2" weight="bold" color="gray">
                      Yorum:
                    </Text>
                    <Text size="2" style={{ fontStyle: "italic" }}>
                      "{comment}"
                    </Text>
                  </Flex>

                  {/* Object ID */}
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray">
                      Object ID:
                    </Text>
                    <Text size="1" style={{ wordBreak: "break-all", fontFamily: "monospace", opacity: 0.7 }}>
                      {objectId}
                    </Text>
                  </Flex>

                  {/* Silinemeyen Badge */}
                  <Flex align="center" gap="1" style={{ marginTop: "5px" }}>
                    <Text size="1" weight="bold" style={{ 
                      background: "var(--red-a3)", 
                      padding: "2px 8px", 
                      borderRadius: "4px",
                      color: "var(--red-11)"
                    }}>
                      🔒 SİLİNEMEZ
                    </Text>
                    <Text size="1" color="gray">
                      Bu kart kalıcıdır ve transfer edilemez
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Flex>
      )}


    </Flex>
  );
}

function getScoreColor(score: number): string {
  if (score >= 4) return "#22c55e"; // Yeşil - İyi
  if (score >= 3) return "#eab308"; // Sarı - Orta
  if (score >= 2) return "#f97316"; // Turuncu - Düşük
  return "#ef4444"; // Kırmızı - Kötü
}
