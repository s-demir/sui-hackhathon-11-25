# 🔐 Quick OAuth Setup Guide

## Kolay Yol: Backend Server ile OAuth

OAuth credentials'ları artık frontend'de değil, backend server'da tutuyoruz. Bu daha güvenli ve kolay!

### 1️⃣ Adım: OAuth Server Hazır! ✅

OAuth server dosyaları zaten oluşturuldu:
- `oauth-server/server.js` - Express backend
- `oauth-server/.env` - Credentials dosyası
- `oauth-server/package.json` - Dependencies

Dependencies zaten yüklendi! ✅

### 2️⃣ Adım: Google OAuth Credentials Al

#### 2.1 Google Cloud Console'a Git
[https://console.cloud.google.com/](https://console.cloud.google.com/)

#### 2.2 Yeni Proje Oluştur (veya mevcut projeyi seç)
- Sol üstteki proje seçiciye tıkla
- "New Project" tıkla
- İsim ver (örn: "SuiSoul OAuth")
- "Create" tıkla

#### 2.3 OAuth Consent Screen Ayarla
1. Sol menüden "APIs & Services" → "OAuth consent screen"
2. "External" seç, "Create" tıkla
3. Sadece zorunlu alanları doldur:
   - **App name**: SuiSoul
   - **User support email**: Senin email'in
   - **Developer contact email**: Senin email'in
4. "Save and Continue" tıkla
5. "Scopes" sayfasında "Save and Continue"
6. "Test users" sayfasında "Save and Continue"
7. "Summary" sayfasında "Back to Dashboard"

#### 2.4 OAuth Client ID Oluştur
1. Sol menüden "Credentials" → "Create Credentials" → "OAuth client ID"
2. Application type: **Web application**
3. Name: SuiSoul OAuth Client
4. **Authorized redirect URIs** ekle:
   ```
   http://localhost:3001/auth/google/callback
   ```
5. "Create" tıkla
6. **Client ID** ve **Client Secret** görünecek - bunları kopyala!

### 3️⃣ Adım: .env Dosyasını Güncelle

`oauth-server/.env` dosyasını aç ve şunları yapıştır:

```env
# Google OAuth Credentials (Buraya yapıştır!)
GOOGLE_CLIENT_ID=senin-google-client-id-buraya
GOOGLE_CLIENT_SECRET=senin-google-client-secret-buraya
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# 42 École OAuth (İsteğe bağlı - şimdilik boş bırakabilirsin)
FORTY_TWO_CLIENT_ID=YOUR_42_CLIENT_ID
FORTY_TWO_CLIENT_SECRET=YOUR_42_CLIENT_SECRET
FORTY_TWO_REDIRECT_URI=http://localhost:3001/auth/42/callback

# Server Config
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 4️⃣ Adım: OAuth Server'ı Başlat

Yeni bir terminal aç ve çalıştır:

```bash
cd C:\Users\HUMA\Desktop\sui\oauth-server
npm start
```

Şunu göreceksin:
```
✅ OAuth server running on http://localhost:3001
📝 Frontend URL: http://localhost:5173
🔑 Google OAuth: Configured
🔑 42 OAuth: Not configured
```

### 5️⃣ Adım: Test Et!

1. Frontend zaten çalışıyor: http://localhost:5173
2. Login sayfasına git: http://localhost:5173/login
3. "Continue with Google" butonuna tıkla
4. Google login ekranı açılacak
5. Email'inle giriş yap
6. Sui profile oluştur!

## 🎉 Hepsi Bu Kadar!

Artık OAuth çalışıyor:
- ✅ Google ile login
- ✅ Email ile profil oluşturma
- ✅ Wallet ile de login (OAuth olmadan da çalışır)

## ⚠️ Önemli Notlar

- **Sadece localhost'ta çalışır**: Production için redirect URI'leri güncellemelisin
- **HTTPS gerek yok**: Localhost için HTTP yeterli
- **42 OAuth İsteğe Bağlı**: Sadece Google yeterli, 42'yi daha sonra ekleyebilirsin
- **Port 3001**: OAuth server 3001, frontend 5173 portunda çalışmalı

## 🔒 Güvenlik

- Client Secret backend'de kalıyor (güvenli ✅)
- Frontend sadece OAuth server URL'ini biliyor
- Tokenlar backend'de işleniyor

## ❓ Sorun mu var?

### OAuth server çalışmıyor
```bash
# Tekrar install dene
cd oauth-server
npm install
npm start
```

### Google login çalışmıyor
1. `.env` dosyasında Client ID ve Secret doğru mu?
2. Redirect URI doğru mu? (http://localhost:3001/auth/google/callback)
3. OAuth server çalışıyor mu? (Port 3001)

### "OAuth not configured" hatası
- OAuth server'ı başlattın mı? (`npm start`)
- .env dosyasını düzenledin mi?
- Port 3001 başka bir program tarafından kullanılıyor olabilir

## 🚀 Sonraki Adımlar

1. ✅ Google OAuth çalıştı
2. 🔄 42 École OAuth ekle (opsiyonel)
3. 🌐 Production'a deploy et (redirect URI'leri güncelle)

Başarılar! 🎊
