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
      setError("Kullanıcı adı gerekli!");
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
          setError("Kullanıcı bulunamadı!");
        }
      } else {
        setError("Kullanıcı bulunamadı!");
      }
    } catch (err: any) {
      console.error("❌ Kullanıcı arama hatası:", err);
      setError(err.message || "Arama başarısız");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRateUser = () => {
    // Validasyon
    if (!profileId.trim()) {
      setError("Profile ID gerekli!");
      return;
    }
    if (!comment.trim()) {
      setError("Yorum gerekli!");
      return;
    }
    if (score < 1 || score > 5) {
      setError("Puan 1-5 arası olmalı!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Transaction objesi oluştur
    const tx = new Transaction();

    /**
     * moveCall parametreleri:
     * 
     * target: Contract fonksiyonunun tam yolu
     * arguments: Fonksiyonun parametreleri (sırayla)
     *   - tx.object(profileId): UserProfile object referansı
     *   - tx.pure.u64(score): u64 tipinde puan
     *   - tx.pure.string(comment): String tipinde yorum
     */
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTIONS.RATE_USER}`,
      arguments: [
        tx.object(profileId),      // &mut UserProfile
        tx.pure.u64(score),        // score: u64
        tx.pure.string(comment),   // comment: String
      ],
    });

    // Transaction'ı gönder
    signAndExecute(
      {
        transaction: tx,
      },
      {
        // Başarılı olursa
        onSuccess: (result) => {
          console.log("✅ Kullanıcı puanlandı!", result);
          setSuccess(true);
          setIsLoading(false);
          // Formu temizle
          setProfileId("");
          setComment("");
          setScore(5);
        },
        // Hata olursa
        onError: (err) => {
          console.error("❌ Hata:", err);
          
          // Kendini puanlama hatası kontrolü
          if (err.message && err.message.includes("MoveAbort") && err.message.includes("1")) {
            setError("❌ Kendini puanlayamazsın! Başka bir kullanıcının Object ID'sini kullan.");
          } else {
            setError(err.message || "Puanlama başarısız");
          }
          
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px", border: "1px solid var(--gray-a4)", borderRadius: "8px" }}>
      <Text size="5" weight="bold">
        ⭐ Kullanıcı Puanla
      </Text>
      
      <Text size="2" color="gray">
        Başka bir kullanıcının güven puanını değiştirin ve ona silinemeyen bir ReputationCard gönderin.
      </Text>

      {/* Username Search */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          🔍 Kullanıcı Ara (İsteğe Bağlı):
        </Text>
        <Flex gap="2">
          <TextField.Root
            placeholder="Kullanıcı adını girin..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading || searchLoading}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleSearchUsername}
            disabled={isLoading || searchLoading || !username.trim()}
            variant="soft"
          >
            {searchLoading ? "Arıyor..." : "Ara"}
          </Button>
        </Flex>
        <Text size="1" color="gray">
          💡 İpucu: "Kullanıcılar" listesinden bir kullanıcı adı kopyalayıp buraya yapıştırabilirsiniz
        </Text>
      </Flex>

      {/* Profile ID Input */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          UserProfile Object ID:
        </Text>
        <TextField.Root
          placeholder="0x..."
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          disabled={isLoading}
        />
        <Text size="1" color="gray">
          ℹ️ Yukarıdaki aramayı kullanın veya Object ID'yi manuel girin
        </Text>
      </Flex>

      {/* Score Selector */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          Puan: {score} / 5
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
          ℹ️ 1 = Kötü (-5 puan), 5 = İyi (+3 puan)
        </Text>
      </Flex>

      {/* Comment Input */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          Yorum:
        </Text>
        <TextArea
          placeholder="Değerlendirmenizi yazın..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
        <Text size="1" color="gray">
          ℹ️ Bu yorum blockchain'de kalıcı olarak saklanacak
        </Text>
      </Flex>

      {/* Submit Button */}
      <Button
        onClick={handleRateUser}
        disabled={isLoading || !profileId || !comment}
        size="3"
        style={{ cursor: isLoading ? "wait" : "pointer" }}
      >
        {isLoading ? "Puanlanıyor..." : "Puanla"}
      </Button>

      {/* Success Message */}
      {success && (
        <Text size="2" color="green">
          ✅ Kullanıcı başarıyla puanlandı! ReputationCard gönderildi.
        </Text>
      )}

      {/* Error Message */}
      {error && (
        <Text size="2" color="red">
          ❌ Hata: {error}
        </Text>
      )}

      {/* Success Message */}
      {success && (
        <Flex direction="column" gap="2" style={{ background: "var(--green-a3)", padding: "15px", borderRadius: "8px", border: "2px solid var(--green-9)" }}>
          <Text size="3" weight="bold" color="green">
            ✅ Puanlama Başarılı!
          </Text>
          <Text size="2">
            ReputationCard gönderildi ve güven puanı güncellendi.
          </Text>
          <Text size="2" weight="bold" color="blue">
            💡 İpucu: ViewProfile bölümünden "🔄 Puanı Yenile" butonuna basarak güncel puanı görebilirsiniz.
          </Text>
        </Flex>
      )}

      {/* Açıklama */}
      <Flex direction="column" gap="1" style={{ marginTop: "10px", background: "var(--gray-a2)", padding: "10px", borderRadius: "4px" }}>
        <Text size="1" weight="bold">
          📋 Ne olacak?
        </Text>
        <Text size="1" color="gray">
          • Puanlanan kişinin trust_score'u değişecek
        </Text>
        <Text size="1" color="gray">
          • Puanlanan kişiye silinemeyen ReputationCard gönderilecek
        </Text>
        <Text size="1" color="gray">
          • Kart puanı ve yorumu içerecek
        </Text>
        <Text size="1" color="gray">
          • ⚠️ Kimse kendini puanlayamaz!
        </Text>
      </Flex>
    </Flex>
  );
}
