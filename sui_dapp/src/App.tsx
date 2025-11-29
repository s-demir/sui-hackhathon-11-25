// 1. KÜTÜPHANE İTHALATLARI (IMPORTS)
// Sui cüzdanını bağlamak için hazır gelen buton bileşeni.
import { ConnectButton } from "@mysten/dapp-kit";
// Tasarım kütüphanesi (Radix UI) bileşenleri. CSS yazmadan güzel görünüm sağlar.
import { Box, Container, Flex, Heading } from "@radix-ui/themes";

// 2. BİZİM YAZDIĞIMIZ BİLEŞENLER
// Cüzdandaki varlıkları gösteren bileşen (Test amaçlı).
import { OwnedObjects } from "./OwnedObjects";
// Yeni profil oluşturma butonu.
import { CreateProfile } from "./components/CreateProfile";
// Puanlama (Rate) formu.
import { RateUser } from "./components/RateUser";
// Profil arama ve detay görme.
import { ViewProfile } from "./components/ViewProfile";
// Kendi profilini görüntüleme.
import { MyProfile } from "./components/MyProfile";
// Tüm profillerin listesi.
import { ProfileList } from "./components/ProfileList";
// Kullanıcı listesi (Varsa).
import { UserList } from "./components/UserList";

// *** YENİ EKLENEN ***
// Yönetici paneli. (Sadece AdminCap sahibi görebilecek, kontrolü içinde yapılıyor).
import { AdminPanel } from "./components/AdminPanel";

function App() {
  return (
    <>
      {/* --- ÜST MENÜ (NAVBAR) --- 
         Flex: Kutuları yan yana dizersin.
         position="sticky": Sayfa kaydırılsa bile üstte sabit kalır.
      */}
      <Flex
        position="sticky"
        px="4"  // Padding X (Sağ-sol boşluk)
        py="2"  // Padding Y (Alt-üst boşluk)
        justify="between" // Elemanları iki uca yasla (Biri sola, biri sağa)
        style={{
          borderBottom: "1px solid var(--gray-a2)", // Altına ince çizgi çek
        }}
      >
        {/* SOL TARAFTAKİ BAŞLIK */}
        <Box>
          <Heading>🎯 SuiSoul Trust System</Heading>
        </Box>

        {/* SAĞ TARAFTAKİ CÜZDAN BUTONU */}
        <Box>
          <ConnectButton />
        </Box>
      </Flex>

      {/* --- ANA İÇERİK ALANI --- 
         Container: İçeriği ortalar ve kenarlardan boşluk bırakır.
      */}
      <Container>
        <Container
          mt="5"   // Margin Top (Üstten boşluk)
          pt="2"   // Padding Top (İçeriden üst boşluk)
          px="4"
          style={{ background: "var(--gray-a2)", minHeight: 500, borderRadius: "8px" }}
        >
          {/* Debug amaçlı cüzdan içeriği (İstersen silebilirsin) */}
          <OwnedObjects />
          
          {/* *** YÖNETİCİ PANELİ ***
            Burası kritik. Bu bileşen kendi içinde "Admin miyim?" kontrolü yapıyor.
            Eğer admin değilse 'null' dönüyor ve ekranda hiçbir yer kaplamıyor.
            Adminse kırmızı paneli buraya çiziyor.
          */}
          <AdminPanel />

          {/* Profil Oluşturma Butonu */}
          <CreateProfile />
          
          {/* Kullanıcı Listeleri */}
          <UserList />
          <ProfileList />
          
          {/* İşlem Alanları */}
          <RateUser />      {/* Puan verme formu */}
          <ViewProfile />   {/* Profil inceleme */}
          <MyProfile />     {/* Kendi profilimi görme */}

        </Container>
      </Container>
    </>
  );
}

export default App;