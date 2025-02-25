import { writable, readable } from "svelte/store";

export let walletClient = writable(null);
export let publicClient = writable(null);
export let address = writable(null);
export let connected = writable(false);
export let modal = writable(null);