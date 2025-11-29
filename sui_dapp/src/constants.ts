/**
 * Smart Contract Configuration
 * 
 * Bu dosya deploy edilmiş smart contract'ın bilgilerini içerir.
 * Contract yeniden deploy edilirse sadece bu dosyayı güncellemeniz yeterli.
 */

// Package ID - Smart contract'ın blockchain'deki adresi
export const PACKAGE_ID = "0x1dd2e57d568ab57ad2782eb992fd4fe0da1eb1259e8a829bd746ee839f999b05";

// Module ismi - Move dosyasındaki "module suisoul::trust_system"
export const MODULE_NAME = "trust_system";

// AdminCap Object ID - Sadece admin işlemleri için (af görevi onaylama)
export const ADMIN_CAP_ID = "0x31820a677873875ea52fd716aed079d4a51081d6810b3236fba88c728fd52afb";

// UsernameRegistry Object ID - Username -> Object ID mapping için
export const REGISTRY_ID = "0xd6b2662621517176817ca7bfcdd87bfd8c6059bb6ad2e06e1f0be79c3db843c2";

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
