module suisoul::trust_system {
    use std::string::String;
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::TxContext;

    public struct UsernameRegistry has key {
        id: UID,
        usernames: Table<String, address>,
    }

    public struct UserProfile has key, store {
        id: UID,
        username: String,
        trust_score: u64,
        owner: address,
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
        ctx: &mut TxContext
    ) {
        assert!(!table::contains(&registry.usernames, username), 0);
        
        let profile_id = object::new(ctx);
        let profile_address = object::uid_to_address(&profile_id);
        
        let profile = UserProfile {
            id: profile_id,
            username,
            trust_score: 100,
            owner: tx_context::sender(ctx),
        };
        
        table::add(&mut registry.usernames, profile.username, profile_address);
        transfer::share_object(profile);
    }

    public entry fun rate_user(
        profile: &mut UserProfile,
        score: u64,
        comment: String,
        ctx: &mut TxContext
    ) {
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
    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            AdminCap { id: object::new(ctx) }, 
            tx_context::sender(ctx)
        );
        
        transfer::share_object(UsernameRegistry {
            id: object::new(ctx),
            usernames: table::new(ctx),
        });
    }
}
