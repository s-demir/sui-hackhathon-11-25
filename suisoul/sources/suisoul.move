/*
/// Module: suisoul
module suisoul::suisoul;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions


module suisoul::trust_system {
    
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{String};

    // --- STRUCTS ---

    // Kullanıcının puan tablosu (Shared Object)
    struct UserProfile has key, store {
        id: UID,
        trust_score: u64, // Puan (0-100 arası mantıken)
        owner: address,
    }

    // Silinemeyen Karne (SBT)
    struct ReputationCard has key {
        id: UID,
        score_given: u64, // 1-5
        comment: String,
    }

    // Yönetici Yetkisi
    struct AdminCap has key, store { id: UID }

    // --- FUNCTIONS ---

    // 1. Profil Oluşturma (Herkes kendine bir profil açmalı)
    public entry fun create_profile(ctx: &mut TxContext) {
        let profile = UserProfile {
            id: object::new(ctx),
            trust_score: 100, // Herkes 100 ile başlar
            owner: tx_context::sender(ctx),
        };
        // Profili "Shared Object" yapıyoruz ki herkes erişip puanlayabilsin
        transfer::share_object(profile);
    }

    // 2. Puanlama (Rate User)
    public entry fun rate_user(
        profile: &mut UserProfile, // Puanlanacak kişinin profili
        score: u64,                // 1-5 arası
        comment: String,
        ctx: &mut TxContext
    ) {
        // Kural: Kimse kendini puanlayamaz (Bunu UI'da engelle, kontratta da check eklenebilir)
        
        // Puan Hesaplama Mantığı
        if (score == 1) { 
            if (profile.trust_score > 5) { profile.trust_score = profile.trust_score - 5 } 
            else { profile.trust_score = 0 }; 
        };
        if (score == 5) { 
            profile.trust_score = profile.trust_score + 3 
        };
        // (Diğer puanlar için else-if blokları eklersin...)

        // Üst limiti 100'de tutmak istersen:
        if (profile.trust_score > 100) { profile.trust_score = 100 };

        // Silinemeyen NFT'yi oluştur ve yolla
        let card = ReputationCard {
            id: object::new(ctx),
            score_given: score,
            comment: comment
        };
        
        // Kartı profil sahibine yolluyoruz. 
        // Drop yeteneği olmadığı için silemeyecek.
        transfer::transfer(card, profile.owner);
    }

    // 3. Af / Görev Tamamlama (Sadece Admin yapabilir)
    public entry fun complete_redemption_task(
        _: &AdminCap,             // Sadece AdminCap sahibi çağırabilir
        profile: &mut UserProfile,
        ctx: &mut TxContext
    ) {
        // Görev yapanın puanını artır
        profile.trust_score = profile.trust_score + 15;
        if (profile.trust_score > 100) { profile.trust_score = 100 };
    }
    
    // Admin yetkisini deploy edene ver (init fonksiyonu)
    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap { id: object::new(ctx) }, tx_context::sender(ctx));
    }
}
