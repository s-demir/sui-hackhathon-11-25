/**
 * Smart Contract Configuration
 * 
 * Bu dosya deploy edilmiş smart contract'ın bilgilerini içerir.
 * Contract yeniden deploy edilirse sadece bu dosyayı güncellemeniz yeterli.
 */

// Package ID - Smart contract'ın blockchain'deki adresi
export const PACKAGE_ID = "0xd505c23e1bea4a68c66298d0c3ef139d35dd1412ed4081ed0a22ccf755fd570b";

// Module ismi - Move dosyasındaki "module ftsui::trust_system"
export const MODULE_NAME = "trust_system";

// AdminCap Object ID - Sadece admin işlemleri için (af görevi onaylama)
export const ADMIN_CAP_ID = "0x7b002ec0c6b6ee8b53f4ecc5200a1eaaa75355d060fe14de34fb76d1493fbc9c";

// UsernameRegistry Object ID - Username -> Object ID mapping için
export const REGISTRY_ID = "0xdfe67788a0ac71ed89cc1e9993d4feaddd33903a5cba2e4e7bffc10b95751794";

/**
 * Fonksiyon İsimleri
 * Smart contract'taki fonksiyonların isimleri
 */
export const FUNCTIONS = {
  CREATE_PROFILE: "create_profile",
  RATE_USER: "rate_user",
  COMPLETE_REDEMPTION: "complete_redemption_task",
  GET_PROFILE_BY_USERNAME: "get_profile_by_username",
  GET_ALL_USERNAMES: "get_all_usernames",
} as const;

/**
 * Struct İsimleri (Object Type'lar)
 * Bu isimler blockchain'den veri çekerken filtreleme için kullanılır
 */
export const STRUCT_TYPES = {
  USER_PROFILE: `${PACKAGE_ID}::${MODULE_NAME}::UserProfile`,
  REPUTATION_CARD: `${PACKAGE_ID}::${MODULE_NAME}::ReputationCard`,
  ADMIN_CAP: `${PACKAGE_ID}::${MODULE_NAME}::AdminCap`,
} as const;
