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
        tx.object(REGISTRY_ID), // Registry object
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
    <Card style={{ background: "#ffebee", border: "2px solid red", marginTop: "20px" }}>
      <Heading color="red" size="4">🔒 Admin Panel</Heading>
      <Text size="2" color="gray" mb="2">
        Only authorized administrators can see this area.
      </Text>

      <Flex direction="column" gap="2" mt="3">
        <Text weight="bold">Approve Restorative Justice Task</Text>
        <TextField.Root 
            placeholder="User's Profile ID (0x...)" 
            value={targetProfileId}
            onChange={(e) => setTargetProfileId(e.target.value)}
        />
        
        <Button color="red" onClick={handleApproveTask}>
          ✅ Approve Task (+15 Points)
        </Button>
      </Flex>
    </Card>
  );
}