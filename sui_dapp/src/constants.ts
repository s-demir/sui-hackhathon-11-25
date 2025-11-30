/**
 * Smart Contract Configuration
 */

// YENİ: Deploy ettiğimiz Paket ID'si
export const PACKAGE_ID = "0x797d351f04fd3d3374ded71ecdff12e80f53970b83c62eeb47251bbd346bff2c";

// Module ismi
export const MODULE_NAME = "trust_system";

// YENİ: Senin cüzdanına gelen AdminCap objesi (Admin Paneli İçin)
export const ADMIN_CAP_ID = "0x2906c51162aafe267b8555e80bf70fdae0c833c7e50c07f0d6144bf1655985a6";

// YENİ: Paylaşılan veritabanı (UsernameRegistry)
export const REGISTRY_ID = "0x48c583f21e874bea2ff8b33777902f2eddc75306e1fd40afc7b2d7895569c73c";

/**
 * Fonksiyon İsimleri
 */
export const FUNCTIONS = {
  CREATE_PROFILE: "create_profile",
  RATE_USER: "rate_user",
  COMPLETE_REDEMPTION: "complete_redemption_task",
  GET_PROFILE_BY_USERNAME: "get_profile_by_username",
  GET_ALL_USERNAMES: "get_all_usernames",
} as const;

/**
 * Struct İsimleri
 */
export const STRUCT_TYPES = {
  USER_PROFILE: `${PACKAGE_ID}::${MODULE_NAME}::UserProfile`,
  REPUTATION_CARD: `${PACKAGE_ID}::${MODULE_NAME}::ReputationCard`,
  ADMIN_CAP: `${PACKAGE_ID}::${MODULE_NAME}::AdminCap`,
} as const;
