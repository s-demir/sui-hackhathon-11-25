import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { PACKAGE_ID, MODULE_NAME, FUNCTIONS, REGISTRY_ID } from "../constants";
import { useZkLogin } from "../hooks/useZkLogin";

export function CreateProfile() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { email } = useZkLogin(); 
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdProfileId, setCreatedProfileId] = useState<string | null>(null);

  // ✅ Safe Copy Function
  const handleSafeCopy = async (text: string | null) => {
    if (!text) return alert("No ID found to copy!");
    
    try {
      await navigator.clipboard.writeText(text);
      alert("✅ Profile ID copied!");
    } catch (err) {
      console.error("Copy error:", err);
      prompt("Could not copy automatically. Please copy from here:", text);
    }
  };

  const handleCreateProfile = () => {
    // Validations
    if (!username.trim()) { setError("Username is required!"); return; }
    if (username.length < 3) { setError("Username must be at least 3 characters!"); return; }
    if (username.length > 20) { setError("Username must be at most 20 characters!"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError("Only letters, numbers, and underscores!"); return; }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTIONS.CREATE_PROFILE}`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(username),
        // ❌ Email parameter removed (made compatible with contract)
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          const createdObjects = (result as any).effects?.created || [];
          // We try to find the object owned by the user (not shared)
          // But since CreateProfile shares the object (share_object),
          // we should find the one with Owner: Shared in createdObjects.
          // Usually, the first created object is the profile object.
          // For a more precise solution, use 'reference.objectId'.
          const userProfile = createdObjects[0]; 
          
          if (userProfile) {
            setCreatedProfileId(userProfile.reference.objectId);
          }
          
          setSuccess(true);
          setIsLoading(false);
        },
        onError: (err) => {
          const msg = err.message || "";
          if (msg.includes("MoveAbort")) {
             if (msg.includes("0)")) setError(`Username '@${username}' is already taken!`);
             else if (msg.includes("2)")) setError("This wallet already has a profile!");
             else setError("Transaction failed. Code: " + msg);
          } else {
             setError(msg || "Failed to create profile");
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
        Start your reputation journey with 100 points.
      </Text>
	  
      {email && (
        <Flex 
          direction="column" 
          gap="1" 
          style={{ background: "var(--blue-a3)", padding: "10px", borderRadius: "6px" }}
        >
          <Text size="2" weight="bold" color="blue">Authenticated as:</Text>
          <Text size="2" style={{ fontFamily: "monospace" }}>{email}</Text>
        </Flex>
      )}

      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">Username:</Text>
        <TextField.Root
          placeholder="Enter a username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading || success}
        />
        <Button
            size="1"
            variant="ghost"
            onClick={() => setUsername(`user_${Math.floor(Math.random() * 10000)}`)}
            disabled={isLoading || success}
            style={{ cursor: "pointer", alignSelf: "flex-end" }}
          >
            🎲 Random
        </Button>
      </Flex>

      <Button
        onClick={handleCreateProfile}
        disabled={isLoading || success || !username.trim()}
        size="3"
        style={{ cursor: isLoading ? "wait" : "pointer" }}
      >
        {isLoading ? "Creating..." : success ? "✅ Profile Created!" : "Create Profile"}
      </Button>

      {/* ✅ BAŞARI EKRANI - GÜNCELLENDİ */}
      {success && createdProfileId && (
        <Flex 
          direction="column" 
          gap="2" 
          style={{ 
            background: "var(--green-a3)", 
            padding: "15px", 
            borderRadius: "8px", 
            border: "2px solid var(--green-9)",
            marginTop: "10px"
          }}
        >
          <Text size="3" weight="bold" color="green">
            ✅ Profil Başarıyla Oluşturuldu!
          </Text>
          
          <Text size="2">
            Admin işlemleri için aşağıdaki <strong>Profil ID</strong>'sini kullanmalısın:
          </Text>
          
          {/* ID Gösterim Kutusu */}
          <Flex align="center" gap="2" style={{ background: "rgba(255,255,255,0.5)", padding: "8px", borderRadius: "4px" }}>
            <Text size="2" style={{ fontFamily: "monospace", wordBreak: "break-all", flex: 1 }}>
              {createdProfileId}
            </Text>
          </Flex>
          
          {/* ✅ Çalışan Kopyalama Butonu */}
          <Button
            onClick={() => handleSafeCopy(createdProfileId)}
            variant="solid"
            color="green"
            style={{ cursor: "pointer", width: "100%" }}
          >
            📋 Profil ID'sini Kopyala
          </Button>
          
          <Text size="1" color="gray" style={{ marginTop: "5px" }}>
            ⚠️ Not: Bu ID, cüzdan adresinden farklıdır. Puanlama ve Admin işlemleri için bunu kullanın.
          </Text>
        </Flex>
      )}

      {error && (
        <Text size="2" color="red" style={{ marginTop: "10px" }}>
          ❌ {error}
        </Text>
      )}
    </Flex>
  );
}
