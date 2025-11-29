import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { PACKAGE_ID, MODULE_NAME, FUNCTIONS, REGISTRY_ID } from "../constants";

export function CreateProfile() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);

  const handleCreateProfile = () => {
    if (!username.trim()) {
      setError("Username is required!");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters!");
      return;
    }
    if (username.length > 20) {
      setError("Username must be at most 20 characters!");
      return;
    }
    // Only allow alphanumeric and underscore (no Turkish or special chars)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters (a-z), numbers (0-9), and underscores (_)!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTIONS.CREATE_PROFILE}`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(username),
      ],
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: (result) => {
          const createdObjects = (result as any).effects?.created || [];
          const userProfile = createdObjects.find((obj: any) => 
            obj.owner === "Shared"
          );
          
          if (userProfile) {
            setCreatedProfileId(userProfile.reference.objectId);
          }
          
          setSuccess(true);
          setIsLoading(false);
        },
        onError: (err) => {
          const errorMsg = err.message || "";
          if (errorMsg.includes("MoveAbort") && errorMsg.includes("0)")) {
            setError(`Username already taken! Try a different one.`);
          } else if (errorMsg.includes("MoveAbort") && errorMsg.includes("2)")) {
            setError(`This wallet already has a profile! Each wallet can only create 1 profile.`);
          } else {
            setError(errorMsg || "Failed to create profile");
          }
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px", border: "1px solid var(--gray-a4)", borderRadius: "8px" }}>
      <Text size="5" weight="bold">
        🎯 Create Profile
      </Text>
      
      <Text size="2" color="gray">
        Initial trust score: 100 points
      </Text>

      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          Username:
        </Text>
        <TextField.Root
          placeholder={`e.g. user_${Math.floor(Math.random() * 10000)}`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading || success}
        />
        <Flex justify="between" align="center">
          <Text size="1" color="gray">
            3-20 characters, letters, numbers, underscore only
          </Text>
          <Button
            size="1"
            variant="ghost"
            onClick={() => setUsername(`user_${Date.now()}`)}
            disabled={isLoading || success}
            style={{ cursor: "pointer" }}
          >
            🎲 Random
          </Button>
        </Flex>
      </Flex>

      {/* Create Profile Button */}
      <Button
        onClick={handleCreateProfile}
        disabled={isLoading || success || !username.trim()}
        size="3"
        style={{ cursor: isLoading ? "wait" : "pointer" }}
      >
        {isLoading ? "Creating..." : success ? "✅ Profile Created!" : "Create Profile"}
      </Button>

      {/* Success message */}
      {success && createdProfileId && (
        <Flex 
          direction="column" 
          gap="2" 
          style={{ 
            background: "var(--green-a3)", 
            padding: "15px", 
            borderRadius: "8px", 
            border: "2px solid var(--green-9)",
            animation: "slideIn 0.4s ease-out",
          }}
        >
          <Text size="3" weight="bold" color="green">
            ✅ Profile Created Successfully!
          </Text>
          
          <Text size="2">
            Your trust score: <strong>100/100</strong>
          </Text>
          
          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">
              🎯 Your Profile Object ID:
            </Text>
            <Text 
              size="2" 
              style={{ 
                wordBreak: "break-all", 
                fontFamily: "monospace",
                background: "var(--gray-a3)",
                padding: "8px",
                borderRadius: "4px"
              }}
            >
              {createdProfileId}
            </Text>
          </Flex>
          
          <Button
            onClick={() => {
              navigator.clipboard.writeText(createdProfileId);
              alert("✅ Object ID copied to clipboard!");
            }}
            variant="solid"
            style={{ cursor: "pointer" }}
          >
            📋 Copy Object ID
          </Button>
          
          <Flex direction="column" gap="1" style={{ marginTop: "10px", background: "var(--yellow-a2)", padding: "10px", borderRadius: "4px" }}>
            <Text size="1" weight="bold">
              💡 Important!
            </Text>
            <Text size="1">
              Share this Object ID with others! They need it to rate you.
            </Text>
          </Flex>
        </Flex>
      )}

      {/* Error message */}
      {error && (
        <Text size="2" color="red">
          ❌ {error}
        </Text>
      )}


    </Flex>
  );
}
