import { ConnectButton, useCurrentAccount, useSuiClient, useDisconnectWallet } from "@mysten/dapp-kit";
import { Box, Flex, Heading, Button, Text, DropdownMenu } from "@radix-ui/themes";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { REGISTRY_ID, STRUCT_TYPES } from "../constants";
import { useState, useEffect } from "react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: disconnect } = useDisconnectWallet();
  const [userProfile, setUserProfile] = useState<{ username: string; profileId: string } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Check if user is admin
  const { data: registryData } = useSuiClientQuery(
    "getObject",
    {
      id: REGISTRY_ID,
      options: { showContent: true },
    },
    {
      enabled: !!account,
    }
  );

  const { data: ownedObjects } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      options: { showType: true },
    },
    {
      enabled: !!account,
    }
  );

  const adminCapObj = ownedObjects?.data.find(
    (obj) => obj.data?.type === STRUCT_TYPES.ADMIN_CAP
  );

  const registryContent = registryData?.data?.content as any;
  const adminAddress = registryContent?.fields?.admin_address;
  const isAdmin = adminCapObj || (account?.address === adminAddress);

  const isActive = (path: string) => location.pathname === path;

  // Fetch user's profile when account changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!account?.address || !registryData) {
        setUserProfile(null);
        return;
      }

      try {
        const walletProfilesId = registryContent?.fields?.wallet_profiles?.fields?.id?.id;
        if (walletProfilesId) {
          const tableObj = await suiClient.getDynamicFields({
            parentId: walletProfilesId,
          });

          for (const field of tableObj.data) {
            const fieldData = await suiClient.getDynamicFieldObject({
              parentId: walletProfilesId,
              name: field.name,
            });

            const fieldContent = fieldData.data?.content as any;
            const key = fieldContent?.fields?.name;
            const value = fieldContent?.fields?.value;

            if (key === account.address) {
              // Get username from profile
              const profileObj = await suiClient.getObject({
                id: value,
                options: { showContent: true },
              });
              
              const profileContent = profileObj.data?.content as any;
              const username = profileContent?.fields?.username;
              
              if (username) {
                setUserProfile({ username, profileId: value });
              }
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    fetchUserProfile();
  }, [account?.address, registryData, suiClient, registryContent]);

  const handleCopyId = async () => {
    if (userProfile?.profileId) {
      try {
        await navigator.clipboard.writeText(userProfile.profileId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <Flex
      position="sticky"
      px="4"
      py="3"
      justify="between"
      align="center"
      style={{
        borderBottom: "1px solid var(--gray-a4)",
        background: "var(--color-background)",
        backdropFilter: "blur(8px)",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo and Navigation */}
      <Flex align="center" gap="6">
        <Link to="/" style={{ textDecoration: "none" }}>
          <Heading size="5" style={{ cursor: "pointer" }}>
            🎯 SuiSoul
          </Heading>
        </Link>

        <Flex gap="4" align="center">
          <Link to="/explore" style={{ textDecoration: "none" }}>
            <Button
              variant={isActive("/explore") ? "solid" : "ghost"}
              style={{ cursor: "pointer" }}
            >
              🔍 Explore
            </Button>
          </Link>

          {account && (
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <Button
                variant={isActive("/dashboard") ? "solid" : "ghost"}
                style={{ cursor: "pointer" }}
              >
                📊 Dashboard
              </Button>
            </Link>
          )}

          <Link to="/rate" style={{ textDecoration: "none" }}>
            <Button
              variant={isActive("/rate") ? "solid" : "ghost"}
              style={{ cursor: "pointer" }}
            >
              ⭐ Rate User
            </Button>
          </Link>

          {isAdmin && (
            <Link to="/admin" style={{ textDecoration: "none" }}>
              <Button
                variant={isActive("/admin") ? "solid" : "ghost"}
                color="red"
                style={{ cursor: "pointer" }}
              >
                🔒 Admin
              </Button>
            </Link>
          )}
        </Flex>
      </Flex>

      {/* Right Side: Theme Toggle + User Info + Wallet */}
      <Flex gap="3" align="center">
        <Button
          variant="ghost"
          onClick={toggleTheme}
          style={{ cursor: "pointer" }}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </Button>

        {/* User Info with Actions */}
        {account && userProfile ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button
                variant="soft"
                size="3"
                style={{ 
                  cursor: "pointer",
                  background: "var(--blue-a2)", 
                  padding: "12px 20px", 
                  borderRadius: "12px",
                  border: "2px solid var(--blue-a5)",
                }}
              >
                <Flex align="center" gap="3">
                  <Text size="4">👤</Text>
                  <Flex direction="column" gap="0" align="start">
                    <Text size="1" color="gray" style={{ fontSize: "11px" }}>
                      Logged in as
                    </Text>
                    <Text size="3" weight="bold" style={{ color: "var(--blue-11)" }}>
                      @{userProfile.username}
                    </Text>
                  </Flex>
                  <Text size="3">▼</Text>
                </Flex>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="2">
              <DropdownMenu.Item onClick={handleCopyId}>
                <Flex align="center" gap="2">
                  <Text size="3">{copiedId ? "✅" : "🆔"}</Text>
                  <Text size="2">{copiedId ? "Profile ID Copied!" : "Copy Profile ID"}</Text>
                </Flex>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item color="red" onClick={() => disconnect()}>
                <Flex align="center" gap="2">
                  <Text size="3">🚪</Text>
                  <Text size="2">Disconnect Wallet</Text>
                </Flex>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : null}

        {/* Wallet Connect - Hide when logged in */}
        <Box style={{ display: account && userProfile ? "none" : "block" }}>
          <ConnectButton />
        </Box>
      </Flex>
    </Flex>
  );
}
