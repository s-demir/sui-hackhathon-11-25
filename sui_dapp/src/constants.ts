/**
 * Smart Contract Configuration
 * 
 * Bu dosya deploy edilmiş smart contract'ın bilgilerini içerir.
 * Contract yeniden deploy edilirse sadece bu dosyayı güncellemeniz yeterli.
 */

// Package ID - Smart contract'ın blockchain'deki adresi
export const PACKAGE_ID = "0xfec0dcda8ab3ebc0e89cf3f4f9d6a3f364d8e6c78eb28f493133a7432be6ae41";

// Module ismi - Move dosyasındaki "module suisoul::trust_system"
export const MODULE_NAME = "trust_system";

// AdminCap Object ID - Sadece admin işlemleri için (af görevi onaylama)
export const ADMIN_CAP_ID = "0xe3507c075345a51f7075970c473399feff4f5b82dbc21cec011bf01707b409b8";

// UsernameRegistry Object ID - Username -> Object ID mapping için
export const REGISTRY_ID = "0xe434f0a1a58f721669dc699d21e52bca023dca22737684a321f23667a00bda8a";

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
