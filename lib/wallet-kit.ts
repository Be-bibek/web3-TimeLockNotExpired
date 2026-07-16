import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { WalletConnectModule } from '@creit.tech/stellar-wallets-kit/modules/wallet-connect';

export const WALLET_CONNECT_PROJECT_ID = 'b7327f1c1f6b3b55ceb96fa1a1170732'; // Generic demo ID

let kit: StellarWalletsKit | null = null;

export function initWalletKit() {
  if (typeof window === 'undefined') return null;
  if (kit) return kit;
  
  try {
    kit = new StellarWalletsKit({
      network: Networks.TESTNET,
      modules: [
        new FreighterModule(),
        new AlbedoModule(),
        new WalletConnectModule({
          projectId: WALLET_CONNECT_PROJECT_ID,
          metadata: {
            name: "StellarFlow Vault",
            description: "Time-Locked Escrow Vault",
            url: window.location.origin,
            icons: ["https://stellarflow.app/icon.png"]
          }
        })
      ]
    });
  } catch (e) {
    console.warn("Wallet kit init warning:", e);
  }
  return kit;
}

export function openWalletModal() {
  const k = initWalletKit();
  if (!k) throw new Error("Wallet Kit not initialized");
  return k.openModal({
    onWalletSelected: async (option: any) => {
      try {
        k.setWallet(option.id);
        const publicKey = await k.getPublicKey();
        console.log("Selected wallet public key:", publicKey);
      } catch (e) {
        console.error(e);
      }
    }
  });
}

export function disconnectWallet() {
  const k = initWalletKit();
  if (!k) return;
  return k.disconnect();
}

export async function signWalletKitTx(xdr: string, publicKey: string) {
  const k = initWalletKit();
  if (!k) throw new Error("Wallet Kit not initialized");
  const result = await k.signTx({ xdr, publicKeys: [publicKey], network: Networks.TESTNET as any });
  return result.signedXDR;
}
