import { parseEther, formatEther, formatUnits } from "viem";

export const wei = (input, decimals=18) => {
    if (typeof input !== 'bigint') {
        return;
    }

    let formattedNumber = formatUnits(input, decimals).toString().match(/^-?\d+(?:\.\d{0,8})?/)[0];
    let [integerPart, decimalPart = ''] = formattedNumber.split(".");

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    decimalPart = decimalPart.padEnd(1, '0'); // Ensures consistent decimal places

    return `${integerPart}.${decimalPart}`;
}

export const address = (address) => {
    if (!address || typeof address !== 'string') return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}