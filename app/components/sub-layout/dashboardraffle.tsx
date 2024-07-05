import Image from "next/image";
import S_Button from "../common/button";
import { MYPRO_ID } from "../../config";
import { useRouter } from 'next/navigation'
import { getAddress, solConnection } from "../../utils/util";
import { useCallback, useEffect, useState } from "react";
import { getParsedAccountByMint, getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { RaffleItem } from "../../utils/type";
import axios, { AxiosResponse } from "axios";
import { globalAuthority } from "@/app/solana/transaction";
import { getAllFTokens, getMetadataPDA } from "@/app/solana/transaction";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export default function DashboardRaffles({ raffles }) {

    const wallet = useAnchorWallet();

    const [nfts, setNfts] = useState<RaffleItem[]>([]);
    const [tokens, setTokens] = useState([]);
    const router = useRouter();

    const getTokens = useCallback(async () => {
        const fts = await getAllFTokens(wallet);
        setTokens(fts);
    }, [setTokens, wallet]);

    useEffect(() => {
        getTokens();
    }, [getTokens])

    useEffect(() => {

    }, [nfts])
    const getProgramNFTs = useCallback(async () => {
        const nftList: RaffleItem[] = [];

        for (let i = 0; i < raffles.length; i++) {
            if (raffles[i].token_amount != 0)
                continue;

            const metadata = await getMetadataPDA(new PublicKey(raffles[i].token_mint));
            const uriPromises: AxiosResponse<any> | { error: any } = await axios.get(metadata.data.uri.replace(/\u0000/g, ""))
                .catch((error) => ({ error }));

            const response = uriPromises as AxiosResponse<any>;
            nftList.push({
                mint: metadata.mint.toBase58(),
                raffleKey: "",
                collection: "",
                name: metadata.data.name.replace(/\u0000/g, ""),
                price: 0,
                token: "",
                tokenDecimal: 9,
                image: response.data.image,
                creator: "",
                endTimeStamp: 0,
                createdTimeStamp: 0,
                totalTickets: 0,
                purchasedTickets: 0,
                verified: true,
            });
        }

        setNfts(nftList);

        // const nftList: RaffleItem[] = [];
        // const globalAuth = await globalAuthority();
        // const originList = await getParsedNftAccountsByOwner({
        //     publicAddress: globalAuth,
        //     connection: solConnection,
        // });
        // const uriPromises = originList.map((item) =>
        //     axios.get(item.data.uri).catch((error) => ({ error }))
        // );

        // const uriData = await Promise.allSettled(uriPromises);

        // const responseData = uriData.map((result: any) => {
        //     if (result.status === "fulfilled") {
        //         return result.value.data;
        //     } else {
        //         console.log("Error fetching URI:", result.reason);
        //         return null; // or handle the error as needed
        //     }
        // });

        // for (let i = 0; i < originList.length; i++) {
        //     nftList.push({
        //         mint: originList[i].mint,
        //         raffleKey: "",
        //         collection: "",
        //         name: originList[i].data.name,
        //         price: 0,
        //         token: "",
        //         tokenDecimal: 9,
        //         image: responseData[i]?.image,
        //         creator: "",
        //         endTimeStamp: 0,
        //         createdTimeStamp: 0,
        //         totalTickets: 0,
        //         purchasedTickets: 0,
        //         verified: true,
        //     });
        // }
    }, [raffles]);
    useEffect(() => {
        getProgramNFTs();
    }, [getProgramNFTs])
    return (
        <div className="draffles">
            {
                raffles.map((e, i) => {
                    const findTokens = tokens?.filter(tk => tk.tokenMint == e.ticket_token_program);
                    if (!findTokens || findTokens.length <= 0)
                        return <></>
                    const token = findTokens[0];
                    const _nft = nfts.find(nft => nft.mint === e.token_mint);
                    return (
                        <div className="horizontal-scroll-wrapper" key={i}>
                            <div className="draffle">
                                <div className="draffle-image">
                                    {
                                        e.token_amount == 0 ? ( // show NFT
                                            <Image
                                                src={_nft?.image}
                                                alt="Vercel Logo"
                                                className="light"
                                                sizes="100vw"
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                }}
                                                width={255}
                                                height={255}
                                            />

                                        ) : ( // Show USDT or USDC etc...
                                            <Image
                                                src={"https://exponential.imgix.net/icons/assets/USDT_color.jpg?auto=format&fit=max&w=256"}
                                                alt="Vercel Logo"
                                                className="light"
                                                sizes="100vw"
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                }}
                                                width={255}
                                                height={255}
                                            />
                                        )
                                    }
                                    <div className="draffle-active">
                                        <Image
                                            src={e.active ? "/images/n-active.svg" : "/images/n-inactive.svg"}
                                            alt="Vercel Logo"
                                            className="light"
                                            sizes="100vw"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                            }}
                                            width={26}
                                            height={26}
                                        />
                                    </div>
                                </div>
                                <div className="draffle-info">
                                    <div className="collection">{getAddress(e.raffleKey)}</div>
                                    <div className="name">{e.token_amount ? getAddress(e.token_mint) : _nft?.name}</div>
                                    <div className="author">Creator: {getAddress(e.creator)}</div>
                                    <div className="justify-between">
                                        <div className="flex-col">
                                            <div className="remaining">Tickets Remaining</div>
                                            {e.count == e.max_entrants ? (<div className="sold-out">SOLD OUT</div>) : (<div className="number">{e.max_entrants - e.count}/{e.max_entrants}</div>)}
                                        </div>
                                        <div className="flex-col">
                                            <div className="price">Price/Ticket</div>
                                            {
                                                <span className="number">{e.ticket_price / (10 ** token.decimal)} {token?.tokenSymbol}</span>
                                            }
                                        </div>
                                    </div>
                                    <S_Button click={() => router.push('/raffle/' + e.raffleKey + "/" + (_nft ? encodeURIComponent(_nft?.image) : "undefine/"))} b_name="View Raffle" color="#DBEF60" width="105px" height="31px" />
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div >
    )
}