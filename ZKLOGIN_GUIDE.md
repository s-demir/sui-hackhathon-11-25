# 🔐 zkLogin Entegrasyonu Rehberi

## 📖 zkLogin Nedir?

zkLogin, Sui blockchain'in özel bir özelliğidir. Kullanıcıların **Google, Facebook, 42 École** gibi OAuth sağlayıcılarıyla giriş yaparak **kripto cüzdanı olmadan** blockchain uygulamalarını kullanmalarını sağlar.

## 🎯 Projede Nasıl Çalışıyor?

### 1. **Kullanıcı Akışı**

```
Kullanıcı → Login Sayfası → Google/42 Seçimi → OAuth Redirect → 
Email Alınır → zkLogin Wallet Oluşturulur → Profil Oluşturabilir
```

### 2. **Dosya Yapısı**

```
sui_dapp/
├── src/
│   ├── hooks/
│   │   └── useZkLogin.tsx          # zkLogin mantığı
│   ├── pages/
│   │   ├── Login.tsx               # Login sayfası
│   │   └── AuthCallback.tsx        # OAuth callback handler
│   ├── components/
│   │   └── CreateProfile.tsx       # Email'i gösterir
│   └── layout/
│       └── Navbar.tsx              # Email badge gösterir
```

### 3. **Smart Contract Değişiklikleri**

```move
// suisoul.move dosyasında:

public struct UsernameRegistry has key {
    id: UID,
    usernames: Table<String, address>,
    username_list: vector<String>,
    wallet_profiles: Table<address, address>,  // Wallet mapping
    email_profiles: Table<String, address>,    // ✨ YENİ: Email mapping
    admin_address: address,
}

public struct UserProfile has key, store {
    id: UID,
    username: String,
    trust_score: u64,
    owner: address,
    email: String,  // ✨ YENİ: Email field
}
```

### 4. **Kontroller**

#### ✅ Wallet Kontrolü (Eskiden beri var)
```move
assert!(!table::contains(&registry.wallet_profiles, sender), 2);
// Error 2: "This wallet already has a profile"
```

#### ✅ Email Kontrolü (YENİ!)
```move
if (std::string::length(&email) > 0) {
    assert!(!table::contains(&registry.email_profiles, email), 4);
    // Error 4: "This email already has a profile"
}
```

## 🚀 Nasıl Test Edebilirsin?

### Adım 1: Environment Variables Ayarla

`.env` dosyası oluştur:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_42_CLIENT_ID=your-42-client-id
VITE_42_CLIENT_SECRET=your-42-client-secret
```

### Adım 2: Google Cloud Console'da OAuth Setup

1. https://console.cloud.google.com/ git
2. Yeni proje oluştur
3. "APIs & Services" → "Credentials"
4. "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Authorized redirect URIs: `http://localhost:5173/auth/callback`
7. Client ID'yi kopyala ve `.env` dosyasına ekle

### Adım 3: 42 API'da OAuth Setup

1. https://profile.intra.42.fr/oauth/applications/new git
2. Application oluştur
3. Redirect URI: `http://localhost:5173/auth/callback`
4. Client ID ve Secret'i kopyala

### Adım 4: Test Et!

```bash
# Dev server'ı başlat
cd sui_dapp
npm run dev
```

1. **Ana Sayfaya Git**: http://localhost:5173
2. **"Login with Email" Butonuna Tıkla**
3. **Google veya 42 École Seç**
4. **OAuth ile Giriş Yap**
5. **Email'in Navbar'da Göründüğünü Gör** 🎉
6. **Profil Oluştur** (email otomatik eklenir)

## 🔍 Kodda Neler Oluyor?

### `useZkLogin` Hook

```typescript
// src/hooks/useZkLogin.tsx

export const useZkLogin = () => {
  const [state, setState] = useState<ZkLoginState>({
    isLoading: false,
    userAddress: null,
    email: null,        // 📧 Email burada saklanır
    provider: null,     // 🌐 Google / 🎓 42
    error: null,
  });

  const loginWithGoogle = async () => {
    // 1. Ephemeral keypair oluştur
    // 2. Nonce generate et
    // 3. Google OAuth'a yönlendir
  };

  const handleCallback = async (jwt: string) => {
    // 1. JWT'den email'i çıkar
    // 2. zkLogin address oluştur
    // 3. State'e kaydet
  };

  return { ...state, loginWithGoogle, loginWith42, handleCallback, logout };
};
```

### `CreateProfile` Componenti

```typescript
// Email'i contract'a gönder
tx.moveCall({
  target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTIONS.CREATE_PROFILE}`,
  arguments: [
    tx.object(REGISTRY_ID),
    tx.pure.string(username),
    tx.pure.string(email || ""),  // ✨ Email buradan gidiyor
  ],
});
```

### `Navbar` Componenti

```typescript
// Email badge göster
{email && (
  <Badge color="green" size="2">
    {provider === '42' ? '🎓' : '🌐'} {email}
  </Badge>
)}
```

## 🎨 UI Özellikleri

### 1. Login Sayfası (`/login`)
- ✅ Google login butonu (mavi)
- ✅ 42 École login butonu (turkuaz)
- ✅ Hover efektleri
- ✅ Loading states

### 2. Navbar
- ✅ Email badge (giriş yaptıysa)
- ✅ Login butonu (giriş yapmadıysa)
- ✅ Logout seçeneği (dropdown menüde)

### 3. Home Sayfası
- ✅ Büyük "Login with Email" butonu
- ✅ Gradient efekt
- ✅ Hover animasyonu

### 4. Create Profile
- ✅ Email bilgisi gösteriliyor
- ✅ Mavi renkli info card
- ✅ "Authenticated with Email" mesajı

## 🛡️ Güvenlik

### 1 Wallet = 1 Profil ✅
```move
assert!(!table::contains(&registry.wallet_profiles, sender), 2);
```

### 1 Email = 1 Profil ✅
```move
assert!(!table::contains(&registry.email_profiles, email), 4);
```

### Username Validasyonu ✅
```typescript
if (!/^[a-zA-Z0-9_]+$/.test(username)) {
  setError("Username can only contain letters (a-z), numbers (0-9), and underscores (_)!");
}
```

## 📊 Deployment Bilgileri

**Yeni Contract ID'ler** (Email desteği ile):
```typescript
PACKAGE_ID: "0xd505c23e1bea4a68c66298d0c3ef139d35dd1412ed4081ed0a22ccf755fd570b"
REGISTRY_ID: "0xdfe67788a0ac71ed89cc1e9993d4feaddd33903a5cba2e4e7bffc10b95751794"
ADMIN_CAP_ID: "0x7b002ec0c6b6ee8b53f4ecc5200a1eaaa75355d060fe14de34fb76d1493fbc9c"
```

## 🐛 Troubleshooting

### "zkLogin hook çalışmıyor"
- `.env` dosyasını kontrol et
- `VITE_` prefix'i olmalı
- Dev server'ı restart et

### "OAuth redirect çalışmıyor"
- Redirect URI'yi kontrol et: `http://localhost:5173/auth/callback`
- Google/42 console'da doğru ayarlandığından emin ol

### "Email gösterilmiyor"
- Browser console'u kontrol et
- `useZkLogin` hook'unun email değeri dolu mu?
- Component'lerde `useZkLogin()` import edilmiş mi?

## 🎉 Sonuç

Artık kullanıcılar **3 farklı yöntemle** giriş yapabilir:

1. 🌐 **Google OAuth** (zkLogin)
2. 🎓 **42 École OAuth** (zkLogin)
3. 👛 **Sui Wallet** (Geleneksel)

Tüm yöntemler **aynı kontrollere tabi**:
- ✅ 1 wallet = 1 profil
- ✅ 1 email = 1 profil
- ✅ Username unique
- ✅ Blockchain'de kalıcı

---

**Not**: zkLogin production'da kullanmak için Sui Foundation'dan zkProof service erişimi gerekir. Şu an test modunda çalışıyor.
