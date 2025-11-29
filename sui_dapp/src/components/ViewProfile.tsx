import { useSuiClientQuery, useSuiClient } from "@mysten/dapp-kit";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, MODULE_NAME, FUNCTIONS, REGISTRY_ID } from "../constants";

export function ViewProfile() {
  const suiClient = useSuiClient();
  const [usernameInput, setUsernameInput] = useState("");
  const [profileId, setProfileId] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
      setSearchError("Kullanıcı adı gerekli!");
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
          setProfileId(objectId);
          setSearchId(objectId);
          setSearchError(null);
        } else {
          setSearchError("Kullanıcı bulunamadı!");
        }
      } else {
        setSearchError("Kullanıcı bulunamadı!");
      }
    } catch (err: any) {
      console.error("❌ Kullanıcı arama hatası:", err);
      setSearchError(err.message || "Arama başarısız");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = () => {
    if (!profileId.trim()) return;
    setSearchId(profileId);
  };
  
  const profileData = data?.data?.content as any;
  const trustScore = profileData?.fields?.trust_score;
  const username = profileData?.fields?.username;
  const owner = profileData?.fields?.owner;

  return (
    <Flex direction="column" gap="3" style={{ padding: "20px", border: "1px solid var(--gray-a4)", borderRadius: "8px" }}>
      <Text size="5" weight="bold">
        🔍 Profil Görüntüle
      </Text>
      
      <Text size="2" color="gray">
        Bir UserProfile'ın güven puanını görüntüleyin.
      </Text>

      {/* Username Search */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          🔍 Kullanıcı Ara (İsteğe Bağlı):
        </Text>
        <Flex gap="2">
          <TextField.Root
            placeholder="Kullanıcı adını girin..."
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            disabled={isLoading || searchLoading}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleSearchUsername}
            disabled={isLoading || searchLoading || !usernameInput.trim()}
            variant="soft"
          >
            {searchLoading ? "Arıyor..." : "Ara"}
          </Button>
        </Flex>
        {searchError && (
          <Text size="1" color="red">
            ❌ {searchError}
          </Text>
        )}
        <Text size="1" color="gray">
          💡 İpucu: "Kullanıcılar" listesinden bir kullanıcı adı kopyalayıp buraya yapıştırabilirsiniz
        </Text>
      </Flex>

      {/* Profile ID Input */}
      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">
          UserProfile Object ID:
        </Text>
        <Flex gap="2">
          <TextField.Root
            placeholder="0x..."
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            disabled={isLoading}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading || !profileId.trim()}
            style={{ cursor: "pointer" }}
          >
            {isLoading ? "Yükleniyor..." : "Ara"}
          </Button>
        </Flex>
        <Text size="1" color="gray">
          ℹ️ Yukarıdaki aramayı kullanın veya Object ID'yi manuel girin
        </Text>
      </Flex>

      {/* Loading State */}
      {isLoading && (
        <Text size="2" color="gray">
          ⏳ Profil yükleniyor...
        </Text>
      )}

      {/* Error State */}
      {error && (
        <Flex direction="column" gap="2" style={{ background: "var(--red-a2)", padding: "10px", borderRadius: "4px" }}>
          <Text size="2" color="red" weight="bold">
            ❌ Hata
          </Text>
          <Text size="1" color="red">
            {error.message || "Profil bulunamadı"}
          </Text>
          <Text size="1" color="gray">
            💡 Object ID'nin doğru olduğundan emin olun
          </Text>
        </Flex>
      )}

      {/* Success State - Profile Data */}
      {data && !error && trustScore !== undefined && (
        <Flex direction="column" gap="3" style={{ background: "var(--green-a2)", padding: "15px", borderRadius: "8px" }}>
          <Text size="4" weight="bold">
            ✅ Profil Bulundu
          </Text>

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

          {/* Owner Address */}
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">
              Profil Sahibi (Cüzdan Adresi):
            </Text>
            <Flex direction="column" gap="1" style={{ background: "var(--blue-a2)", padding: "10px", borderRadius: "4px" }}>
              <Text size="1" style={{ wordBreak: "break-all", fontFamily: "monospace" }}>
                {owner}
              </Text>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(owner);
                  alert("✅ Cüzdan adresi kopyalandı!\n\nBu adresi Reputation Kartları bölümünde kullanarak bu kullanıcının aldığı tüm kartları görebilirsiniz.");
                }}
                size="2"
                variant="soft"
                style={{ cursor: "pointer" }}
              >
                📋 Adresi Kopyala (Kartlarını Görmek İçin)
              </Button>
            </Flex>
          </Flex>

          {/* Object ID */}
          <Flex direction="column" gap="1">
            <Text size="2" color="gray">
              Object ID:
            </Text>
            <Text size="1" style={{ wordBreak: "break-all", fontFamily: "monospace" }}>
              {searchId}
            </Text>
          </Flex>

          {/* Yenile Butonu */}
          <Button
            onClick={() => refetch()}
            variant="soft"
            style={{ cursor: "pointer" }}
          >
            🔄 Yenile
          </Button>
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
