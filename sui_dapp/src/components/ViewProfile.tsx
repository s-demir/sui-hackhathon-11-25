import { useSuiClientQuery, useSuiClient } from "@mysten/dapp-kit";
import { Button, Flex, Text, TextField, Card } from "@radix-ui/themes";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, MODULE_NAME, FUNCTIONS, REGISTRY_ID, STRUCT_TYPES } from "../constants";

export function ViewProfile() {
  const suiClient = useSuiClient();
  const [usernameInput, setUsernameInput] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showCards, setShowCards] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState("");

  const { data, isLoading, error, refetch } = useSuiClientQuery(
    "getObject",
    {
      id: searchId,
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
    },
    {
      enabled: !!searchId,
    }
  );

  const handleSearchUsername = async () => {
    if (!usernameInput.trim()) {
      setSearchError("Username is required!");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTIONS.GET_PROFILE_BY_USERNAME}`,
        arguments: [
          tx.object(REGISTRY_ID),
          tx.pure.string(usernameInput),
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
          setSearchId(objectId);
          setSearchError(null);
        } else {
          setSearchError("User not found!");
        }
      } else {
        setSearchError("User not found!");
      }
    } catch (err: any) {
      console.error("❌ User search error:", err);
      setSearchError(err.message || "Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const profileData = data?.data?.content as any;
  const trustScore = profileData?.fields?.trust_score;
  const username = profileData?.fields?.username;
  const owner = profileData?.fields?.owner;

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

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px", border: "1px solid var(--gray-a4)", borderRadius: "8px" }} data-view-profile>
      <Text size="5" weight="bold">
        🔍 Search Profile
      </Text>
      
      <Text size="2" color="gray">
        Search for a profile by username and view their trust score.
      </Text>

      {/* User Search */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          🔍 Search User:
        </Text>
        <Flex gap="2">
          <TextField.Root
            placeholder="Enter username..."
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            disabled={isLoading || searchLoading}
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && usernameInput.trim()) {
                handleSearchUsername();
              }
            }}
          />
          <Button
            onClick={handleSearchUsername}
            disabled={isLoading || searchLoading || !usernameInput.trim()}
            style={{ cursor: "pointer" }}
          >
            {searchLoading ? "Searching..." : "🔍 Search"}
          </Button>
        </Flex>
      {searchError && (
        <Text size="1" color="red">
          ❌ {searchError}
        </Text>
      )}
        <Text size="1" color="gray">
          💡 Tip: Copy a username from the "Users" list and paste it here
        </Text>
      </Flex>

      {/* Loading State */}
      {(isLoading || searchLoading) && (
        <Text size="2" color="gray">
          ⏳ Loading profile...
        </Text>
      )}

      {/* Error State */}
      {(error || searchError) && (
        <Flex direction="column" gap="2" style={{ background: "var(--red-a2)", padding: "10px", borderRadius: "4px" }}>
          <Text size="2" color="red" weight="bold">
            ❌ Error
          </Text>
          <Text size="1" color="red">
            {searchError || error?.message || "Profile not found"}
          </Text>
        </Flex>
      )}

      {/* Success State - Profile Data */}
      {data && !error && !searchError && trustScore !== undefined && (
        <Flex direction="column" gap="3" style={{ background: "var(--green-a2)", padding: "15px", borderRadius: "8px" }}>
          <Flex justify="between" align="center">
            <Text size="4" weight="bold">
              ✅ Profile Found
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

          {/* Display Reputation Cards */}
          <Button
            onClick={() => {
              setOwnerAddress(owner);
              setShowCards(!showCards);
            }}
            size="3"
            variant={showCards ? "soft" : "solid"}
            style={{ cursor: "pointer" }}
          >
            {showCards ? "📋 Hide Cards" : "📋 View Reputation Cards"}
          </Button>
        </Flex>
      )}

      {/* Reputation Cards - Show below profile */}
      {showCards && ownerAddress && (
        <Flex direction="column" gap="3" style={{ marginTop: "15px", padding: "15px", background: "var(--gray-a2)", borderRadius: "8px" }}>
          <Flex justify="between" align="center">
            <Text size="4" weight="bold">
              📋 Reputation Cards
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
            All rating cards received by @{username}
          </Text>

          {cardsLoading && (
            <Text size="2" color="gray">
              ⏳ Loading cards...
            </Text>
          )}

          {!cardsLoading && cards.length === 0 && (
            <Flex direction="column" gap="2" style={{ background: "var(--gray-a3)", padding: "15px", borderRadius: "4px" }}>
              <Text size="2" weight="bold">
                📭 No cards yet
              </Text>
              <Text size="1" color="gray">
                This user has not been rated yet.
              </Text>
            </Flex>
          )}

          {!cardsLoading && cards.length > 0 && (
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">
                Total {cards.length} cards
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
                      e.currentTarget.style.borderColor = "var(--blue-a7)";
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
