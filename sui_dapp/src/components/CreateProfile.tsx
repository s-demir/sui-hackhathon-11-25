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
      setError("Kullanıcı adı gerekli!");
      return;
    }
    if (username.length < 3) {
      setError("Kullanıcı adı en az 3 karakter olmalı!");
      return;
    }
    if (username.length > 20) {
      setError("Kullanıcı adı en fazla 20 karakter olmalı!");
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
            setError(`❌ Bu username zaten kullanılıyor! Farklı bir username deneyin.`);
          } else if (errorMsg.includes("MoveAbort") && errorMsg.includes("2)")) {
            setError(`❌ Bu cüzdan zaten bir profile sahip! Her cüzdan sadece 1 profil oluşturabilir.`);
          } else {
            setError(errorMsg || "Profil oluşturulamadı");
          }
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px" }}>
      <Text size="5" weight="bold">
        🎯 Profil Oluştur
      </Text>
      
      <Text size="2" color="gray">
        Başlangıç güven puanı: 100
      </Text>

      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          Kullanıcı Adı:
        </Text>
        <TextField.Root
          placeholder={`örn: user_${Math.floor(Math.random() * 10000)}`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading || success}
        />
        <Flex justify="between" align="center">
          <Text size="1" color="gray">
            3-20 karakter arası, benzersiz olmalı
          </Text>
          <Button
            size="1"
            variant="ghost"
            onClick={() => setUsername(`user_${Date.now()}`)}
            disabled={isLoading || success}
            style={{ cursor: "pointer" }}
          >
            🎲 Rastgele
          </Button>
        </Flex>
      </Flex>

      {/* Profil Oluştur Butonu */}
      <Button
        onClick={handleCreateProfile}
        disabled={isLoading || success || !username.trim()}
        size="3"
        style={{ cursor: isLoading ? "wait" : "pointer" }}
      >
        {isLoading ? "Oluşturuluyor..." : success ? "✅ Profil Oluşturuldu!" : "Profil Oluştur"}
      </Button>

      {/* Başarı mesajı */}
      {success && createdProfileId && (
        <Flex direction="column" gap="2" style={{ background: "var(--green-a3)", padding: "15px", borderRadius: "8px", border: "2px solid var(--green-9)" }}>
          <Text size="3" weight="bold" color="green">
            ✅ Profiliniz Oluşturuldu!
          </Text>
          
          <Text size="2">
            Güven puanınız: <strong>100</strong>
          </Text>
          
          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">
              🎯 Profil Object ID'niz:
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
              alert("✅ Object ID kopyalandı!");
            }}
            variant="solid"
            style={{ cursor: "pointer" }}
          >
            📋 Object ID'yi Kopyala
          </Button>
          
          <Flex direction="column" gap="1" style={{ marginTop: "10px", background: "var(--yellow-a2)", padding: "10px", borderRadius: "4px" }}>
            <Text size="1" weight="bold">
              💡 Önemli!
            </Text>
            <Text size="1">
              Bu Object ID'yi arkadaşlarınızla paylaşın! Sizi puanlamak için bu ID'ye ihtiyaçları var.
            </Text>
          </Flex>
        </Flex>
      )}

      {/* Hata mesajı */}
      {error && (
        <Text size="2" color="red">
          ❌ Hata: {error}
        </Text>
      )}


    </Flex>
  );
}
