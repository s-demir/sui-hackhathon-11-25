import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

function App() {
  const account = useCurrentAccount();

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Sui dApp</h1>

      <ConnectButton />

      {account && (
        <div style={{ marginTop: 20 }}>
          <p><strong>Bağlı Hesap:</strong></p>
          <p>{account.address}</p>
        </div>
      )}
    </div>
  );
}

export default App;
