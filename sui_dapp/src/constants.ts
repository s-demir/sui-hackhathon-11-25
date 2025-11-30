/**
 * Smart Contract Configuration
 */

// Package ID: AdminCap's package address from terminal output (0x797d...)
// Package ID: From latest publish output
export const PACKAGE_ID = "0xd4761bd2bab1009c6126711fa02389c1599fd520543369a617091070d9ad9aab";
// Module name
export const MODULE_NAME = "trust_system";
// AdminCap ID: First object from terminal output (0x2906...)
// AdminCap ID: From latest publish output
export const ADMIN_CAP_ID = "0xc426fbf34ba4cfc77525adb39da53049e55bf6607afba531c045145f3a5406c0";
// UsernameRegistry ID: Shared object from previous deploy output
// UsernameRegistry ID: From latest publish output
export const REGISTRY_ID = "0xc7c5bc8c1c5d76584dffccc77629324a9f9eba262213a3c56155f8b521c90d09";

export const FUNCTIONS = {
  CREATE_PROFILE: "create_profile",
  RATE_USER: "rate_user",
  COMPLETE_REDEMPTION: "complete_redemption_task",
  GET_PROFILE_BY_USERNAME: "get_profile_by_username",
  GET_ALL_USERNAMES: "get_all_usernames",
} as const;

export const STRUCT_TYPES = {
  USER_PROFILE: `${PACKAGE_ID}::${MODULE_NAME}::UserProfile`,
  REPUTATION_CARD: `${PACKAGE_ID}::${MODULE_NAME}::ReputationCard`,
  ADMIN_CAP: `${PACKAGE_ID}::${MODULE_NAME}::AdminCap`,
} as const;