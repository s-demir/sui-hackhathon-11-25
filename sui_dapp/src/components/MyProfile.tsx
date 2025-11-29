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
      setError("❌ Connect your wallet first!");
      return;
    }

    setLoading(true);
    setError(null);
    setShowCards(false);

    try {
      // Fetch registry object
      const registryObj = await suiClient.getObject({
        id: REGISTRY_ID,
        options: { showContent: true },
      });

      const registryContent = registryObj.data?.content as any;
      const walletProfilesId = registryContent?.fields?.wallet_profiles?.fields?.id?.id;

      if (walletProfilesId) {
        // Fetch wallet_profiles table object
        const tableObj = await suiClient.getDynamicFields({
          parentId: walletProfilesId,
        });

        // Check each field
        for (const field of tableObj.data) {
          const fieldData = await suiClient.getDynamicFieldObject({
            parentId: walletProfilesId,
            name: field.name,
          });

          const fieldContent = fieldData.data?.content as any;
          const key = fieldContent?.fields?.name;
          const value = fieldContent?.fields?.value;

          if (key === currentAccount.address) {
            // This is our profile!
            setProfileId(value);
            setOwnerAddress(currentAccount.address);
            setError(null);
            setLoading(false);
            return;
          }
        }
      }

      // No profile found
      setError("Profile not found! Create a profile first.");
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message || "Profile could not be loaded");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on component mount
  useEffect(() => {
    if (currentAccount?.address) {
      fetchMyProfile();
    }
  }, [currentAccount?.address]);

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px", border: "1px solid var(--gray-a4)", borderRadius: "8px" }}>
      <Text size="5" weight="bold">
        👤 View My Profile
      </Text>
      
      <Text size="2" color="gray">
        View your profile and reputation cards you've received.
      </Text>

      {/* Refresh Button */}
      <Button
        onClick={fetchMyProfile}
        disabled={loading || !currentAccount}
        size="3"
        style={{ cursor: "pointer" }}
      >
        {loading ? "⏳ Loading..." : "🔄 Refresh My Profile"}
      </Button>

      {!currentAccount && (
        <Flex direction="column" gap="2" style={{ background: "var(--yellow-a2)", padding: "10px", borderRadius: "4px" }}>
          <Text size="2" color="orange" weight="bold">
            ⚠️ Wallet Not Connected
          </Text>
          <Text size="1" color="gray">
            Connect your wallet first to view your profile.
          </Text>
        </Flex>
      )}

      {/* Loading State */}
      {loading && (
        <Text size="2" color="gray">
          ⏳ Loading your profile...
        </Text>
      )}

      {/* Error State */}
      {error && (
        <Flex direction="column" gap="2" style={{ background: "var(--red-a2)", padding: "10px", borderRadius: "4px" }}>
          <Text size="2" color="red" weight="bold">
            ❌ Error
          </Text>
          <Text size="1" color="red">
            {error}
          </Text>
          <Text size="1" color="gray">
            💡 Profile not found. Create a profile first.
          </Text>
        </Flex>
      )}

      {/* Success State - Profile Data */}
      {data && !profileError && !error && trustScore !== undefined && (
        <Flex direction="column" gap="3" style={{ background: "var(--green-a2)", padding: "15px", borderRadius: "8px" }}>
          <Flex justify="between" align="center">
            <Text size="4" weight="bold">
              ✅ My Profile
            </Text>
            <Button
              onClick={() => refetch()}
              size="2"
              variant="soft"
              disabled={isLoading}
              style={{ cursor: isLoading ? "wait" : "pointer" }}
            >
              {isLoading ? "⏳" : "🔄 Refresh Score"}
            </Button>
          </Flex>

          {/* Username */}
          {username && (
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">
                Username:
              </Text>
              <Text size="5" weight="bold">
                @{username}
              </Text>
            </Flex>
          )}

          {/* Trust Score - Large and prominent */}
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              Trust Score:
            </Text>
            <Text size="8" weight="bold" style={{ color: getTrustScoreColor(Number(trustScore)) }}>
              {trustScore} / 100
            </Text>
            <Text size="1" color="gray">
              {getTrustScoreLabel(Number(trustScore))}
            </Text>
          </Flex>

          {/* View Reputation Cards */}
          <Button
            onClick={() => {
              setShowCards(!showCards);
            }}
            size="3"
            variant={showCards ? "soft" : "solid"}
            style={{ cursor: "pointer" }}
          >
            {showCards ? "📋 Hide Cards" : "📋 View My Reputation Cards"}
          </Button>
        </Flex>
      )}

      {/* Reputation Cards - Show below profile */}
      {showCards && ownerAddress && (
        <Flex direction="column" gap="3" style={{ marginTop: "15px", padding: "15px", background: "var(--gray-a2)", borderRadius: "8px" }}>
          <Flex justify="between" align="center">
            <Text size="4" weight="bold">
              📋 My Reputation Cards
            </Text>
            <Button
              onClick={() => refetchCards()}
              variant="soft"
              size="2"
              disabled={cardsLoading}
              style={{ cursor: "pointer" }}
            >
              🔄 Refresh
            </Button>
          </Flex>

          <Text size="2" color="gray">
            All rating cards you've received
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
                  <Card 
                    key={objectId} 
                    style={{ 
                      padding: "15px",
                      transition: "all 0.3s ease",
                      border: "1px solid var(--gray-a4)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 16px var(--gray-a5)";
                      e.currentTarget.style.borderColor = "var(--green-a7)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "var(--gray-a4)";
                    }}
                  >
                    <Flex direction="column" gap="2">
                      {/* Score */}
                      <Flex align="center" gap="2">
                        <Text size="6" weight="bold" style={{ color: getCardScoreColor(Number(scoreGiven)) }}>
                          {scoreGiven} ⭐
                        </Text>
                        <Text size="2" color="gray">
                          / 5
                        </Text>
                      </Flex>

                      {/* Comment */}
                      <Flex direction="column" gap="1">
                        <Text size="2" weight="bold" color="gray">
                          Comment:
                        </Text>
                        <Text size="2" style={{ fontStyle: "italic" }}>
                          "{comment}"
                        </Text>
                      </Flex>

                      {/* Permanent Badge */}
                      <Flex align="center" gap="1" style={{ marginTop: "5px" }}>
                        <Text size="1" weight="bold" style={{ 
                          background: "var(--red-a3)", 
                          padding: "2px 8px", 
                          borderRadius: "4px",
                          color: "var(--red-11)"
                        }}>
                          🔒 PERMANENT
                        </Text>
                        <Text size="1" color="gray">
                          This card is permanent
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
  if (score >= 80) return "#22c55e"; // Green - Good
  if (score >= 60) return "#eab308"; // Yellow - Medium
  if (score >= 40) return "#f97316"; // Orange - Low
  return "#ef4444"; // Red - Bad
}

function getTrustScoreLabel(score: number): string {
  if (score >= 80) return "⭐ Excellent trust score!";
  if (score >= 60) return "👍 Good trust score";
  if (score >= 40) return "⚠️ Medium trust score";
  return "❌ Low trust score";
}

function getCardScoreColor(score: number): string {
  if (score >= 4) return "#22c55e"; // Green - Good
  if (score >= 3) return "#eab308"; // Yellow - Medium
  if (score >= 2) return "#f97316"; // Orange - Low
  return "#ef4444"; // Red - Bad
}
