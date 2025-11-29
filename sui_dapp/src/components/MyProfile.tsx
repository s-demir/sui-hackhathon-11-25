import { useSuiClientQuery, useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { Button, Flex, Text, Card } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { REGISTRY_ID, STRUCT_TYPES } from "../constants";

export function MyProfile() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCards, setShowCards] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState("");

  const { data, isLoading, error: profileError, refetch } = useSuiClientQuery(
    "getObject",
    {
      id: profileId,
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
    },
    {
      enabled: !!profileId,
    }
  );

  const profileData = data?.data?.content as any;
  const trustScore = profileData?.fields?.trust_score;
  const username = profileData?.fields?.username;

  // Reputation kartlarını çek
  const { data: cardsData, isLoading: cardsLoading, refetch: refetchCards } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: ownerAddress,
      filter: {
        StructType: STRUCT_TYPES.REPUTATION_CARD,
      },
      options: {
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: !!ownerAddress && showCards,
    }
  );

  const cards = cardsData?.data || [];

  const fetchMyProfile = async () => {
    if (!currentAccount?.address) {
      setError("❌ Önce cüzdanınızı bağlayın!");
      return;
    }

    setLoading(true);
    setError(null);
    setShowCards(false);

    try {
      // Registry objesini çek
      const registryObj = await suiClient.getObject({
        id: REGISTRY_ID,
        options: { showContent: true },
      });

      const registryContent = registryObj.data?.content as any;
      const walletProfilesId = registryContent?.fields?.wallet_profiles?.fields?.id?.id;

      if (walletProfilesId) {
        // wallet_profiles table objesini çek
        const tableObj = await suiClient.getDynamicFields({
          parentId: walletProfilesId,
        });

        // Her bir field için kontrol et
        for (const field of tableObj.data) {
          const fieldData = await suiClient.getDynamicFieldObject({
            parentId: walletProfilesId,
            name: field.name,
          });

          const fieldContent = fieldData.data?.content as any;
          const key = fieldContent?.fields?.name;
          const value = fieldContent?.fields?.value;

          if (key === currentAccount.address) {
            // Bu bizim profilimiz!
            setProfileId(value);
            setOwnerAddress(currentAccount.address);
            setError(null);
            setLoading(false);
            return;
          }
        }
      }

      // Hiçbir profil bulunamadı
      setError("Profiliniz bulunamadı! Önce profil oluşturun.");
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message || "Profil yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Component mount olunca otomatik yükle
  useEffect(() => {
    if (currentAccount?.address) {
      fetchMyProfile();
    }
  }, [currentAccount?.address]);

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px", border: "1px solid var(--gray-a4)", borderRadius: "8px" }}>
      <Text size="5" weight="bold">
        👤 Profilimi Görüntüle
      </Text>
      
      <Text size="2" color="gray">
        Kendi profilinizi ve aldığınız reputation kartlarını görüntüleyin.
      </Text>

      {/* Yenile Butonu */}
      <Button
        onClick={fetchMyProfile}
        disabled={loading || !currentAccount}
        size="3"
        style={{ cursor: "pointer" }}
      >
        {loading ? "⏳ Yükleniyor..." : "🔄 Profilimi Yenile"}
      </Button>

      {!currentAccount && (
        <Flex direction="column" gap="2" style={{ background: "var(--yellow-a2)", padding: "10px", borderRadius: "4px" }}>
          <Text size="2" color="orange" weight="bold">
            ⚠️ Cüzdan Bağlı Değil
          </Text>
          <Text size="1" color="gray">
            Profilinizi görüntülemek için önce cüzdanınızı bağlayın.
          </Text>
        </Flex>
      )}

      {/* Loading State */}
      {loading && (
        <Text size="2" color="gray">
          ⏳ Profiliniz yükleniyor...
        </Text>
      )}

      {/* Error State */}
      {error && (
        <Flex direction="column" gap="2" style={{ background: "var(--red-a2)", padding: "10px", borderRadius: "4px" }}>
          <Text size="2" color="red" weight="bold">
            ❌ Hata
          </Text>
          <Text size="1" color="red">
            {error}
          </Text>
          <Text size="1" color="gray">
            💡 Profiliniz bulunamadı. Önce profil oluşturun.
          </Text>
        </Flex>
      )}

      {/* Success State - Profile Data */}
      {data && !profileError && !error && trustScore !== undefined && (
        <Flex direction="column" gap="3" style={{ background: "var(--green-a2)", padding: "15px", borderRadius: "8px" }}>
          <Flex justify="between" align="center">
            <Text size="4" weight="bold">
              ✅ Profilim
            </Text>
            <Button
              onClick={() => refetch()}
              size="2"
              variant="soft"
              disabled={isLoading}
              style={{ cursor: isLoading ? "wait" : "pointer" }}
            >
              {isLoading ? "⏳" : "🔄 Puanı Yenile"}
            </Button>
          </Flex>

          {/* Username */}
          {username && (
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">
                Kullanıcı Adı:
              </Text>
              <Text size="5" weight="bold">
                @{username}
              </Text>
            </Flex>
          )}

          {/* Trust Score - Büyük ve belirgin */}
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              Güven Puanı:
            </Text>
            <Text size="8" weight="bold" style={{ color: getTrustScoreColor(Number(trustScore)) }}>
              {trustScore} / 100
            </Text>
            <Text size="1" color="gray">
              {getTrustScoreLabel(Number(trustScore))}
            </Text>
          </Flex>

          {/* Reputation Kartlarını Görüntüle */}
          <Button
            onClick={() => {
              setShowCards(!showCards);
            }}
            size="3"
            variant={showCards ? "soft" : "solid"}
            style={{ cursor: "pointer" }}
          >
            {showCards ? "📋 Kartları Gizle" : "📋 Reputation Kartlarımı Görüntüle"}
          </Button>
        </Flex>
      )}

      {/* Reputation Cards - Profil altında göster */}
      {showCards && ownerAddress && (
        <Flex direction="column" gap="3" style={{ marginTop: "15px", padding: "15px", background: "var(--gray-a2)", borderRadius: "8px" }}>
          <Flex justify="between" align="center">
            <Text size="4" weight="bold">
              📋 Reputation Kartlarım
            </Text>
            <Button
              onClick={() => refetchCards()}
              variant="soft"
              size="2"
              disabled={cardsLoading}
              style={{ cursor: "pointer" }}
            >
              🔄 Yenile
            </Button>
          </Flex>

          <Text size="2" color="gray">
            Aldığınız tüm puanlama kartları
          </Text>

          {cardsLoading && (
            <Text size="2" color="gray">
              ⏳ Kartlar yükleniyor...
            </Text>
          )}

          {!cardsLoading && cards.length === 0 && (
            <Flex direction="column" gap="2" style={{ background: "var(--gray-a3)", padding: "15px", borderRadius: "4px" }}>
              <Text size="2" weight="bold">
                📭 Henüz kart yok
              </Text>
              <Text size="1" color="gray">
                Henüz hiç puanlanmadınız.
              </Text>
            </Flex>
          )}

          {!cardsLoading && cards.length > 0 && (
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Toplam {cards.length} kart
              </Text>
              {cards.map((card: any) => {
                const content = card.data?.content;
                const fields = content?.fields;
                const scoreGiven = fields?.score_given;
                const comment = fields?.comment;
                const objectId = card.data?.objectId;

                return (
                  <Card key={objectId} style={{ padding: "15px" }}>
                    <Flex direction="column" gap="2">
                      {/* Puan */}
                      <Flex align="center" gap="2">
                        <Text size="6" weight="bold" style={{ color: getCardScoreColor(Number(scoreGiven)) }}>
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
                          Bu kart kalıcıdır
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                );
              })}
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
}

function getTrustScoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // Yeşil - İyi
  if (score >= 60) return "#eab308"; // Sarı - Orta
  if (score >= 40) return "#f97316"; // Turuncu - Düşük
  return "#ef4444"; // Kırmızı - Kötü
}

function getTrustScoreLabel(score: number): string {
  if (score >= 80) return "⭐ Mükemmel güven puanı!";
  if (score >= 60) return "👍 İyi güven puanı";
  if (score >= 40) return "⚠️ Orta güven puanı";
  return "❌ Düşük güven puanı";
}

function getCardScoreColor(score: number): string {
  if (score >= 4) return "#22c55e"; // Yeşil - İyi
  if (score >= 3) return "#eab308"; // Sarı - Orta
  if (score >= 2) return "#f97316"; // Turuncu - Düşük
  return "#ef4444"; // Kırmızı - Kötü
}
