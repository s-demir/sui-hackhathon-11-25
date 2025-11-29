/**
 * Smart Contract Configuration
 * 
 * Bu dosya deploy edilmiş smart contract'ın bilgilerini içerir.
 * Contract yeniden deploy edilirse sadece bu dosyayı güncellemeniz yeterli.
 */

// Package ID - Smart contract'ın blockchain'deki adresi
export const PACKAGE_ID = "0x4d8673f43c4427ba080c6c734f7c7c1784e7b4c36c04bd4ef2ce0b4bbdf331c8";

// Module ismi - Move dosyasındaki "module suisoul::trust_system"
export const MODULE_NAME = "trust_system";

// AdminCap Object ID - Sadece admin işlemleri için (af görevi onaylama)
export const ADMIN_CAP_ID = "0xac66e37cd5205bb46caa3bb3529989c62e512cc10160e577292d3483e6853838";

// UsernameRegistry Object ID - Username -> Object ID mapping için
export const REGISTRY_ID = "0x0f5f61daef37077a1c70d4668ed3acb6f9137264a0a398c403d882ba97b30159";

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
