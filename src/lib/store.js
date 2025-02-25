import { writable } from 'svelte/store';

export const accountState = writable({});
export const networkState = writable({});
export const appKitState = writable({});
export const themeState = writable({ themeMode: 'light', themeVariables: {} });
export const events = writable([]);
export const walletInfo = writable({});
export const wagmiConfig = writable(null);
export const signerAddress = writable(null);
export const connected = writable(false);
export const publicClient = writable(false);
export const walletConnected = writable(false);
export const isAdmin = writable(false);

export const chatMessages = writable([]);
export const recentSlaps = writable([]);
export const pendingSlaps = writable([]);
export const betAmount = writable(0);
export const maxBetAmount = writable(1000);

export function sendMessage(message) {
    chatMessages.update(messages => {
        const newMessages = [...messages, message];
        return newMessages.slice(-50);
    });
}