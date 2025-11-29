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
        💡 How to Use?
      </Text>
      
      <Text size="2">
        <strong>1. Create Profile:</strong> Create a profile with your username
      </Text>
      
      <Text size="2">
        <strong>2. Share Object ID:</strong> Share your Profile ID with friends
      </Text>
      
      <Text size="2">
        <strong>3. Rate:</strong> Rate using Object ID from the "Rate User" section
      </Text>
      
      <a 
        href={`https://suiscan.xyz/testnet/object/${PACKAGE_ID}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <Button variant="soft" style={{ cursor: "pointer", width: "100%" }}>
          🔍 View All Profiles in Explorer
        </Button>
      </a>
    </Flex>
  );
}
