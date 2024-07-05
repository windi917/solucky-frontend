import { PublicKey } from "@metaplex-foundation/js";

export const RPC_URL = "https://api.devnet.solana.com";

export const GLOBAL_AUTHORITY_SEED = "global-authority";
export const EMPTY_USER = "11111111111111111111111111111111";

// export const MYPRO_ID = "B4Gg1qfGjkHZNZxte12H4tWrvtcm6BwMBtkrHKL5UNJb";
export const MYPRO_ID = "6p7XJtezjZMxjMKcz9FUjqPwM6duENy6PvE1aLcci9ZF";
export const APE_TOKEN_MINT = new PublicKey("AsACVnuMa5jpmfp3BjArmb2qWg5A6HBkuXePwT37RrLY");
export const ADMIN_WALLET = new PublicKey("84spPZ5P48hHURprjTZAaDGSMV6h3R6ivNeCyP7TugCc");
export const RAFFLE_SIZE = 33000;
export const DECIMALS = 100;
export const DAY = 3600 * 24 * 1000
export const TOKENS = [
    {
        tokenName: "Solana",
        tokenSymbol: "SOL",
        tokenMint: "11111111111111111111111111111111",
        decimal: 9
    },
    {
        tokenName: "RaffleToken",
        tokenSymbol: "RTK",
        tokenMint: "9cmYPgxT1wGP6ySgSDHCmTrLYzeDp1iVssy4grjdjDyQ",
        // tokenMint: "CAZPUCJJ9PYVVfe81NXwEcMZuafvQkCtBCti15ibGP3V",
        decimal: 2
    },
    {
        tokenName: "TicketToken",
        tokenSymbol: "TTK",
        tokenMint: "GAKS74QSGdt4tN4SLH6bHhJfAucYu3e8Dwf6hRRcJaU1",
        // tokenMint: "CAZPUCJJ9PYVVfe81NXwEcMZuafvQkCtBCti15ibGP3V",
        decimal: 2
    },
]
