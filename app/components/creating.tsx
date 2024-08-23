import Image from "next/image";
import S_Button from "./common/button";
import SpinButton from "./common/spinbutton";
import { useState } from "react";
import TokenSelect from "./common/token_select";
import { DAY } from "../config";
import { ToastContainer, toast } from 'react-toastify';
import { createRaffle } from "../solana/transaction";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import { useContext, useEffect, useCallback } from "react";
import { TodoContext } from "../third-provider";
import { useRouter } from "next/navigation";
import { getAllFTokens } from "../solana/transaction";
import { Oval } from "react-loader-spinner";


export default function Create() {

    const router = useRouter();
    const wallet = useAnchorWallet();
    const { connected } = useWallet();
    const context = useContext(TodoContext)

    const { currentNFT } = context;

    const [input, setInput] = useState(new Date().toISOString());
    const [token, setToken] = useState(0);
    const [rtoken, setRToken] = useState(null);
    const [ticket, setTicket] = useState(0);
    const [price, setPrice] = useState(0);
    const [ttoken, setTToken] = useState(null);
    const [tokens, setTokens] = useState([]);

    const [loading, setLoading] = useState(false);

    const getTokens = useCallback(async () => {
        const fts = await getAllFTokens(wallet);
        setTokens(fts);
        setTToken(fts[0].tokenMint)
        setRToken(fts[1].tokenMint)
    }, [wallet]);

    useEffect(() => {
        getTokens();
    }, [getTokens])


    const onChange = (e) => {
        setInput(e.target.value);
    }
    const onCreate = async () => {
        //Check Whether NFT is selected First

        // await initProject(wallet);

        let error = "";
        let d = new Date(input);
        let current = new Date();
        if (token <= 0 && !currentNFT) {
            error = "Please insert raffle token amount correctly!"
        }
        else if (ticket <= 0) {
            error = "Please insert ticket count correctly!"
        }
        else if (price <= 0) {
            error = "Please insert ticket price correctly!"
        }
        else if ((d.getTime() - current.getTime()) <= DAY) {
            console.log((d.getTime() - current.getTime()));
            error = "Raffle period should be longer than one day"
        }
        if (error != "") {
            toast.error(error, {
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
        console.log("currentNFT, rtoken, ttoken", currentNFT, rtoken, ttoken)
        const res = await createRaffle(
            wallet,
            new PublicKey(currentNFT ? currentNFT.mint : rtoken),
            token,
            new PublicKey(ttoken),
            price, // price
            d.getTime() / 1000,
            ticket, // count
            setLoading
        );

        if ( res?.success === false ) {
            toast.error("Create Raffle Error!");
        } else {
            toast.success("Create Raffle Success!");
        }
    }
    return (
        <div className="creating flex-col max-w-screen-xl" style={{ height: '100%', overflow: 'auto' }}>
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
            <div className="create-raffle-title">CREATE RAFFLE</div>
            <div className="creating-info">
                <div className="creating-info-left flex-col">
                    <div className="justify-center">
                        {
                            !currentNFT || token ? (
                                <div onClick={() => { router.push("/select-nft") }}>
                                    <Image
                                        src="/images/create-raffle.svg"
                                        alt="Vercel Logo"
                                        className="light"
                                        sizes="100vw"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                        }}
                                        width={429}
                                        height={280}
                                    />
                                </div>
                            ) : (
                                <div className="selectnft-item">
                                    <Image
                                        src={currentNFT.image}
                                        alt="Vercel Logo"
                                        className="light"
                                        sizes="100vw"
                                        style={{
                                            width: '240px',
                                            height: 'auto',
                                        }}
                                        width={350}
                                        height={500}
                                    />
                                    <div className="selectnft-title">
                                        {currentNFT.name}
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <div className="justify-center">
                        OR
                    </div>
                    <div className="flex-col raffle-tokens">
                        <div className="raffle-token-title">
                            Raffle Tokens
                        </div>
                        <div className="raffle-token-info">
                            <div className="raffle-token-select">
                                <SpinButton number={token} setNumber={setToken} />
                            </div>
                            <div className="raffle-token-amount">
                                <TokenSelect tokens={tokens.slice(1)} token={rtoken} setToken={setRToken} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="creating-info-right flex-col">
                    <div className="creating-raffle-info flex-col">
                        <div className="creating-raffle-date flex-col">
                            <div className="pb-2 raffle-text">
                                Raffle End Date
                            </div>
                            <div>
                                <input
                                    className="search-input"
                                    type="datetime-local"
                                    value={input}
                                    placeholder="&#128269;Search"
                                    onChange={onChange}
                                />
                            </div>
                        </div>
                        <div className="creating-raffle-detail flex-col">
                            <div className="creating-raffle-setting justify-between align-end">
                                <div className="flex-col">
                                    <div className="pb-2 raffle-text">
                                        Count
                                    </div>
                                    <div>
                                        <SpinButton number={ticket} setNumber={setTicket} />
                                    </div>
                                </div>
                                <div className="flex-col">
                                    <div className="pb-2 raffle-text">
                                        Ticket Price
                                    </div>
                                    <div>
                                        <SpinButton number={price} setNumber={setPrice} />
                                        <div className="pl-3 raffle-text" style={{ alignItems: 'center' }}>
                                            Sol
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="creating-raffle-button justify-end">
                                <S_Button b_name="Create Raffle" color="#DBEF60" width="121px" height="47px" click={onCreate} />
                            </div>
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
                </div>
            </div>
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
    )
}