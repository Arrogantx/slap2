import { readContract, writeContract, getPublicClient } from "@wagmi/core";
import ERC20_ABI from '$lib/abi/ERC20.json';
import { TOKEN_ADDRESS } from '$lib/config';
import { wagmiConfig } from "$lib/store";
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { avalancheFuji } from '@reown/appkit/networks'
import { wagmiAdapter } from "$lib/appkit";

export const balanceOf = async(address) => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    let amount = await publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address]
    });
    return amount;
}

export const symbol = async() => {
    let symbol = await readContract(wagmiAdapter.wagmiConfig, {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'symbol',
    });
    return symbol;
}

export const name = async() => {
    let name = await readContract(wagmiAdapter.wagmiConfig, {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'name',
    });
    return name;
}

export const decimals = async() => {
    let decimals = await readContract(wagmiAdapter.wagmiConfig, {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'decimals',
    });
    return decimals;
}

export const totalSupply = async() => {
    let supply = await readContract(wagmiAdapter.wagmiConfig, {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
    });
    return supply;
}

export const allowance = async(owner, spender) => {
    let amount = await readContract(wagmiAdapter.wagmiConfig, {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner, spender]
    });
    return amount;
}

// Write functions
export const approve = async(spender, amount) => {
    let tx = await writeContract(wagmiAdapter.wagmiConfig, {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, amount]
    });
    return tx;
}

export const transfer = async(to, amount) => {
    let tx = await writeContract(wagmiAdapter.wagmiConfig, {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, amount]
    });
    return tx;
}

export const transferFrom = async(from, to, amount) => {
    let tx = await writeContract(wagmiAdapter.wagmiConfig, {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transferFrom',
        args: [from, to, amount]
    });
    return tx;
}