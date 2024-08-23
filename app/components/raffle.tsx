'use client';
import Image from "next/image";
import S_Button from "./common/button";
import SpinButton from "./common/spinbutton";
import { useEffect, useRef, useState, useCallback } from "react";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useContext } from "react";
import { TodoContext } from "../third-provider";
import { PublicKey } from "@solana/web3.js";
import { buyTicket, claimReward, revealWinner, withdrawNft } from "../solana/transaction";
import { ToastContainer, toast } from 'react-toastify';

import { getAddress } from "../utils/util";
import { useRouter } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { getTransactionsByRaffle } from "../api/transaction";
import moment from 'moment';
import { getAllFTokens } from "../solana/transaction";

import { Oval } from "react-loader-spinner";

import dynamic from 'next/dynamic';

const MoonPayProvider = dynamic(
    () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayProvider),
    { ssr: false },
);

const MoonPayBuyWidget = dynamic(
    () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayBuyWidget),
    { ssr: false },
);

export default function Raffle({ raffle, image }) {
    const router = useRouter();
    const context = useContext(TodoContext);
    const { connected } = useWallet();
    const wallet = useAnchorWallet();
    const [ticket, setTicket] = useState(0);

    const DECIMALS = useRef(null);
    const price = useRef(null);

    const [dialogNum, setDialogNum] = useState(1);
    const [loading, setLoading] = useState(false);
    const [txs, setTxs] = useState([]);
    const [token, setToken] = useState([]);
    const [showMoonpay, setShowMoonpay] = useState(false);

    const [timer, setTimer] = useState("00:00:00");
    const Ref = useRef();

    const getTransactions = useCallback(async () => {
        const data_tx = await getTransactionsByRaffle(raffle.raffleKey);
        setTxs(data_tx);
    }, [setTxs, raffle]);

    const getTokens = useCallback(async () => {
        const fts = await getAllFTokens(wallet);
        if (!fts)
            return null;
        const findFTs = fts.filter(e => e.tokenMint == raffle.ticket_token_program)
        let ft;
        if (findFTs)
            ft = findFTs[0];

        DECIMALS.current = ft?.decimal;
        price.current = raffle.ticket_price / (10 ** DECIMALS.current);
        setToken(ft);
    }, [setToken, wallet, raffle.ticket_token_program, raffle.ticket_price]);

    useEffect(() => {
        getTokens();
        getTransactions();
    }, [getTokens, getTransactions])

    const getTimeRemaining = useCallback(() => {
        const total =
            raffle.end_timestamp * 1000 - new Date().getTime();
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor(
            (total / 1000 / 60) % 60
        );
        const hours = Math.floor(
            (total / 1000 / 60 / 60)// % 24
        );
        return {
            total,
            hours,
            minutes,
            seconds,
        };
    }, [raffle.end_timestamp]);

    const startTimer = useCallback(() => {
        let { total, hours, minutes, seconds } = getTimeRemaining();
        if (total <= 0)
            setTimer("FINISHED")
        else
            setTimer(
                (hours > 9 ? hours : "0" + hours) +
                ":" +
                (minutes > 9
                    ? minutes
                    : "0" + minutes) +
                ":" +
                (seconds > 9 ? seconds : "0" + seconds)
            );
    }, [getTimeRemaining]);

    const clearTimer = useCallback(() => {
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {
            startTimer();
        }, 1000);
        Ref.current = id;
    }, [startTimer]);

    useEffect(() => {
        clearTimer();
    }, [clearTimer])

    const showDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const datevalues = [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
        ];
        return datevalues[0] + "/" + datevalues[1] + "/" + datevalues[2];
    }

    const buy_ticket = async () => {
        console.log("#################################");
        if (ticket == 0) {
            toast.error('Please insert correct amount!', {
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
        console.log("BUY_____", new Date(), new Date(raffle.end_timestamp * 1000), raffle.end_timestamp);
        if (new Date() > new Date(raffle.end_timestamp * 1000)) {
            toast.error('Raffle ended!', {
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
        const res = await buyTicket(wallet, new PublicKey(raffle.raffleKey), new PublicKey(raffle.ticket_token_program), ticket, setLoading);
        if ( res?.success === false ) {
            toast.error("Buy Ticket Error!");
        } else {
            toast.success("Buy Ticket Success!");
        }
    }

    const withdraw_NFT = async () => {
        const res = await withdrawNft(wallet, new PublicKey(raffle.token_mint), new PublicKey(raffle.raffleKey), setLoading);
        
        if ( res?.success === false ) {
            toast.error("Withdraw NFT Error!");
        } else {
            toast.success("Withdraw NFT Success!");
        }
    }

    const claim_NFT = async () => {
        const res = await claimReward(wallet, new PublicKey(raffle.token_mint), new PublicKey(raffle.raffleKey), setLoading);

        if ( res?.success === false ) {
            toast.error("Claim NFT Error!");
        } else {
            toast.success("Claim NFT Success!");
        }
    }
    const reveal_Winner = async () => {
        const res = await revealWinner(wallet, new PublicKey(raffle.raffleKey), setLoading);

        if ( res?.success === false ) {
            toast.error("Reveal Winner Error!");
            return;
        } else {
            toast.success("Reveal Winner Success!");
        }

        await context.getData();
    }
    const counts = raffle.entrants.reduce((acc, value) => {
        const found = acc.find(e => e.value === value);

        if (found) {
            found.count += 1;
        } else {
            acc.push({ value: value, count: 1 });
        }

        return acc;
    }, []);

    let creator = context.users.find(e_user => e_user.wallet == raffle.creator);

    const NEXT_PUBLIC_MOONPAY_API_KEY = 'pk_test_123';
    const handleBuySol = () => {
        setShowMoonpay(true);
        const moonpayUrl = `https://buy.moonpay.com?&currencyCode=sol`;
        window.open(moonpayUrl, 'MoonPay', 'width=500,height=800');
    };

    return (
        <MoonPayProvider
            apiKey="pk_test_123"
            debug
        >
            <div className="raffle-detail" style={{ height: '100%', overflow: 'auto' }}>
                {/* {showMoonpay && <MoonPayBuyWidget
                    variant="overlay"
                    baseCurrencyCode="usd"
                    baseCurrencyAmount="100"
                    defaultCurrencyCode="eth"
                    onCloseOverlay={() => setShowMoonpay(false)}
                />} */}
                <div className="raffle-image flex-col">
                    <div>
                        {image === "" ? (
                            <Image
                                src={"https://exponential.imgix.net/icons/assets/USDT_color.jpg?auto=format&fit=max&w=256"}
                                alt="Vercel Logo"
                                className="light"
                                sizes="100vw"
                                style={{
                                    height: 'auto',
                                }}
                                width={421}
                                height={421}
                            />
                        ) : (
                            <Image
                                src={image}
                                alt="Vercel Logo"
                                className="light"
                                sizes="100vw"
                                style={{
                                    height: 'auto',
                                }}
                                width={421}
                                height={421}
                            />
                        )}

                    </div>
                    {!connected ? (<div className="connect-wallet justify-center">
                        <WalletMultiButton>
                            Connect Wallet
                        </WalletMultiButton>
                    </div>) :
                        (<div className="purchase-left-panel purchase-panel flex-col">
                            {
                                timer !== "FINISHED" ? (
                                    <>
                                        <div className="buy-ticket-panel">
                                            <SpinButton number={ticket} setNumber={setTicket} />
                                            <S_Button b_name={"Buy for " + (price.current * ticket).toFixed(2) + "SOL"} width="155px" height="49px" color="#DBEF60" click={() => { buy_ticket() }} />
                                        </div>
                                        <div className="ticket-price">
                                            {price.current} {token?.tokenSymbol} / Ticket
                                        </div>
                                    </>
                                ) :
                                    (
                                        raffle.winner == "11111111111111111111111111111111" && raffle.count ?
                                            <S_Button b_name={"Reveal Winner"} width="155px" height="49px" color="#DBEF60" click={() => { reveal_Winner() }} />
                                            : (
                                                raffle.count == 0 ?
                                                    <S_Button b_name={"Withdraw NFT"} width="155px" height="49px" color="#DBEF60" click={() => { withdraw_NFT() }} /> :
                                                    <S_Button b_name={"Claim NFT"} width="155px" height="49px" color="#DBEF60" click={() => { claim_NFT() }} />)
                                    )
                            }
                            <div className="ticket-left">
                                You have: {context.balance / 10 ** 9} SOL
                            </div>
                            <div className="buy-sol-panel">
                                <div className="ticket-need-sol">Need SOL?</div>
                                <S_Button b_name="Buy SOL" width="105px" height="49px" color="#99E6DB" click={handleBuySol} />
                            </div>
                        </div>)}
                </div>
                <div className="raffle-detail-info flex-col">
                    <div className="raffle-title flex-col">
                        <div className="justify-between">
                            <div>
                                {getAddress(raffle.raffleKey)}&nbsp;
                                <Image
                                    src="/images/check.svg"
                                    alt="Vercel Logo"
                                    className="light"
                                    sizes="100vw"
                                    style={{
                                        height: 'auto',
                                    }}
                                    width={19}
                                    height={19}
                                />
                            </div>
                            <div onClick={() => router.back()}>
                                &lt; Back
                            </div>
                        </div>
                        <div className="raffle-name">
                            {getAddress(raffle.creator)} &nbsp;
                            <Image
                                src="/images/eye.svg"
                                alt="Vercel Logo"
                                className="light"
                                sizes="100vw"
                                style={{
                                    height: 'auto',
                                }}
                                width={29}
                                height={15}
                            />
                        </div>
                        <div className="nft-price-value">
                            <div>
                                NFT Floor Price &nbsp;<div className="raffle-price">5.1</div>
                            </div>
                            <div>
                                Total Ticket Value &nbsp;<div className="raffle-price">6.6</div>
                            </div>
                        </div>
                    </div>
                    {connected ? (<div className="purchase-panel purchase-right-panel">
                        <div className="buy-ticket-panel">
                            <SpinButton number={ticket} setNumber={setTicket} />
                            <S_Button b_name={"Buy for " + price.current * ticket + "SOL"} width="155px" height="49px" color="#DBEF60" click={() => { buy_ticket() }} />
                        </div>
                        <div className="ticket-price">
                            {price.current} {token?.tokenSymbol} / Ticket
                        </div>
                        <div className="ticket-left">
                            You have: {context.balance / 10 ** 9} SOL
                        </div>
                        <div className="buy-sol-panel">
                            <div className="ticket-need-sol">Need SOL?</div>
                            <S_Button b_name="Buy SOqqqL" width="105px" height="49px" color="#99E6DB" />
                        </div>
                    </div>) : <></>}
                    <div className="raffle-details flex-col">
                        <div className="raffle-button-group">
                            <S_Button click={() => setDialogNum(0)} b_name="Details" color={dialogNum == 0 ? "#FFFFFF4D" : "transparent"} border={dialogNum == 0 ? "none" : "1px solid #76ED97"} width="128px" height="42px" t_color="white" />
                            <S_Button click={() => setDialogNum(1)} b_name="Participants" color={dialogNum == 1 ? "#FFFFFF4D" : "transparent"} border={dialogNum == 1 ? "none" : "1px solid #76ED97"} width="144px" height="42px" t_color="white" />
                            <S_Button click={() => setDialogNum(2)} b_name="Transactions" color={dialogNum == 2 ? "#FFFFFF4D" : "transparent"} border={dialogNum == 2 ? "none" : "1px solid #76ED97"} width="146px" height="42px" t_color="white" />
                        </div>
                        <div className="flex-col raffle-content">
                            {dialogNum == 0 &&
                                <>
                                    <div className="raffle-ticket">
                                        <div className="raffle-ticket-left flex-col justify-evenly">
                                            <div className="raffle-left-top justify-between">
                                                <div className="flex-col justify-between">
                                                    <div className="flex-col">
                                                        <div>
                                                            Ticket Sales Ends in:
                                                        </div>
                                                        <div className="raffle-number">
                                                            {timer}
                                                        </div>
                                                    </div>
                                                    <div className="flex-col">
                                                        <div>
                                                            Raffle Start Date:
                                                        </div>
                                                        <div className="raffle-number">
                                                            {showDate(raffle.start_timestamp)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-col justify-between">
                                                    <div className="flex-col">
                                                        <div>
                                                            Ticket Cost:
                                                        </div>
                                                        <div className="raffle-number">
                                                            {price.current} {token?.tokenSymbol}
                                                        </div>
                                                    </div>
                                                    <div className="flex-col">
                                                        <div>
                                                            Ticket Remaining:
                                                        </div>
                                                        <div className="raffle-number">
                                                            {raffle.max_entrants - raffle.count}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-col">
                                                <div>
                                                    Raffler:

                                                </div>
                                                <div>
                                                    {
                                                        <div className="justify-between">
                                                            <div className="align-center raffle-accounts-participants">
                                                                <a href={"https://solscan.io/account/" + raffle.creator}>{creator ? creator.name : raffle.creator}</a>
                                                                <Link href={"/profile/" + raffle.creator}><svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <g clip-path="url(#clip0_23_2751)">
                                                                        <path d="M24.1099 10.93C23.8799 8.51 23.0099 6.35 21.4699 4.48C19.3599 1.91 16.6499 0.41 13.3399 0.0700004C9.9099 -0.28 6.8499 0.67 4.2299 2.91C1.7799 5 0.369902 7.67 0.0599023 10.88C-0.270098 14.29 0.679902 17.34 2.9099 19.94C4.9799 22.36 7.6399 23.74 10.8099 24.1C11.2199 24.15 11.6199 24.17 12.0299 24.2H12.1199C12.4899 24.17 12.8599 24.15 13.2199 24.11C15.7499 23.87 17.9899 22.92 19.9199 21.27C21.8999 19.58 23.1999 17.45 23.8199 14.91C24.0199 14.09 24.1399 13.26 24.1399 12.41C24.1399 12.32 24.1699 12.22 24.1799 12.13V12.04C24.1499 11.67 24.1299 11.3 24.0899 10.94L24.1099 10.93ZM12.0799 3.56C14.3099 3.56 16.1099 5.37 16.1099 7.6C16.1099 9.85 14.3399 11.62 12.0799 11.62C9.8299 11.62 8.0599 9.85 8.0599 7.59C8.0599 5.38 9.8699 3.57 12.0799 3.57V3.56ZM18.4699 17.81C18.4299 18.3 18.1699 18.67 17.8099 18.97C16.3699 20.16 14.7199 20.86 12.8599 21.01C10.3999 21.2 8.1999 20.51 6.2899 18.93C5.7099 18.45 5.6099 17.79 5.6999 17.08C5.9499 15.07 7.6599 13.56 9.6899 13.55C10.4899 13.55 11.2799 13.55 12.0799 13.55C12.8899 13.55 13.6999 13.55 14.5199 13.55C16.7899 13.55 18.6399 15.55 18.4699 17.81Z" fill="#DBEF60" />
                                                                    </g>
                                                                    <defs>
                                                                        <clipPath id="clip0_23_2751">
                                                                            <rect width="24.2" height="24.2" fill="white" />
                                                                        </clipPath>
                                                                    </defs>
                                                                </svg>
                                                                </Link>
                                                                {creator?.twitter === "unknown" && <a style={{ paddingTop: "7px" }}><svg width="31" height="19" viewBox="0 0 31 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <g clip-path="url(#clip0_23_2754)">
                                                                        <path d="M20.84 0H9.33C4.17718 0 0 4.17494 0 9.325C0 14.4751 4.17718 18.65 9.33 18.65H20.84C25.9928 18.65 30.17 14.4751 30.17 9.325C30.17 4.17494 25.9928 0 20.84 0Z" fill="#76ED97" />
                                                                        <path d="M21.4497 15.79C21.4497 15.79 21.4697 15.82 21.4697 15.83C21.4697 15.83 21.4497 15.8 21.4497 15.79Z" fill="#2F2F2F" />
                                                                        <path d="M21.4199 15.75C19.7399 13.3 18.0499 10.85 16.3599 8.41C16.2999 8.33 16.3399 8.3 16.3799 8.25C17.9199 6.46 19.4699 4.67 21.0099 2.88C21.0199 2.87 21.0299 2.84 21.0399 2.83C21.0199 2.83 21.0099 2.82 20.9899 2.82C20.6499 2.82 20.2999 2.82 19.9599 2.82C19.9299 2.82 19.8899 2.84 19.8599 2.87C18.5099 4.43 17.1599 6 15.8199 7.56C15.7899 7.59 15.7799 7.59 15.7599 7.56C14.6899 6 13.6099 4.44 12.5399 2.88C12.5199 2.85 12.5099 2.82 12.4499 2.82C11.2299 2.82 10.0099 2.82 8.78994 2.82C8.75994 2.82 8.71994 2.82 8.68994 2.83C8.70994 2.86 8.71994 2.9 8.73994 2.92C9.40994 3.9 10.0899 4.88 10.7699 5.86C11.7199 7.24 12.6699 8.63 13.6299 10.01C13.6699 10.06 13.6499 10.08 13.6199 10.12C11.9899 12.01 10.3599 13.9 8.72994 15.79C8.71994 15.8 8.70994 15.82 8.69994 15.84C8.71994 15.84 8.72994 15.84 8.74994 15.84C9.09994 15.84 9.44994 15.84 9.79994 15.84C9.81994 15.84 9.84994 15.82 9.86994 15.81C10.2499 15.38 10.6199 14.94 10.9999 14.51C12.0599 13.28 13.1099 12.05 14.1699 10.83H14.1999C15.3399 12.48 16.4799 14.14 17.6199 15.79C17.6599 15.84 17.6999 15.84 17.7399 15.84C18.3499 15.84 18.9499 15.84 19.5599 15.84C20.1599 15.84 20.7599 15.84 21.3599 15.84C21.3799 15.84 21.3899 15.84 21.4099 15.84C21.4299 15.84 21.4399 15.84 21.4599 15.84C21.4599 15.83 21.4399 15.81 21.4399 15.8C21.4399 15.79 21.4199 15.77 21.4099 15.76L21.4199 15.75ZM19.7999 15.02C19.5499 15.02 19.3099 15.02 19.0599 15.02C18.7999 15.02 18.5399 15.02 18.2699 15.02C18.2399 15.02 18.1899 14.99 18.1699 14.97C16.5299 12.63 14.8799 10.29 13.2399 7.94C12.2699 6.55 11.2999 5.16 10.3299 3.77C10.3099 3.74 10.2899 3.71 10.2699 3.68C10.3099 3.68 10.3499 3.68 10.3799 3.68C10.8799 3.68 11.3799 3.68 11.8699 3.68C11.9299 3.68 11.9599 3.7 11.9899 3.75C13.4299 5.81 14.8799 7.87 16.3199 9.93C17.4899 11.6 18.6599 13.28 19.8299 14.95C19.8499 14.98 19.8699 15 19.8899 15.02C19.8599 15.02 19.8199 15.02 19.7899 15.02H19.7999Z" fill="#2F2F2F" />
                                                                    </g>
                                                                    <defs>
                                                                        <clipPath id="clip0_23_2754">
                                                                            <rect width="30.17" height="18.65" fill="white" />
                                                                        </clipPath>
                                                                    </defs>
                                                                </svg></a>
                                                                }
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <Image
                                                src="/images/flowerlucky.svg"
                                                alt="Vercel Logo"
                                                className="light"
                                                sizes="100vw"
                                                style={{
                                                    height: 'auto',
                                                }}
                                                width={144}
                                                height={129}
                                            />
                                        </div>
                                    </div>

                                    <div className="raffle-terms flex-col">
                                        <div className="raffle-terms-title">
                                            Terms & Conditoins:
                                        </div>
                                        <div className="raffle-terms-info">
                                            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in
                                        </div>
                                    </div>
                                </>
                            }
                            {
                                dialogNum == 1 &&
                                <>
                                    <div className="justify-between">
                                        <div className="raffle-wallets">
                                            Wallet:
                                        </div>
                                        <div className="raffle-wallets">
                                            Tickets Bought
                                        </div>
                                    </div>
                                    <div className="flex-col raffle-accounts">
                                        {

                                            counts.map((e, i) => {
                                                let user = context.users.find(e_user => e_user.wallet == e.value);
                                                return <div className="justify-between" key={i}>
                                                    <div className="align-center raffle-accounts-participants">
                                                        <a href={"https://solscan.io/account/" + e.value}>{user ? user.name : e.value}</a>
                                                        <Link href={"/profile/" + e.value}><svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <g clip-path="url(#clip0_23_2751)">
                                                                <path d="M24.1099 10.93C23.8799 8.51 23.0099 6.35 21.4699 4.48C19.3599 1.91 16.6499 0.41 13.3399 0.0700004C9.9099 -0.28 6.8499 0.67 4.2299 2.91C1.7799 5 0.369902 7.67 0.0599023 10.88C-0.270098 14.29 0.679902 17.34 2.9099 19.94C4.9799 22.36 7.6399 23.74 10.8099 24.1C11.2199 24.15 11.6199 24.17 12.0299 24.2H12.1199C12.4899 24.17 12.8599 24.15 13.2199 24.11C15.7499 23.87 17.9899 22.92 19.9199 21.27C21.8999 19.58 23.1999 17.45 23.8199 14.91C24.0199 14.09 24.1399 13.26 24.1399 12.41C24.1399 12.32 24.1699 12.22 24.1799 12.13V12.04C24.1499 11.67 24.1299 11.3 24.0899 10.94L24.1099 10.93ZM12.0799 3.56C14.3099 3.56 16.1099 5.37 16.1099 7.6C16.1099 9.85 14.3399 11.62 12.0799 11.62C9.8299 11.62 8.0599 9.85 8.0599 7.59C8.0599 5.38 9.8699 3.57 12.0799 3.57V3.56ZM18.4699 17.81C18.4299 18.3 18.1699 18.67 17.8099 18.97C16.3699 20.16 14.7199 20.86 12.8599 21.01C10.3999 21.2 8.1999 20.51 6.2899 18.93C5.7099 18.45 5.6099 17.79 5.6999 17.08C5.9499 15.07 7.6599 13.56 9.6899 13.55C10.4899 13.55 11.2799 13.55 12.0799 13.55C12.8899 13.55 13.6999 13.55 14.5199 13.55C16.7899 13.55 18.6399 15.55 18.4699 17.81Z" fill="#DBEF60" />
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_23_2751">
                                                                    <rect width="24.2" height="24.2" fill="white" />
                                                                </clipPath>
                                                            </defs>
                                                        </svg>
                                                        </Link>
                                                        {user?.twitter === "unknown" && <a style={{ paddingTop: "7px" }}><svg width="31" height="19" viewBox="0 0 31 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <g clip-path="url(#clip0_23_2754)">
                                                                <path d="M20.84 0H9.33C4.17718 0 0 4.17494 0 9.325C0 14.4751 4.17718 18.65 9.33 18.65H20.84C25.9928 18.65 30.17 14.4751 30.17 9.325C30.17 4.17494 25.9928 0 20.84 0Z" fill="#76ED97" />
                                                                <path d="M21.4497 15.79C21.4497 15.79 21.4697 15.82 21.4697 15.83C21.4697 15.83 21.4497 15.8 21.4497 15.79Z" fill="#2F2F2F" />
                                                                <path d="M21.4199 15.75C19.7399 13.3 18.0499 10.85 16.3599 8.41C16.2999 8.33 16.3399 8.3 16.3799 8.25C17.9199 6.46 19.4699 4.67 21.0099 2.88C21.0199 2.87 21.0299 2.84 21.0399 2.83C21.0199 2.83 21.0099 2.82 20.9899 2.82C20.6499 2.82 20.2999 2.82 19.9599 2.82C19.9299 2.82 19.8899 2.84 19.8599 2.87C18.5099 4.43 17.1599 6 15.8199 7.56C15.7899 7.59 15.7799 7.59 15.7599 7.56C14.6899 6 13.6099 4.44 12.5399 2.88C12.5199 2.85 12.5099 2.82 12.4499 2.82C11.2299 2.82 10.0099 2.82 8.78994 2.82C8.75994 2.82 8.71994 2.82 8.68994 2.83C8.70994 2.86 8.71994 2.9 8.73994 2.92C9.40994 3.9 10.0899 4.88 10.7699 5.86C11.7199 7.24 12.6699 8.63 13.6299 10.01C13.6699 10.06 13.6499 10.08 13.6199 10.12C11.9899 12.01 10.3599 13.9 8.72994 15.79C8.71994 15.8 8.70994 15.82 8.69994 15.84C8.71994 15.84 8.72994 15.84 8.74994 15.84C9.09994 15.84 9.44994 15.84 9.79994 15.84C9.81994 15.84 9.84994 15.82 9.86994 15.81C10.2499 15.38 10.6199 14.94 10.9999 14.51C12.0599 13.28 13.1099 12.05 14.1699 10.83H14.1999C15.3399 12.48 16.4799 14.14 17.6199 15.79C17.6599 15.84 17.6999 15.84 17.7399 15.84C18.3499 15.84 18.9499 15.84 19.5599 15.84C20.1599 15.84 20.7599 15.84 21.3599 15.84C21.3799 15.84 21.3899 15.84 21.4099 15.84C21.4299 15.84 21.4399 15.84 21.4599 15.84C21.4599 15.83 21.4399 15.81 21.4399 15.8C21.4399 15.79 21.4199 15.77 21.4099 15.76L21.4199 15.75ZM19.7999 15.02C19.5499 15.02 19.3099 15.02 19.0599 15.02C18.7999 15.02 18.5399 15.02 18.2699 15.02C18.2399 15.02 18.1899 14.99 18.1699 14.97C16.5299 12.63 14.8799 10.29 13.2399 7.94C12.2699 6.55 11.2999 5.16 10.3299 3.77C10.3099 3.74 10.2899 3.71 10.2699 3.68C10.3099 3.68 10.3499 3.68 10.3799 3.68C10.8799 3.68 11.3799 3.68 11.8699 3.68C11.9299 3.68 11.9599 3.7 11.9899 3.75C13.4299 5.81 14.8799 7.87 16.3199 9.93C17.4899 11.6 18.6599 13.28 19.8299 14.95C19.8499 14.98 19.8699 15 19.8899 15.02C19.8599 15.02 19.8199 15.02 19.7899 15.02H19.7999Z" fill="#2F2F2F" />
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_23_2754">
                                                                    <rect width="30.17" height="18.65" fill="white" />
                                                                </clipPath>
                                                            </defs>
                                                        </svg></a>
                                                        }
                                                    </div>
                                                    <div>{e.count}</div>
                                                </div>
                                            })
                                        }
                                    </div>
                                </>
                            }
                            {
                                dialogNum == 2 &&
                                <>
                                    <div className="transaction-heading">
                                        <div>TxHash:</div>
                                        <div>Buyer:</div>
                                        <div>Date:</div>
                                        <div>Tickets:</div>
                                    </div>
                                    <div className="transaction-contents flex-col">
                                        {
                                            txs.map((e, i) => <div className="transaction-content" key={i}>
                                                <div><a target="_blank" href={"https://solscan.io/tx/" + e.txHash}>{getAddress(e.txHash)}</a></div>
                                                <div><a target="_blank" href={"https://solscan.io/account/" + e.userId}>{getAddress(e.userId)}</a></div>
                                                <div>{moment.unix(e.purchasedTime / 1000).format('MM/DD hh:mm A')}</div>
                                                <div>{e.ticketCount}</div>
                                            </div>)
                                        }
                                    </div>
                                </>
                            }
                        </div>
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
                {loading && (
                    <div className="loading-overlay">
                        <div className="loader-wrapper">
                            <Oval
                                height="80"
                                visible={true}
                                width="80"
                                color="#CCF869"
                                ariaLabel="oval-loading"
                            />
                        </div>
                    </div>
                )}
            </div>
        </MoonPayProvider>
    )
}