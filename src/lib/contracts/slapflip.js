import { readContract, writeContract, getPublicClient } from "@wagmi/core";
import SLAPFLIP_ABI from '$lib/abi/SlapFlip.json';
import { SLAPFLIP_ADDRESS } from '$lib/config';
import { wagmiAdapter } from "$lib/appkit";

export const getRecentFulfilledSlaps = async(count) => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'getRecentFulfilledSlaps',
        args: [count]
    });
}

export const getRecentPendingSlaps = async(count) => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'getRecentPendingSlaps',
        args: [count]
    });
}

export const getRecentSlaps = async(count) => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'getRecentSlaps',
        args: [count]
    });
}

export const getSlapHistoryLength = async() => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'getSlapHistoryLength'
    });
}

export const getSlapStatus = async(slapId) => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'getSlapStatus',
        args: [slapId]
    });
}

export const getLeaderboard = async(n) => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'getLeaderboard',
        args: [n]
    });
}

export const getHouseFee = async() => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'houseFee'
    });
}

export const getLastSlapId = async() => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'lastSlapId'
    });
}

export const getPlayerStats = async(address) => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    const stats = await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'players',
        args: [address]
    });
    
    return {
        slapped: stats[0],
        slaps: stats[1],
        won: stats[2],
        lost: stats[3],
        wagered: stats[4]
    };
}

export const getTotalSlaps = async() => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'totalSlaps'
    });
}

export const getSlapHistory = async(index) => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'slapHistory',
        args: [index]
    });
}

export const getSlap = async(slapId) => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'slaps',
        args: [slapId]
    });
}

export const calculateFee = async(amount) => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'calculateFee',
        args: [amount]
    });
}

export const maxSlap = async() => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'maxSlap'
    });
}

export const maxSlapNative = async() => {
    const publicClient = getPublicClient(wagmiAdapter.wagmiConfig);
    return await publicClient.readContract({
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'maxSlapNative'
    });
}

// Write functions remain unchanged
export const slapWithToken = async(toSlap, amount) => {
    return await writeContract(wagmiAdapter.wagmiConfig, {
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'slapWithToken',
        args: [toSlap, amount]
    });
}

export const slapWithNative = async(toSlap, amount) => {
    return await writeContract(wagmiAdapter.wagmiConfig, {
        address: SLAPFLIP_ADDRESS,
        abi: SLAPFLIP_ABI,
        functionName: 'slapWithNative',
        args: [toSlap],
        value: amount
    });
}

// Helper function remains unchanged
export const formatSlapStatus = (status) => {
    return {
        player: status.player,
        slappee: status.slap,
        amount: status.amount,
        fulfilled: status.fulfilled,
        won: status.won,
        exists: status.exists,
        tokenType: status.tokenType,
        randomWords: status.randomWords || []
    };
}