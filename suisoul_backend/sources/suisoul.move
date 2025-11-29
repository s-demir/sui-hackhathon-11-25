module suisoul::trust_system {
    
    // --- KÜTÜPHANELER ---
    // Sui'nin standart alet çantasını çağırıyoruz.
    use sui::object::{Self, UID};  // Her objenin bir ID'si (UID) olmak zorundadır.
    use sui::transfer;             // Objeleri birine göndermek veya paylaşmak için lazım.
    use sui::tx_context::{Self, TxContext}; // İşlemi kim yapıyor? (msg.sender) bilgisini buradan alırız.
    use std::string::{String};     // Yazı (Metin) verisi tutmak için.

    // --- 1. VERİ YAPILARI (STRUCTS) ---

    // TABLO: Kullanıcı Profili
    // 'key': Bu bir obje olacak ve zincirde bir ID'si olacak.
    // 'store': Bu obje başka objelerin içinde saklanabilir veya transfer edilebilir.
    struct UserProfile has key, store {
        id: UID,             // Sui'deki T.C. Kimlik No gibi. Benzersizdir.
        trust_score: u64,    // Puanı. (u64 = Negatif olamayan tam sayı).
        owner: address,      // Bu profil kime ait? (Cüzdan adresi).
    }

    // TABLO: İtibar Kartı (NFT)
    // *** KRİTİK NOKTA ***
    // Burada sadece 'key' var. 'drop' ve 'store' YOK!
    // 'drop' yok: Kullanıcı bunu cüzdanından silemez.
    // 'store' yok: Kullanıcı bunu başkasına gönderemez veya satamaz.
    // Sonuç: Bu tam anlamıyla bir "Soulbound Token" (Ruha Bağlı Jeton).
    struct ReputationCard has key {
        id: UID,
        score_given: u64,    // Verilen puan (1 veya 5).
        comment: String,     // "Projeyi harika yönetti" gibi yorum.
    }

    // TABLO: Yönetici Anahtarı
    // Bu objeye sahip olan kişi "Patron"dur. Af çıkarabilir.
    struct AdminCap has key, store { id: UID }

    // --- 2. FONKSİYONLAR ---

    // INIT: Başlangıç Ayarı
    // Kontrat zincire ilk yüklendiğinde SADECE BİR KERE çalışır.
    fun init(ctx: &mut TxContext) {
        // Admin yetkisini (AdminCap) oluşturuyoruz.
        // Ve işlemi yapan kişiye (deploy edene) veriyoruz.
        transfer::transfer(AdminCap { id: object::new(ctx) }, tx_context::sender(ctx));
    }

    // FONKSİYON 1: Profil Oluşturma
    // Herkes bu butona basıp kendine bir karne oluşturabilir.
    public entry fun create_profile(ctx: &mut TxContext) {
        // Profili hafızada oluşturuyoruz:
        let profile = UserProfile {
            id: object::new(ctx),           // Yeni bir ID üret.
            trust_score: 100,               // Başlangıç puanı 100 olsun.
            owner: tx_context::sender(ctx), // Sahibi, işlemi yapan kişi olsun.
        };
        
        // *** ÖNEMLİ ***
        // 'share_object' diyoruz. Neden?
        // Çünkü bu profili HERKES görebilmeli ve HERKES (yetkisi varsa) puanını değiştirebilmeli.
        // Eğer kişiye özel (owned object) yapsaydık, başkası puan veremezdi.
        transfer::share_object(profile);
    }

    // FONKSİYON 2: Puanlama (Rate User)
    // Bir kullanıcı, diğerinin puanını değiştirir ve ona NFT yollar.
    public entry fun rate_user(
        profile: &mut UserProfile, // DEĞİŞECEK OLAN profil (referans olarak alıyoruz).
        score: u64,                // Frontend'den gelen puan (1 veya 5).
        comment: String,           // Frontend'den gelen yorum.
        ctx: &mut TxContext        // İşlem bağlamı.
    ) {
        // --- ADIM 1: Matematiği Yap ---
        
        // Eğer 1 puan verilmişse (Kötü Hareket):
        if (score == 1) { 
            // Puanı 5 azaltacağız ama 0'ın altına düşerse hata vermesin diye kontrol:
            if (profile.trust_score > 5) { 
                profile.trust_score = profile.trust_score - 5 
            } else { 
                profile.trust_score = 0 // Zaten 3 puanı varsa 0 olsun, eksiye düşmesin.
            }; 
        };
        
        // Eğer 5 puan verilmişse (İyi Hareket):
        if (score == 5) { 
            profile.trust_score = profile.trust_score + 3 
        };

        // Puan 100'ü geçmesin (Tavan Puan):
        if (profile.trust_score > 100) { profile.trust_score = 100 };

        // --- ADIM 2: NFT'yi Oluştur ---
        
        let card = ReputationCard {
            id: object::new(ctx),
            score_given: score,
            comment: comment
        };
        
        // --- ADIM 3: NFT'yi Yapıştır ---
        // Bu kartı, profil sahibinin cüzdanına yolluyoruz.
        // Kartın 'drop' yeteneği olmadığı için, alan kişi istese de silemeyecek!
        transfer::transfer(card, profile.owner);
    }

    // FONKSİYON 3: Af / Görev Tamamlama (Redemption)
    // Bu fonksiyonu SADECE AdminCap sahibi çağırabilir.
    public entry fun complete_redemption_task(
        _: &AdminCap,             // <-- GÜVENLİK KONTROLÜ BURASI
                                  // Eğer cüzdanında AdminCap yoksa bu fonksiyon çalışmaz!
        profile: &mut UserProfile,
        ctx: &mut TxContext
    ) {
        // Görevi yapan kişiye ödül olarak 15 puan ekle.
        profile.trust_score = profile.trust_score + 15;
        
        // 100'ü geçmesin kontrolü.
        if (profile.trust_score > 100) { profile.trust_score = 100 };
    }
}