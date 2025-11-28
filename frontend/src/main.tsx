import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
    testnet: { url: "https://fullnode.testnet.sui.io:443" },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
                <WalletProvider>
                    <App />
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
