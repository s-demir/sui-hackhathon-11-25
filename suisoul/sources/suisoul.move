module suisoul::trust_system {
    // --- Importlar ---
    use std::string::String;
    use sui::table::{Self, Table};
    use sui::event;

    // --- Hata Kodları (Constants) ---
    const EUsernameTaken: u64 = 0;
    const ECannotRateSelf: u64 = 1;
    const EWalletAlreadyHasProfile: u64 = 2;
    // const ENotAdmin: u64 = 3; 
    const EAlreadyRated: u64 = 4;
    const EInvalidScore: u64 = 5;

    // --- Events (Olaylar) - YENİ ---
    // Frontend'in dinleyeceği olaylar burada tanımlanır.
    
    // 1. Profil oluşturulduğunda fırlatılır
    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        user_address: address,
        username: String,
    }

    // 2. Bir kullanıcı puanlandığında fırlatılır
    public struct UserRated has copy, drop {
        rater: address,
        target_profile_id: ID,
        score: u64,
        new_trust_score: u64,
    }

    // --- Structlar (Veri Yapıları) ---
    public struct UsernameRegistry has key {
        id: UID,
        usernames: Table<String, address>,
        username_list: vector<String>,
        wallet_profiles: Table<address, address>,
    }

    public struct UserProfile has key, store {
        id: UID,
        username: String,
        trust_score: u64,
        owner: address,
        rated_by: Table<address, bool>,
    }

    public struct ReputationCard has key {
        id: UID,
        score_given: u64,
        comment: String,
    }

    public struct AdminCap has key, store { 
        id: UID 
    }

    // --- Fonksiyonlar ---

    public fun create_profile(
        registry: &mut UsernameRegistry,
        username: String, 
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(!table::contains(&registry.wallet_profiles, sender), EWalletAlreadyHasProfile);
        assert!(!table::contains(&registry.usernames, username), EUsernameTaken);
        
        let profile_uid = object::new(ctx);
        // Event için ID'yi kopyalıyoruz (UID move edilmeden önce)
        let profile_id = object::uid_to_inner(&profile_uid); 
        let profile_address = object::uid_to_address(&profile_uid);
        
        let profile = UserProfile {
            id: profile_uid,
            username: username, // 'username' değişkenini kopyalar
            trust_score: 100,
            owner: sender,
            rated_by: table::new(ctx),
        };

        table::add(&mut registry.wallet_profiles, sender, profile_address);
        table::add(&mut registry.usernames, profile.username, profile_address);
        vector::push_back(&mut registry.username_list, profile.username);
        
        // Obje paylaşılmadan önce veya sonra event fırlatılabilir
        transfer::share_object(profile);

        // YENİ: Event fırlatılıyor
        event::emit(ProfileCreated {
            profile_id,
            user_address: sender,
            username,
        });
    }

    public fun rate_user(
        profile: &mut UserProfile,
        score: u64,
        comment: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        assert!(profile.owner != sender, ECannotRateSelf);
        assert!(!table::contains(&profile.rated_by, sender), EAlreadyRated);
        assert!(score >= 1 && score <= 5, EInvalidScore);

        if (score == 1) { 
            if (profile.trust_score > 10) { profile.trust_score = profile.trust_score - 10 } 
            else { profile.trust_score = 0 };
        } else if (score == 2) {
            if (profile.trust_score > 5) { profile.trust_score = profile.trust_score - 5 } 
            else { profile.trust_score = 0 };
        } else if (score == 4) {
            profile.trust_score = profile.trust_score + 5;
        } else if (score == 5) {
            profile.trust_score = profile.trust_score + 10;
        };

        if (profile.trust_score > 100) { 
            profile.trust_score = 100 
        };

        table::add(&mut profile.rated_by, sender, true);

        // YENİ: Event fırlatılıyor (Puanlama işlemi bittiğinde)
        event::emit(UserRated {
            rater: sender,
            target_profile_id: object::uid_to_inner(&profile.id),
            score,
            new_trust_score: profile.trust_score
        });

        let card = ReputationCard {
            id: object::new(ctx),
            score_given: score,
            comment
        };
        transfer::transfer(card, profile.owner);
    }

    public fun complete_redemption_task(
        _: &AdminCap,
        profile: &mut UserProfile,
        _ctx: &mut TxContext
    ) {
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
        });
    }
}
//deneme
