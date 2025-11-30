import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Text, TextField, TextArea } from "@radix-ui/themes";
import { useState } from "react";
import { PACKAGE_ID, MODULE_NAME, FUNCTIONS, REGISTRY_ID } from "../constants";

export function RateUser() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const [username, setUsername] = useState("");
  const [profileId, setProfileId] = useState("");
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSearchUsername = async () => {
    if (!username.trim()) {
      setError("Username is required!");
      return;
    }

    setSearchLoading(true);
    setError(null);

    try {
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
          setProfileId(objectId);
          setError(null);
        } else {
          setError("User not found!");
        }
      } else {
        setError("User not found!");
      }
    } catch (err: any) {
      console.error("❌ User search error:", err);
      setError(err.message || "Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRateUser = () => {
    // Validation
    if (!username.trim()) {
      setError("Username is required! Search for a user first.");
      return;
    }
    if (!profileId.trim()) {
      setError("User not found! Search first.");
      return;
    }
    if (!comment.trim()) {
      setError("Comment is required!");
      return;
    }
    if (score < 1 || score > 5) {
      setError("Score must be between 1-5!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Transaction objesi oluştur
    const tx = new Transaction();

    /**
     * moveCall parameters:
     * 
     * target: Full path to contract function
     * arguments: Function parameters (in order)
     *   - tx.object(profileId): UserProfile object reference
     *   - tx.pure.u64(score): Score as u64
     *   - tx.pure.string(comment): Comment as String
     */
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTIONS.RATE_USER}`,
      arguments: [
        tx.object(profileId),      // &mut UserProfile
        tx.pure.u64(score),        // score: u64
        tx.pure.string(comment),   // comment: String
      ],
    });

    // Send transaction
    signAndExecute(
      {
        transaction: tx,
      },
      {
        // On success
        onSuccess: (result) => {
          console.log("✅ User rated!", result);
          setSuccess(true);
          setIsLoading(false);
          // Clear form
          setUsername("");
          setProfileId("");
          setComment("");
          setScore(5);
        },
        // On error
       onError: (err) => {
          console.error("❌ Error:", err);
          const msg = err.message || "";
          if (msg.includes("MoveAbort")) {
            if (msg.includes("1)")) setError("❌ You cannot rate yourself!");
            else if (msg.includes("4)")) setError("⚠️ You have already rated this user!");
            else if (msg.includes("5)")) setError("❌ Invalid score (1-5 only)!");
            else setError("❌ Transaction failed.");
          } else {
            setError(msg || "Rating failed");
          }
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px", border: "1px solid var(--gray-a4)", borderRadius: "8px" }}>
      <Text size="5" weight="bold">
        ⭐ Rate User
      </Text>
      
      <Text size="2" color="gray">
        Change another user's trust score and send them a permanent ReputationCard.
      </Text>

      {/* Username Search */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          🔍 User to Rate:
        </Text>
        <Flex gap="2">
          <TextField.Root
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading || searchLoading}
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && username.trim()) {
                handleSearchUsername();
              }
            }}
          />
          <Button
            onClick={handleSearchUsername}
            disabled={isLoading || searchLoading || !username.trim()}
            style={{ cursor: "pointer" }}
          >
            {searchLoading ? "Searching..." : "🔍 Search"}
          </Button>
        </Flex>
        {profileId && (
          <Text size="2" color="green" weight="bold">
            ✅ User found: @{username}
          </Text>
        )}
        <Text size="1" color="gray">
          💡 Tip: Copy a username from the "Users" list and paste it here
        </Text>
      </Flex>

      {/* Score Selector */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          Score: {score} / 5
        </Text>
        <Flex gap="2">
          {[1, 2, 3, 4, 5].map((num) => (
            <Button
              key={num}
              onClick={() => setScore(num)}
              variant={score === num ? "solid" : "soft"}
              disabled={isLoading}
              style={{ cursor: "pointer" }}
            >
              {num} ⭐
            </Button>
          ))}
        </Flex>
        <Text size="1" color="gray">
          ℹ️ 1 = Bad (-5 points), 5 = Good (+3 points)
        </Text>
      </Flex>

      {/* Comment Input */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          Comment:
        </Text>
        <TextArea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
        <Text size="1" color="gray">
          ℹ️ This comment will be permanently stored on the blockchain
        </Text>
      </Flex>

      {/* Submit Button */}
      <Button
        onClick={handleRateUser}
        disabled={isLoading || !profileId || !comment}
        size="3"
        style={{ cursor: isLoading ? "wait" : "pointer" }}
      >
        {isLoading ? "Rating..." : "Rate"}
      </Button>

      {/* Success Message */}
      {success && (
        <Text size="2" color="green">
          ✅ User successfully rated! ReputationCard sent.
        </Text>
      )}

      {/* Error Message */}
      {error && (
        <Text size="2" color="red">
          ❌ Error: {error}
        </Text>
      )}

      {/* Success Message */}
      {success && (
        <Flex 
          direction="column" 
          gap="2" 
          style={{ 
            background: "var(--green-a3)", 
            padding: "15px", 
            borderRadius: "8px", 
            border: "2px solid var(--green-9)",
            animation: "fadeIn 0.5s ease-in",
            boxShadow: "0 4px 12px var(--green-a5)",
          }}
        >
          <Text size="3" weight="bold" color="green">
            ✅ Rating Successful!
          </Text>
          <Text size="2">
            ReputationCard sent and trust score updated.
          </Text>
          <Text size="2" weight="bold" color="blue">
            💡 Tip: Click "🔄 Refresh Score" in ViewProfile to see the updated score.
          </Text>
        </Flex>
      )}

      {/* Description */}
      <Flex direction="column" gap="1" style={{ marginTop: "10px", background: "var(--gray-a2)", padding: "10px", borderRadius: "4px" }}>
        <Text size="1" weight="bold">
          📋 What happens?
        </Text>
        <Text size="1" color="gray">
          • The rated person's trust_score will change
        </Text>
        <Text size="1" color="gray">
          • A permanent ReputationCard will be sent to the rated person
        </Text>
        <Text size="1" color="gray">
          • The card will contain the score and comment
        </Text>
        <Text size="1" color="gray">
          • ⚠️ Nobody can rate themselves!
        </Text>
      </Flex>
    </Flex>
  );
}
