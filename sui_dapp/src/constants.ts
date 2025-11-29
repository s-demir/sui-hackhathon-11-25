/**
 * Smart Contract Configuration
 * 
 * Bu dosya deploy edilmiş smart contract'ın bilgilerini içerir.
 * Contract yeniden deploy edilirse sadece bu dosyayı güncellemeniz yeterli.
 */

// Package ID - Smart contract'ın blockchain'deki adresi
export const PACKAGE_ID = "0x13290b874780b3e4383d1e29025d83e0841ebf7346d7728bd8e10cdd908c6839";

// Module ismi - Move dosyasındaki "module suisoul::trust_system"
export const MODULE_NAME = "trust_system";

// AdminCap Object ID - Sadece admin işlemleri için (af görevi onaylama)
export const ADMIN_CAP_ID = "0x6c85cc65a3a10b62e4e29d37c357d5376919e2e065039f44b43fda6361bae468";

// UsernameRegistry Object ID - Username -> Object ID mapping için
export const REGISTRY_ID = "0x9b612414e5fed9d440df10cf1823244a267d6298289173c39392a54d01851b95";

/**
 * Fonksiyon İsimleri
 * Smart contract'taki fonksiyonların isimleri
 */
export const FUNCTIONS = {
  CREATE_PROFILE: "create_profile",
  RATE_USER: "rate_user",
  COMPLETE_REDEMPTION: "complete_redemption_task",
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
