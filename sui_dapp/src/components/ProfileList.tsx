import { Button, Flex, Text } from "@radix-ui/themes";
import { PACKAGE_ID } from "../constants";

export function ProfileList() {
  return (
    <Flex 
      direction="column" 
      gap="2" 
      style={{ 
        padding: "15px", 
        background: "var(--blue-a2)", 
        borderRadius: "8px",
        border: "1px solid var(--blue-a4)"
      }}
    >
      <Text size="3" weight="bold">
        💡 Nasıl Kullanılır?
      </Text>
      
      <Text size="2">
        <strong>1. Profil Oluştur:</strong> Username ile profil oluşturun
      </Text>
      
      <Text size="2">
        <strong>2. Object ID Paylaş:</strong> Profil ID'nizi arkadaşlarınızla paylaşın
      </Text>
      
      <Text size="2">
        <strong>3. Puanla:</strong> "Kullanıcı Puanla" bölümünden Object ID ile puanlayın
      </Text>
      
      <a 
        href={`https://suiscan.xyz/testnet/object/${PACKAGE_ID}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <Button variant="soft" style={{ cursor: "pointer", width: "100%" }}>
          🔍 Explorer'da Tüm Profilleri Gör
        </Button>
      </a>
    </Flex>
  );
}
