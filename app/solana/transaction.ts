import * as anchor from "@project-serum/anchor";

import {
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
} from '@solana/web3.js';

import { IDL as RaffleIDL, Raffle } from "./raffle";

import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { solConnection } from "../utils/util";
import { RafflePool } from "../utils/type";
import { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import {
    GLOBAL_AUTHORITY_SEED,
    // APE_TOKEN_MINT,
    RAFFLE_SIZE,
    DECIMALS,
    ADMIN_WALLET,
    EMPTY_USER
} from "../config"
import { useActionState } from "react";
import { Poor_Story } from "next/font/google";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { createTransaction } from "../api/transaction";

require('dotenv').config();

const splToken = require('@solana/spl-token');
const { Metadata } = require('@metaplex-foundation/mpl-token-metadata');

// import { successAlert } from "../components/ToastGroup";
// import whiteListOne from "./whitelist/levelOne.json"
// import whiteListTwo from "./whitelist/levelTwo.json"

export const globalAuthority = async () => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        new PublicKey(process.env.NEXT_PUBLIC_MYPRO_ID)
    );
    return globalAuthority.toBase58();
}

export const initProject = async (
    wallet: AnchorWallet | undefined
) => {
    console.log("initProject-step1 : ", wallet);
    if (!wallet) return;

    let provider = new anchor.AnchorProvider(solConnection, wallet as anchor.Wallet, { skipPreflight: true })

    const program: anchor.Program<Raffle> = new anchor.Program(RaffleIDL, process.env.NEXT_PUBLIC_MYPRO_ID, provider) as anchor.Program<Raffle>;

    const [globalAuthority, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    let tx = new Transaction();

    console.log("initProject-step2 : ", provider.publicKey.toBase58(), globalAuthority.toBase58());

    const ix = await program.methods.initialize().accounts({
        admin: provider.publicKey,
        globalAuthority,
        systemProgram: SystemProgram.programId,
        // rent: SYSVAR_RENT_PUBKEY,
    }).instruction();
    tx.add(ix);

    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
    const signedTx = await wallet.signTransaction(tx);
    const txId = await program.provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true });


    console.log("txHash =", txId);

    return true;
}

/**
 * @dev CreateRaffle function
 * @param userAddress The raffle creator's address
 * @param nft_mint The nft_mint address
 * @param ticketPriceSol The ticket price by SOL 
 * @param ticketPriceApe The ticket price by SOLAPE token
 * @param endTimestamp The raffle end timestamp
 * @param max The max entrants of this raffle
 */

export const createRaffle = async (
    wallet: AnchorWallet | undefined,
    raffle_mint: PublicKey,
    raffle_token: number,
    ticket_mint: PublicKey,
    ticketPrice: number,
    endTimestamp: number,
    max: number,
    setLoading: Function,
) => {
    if (!wallet) return;
    setLoading(true);
    let cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(solConnection, wallet as anchor.Wallet, { skipPreflight: true })
    const program = new anchor.Program(RaffleIDL as anchor.Idl, process.env.NEXT_PUBLIC_MYPRO_ID, provider);
    try {

        const tx = await createRaffleTx(
            wallet,
            program,
            wallet.publicKey,
            raffle_mint,
            raffle_token,
            ticket_mint,
            ticketPrice,
            endTimestamp,
            1,
            max
        );

        const blockHash = await program.provider.connection.getLatestBlockhash();

        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = blockHash.blockhash;
        const signedTx = await wallet.signTransaction(tx);
        const txId = await program.provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true });

        console.log("signedTx =", signedTx);
        console.log("txHash =", txId);

        const signature = await solConnection.confirmTransaction(
            {
                blockhash: blockHash.blockhash,
                lastValidBlockHeight: blockHash.lastValidBlockHeight,
                signature: txId,
            },
            "finalized"
        );

        console.log("txHash =", signature);
        setLoading(false);
        return { success: true, tx: signature };
    } catch (error) {
        console.log(error);
        setLoading(false);
        return { success: false };
    }
}

/**
 * @dev BuyTicket function
 * @param userAddress The use's address
 * @param nft_mint The nft_mint address
 * @param amount The amount of ticket to buy
 */

export const buyTicket = async (
    wallet: AnchorWallet | undefined,
    raffleKey: PublicKey,
    ticketToken: PublicKey,
    amount: number,
    setLoading: Function
) => {
    console.log(amount);
    if (!wallet) return;
    const walletAddress = wallet.publicKey;
    let provider = new anchor.AnchorProvider(solConnection, wallet as anchor.Wallet, { skipPreflight: true })
    const program = new anchor.Program(RaffleIDL as anchor.Idl, process.env.NEXT_PUBLIC_MYPRO_ID, provider);



    /// Wallet compare with JSON

    // const whiteListOneSet = new Set(whiteListOne);
    // const whiteListTwoSet = new Set(whiteListTwo);

    // let level = 2;
    // if (whiteListOneSet.has(wallet.publicKey.toBase58())) {
    //     level = 0;
    // } else if (whiteListTwoSet.has(wallet.publicKey.toBase58())) {
    //     level = 1;
    // }

    // console.log("whitelist level:", level)

    try {
        setLoading(true);
        const tx = await buyTicketTx(
            wallet,
            program,
            walletAddress,
            raffleKey,
            ticketToken,
            amount,
            0
        );

        const blockHash = await program.provider.connection.getLatestBlockhash();
        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = blockHash.blockhash;
        const signedTx = await wallet.signTransaction(tx);
        const txId = await program.provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true });

        const signature = await solConnection.confirmTransaction(
            {
                blockhash: blockHash.blockhash,
                lastValidBlockHeight: blockHash.lastValidBlockHeight,
                signature: txId,
            },
            "finalized"
        );

        if (!signature)
            return { success: false };

        console.log("txHash =", signature);

        await createTransaction({
            txHash: txId,
            userId: walletAddress.toBase58(),
            raffleId: raffleKey,
            purchasedTime: Date.now().toString(),
            ticketCount: Number(amount)
        })
        setLoading(false);

        return { success: true, tx: signature };
    } catch (error) {
        console.log(error)
        setLoading(false);

        return { success: false };
    }
}

/**
 * @dev RevealWinner function
 * @param nft_mint The nft_mint address
 */
export const revealWinner = async (
    wallet: AnchorWallet | undefined,
    raffleKey: PublicKey,
    setLoading: Function
) => {
    if (wallet.publicKey === null) return;
    const walletAddress = wallet.publicKey;
    let cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions())
    const program = new anchor.Program(RaffleIDL as anchor.Idl, process.env.NEXT_PUBLIC_MYPRO_ID, provider);
    try {
        setLoading(true);
        const tx = await revealWinnerTx(
            program,
            walletAddress,
            raffleKey,
        );

        const blockHash = await program.provider.connection.getLatestBlockhash();
        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = blockHash.blockhash;
        const signedTx = await wallet.signTransaction(tx);
        const txId = await program.provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true });

        const signature = await solConnection.confirmTransaction(
            {
                blockhash: blockHash.blockhash,
                lastValidBlockHeight: blockHash.lastValidBlockHeight,
                signature: txId,
            },
            "finalized"
        );

        if (!signature)
            return { success: false };

        console.log("txHash =", signature);
        setLoading(false);

        return { success: true, tx: signature };
    } catch (error) {
        console.log(error);
        setLoading(true);
        return { success: false };
    }
}

/**
 * @dev ClaimReward function
 * @param nft_mint The nft_mint address
 */
export const claimReward = async (
    wallet: AnchorWallet | undefined,
    nft_mint: PublicKey,
    raffleKey: PublicKey,
    setLoading: Function,
) => {
    if (wallet.publicKey === null) return;
    const walletAddress = wallet.publicKey;
    let cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions())
    const program = new anchor.Program(RaffleIDL as anchor.Idl, process.env.NEXT_PUBLIC_MYPRO_ID, provider);
    try {
        setLoading(true)
        const tx = await claimRewardTx(
            program,
            walletAddress,
            nft_mint,
            raffleKey
        );

        const blockHash = await program.provider.connection.getLatestBlockhash();
        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = blockHash.blockhash;
        const signedTx = await wallet.signTransaction(tx);
        const txId = await program.provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true });

        const signature = await solConnection.confirmTransaction(
            {
                blockhash: blockHash.blockhash,
                lastValidBlockHeight: blockHash.lastValidBlockHeight,
                signature: txId,
            },
            "finalized"
        );

        if (!signature)
            return { success: false };

        console.log("txHash =", signature);
        setLoading(false);

        return { success: true, tx: signature };
    } catch (error) {
        console.log(error);
        setLoading(false)

        return { success: false };
    }
}

/**
 * @dev WithdrawNFT function
 * @param nft_mint The nft_mint address
 */
export const withdrawNft = async (
    wallet: AnchorWallet | undefined,
    nft_mint: PublicKey,
    raffleKey: PublicKey,
    setLoading: Function
) => {
    if (wallet.publicKey === null) return;
    const walletAddress = wallet.publicKey;
    let cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions())
    const program = new anchor.Program(RaffleIDL as anchor.Idl, process.env.NEXT_PUBLIC_MYPRO_ID, provider);
    try {
        setLoading(true);
        const tx = await withdrawNftTx(
            program,
            walletAddress,
            nft_mint,
            raffleKey
        );
        
        const blockHash = await program.provider.connection.getLatestBlockhash();
        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = blockHash.blockhash;
        const signedTx = await wallet.signTransaction(tx);
        const txId = await program.provider.connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: true });

        const signature = await solConnection.confirmTransaction(
            {
                blockhash: blockHash.blockhash,
                lastValidBlockHeight: blockHash.lastValidBlockHeight,
                signature: txId,
            },
            "finalized"
        );

        if (!signature)
            return { success: false };

        console.log("txHash =", signature);
        setLoading(false);

        return { success: true, tx: signature };
    } catch (error) {
        console.log("Withdraw Error:", error)
        setLoading(false);
        return { success: false };
    }
}

export const createRaffleTx = async (
    wallet: AnchorWallet | undefined,
    program: anchor.Program,
    userAddress: PublicKey | undefined,
    raffle_mint: PublicKey,
    raffle_token: number,
    ticket_mint: PublicKey,
    ticketPrice: number,
    endTimestamp: number,
    whitelisted: number,
    max: number
) => {
    if (!userAddress) return;
    const [globalAuthority, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    console.log(globalAuthority.toBase58());
    //Source Token Account (NFT or Raffle Token)
    let ownerNftAccount = await getAssociatedTokenAccount(userAddress, raffle_mint);
    let ix0 = await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        globalAuthority,
        [raffle_mint]
    );
    console.log("Dest NFT Account!! = ", ix0.destinationAccounts[0].toBase58());

    //Create Ticket Token Account on User Account

    let ix1 = await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        userAddress,
        [ticket_mint]
    );
    console.log("Dest FT Account~~ = ", ix1.destinationAccounts[0].toBase58());

    let raffle;
    let i;

    for (i = 11; i > 0; i--) {
        raffle = await PublicKey.createWithSeed(
            userAddress,
            raffle_mint.toBase58().slice(0, i),
            program.programId,
        );
        let state = await getStateByKey(raffle);
        if (state === null) {
            console.log("idx:", i);
            break;
        }
    }

    let tx = new Transaction();
    if (raffle) {
        console.log("Programe ID:", program.programId.toBase58());
        let ix = SystemProgram.createAccountWithSeed({
            fromPubkey: userAddress,
            basePubkey: userAddress,
            seed: raffle_mint.toBase58().slice(0, i),
            newAccountPubkey: raffle,
            lamports: await solConnection.getMinimumBalanceForRentExemption(RAFFLE_SIZE),
            space: RAFFLE_SIZE,
            programId: program.programId,
        });


        console.log("############", await solConnection.getMinimumBalanceForRentExemption(RAFFLE_SIZE))
        tx.add(ix);
        if (ix0.instructions.length > 0) tx.add(...ix0.instructions)
        if (ix1.instructions.length > 0 && ticket_mint.toBase58() != EMPTY_USER) tx.add(...ix1.instructions)

        console.log("Raffle, mint, TA:", raffle_mint.toBase58(), ticket_mint.toBase58(), TOKEN_PROGRAM_ID.toBase58());

        const tokens = await getAllFTokens(wallet);

        console.log("FTS = ", tokens, raffle_token)

        let decimal1 = 0;
        if (raffle_token !== 0) {
            const raffleFindTokens = tokens.filter(e => e.tokenMint == raffle_mint.toBase58());
            console.log("raffle tokens", raffleFindTokens)
            if (!raffleFindTokens || raffleFindTokens.length <= 0)
                return null;

            const raffleToken = raffleFindTokens[0];
            decimal1 = raffleToken.decimal;
        }

        const ticketFindTokens = tokens.filter(e => e.tokenMint == ticket_mint.toBase58());
        console.log("ticket tokens", ticketFindTokens)
        if (!ticketFindTokens || ticketFindTokens.length <= 0)
            return null;

        const ticketToken = ticketFindTokens[0];
        const decimal2 = ticketToken.decimal;

        console.log("##$#$#$#$##$#", decimal1, decimal2)

        const ix2 = await program.instruction.createRaffle(
            new anchor.BN(raffle_token * 10 ** decimal1),
            new anchor.BN(ticketPrice * 10 ** decimal2),
            new anchor.BN(endTimestamp),
            new anchor.BN(max),
            {
                accounts: {
                    admin: userAddress,
                    globalAuthority,
                    raffle,
                    createrTokenAccount: ownerNftAccount,
                    destTokenAccount: ix0.destinationAccounts[0],
                    tokenMintAddress: raffle_mint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    ticketTokenProgram: ticket_mint,
                },
                instructions: [],
                signers: []
            })
        tx.add(ix2);
        console.log("########################$$$$$$$$$$$$$$$$$", tx)
    }

    return tx;
}

export const buyTicketTx = async (
    wallet: AnchorWallet | undefined,
    program: anchor.Program,
    userAddress: PublicKey,
    raffleKey: PublicKey,
    ticketToken: PublicKey,
    amount: number,
    level: number
) => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );

    const tokens = await getAllFTokens(wallet);

    if (ticketToken.toBase58() == EMPTY_USER)
        ticketToken = new PublicKey(tokens[1].tokenMint);

    let tx = new Transaction();
    if (raffleKey) {

        let raffleState = await getStateByKey(raffleKey);
        if (raffleState) {
            const creator = raffleState.creator;

            let ix1 = await getATokenAccountsNeedCreate(
                solConnection,
                userAddress,
                userAddress,
                [ticketToken]
            );
            let ix2 = await getATokenAccountsNeedCreate(
                solConnection,
                userAddress,
                creator,
                [ticketToken]
            );
            let ix3 = await getATokenAccountsNeedCreate(
                solConnection,
                userAddress,
                ADMIN_WALLET,
                [ticketToken]
            );

            if (ix1.instructions.length > 0 && ticketToken.toBase58() != EMPTY_USER) tx.add(...ix1.instructions);
            if (ix2.instructions.length > 0 && ticketToken.toBase58() != EMPTY_USER) tx.add(...ix2.instructions);
            if (ix3.instructions.length > 0 && ticketToken.toBase58() != EMPTY_USER) tx.add(...ix3.instructions);

            console.log(ix2.destinationAccounts[0].toBase58());

            tx.add(program.instruction.buyTickets(
                new anchor.BN(amount),
                {
                    accounts: {
                        buyer: userAddress,
                        raffle: raffleKey,
                        globalAuthority,
                        creator,
                        creatorTokenAccount: ix2.destinationAccounts[0],
                        userTokenAccount: ix1.destinationAccounts[0],
                        admin: ADMIN_WALLET,
                        adminTokenAccount: ix3.destinationAccounts[0],
                        tokenProgram: TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    },
                    instructions: [],
                    signers: [],
                }));
        }

    }
    return tx;

}

export const revealWinnerTx = async (
    program: anchor.Program,
    userAddress: PublicKey,
    raffleKey: PublicKey,
) => {
    let tx = new Transaction();
    tx.add(program.instruction.revealWinner(
        {
            accounts: {
                buyer: userAddress,
                raffle: raffleKey
            },
            instructions: [],
            signers: []
        }
    ));

    return tx;
}

export const claimRewardTx = async (
    program: anchor.Program,
    userAddress: PublicKey,
    nft_mint: PublicKey,
    raffleKey: PublicKey,
) => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );

    let tx = new Transaction();
    const srcTokenAccount = await getAssociatedTokenAccount(globalAuthority, nft_mint);

    let ix0 = await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        userAddress,
        [nft_mint]
    );
    console.log("Claimer's Token Account: ", ix0.destinationAccounts[0]);

    if (ix0.instructions.length > 0) tx.add(...ix0.instructions);
    if (raffleKey) {
        tx.add(program.instruction.claimReward(
            bump,
            {
                accounts: {
                    claimer: userAddress,
                    globalAuthority,
                    raffle: raffleKey,
                    claimerTokenAccount: ix0.destinationAccounts[0],
                    srcTokenAccount,
                    nftMintAddress: nft_mint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
                instructions: [],
                signers: [],
            }));
    }

    return tx;

}

export const withdrawNftTx = async (
    program: anchor.Program,
    userAddress: PublicKey,
    nft_mint: PublicKey,
    raffleKey: PublicKey
) => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );

    let tx = new Transaction();
    const srcTokenAccount = await getAssociatedTokenAccount(globalAuthority, nft_mint);

    let ix0 = await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        userAddress,
        [nft_mint]
    );

    if (raffleKey) {
        if (ix0.instructions.length === 0) {
            tx.add(program.instruction.withdrawNft(
                bump,
                {
                    accounts: {
                        claimer: userAddress,
                        globalAuthority,
                        raffle: raffleKey,
                        claimerTokenAccount: ix0.destinationAccounts[0],
                        srcTokenAccount,
                        nftMintAddress: nft_mint,
                        tokenProgram: TOKEN_PROGRAM_ID,
                    },
                    signers: [],
                }));
        } else {
            if (ix0.instructions.length > 0) tx.add(...ix0.instructions);
            tx.add(program.instruction.withdrawNft(
                bump,
                {
                    accounts: {
                        claimer: userAddress,
                        globalAuthority,
                        raffle: raffleKey,
                        claimerTokenAccount: ix0.destinationAccounts[0],
                        srcTokenAccount,
                        nftMintAddress: nft_mint,
                        tokenProgram: TOKEN_PROGRAM_ID,
                    },
                    instructions: [],
                    signers: [],
                }));
        }
    }

    return tx;

}

var byteArrayToInt = function (byteArray: Buffer) {
    var value = 0;
    for (var i = 0; i <= byteArray.length - 1; i++) {
        value = (value * 256) + byteArray[i];
    }
    return value;
};

export const getAllData = async () => {
    let cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions())
    const program = new anchor.Program(RaffleIDL as anchor.Idl, process.env.NEXT_PUBLIC_MYPRO_ID, provider);
    let poolAccounts = await solConnection.getProgramAccounts(
        program.programId,
        {
            filters: [
                {
                    dataSize: RAFFLE_SIZE,
                },
            ]
        }
    );

    let result = [];
    for (let i = 0; i < poolAccounts.length; i++) {
        const data = poolAccounts[i].account.data;

        const creator = new PublicKey(data.slice(8, 40));
        const token_program = new PublicKey(data.slice(40, 72));
        const token_mint = new PublicKey(data.slice(72, 104));
        let buf = data.slice(104, 112).reverse();
        const token_amount = byteArrayToInt(buf);
        const ticket_token_program = new PublicKey(data.slice(112, 144));

        buf = data.slice(144, 152).reverse();
        const ticket_price = byteArrayToInt(buf);

        buf = data.slice(152, 160).reverse();
        const count = byteArrayToInt(buf);

        buf = data.slice(160, 168).reverse();
        const no_repeat = byteArrayToInt(buf);

        buf = data.slice(168, 176).reverse();
        const max_entrants = byteArrayToInt(buf);

        buf = data.slice(176, 184).reverse();
        const start_timestamp = byteArrayToInt(buf);

        buf = data.slice(184, 192).reverse();
        const end_timestamp = byteArrayToInt(buf);

        buf = data.slice(192, 200).reverse();
        const whitelisted = byteArrayToInt(buf);

        const winner = new PublicKey(data.slice(200, 232)).toBase58();

        let entrants = [];

        for (let j = 0; j < count; j++) {
            const entrant = new PublicKey(data.slice(232 + j * 32, 264 + j * 32));
            entrants.push(entrant.toBase58());
        }

        result.push({
            raffleKey: poolAccounts[i].pubkey.toBase58(),
            creator: creator.toBase58(),
            token_program: token_program.toBase58(),
            token_mint: token_mint.toBase58(),
            ticket_token_program: ticket_token_program.toBase58(),
            token_amount,
            ticket_price,
            count,
            no_repeat,
            max_entrants,
            start_timestamp,
            end_timestamp,
            whitelisted,
            winner,
            entrants: entrants
        });

    }

    console.log("-------------All Data--", result)
    return result;
}

export const getRaffleKey = async (
    nft_mint: PublicKey
): Promise<PublicKey | null> => {
    let cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions())
    const program = new anchor.Program(RaffleIDL as anchor.Idl, process.env.NEXT_PUBLIC_MYPRO_ID, provider);
    let poolAccounts = await solConnection.getProgramAccounts(
        program.programId,
        {
            filters: [
                {
                    dataSize: RAFFLE_SIZE
                },
                {
                    memcmp: {
                        "offset": 40,
                        "bytes": nft_mint.toBase58()
                    }
                }
            ]
        }
    );
    if (poolAccounts.length !== 0) {
        let maxId = 0;
        let used = 0;
        for (let i = 0; i < poolAccounts.length; i++) {
            const data = poolAccounts[i].account.data;
            const buf = data.slice(128, 136).reverse();
            if ((new anchor.BN(buf)).toNumber() === 1) {
                maxId = i;
                used = 1;
            }

        }
        let raffleKey: PublicKey = PublicKey.default;

        if (used === 1) raffleKey = poolAccounts[maxId].pubkey;

        console.log(raffleKey.toBase58())
        return raffleKey;
    } else {
        return null;
    }
}

export const getStateByKey = async (
    raffleKey: PublicKey
): Promise<RafflePool | null> => {

    let cloneWindow: any = window;
    let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions())
    const program = new anchor.Program(RaffleIDL as anchor.Idl, process.env.NEXT_PUBLIC_MYPRO_ID, provider);
    console.log("RaffleKey:", raffleKey.toBase58());
    try {
        let rentalState = await program.account.rafflePool.fetch(raffleKey);
        return rentalState as unknown as RafflePool;
    } catch {
        return null;
    }
}
const getAssociatedTokenAccount = async (ownerPubkey: PublicKey, mintPk: PublicKey): Promise<PublicKey> => {
    let associatedTokenAccountPubkey = (await PublicKey.findProgramAddressSync(
        [
            ownerPubkey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintPk.toBuffer(), // mint address
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];
    return associatedTokenAccountPubkey;
}

export const getATokenAccountsNeedCreate = async (
    connection: anchor.web3.Connection,
    walletAddress: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    nfts: anchor.web3.PublicKey[],
) => {
    let instructions = [], destinationAccounts = [];
    for (const mint of nfts) {
        const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
        let response = await connection.getAccountInfo(destinationPubkey);
        if (!response) {
            const createATAIx = createAssociatedTokenAccountInstruction(
                destinationPubkey,
                walletAddress,
                owner,
                mint,
            );
            instructions.push(createATAIx);
        }
        destinationAccounts.push(destinationPubkey);
        // if (walletAddress != owner) {
        //     const userAccount = await getAssociatedTokenAccount(walletAddress, mint);
        //     response = await connection.getAccountInfo(userAccount);
        //     if (!response) {
        //         const createATAIx = createAssociatedTokenAccountInstruction(
        //             userAccount,
        //             walletAddress,
        //             owner,
        //             mint,
        //         );
        //         instructions.push(createATAIx);
        //     }
        // }
    }
    return {
        instructions,
        destinationAccounts,
    };
}

export const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey,
    walletAddress: anchor.web3.PublicKey,
    splTokenMintAddress: anchor.web3.PublicKey
) => {
    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: walletAddress, isSigner: false, isWritable: false },
        { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new anchor.web3.TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
}

const getPDA = async (
    mint: anchor.web3.PublicKey,
): Promise<anchor.web3.PublicKey> => {
    const METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

    return (
        await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from('metadata'),
                METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            METADATA_PROGRAM_ID,
        )
    )[0];
};

export const getMetadataPDA = async (
    // wallet: AnchorWallet | undefined,
    mint: PublicKey
) => {
    try {
        let tokenmetaPubkey = await getPDA(mint);
        const account = await Metadata.fromAccountAddress(solConnection, tokenmetaPubkey);
        return account;
    } catch {
    }
}

function displayMintAddress(address: string) {
    var visibleChars = 6; // Number of characters to display at the beginning and end
    var hiddenChars = address.length - (visibleChars * 2);

    // Extract visible parts
    var visiblePart = address.substr(0, visibleChars);
    var hiddenPart = "...";
    var visibleEnd = address.substr(-visibleChars);

    // Concatenate and display
    var displayedAddress = visiblePart + hiddenPart + visibleEnd;

    return displayedAddress;
}

export const getAllTokens = async (
    wallet: AnchorWallet | undefined
) => {
    if (!wallet) return;

    try {
        // Fetch the FT account addresses
        const parsedTokenAccounts = await solConnection.getParsedTokenAccountsByOwner(wallet.publicKey, {
            programId: TOKEN_PROGRAM_ID,
        });

        const fts = parsedTokenAccounts.value
            .map(e => ({
                tokenMint: e.account.data.parsed.info.mint,
                decimal: e.account.data.parsed.info.tokenAmount.decimals,
                tokenSymbol: displayMintAddress(e.account.data.parsed.info.mint),
                tokenName: displayMintAddress(e.account.data.parsed.info.mint)
            }));

        fts.unshift({
            tokenMint: "11111111111111111111111111111111",
            decimal: 9,
            tokenSymbol: "SOL",
            tokenName: "SOL"
        })

        for (let i = 0; i < fts.length; i++) {
            const metadata = await getMetadataPDA(new PublicKey(fts[i].tokenMint));
            if (metadata) {
                // console.log("-------Meta data-------", fts[i].tokenMint, metadata.data.symbol)
                fts[i].tokenSymbol = metadata.data.symbol.replace(/[^\w\s]/g, '');
                fts[i].tokenName = metadata.data.name.replace(/[^\w\s]/g, '');
            }
        }

        // console.log("All Tokens : ", fts)
        return fts;
    } catch {
        console.log("GET FT ERROR!");
        throw new Error('Error Fundable Tokens')
    }
}

export const getAllFTokens = async (
    wallet: AnchorWallet | undefined
) => {
    if (!wallet) return;

    try {
        // Fetch the FT account addresses
        const parsedTokenAccounts = await solConnection.getParsedTokenAccountsByOwner(wallet.publicKey, {
            programId: TOKEN_PROGRAM_ID,
        });

        const fts = parsedTokenAccounts.value
            .filter(e => e.account.data.parsed.info.tokenAmount.decimals !== 0)
            .map(e => ({
                tokenMint: e.account.data.parsed.info.mint,
                decimal: e.account.data.parsed.info.tokenAmount.decimals,
                tokenSymbol: displayMintAddress(e.account.data.parsed.info.mint)
            }));

        fts.unshift({
            tokenMint: "11111111111111111111111111111111",
            decimal: 9,
            tokenSymbol: "SOL"
        })

        for (let i = 0; i < fts.length; i++) {
            const metadata = await getMetadataPDA(new PublicKey(fts[i].tokenMint));
            if (metadata) {
                // console.log("-------Meta data-------", fts[i].tokenMint, metadata.data.symbol)
                fts[i].tokenSymbol = metadata.data.symbol.replace(/[^\w\s]/g, '');
            }
        }

        // console.log("Fundable Tokens : ", fts)
        return fts;
    } catch {
        console.log("GET FT ERROR!");
        throw new Error('Error Fundable Tokens')
    }
}