'use client';
import Image from "next/image";
import S_Button from "./common/button";
import { useContext, useEffect, useCallback, useState } from "react";

import { getAddress } from "../utils/util";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import DashboardRaffles from "./sub-layout/dashboardraffle";
import { TodoContext } from "../third-provider";
import DiscordAuthButton from "./common/DiscordButton";
import TwitterAuthButton from "./common/TwitterButton";
import { getUserByWallet, createUser } from "../api/user";


type Props = {
    addr: string;
};

export default function MyProfile({ walletAddress }: Props) {
    const context = useContext(TodoContext);
    const { user, setUser } = context;
    const wallet = useAnchorWallet();
    const [filter, setFilter] = useState("created");
    const [sort, setSort] = useState("latest");
    const [dialogNum, setDialogNum] = useState(0);
    const { publicKey, connected } = useWallet();


    let raffles = [];
    if (dialogNum == 0) raffles = context.raffles.filter(e => e.creator == walletAddress);
    if (dialogNum == 1) raffles = context.raffles.filter(e => e.entrants.indexOf(walletAddress) >= 0);

    const getUserInfo = useCallback(async () => {
        try {
            const res = await getUserByWallet(walletAddress);
            setUser(res);
        } catch (error) {
            const new_user = {
                name: "unknown",
                twitter: "unknown",
                discord: "unknown",
                followers: 0,
                following: 0,
                wallet: walletAddress,
                transactions: []
            }
            const res = await createUser(new_user)
            setUser(new_user);
        }
    }, [setUser, walletAddress]);
    useEffect(() => {
        getUserInfo();
    }, [getUserInfo])

    return (
        <div className="profile-detail">
            <div className="profile-detail-left flex-col">
                <div className="profile-raffle">RAFFLE</div>
                <div className="profile-info flex-col">
                    <div className="profile-info-title">
                        <div className="profile-name">{user.name != "unknown" ? user.name : (user.wallet ? getAddress(user.wallet) : "")}&nbsp;</div>
                        <Image
                            src="/images/solana.svg"
                            alt="Vercel Logo"
                            className="light"
                            sizes="100vw"
                            style={{
                                height: 'auto',
                            }}
                            width={28}
                            height={21}
                        />
                    </div>
                    <div className="justify-around">
                        {
                            publicKey?.toBase58() == walletAddress ?
                                <>
                                    {user.twitter == "unknown" ? <TwitterAuthButton user={user} setUser={setUser} /> : <div>{user.twitter}</div>}
                                    {user.discord == "unknown" ? <DiscordAuthButton user={user} setUser={setUser} /> : <div>{user.discord}</div>}
                                </> :
                                <>
                                    <S_Button b_name="Follow" color="#DBEF60" width="123px" height="47px" t_color="#1A2828" />
                                </>
                        }
                    </div>
                </div>
                <div className="profile-filter-group flex-col">
                    {/* <S_Button click={() => setDialogNum(0)} b_name="Raffle Created" color={dialogNum == 0 ? "#FFFFFF4D" : "transparent"} border={dialogNum == 0 ? "none" : "1px solid #76ED97"} height="42px" t_color="white" /> */}
                    <S_Button click={() => setDialogNum(1)} b_name="Raffle Purchased" color={dialogNum == 1 ? "#FFFFFF4D" : "transparent"} border={dialogNum == 1 ? "none" : "1px solid #76ED97"} height="42px" t_color="white" />
                    {/* <S_Button click={() => setDialogNum(2)} b_name="Favorite" color={dialogNum == 2 ? "#FFFFFF4D" : "transparent"} border={dialogNum == 2 ? "none" : "1px solid #76ED97"} height="42px" t_color="white" /> */}
                    <S_Button click={() => setDialogNum(3)} b_name="Followed" color={dialogNum == 3 ? "#FFFFFF4D" : "transparent"} border={dialogNum == 3 ? "none" : "1px solid #76ED97"} height="42px" t_color="white" />
                </div>
            </div>
            <div className="profile-detail-right">
                <DashboardRaffles raffles={raffles} />
            </div>
        </div>
    )
}