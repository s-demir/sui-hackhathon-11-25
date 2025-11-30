import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Card, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { PACKAGE_ID, MODULE_NAME, STRUCT_TYPES } from "../constants";

export function AdminPanel() {
    const [copied, setCopied] = useState(false);

    // Güvenli kopyalama fonksiyonu
    const handleCopyCapId = async () => {
      try {
        await navigator.clipboard.writeText(adminCapObj.data?.objectId || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert("Kopyalama hatası! Cap ID: " + (adminCapObj.data?.objectId || ""));
      }
    };
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [targetProfileId, setTargetProfileId] = useState("");

  // 1. Cüzdandaki AdminCap objesini ara
  const { data: ownedObjects, isPending } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: {
        StructType: STRUCT_TYPES.ADMIN_CAP, // Sadece AdminCap tipindeki objeleri getir
      },
      options: { showType: true },
    },
    {
      enabled: !!account,
    }
  );

  // Yükleniyorsa veya account yoksa gösterme
  if (!account || isPending || !ownedObjects) return null;

  // AdminCap var mı kontrol et
  const adminCapObj = ownedObjects.data?.[0]; // Filtrelediğimiz için ilk geleni alabiliriz

  // --- DEBUG ---
  // Eğer panel görünmüyorsa konsola bakmak için bu logları açabilirsin
  // console.log("Account:", account.address);
  // console.log("Aranan Admin Tipi:", STRUCT_TYPES.ADMIN_CAP);
  // console.log("Bulunan Objeler:", ownedObjects.data);
  // --- DEBUG ---

  // Eğer AdminCap yoksa paneli GÖSTERME (return null)
  if (!adminCapObj) {
    return null;
  }

  // --- Buradan aşağısı sadece Yöneticiye görünür ---

  const handleApproveTask = () => {
    if (!targetProfileId) return alert("Please enter a Profile ID!");

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::complete_redemption_task`,
      arguments: [
        tx.object(adminCapObj.data!.objectId), // 1. Argüman: AdminCap
        tx.object(targetProfileId),            // 2. Argüman: UserProfile
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
            alert("✅ Task Approved! User earned +15 Points.");
            setTargetProfileId(""); // Inputu temizle
        },
        onError: (err) => {
            console.error(err);
            alert("❌ Failed to approve task: " + err.message);
        },
      }
    );
  };

  return (
    <Card style={{
      background: 'linear-gradient(135deg, #18181b 80%, #1e293b 100%)',
      border: '2px solid #3b82f6',
      boxShadow: '0 4px 24px rgba(37,99,235,0.09)',
      marginTop: 24,
      borderRadius: 14,
      padding: '32px 28px',
      maxWidth: 440,
      color: '#e0e7ef',
    }}>
      <Flex direction="row" align="center" gap="2" mb="2">
        <span style={{ fontSize: 28 }}>👮‍♂️</span>
        <Heading size="5" style={{ color: '#e0e7ef', fontWeight: 700 }}>Admin Panel</Heading>
      </Flex>
      
      <Flex direction="column" gap="1" mb="4">
         <Text size="2" style={{ color: '#94a3b8' }}>
            Welcome, Admin. You have the authority to approve tasks.
         </Text>
         <Flex align="center" gap="2">
           <Text size="1" style={{ color: '#475569', fontFamily: 'monospace' }}>
              Cap ID: {adminCapObj.data?.objectId.slice(0, 6)}...{adminCapObj.data?.objectId.slice(-4)}
           </Text>
           <Button
             size="1"
             variant={copied ? "soft" : "solid"}
             color={copied ? "green" : undefined}
             onClick={handleCopyCapId}
             style={{ cursor: "pointer", fontSize: 12 }}
           >
             {copied ? "✅ Kopyalandı!" : "📋 Kopyala"}
           </Button>
         </Flex>
      </Flex>

      <Flex direction="column" gap="3" mt="3">
        <Text weight="bold" style={{ color: '#60a5fa', fontSize: 16 }}>Approve Restorative Justice Task</Text>
        <TextField.Root 
          placeholder="Paste User Profile Object ID..." 
          value={targetProfileId}
          onChange={(e) => setTargetProfileId(e.target.value)}
          style={{
            background: '#1e293b',
            border: '1.5px solid #334155',
            color: '#e0e7ef',
            borderRadius: 8,
            fontSize: 15,
            padding: '10px 12px',
            marginBottom: 8,
          }}
        />
        <Button
          style={{
            background: 'linear-gradient(90deg, #3b82f6 70%, #60a5fa 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            padding: '12px 0',
          }}
          onClick={handleApproveTask}
        >
          ✅ Approve Task (+15 Points)
        </Button>
      </Flex>
    </Card>
  );
}
