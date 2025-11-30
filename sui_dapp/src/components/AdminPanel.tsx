// Bu kod şunları yapacak:
// Cüzdanındaki tüm eşyaları tarayacak.
// İçinde AdminCap var mı diye bakacak.
// Varsa paneli gösterecek, yoksa null (hiçbir şey) döndürecek.
// Butona basınca o AdminCap ID'sini kullanarak işlem yapacak.

import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Card, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { PACKAGE_ID, MODULE_NAME, STRUCT_TYPES, REGISTRY_ID } from "../constants";

export function AdminPanel() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [targetProfileId, setTargetProfileId] = useState("");

  // AdminCap kontrolü
  const { data: ownedObjects, isPending } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      options: { showType: true },
    },
    {
      enabled: !!account,
    }
  );

  // Registry'den admin_address kontrolü
  const { data: registryData, isPending: isRegistryPending } = useSuiClientQuery(
    "getObject",
    {
      id: REGISTRY_ID,
      options: { showContent: true },
    },
    {
      enabled: !!account,
    }
  );

  if (!account || isPending || isRegistryPending || !ownedObjects || !registryData) return null;

  const adminCapObj = ownedObjects.data.find(
    (obj) => obj.data?.type === STRUCT_TYPES.ADMIN_CAP
  );

  // --- DEBUG KODU BAŞLANGIÇ ---
  console.log("---------------- DEBUG BAŞLANGIÇ ----------------");
  console.log("Sabitlerdeki Package ID:", PACKAGE_ID);
  console.log("Kodun Aradığı Admin Tipi:", STRUCT_TYPES.ADMIN_CAP);
  
  // Cüzdandaki tüm objeleri yazdır
  if (ownedObjects?.data) {
      console.log("Cüzdanımdaki Objeler:", ownedObjects.data);
      
      const foundAdmin = ownedObjects.data.find(
        (obj) => obj.data?.type === STRUCT_TYPES.ADMIN_CAP
      );
      console.log("Bulunan AdminCap:", foundAdmin ? "BULDUM! ✅" : "YOK ❌");
      
      // Eğer AdminCap bulunduysa detaylarını yazdır
      if (foundAdmin) {
        console.log("AdminCap Detayları:", foundAdmin);
        console.log("AdminCap ID:", foundAdmin.data?.objectId);
      }
  }
  console.log("---------------- DEBUG BİTİŞ ----------------");
  // --- DEBUG KODU BİTİŞ ---

  // Registry'den admin adresi al
  const registryContent = registryData.data?.content as any;
  const adminAddress = registryContent?.fields?.admin_address;

  // Eğer AdminCap yoksa VE admin değilse gösterme
  if (!adminCapObj && account.address !== adminAddress) {
    return null;
  }

  // --- Buradan aşağısı sadece Yöneticiye görünür ---

  const handleApproveTask = () => {
    if (!targetProfileId) return alert("Please enter a Profile ID!");
    if (!adminCapObj) return alert("AdminCap not found!");

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::complete_redemption_task`,
      arguments: [
        tx.object(adminCapObj.data!.objectId), // AdminCap
        tx.object(targetProfileId), // Profile
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => alert("Task Approved! User earned +15 Points."),
        onError: (err) => console.error(err),
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
        <span style={{ fontSize: 28, color: '#3b82f6' }}>🔒</span>
        <Heading size="5" style={{ color: '#e0e7ef', fontWeight: 700 }}>Admin Panel</Heading>
      </Flex>
      <Text size="2" color="gray" mb="2" style={{ marginBottom: 8 }}>
        <span style={{
          background: '#334155',
          color: '#60a5fa',
          borderRadius: 6,
          padding: '2px 10px',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: 0.1,
        }}>Only authorized administrators can see this area.</span>
      </Text>

      <Flex direction="column" gap="3" mt="3">
        <Text weight="bold" style={{ color: '#60a5fa', fontSize: 16 }}>Approve Restorative Justice Task</Text>
        <TextField.Root 
          placeholder="User's Profile ID (0x...)" 
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
            boxShadow: '0 2px 8px rgba(37,99,235,0.07)',
          }}
        />
        <Button
          style={{
            background: 'linear-gradient(90deg, #3b82f6 70%, #60a5fa 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(37,99,235,0.13)',
            border: 'none',
            padding: '12px 0',
            transition: 'background 0.2s',
          }}
          onClick={handleApproveTask}
        >
          ✅ Approve Task (+15 Points)
        </Button>
      </Flex>
    </Card>
  );
}