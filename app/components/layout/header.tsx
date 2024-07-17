'use client';
import Image from "next/image";
import { WalletMultiButton, WalletModalButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import S_Button from "../common/button";
import axios from "axios";
import { useEffect, useContext, useRef, useState, useCallback } from "react";
import { TodoContext } from "../../third-provider";
import { useRouter } from "next/navigation";
import Router from "next/router";
import { getUserByWallet, createUser } from "@/app/api/user";
import { getAddress } from "@/app/utils/util";

import { ToastContainer, toast } from 'react-toastify';

require('dotenv').config();

const navbar_data = [
    {
        name: "My Profile",
        icon: "/images/profile.svg",
        route: "/profile/"
    },
    {
        name: "Create Raffle",
        icon: "/images/c_raffle.svg",
        route: "/create"
    },
    {
        name: "Raffle Home",
        icon: "/images/dashboard.svg",
        route: "/"
    },
    {
        name: "Buyers Guide",
        icon: "/images/guide.svg",
        route: "/guide"
    },
    {
        name: "About",
        icon: "/images/about.svg",
        route: "/about"
    }
]

export default function Header() {
    const router = useRouter();
    const context = useContext(TodoContext);
    const { publicKey, connected } = useWallet();
    const [nav, toggleNav] = useState(false);
    const navRef = useRef(null);

    const onClickCreate = useCallback(() => {
        if (!connected) {
            toast.error("Wallet is not connected.", {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return;
        }
        router.push('/create');
    }, [connected, router]);



    useEffect(() => {
        const showBalance = async () => {
            if (publicKey) {
                const address = publicKey.toBase58();
                const url = process.env.NEXT_PUBLIC_RPC_URL;
                const headers = {
                    'Content-Type': 'application/json',
                };

                const postData = {
                    "jsonrpc": '2.0',
                    "id": 1,
                    "method": "getBalance",
                    "params": [address]
                };

                try {
                    const response = await axios.post(url, postData, { headers });
                    context.setBalance(response.data.result.value);
                } catch (error) {
                    console.error('Error:', error.message);
                };
            }
        }

        showBalance();
    }, [publicKey, context])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                toggleNav(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="header">
            <div className="header-nav" onClick={() => { toggleNav(!nav) }}>
                <Image
                    src="/images/navbar.svg"
                    alt="Vercel Logo"
                    className="light"
                    sizes="100vw"
                    style={{
                        width: '100%',
                        height: 'auto',
                    }}
                    width={45}
                    height={45}
                />
            </div>
            <div onClick={() => { router.push("/") }}>
                <Image
                    src="/images/sollucky.svg"
                    alt="Vercel Logo"
                    className="light"
                    sizes="100vw"
                    style={{
                        width: '100%',
                        height: 'auto',
                    }}
                    width={218}
                    height={54}
                />
            </div>
            <div className="header-buttons">
                {/* <S_Button b_name="Auctions" color="#DBEF60" width="93px" height="47px" /> */}
                <S_Button b_name="+" color="#76ED97" width="43px" height="47px" click={onClickCreate} />
                <WalletMultiButton>
                    {!connected ? "Connect Wallet" : getAddress(publicKey?.toBase58())}
                </WalletMultiButton>
            </div>
            <div className={(nav ? "show-animation " : " ") + "navbar"} ref={navRef}>
                <div className="navbar-icon">
                    <Image
                        src="/images/sollucky.svg"
                        alt="Vercel Logo"
                        className="light"
                        sizes="100vw"
                        style={{
                            width: '100%',
                            height: 'auto',
                        }}
                        width={218}
                        height={54}
                    />
                </div>
                <div className="close-button" onClick={() => { toggleNav(!nav) }}>
                    <Image
                        src="/images/close.svg"
                        alt="Vercel Logo"
                        className="light"
                        sizes="100vw"
                        style={{
                            width: '100%',
                            height: 'auto',
                        }}
                        width={55}
                        height={54}
                    />
                </div>
                <div className="navbar-menu">
                    {
                        navbar_data.map((e, i) => (<div onClick={() => {
                            router.push(i == 0 ? e.route + publicKey?.toBase58() : e.route);
                        }} key={i}>
                            <Image
                                src={e.icon}
                                alt="Vercel Logo"
                                className="light"
                                sizes="100vw"
                                style={{
                                    width: '22px',
                                    height: '22px',
                                }}
                                width={22}
                                height={21}
                            />
                            <div>{e.name}</div>
                        </div>))
                    }
                </div>
            </div>
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
        </div>
    )
}