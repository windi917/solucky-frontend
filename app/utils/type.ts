import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export interface RaffleItem {
    mint: string;
    raffleKey: string;
    collection: string;
    name: string;
    price: number;
    token: string;
    tokenDecimal: number;
    image: string;
    creator: string;
    endTimeStamp: number;
    createdTimeStamp: number;
    totalTickets: number;
    purchasedTickets: number;
    verified?: boolean,
    winner?: string,
    entrants?: string[],
    whitelisted?: number
}

export interface PropetiesType { type: string, value: string }

export interface GlobalPool {
    superAdmin: PublicKey,
}

export interface RafflePool {
    creator: PublicKey,
    token_program: PublicKey,
    token_mint: PublicKey,    
    token_amount: anchor.BN,
    ticket_token_program: PublicKey,    
    ticketPrice: anchor.BN,
    count: anchor.BN,
    noRepeat: anchor.BN,
    maxEntrants: anchor.BN,
    startTimestamp: anchor.BN,
    endTimestamp: anchor.BN,    
    whitelisted: anchor.BN, // 1 : featured, 2: ended(old), 3:withdrawd(old)
    winner: PublicKey,
    entrants: PublicKey[],
}