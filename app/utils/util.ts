import { web3 } from "@project-serum/anchor";
import { RPC_URL } from "../config";
import { programs } from "@metaplex/js";
import { clusterApiUrl } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";

export function formatOrdinal(num: number): string {
    const suffixes = ["th", "st", "nd", "rd"];
    const remainder = num % 100;
    return `${num}${suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0]}`;
}

export function getAddress(address: String) {
    return address.slice(0, 4) + "..." + address.slice(28, 32);
}

export function formatName(name: string) {
    return name.length > 8 ? name.slice(0, 7) + "..." : name;
}


export const solConnection = new web3.Connection(clusterApiUrl("devnet"));
// export const solConnection = new web3.Connection('https://devnet.helius-rpc.com/?api-key=67cbb36a-b35f-4c88-9240-c78a20c73f6c');


// export const getNftMetaData = async (nftMintPk: PublicKey) => {
//     let {
//         metadata: { Metadata },
//     } = programs;
//     let metadataAccount = await Metadata.getPDA(nftMintPk);
//     const metadata = await Metadata.load(solConnection, metadataAccount);
//     return metadata.data.data.uri;
// };

export interface AddressCount {
    address: string;
    count: number;
}

export function getAddressCounts(addresses: string[]): AddressCount[] {
    const countObj: { [address: string]: number } = {};

    addresses.forEach((address) => {
        if (countObj.hasOwnProperty(address)) {
            countObj[address] += 1;
        } else {
            countObj[address] = 1;
        }
    });

    const result: AddressCount[] = Object.entries(countObj).map(([address, count]) => ({
        address,
        count,
    }));

    return result.sort((a, b) => b.count - a.count);
}

export const getCollectionNameByMint = async (mintAddress: string): Promise<string> => {
    const url = `https://api-mainnet.magiceden.io/rpc/getCollectionForMint/${mintAddress}`;
    try {
        const response = await axios.get(url);
        const collectionName = response.data.results.symbol;
        return collectionName;
    } catch (error) {
        throw new Error(`Failed to get collection name: ${error}`);
    }
}

export const getFloorPrice = async (collectionName: string): Promise<number> => {
    const url = `https://api-mainnet.magiceden.io/rpc/getCollectionEscrowStats/${collectionName}`;
    try {
        const response = await axios.get(url);
        const floorPrice = response.data.results.floorPrice / 10 ** 9;  // Convert from lamports to SOL
        return floorPrice;
    } catch (error) {
        throw new Error(`Failed to get floor price: ${error}`);
    }
}