'use client'
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import { useContext, useEffect, useState, useCallback } from "react";
import { TodoContext } from "../third-provider";
import SELECT_NFT from "../components/sub-layout/selectnft";
import { useWallet } from "@solana/wallet-adapter-react";
import { RaffleItem } from "../utils/type";
import { solConnection } from "../utils/util";
import { getParsedAccountByMint, getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import axios from "axios";

export default function Guide() {
  const context = useContext(TodoContext);
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [nfts, setNfts] = useState<RaffleItem[]>([]);

  const getAllNfts = useCallback(async () => {
    if (wallet.publicKey === null) return;
    setIsLoading(true);
    try {
      const nftList: RaffleItem[] = [];      
      const originList = await getParsedNftAccountsByOwner({
        publicAddress: wallet.publicKey.toBase58(),
        connection: solConnection,
      });

      console.log("originList", originList);

      const uriPromises = originList.map((item) =>
        axios.get(item.data.uri).catch((error) => ({ error }))
      );

      const uriData = await Promise.allSettled(uriPromises);

      const responseData = uriData.map((result: any) => {
        if (result.status === "fulfilled") {
          return result.value.data;
        } else {
          console.log("Error fetching URI:", result.reason);
          return null; // or handle the error as needed
        }
      });

      for (let i = 0; i < originList.length; i++) {
        nftList.push({
          mint: originList[i].mint,
          raffleKey: "",
          collection: "",
          name: originList[i].data.name,
          price: 0,
          token: "",
          tokenDecimal: 9,
          image: responseData[i]?.image,
          creator: "",
          endTimeStamp: 0,
          createdTimeStamp: 0,
          totalTickets: 0,
          purchasedTickets: 0,
          verified: true,
        });
      }

      console.log("nftList", nftList);
      setNfts(nftList);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }, [wallet]);

  useEffect(() => {
    getAllNfts();
  }, [getAllNfts]);

  return (
    <main className="flex min-h-screen flex-col items-center s-welcome">
      <Header />
      <SELECT_NFT nfts={nfts} />
      <Footer />
    </main>
  );
}
