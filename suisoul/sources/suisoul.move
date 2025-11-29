module suisoul::trust_system {
    use std::string::String;
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use std::vector;

    public struct UsernameRegistry has key {
        id: UID,
        usernames: Table<String, address>,
        username_list: vector<String>,
        wallet_profiles: Table<address, address>, // wallet -> profile_id mapping
        email_profiles: Table<String, address>, // email -> profile_id mapping (zkLogin için)
        admin_address: address, // İlk profil oluşturan kişi admin olur
    }

    public struct UserProfile has key, store {
        id: UID,
        username: String,
        trust_score: u64,
        owner: address,
        email: String, // zkLogin email (opsiyonel, boş string olabilir)
    }

    public struct ReputationCard has key {
        id: UID,
        score_given: u64,
        comment: String,
    }

    public struct AdminCap has key, store { 
        id: UID 
    }

    public entry fun create_profile(
        registry: &mut UsernameRegistry,
        username: String,
        email: String, // zkLogin email (boş string olabilir normal wallet için)
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // 1 wallet = 1 profil kontrolü
        assert!(!table::contains(&registry.wallet_profiles, sender), 2); // Error code: 2 = Wallet already has a profile
        
        // Username benzersizlik kontrolü
        assert!(!table::contains(&registry.usernames, username), 0); // Error code: 0 = Username already taken
        
        // Eğer email varsa (zkLogin kullanıyorsa), o email ile kayıtlı profil olmamalı
        if (std::string::length(&email) > 0) {
            assert!(!table::contains(&registry.email_profiles, email), 4); // Error code: 4 = Email already has a profile
        };
        
        // Eğer bu ilk profil ise (admin_address boş ise), bu kişiyi admin yap
        if (registry.admin_address == @0x0) {
            registry.admin_address = sender;
        };
        
        let profile_id = object::new(ctx);
        let profile_address = object::uid_to_address(&profile_id);
        
        let profile = UserProfile {
            id: profile_id,
            username,
            trust_score: 100,
            owner: sender,
            email,
        };
        
        // Wallet'ı kaydet
        table::add(&mut registry.wallet_profiles, sender, profile_address);
        
        // Email varsa kaydet
        if (std::string::length(&email) > 0) {
            table::add(&mut registry.email_profiles, email, profile_address);
        };
        
        // Username'i kaydet
        table::add(&mut registry.usernames, profile.username, profile_address);
        vector::push_back(&mut registry.username_list, profile.username);
        
        transfer::share_object(profile);
    }

    public entry fun rate_user(
        profile: &mut UserProfile,
        score: u64,
        comment: String,
        ctx: &mut TxContext
    ) {
        // Kendini puanlamayı engelle
        assert!(profile.owner != tx_context::sender(ctx), 1); // Error code: 1 = Cannot rate yourself
        
        if (score == 1) { 
            if (profile.trust_score > 5) { profile.trust_score = profile.trust_score - 5 } 
            else { profile.trust_score = 0 }; 
        };
        if (score == 5) { 
            profile.trust_score = profile.trust_score + 3 
        };
        
        if (profile.trust_score > 100) { 
            profile.trust_score = 100 
        };
        let card = ReputationCard {
            id: object::new(ctx),
            score_given: score,
            comment
        };
        
        transfer::transfer(card, profile.owner);
    }

    public entry fun complete_redemption_task(
        registry: &UsernameRegistry,
        _: &AdminCap,
        profile: &mut UserProfile,
        ctx: &mut TxContext
    ) {
        // Sadece admin çağırabilir
        assert!(tx_context::sender(ctx) == registry.admin_address, 3); // Error code: 3 = Not admin
        
        profile.trust_score = profile.trust_score + 15;
        if (profile.trust_score > 100) { 
            profile.trust_score = 100 
        };
    }
    public fun get_profile_by_username(
        registry: &UsernameRegistry, 
        username: String
    ): address {
        *table::borrow(&registry.usernames, username)
    }

    public fun get_all_usernames(registry: &UsernameRegistry): vector<String> {
        registry.username_list
    }

    public fun get_username_count(registry: &UsernameRegistry): u64 {
        vector::length(&registry.username_list)
    }
    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            AdminCap { id: object::new(ctx) }, 
            tx_context::sender(ctx)
        );
        
        transfer::share_object(UsernameRegistry {
            id: object::new(ctx),
            usernames: table::new(ctx),
            username_list: vector::empty(),
            wallet_profiles: table::new(ctx),
            email_profiles: table::new(ctx),
            admin_address: @0x0, // Başlangıçta admin yok, ilk profil oluşturan admin olacak
        });
    }
}
