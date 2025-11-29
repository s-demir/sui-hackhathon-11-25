# 🎯 SuiSoul Trust System

Sui blockchain üzerinde çalışan merkezi olmayan güven/reputasyon sistemi.

## 📁 Proje Yapısı

```
sui/
├── suisoul/          # Smart Contract (Move)
│   ├── sources/
│   │   └── suisoul.move
│   └── Move.toml
└── sui_dapp/         # Frontend (React + TypeScript)
    ├── src/
    │   ├── components/
    │   │   ├── CreateProfile.tsx
    │   │   ├── RateUser.tsx
    │   │   ├── ViewProfile.tsx
    │   │   ├── ReputationCards.tsx
    │   │   └── ProfileList.tsx
    │   ├── App.tsx
    │   ├── constants.ts
    │   └── OwnedObjects.tsx
    └── package.json
```

## 🚀 Kurulum

### Backend (Smart Contract)
```bash
cd suisoul
sui move build
sui client publish --gas-budget 100000000
```

### Frontend
```bash
cd sui_dapp
npm install
npm run dev
```

## 📝 Özellikler

- ✅ Username ile profil oluşturma
- ✅ Username uniqueness kontrolü
- ✅ 1-5 yıldız puanlama sistemi
- ✅ Silinemeyen ReputationCard'lar (SBT)
- ✅ Dinamik güven puanı hesaplama
- ✅ Admin redemption sistemi

## 🔗 Contract Bilgileri

- **Network:** Sui Testnet
- **Package ID:** `0x9d24b6fd0f7ecd9d212b209a08f6cd0163f569fbfecae63ddc21e5ce648d30a4`
- **Registry ID:** `0x7f2678d68f25d894163928434e39405c020ceffb32cd8306a184fc5b5bcbd71c`