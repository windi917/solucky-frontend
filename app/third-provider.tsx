'use client'

import {
    ConnectionProvider,
    WalletProvider,
    useWallet,
    useConnection
} from "@solana/wallet-adapter-react";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import React, { createContext, useState, useEffect } from "react";
const initializeValue = [];
export const TodoContext = createContext(initializeValue);

import { useMemo } from "react";
import { getAllData, initProject } from "./solana/transaction";

import { getUsers } from "./api/user";
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

require('dotenv').config();

export default function ThirdProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL, [network]);
    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
        [network]
    );

    //States
    const [users, setUsers] = useState([]);
    const [raffles, setRaffle] = useState([]);
    const [filter, setFilter] = useState("recent");
    const [tokenRaffle, setTokenRaffle] = useState(true);
    const [filterMode, setFilterMode] = useState(1);
    const [nftRaffle, setNFTRaffle] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [balance, setBalance] = useState(0);
    const [currentNFT, setCurrnetNFT] = useState(null);
    const [user, setUser] = useState({
        name: "unknown",
        twitter: "unknown",
        discord: "unknown",
        followers: 0,
        following: 0,
        wallet: "",
        transactions: []
    });
    const [isDataFetched, setIsDataFetched] = useState(false); // New state variable

    const getData = async () => {
        try {
            const t_users = await getUsers();
            const data = await getAllData();
            setUsers(t_users);
            setRaffle(data);
            setIsDataFetched(true); // Set to true once data is fetched
        } catch (error) {
            
            setIsDataFetched(true); // Set to true once data is fetched
            if (error instanceof Error) {
                toast.error('Get raffles Error!' + error.message, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                return;
              } else {
                toast.error('Get raffles Error!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                return;
              }
        }
    }
    useEffect(() => {
        getData();
    }, []);

    return (
        <TodoContext.Provider value={{ getData, balance, setBalance, raffles, setFilter, filter, tokenRaffle, setTokenRaffle, nftRaffle, setNFTRaffle, searchText, setSearchText, setCurrnetNFT, currentNFT, user, setUser, users, filterMode, setFilterMode }}>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        {isDataFetched ? children : null} {/* Render children only after data is fetched */}
                    </WalletModalProvider>
                    <ToastContainer
                        position="top-center"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                        stacked
                    />
                </WalletProvider>
            </ConnectionProvider>
        </TodoContext.Provider >
    )
}