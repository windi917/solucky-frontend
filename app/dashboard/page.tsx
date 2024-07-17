'use client'
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import Branding from "../components/sub-layout/branding";
import Splitter from "../components/layout/splitter";
import Filters from "../components/sub-layout/filters";
import DashboardRaffles from "../components/sub-layout/dashboardraffle";
import { useContext, useEffect, useState, useCallback } from "react";
import { TodoContext } from "../third-provider";
import MobileHeader from "../components/layout/mheader";
import { useRouter } from "next/navigation";
import { getAllTokens, getMetadataPDA } from "../solana/transaction";
import { PublicKey } from "@solana/web3.js";

export default function Home() {
  const router = useRouter();
  const wallet = useAnchorWallet();
  const context = useContext(TodoContext);
  const { tokenRaffle, nftRaffle } = context;

  const [tokens, setTokens] = useState([]);

  let raffles;

  const getTokens = useCallback(async () => {
    const res = await getAllTokens(wallet);
    setTokens(res);

    // const metaData = await getMetadataPDA(new PublicKey('Du3Ub2xM52stut1DSa9o8iCBXtwYSmVfiFqdYehJhcdK'));
    // console.log("################", metaData)
  }, [wallet]);

  useEffect(() => {
    getTokens();
  }, [getTokens])

  const baseRaffles = context.raffles;

  //SearchText Filter
  if (context.searchText != "")
    raffles = baseRaffles.filter(e => {
      const token = tokens.find((token) => token.tokenMint === e.token_mint);

      if (token)
        return e.raffleKey.indexOf(context.searchText) >= 0 ||
          e.creator.indexOf(context.searchText) >= 0 ||
          e.token_mint.indexOf(context.searchText) >= 0 ||
          token.tokenName.indexOf(context.searchText) >= 0 ||
          token.tokenSymbol.indexOf(context.searchText) >= 0
      else
        return e.raffleKey.indexOf(context.searchText) >= 0 ||
          e.creator.indexOf(context.searchText) >= 0 ||
          e.token_mint.indexOf(context.searchText) >= 0
    })
  else
    raffles = baseRaffles;

  //NFT and Raffle Filter
  raffles = raffles.filter(e => {
    if ((!nftRaffle && e.token_amount == 0) || (!tokenRaffle && e.token_amount))
      return false;
    return true;
  })

  //Filter by Filter Mode
  if (context.filterMode === 0) {
    raffles = raffles.filter(e => {
      const curTime = new Date();
      const startTime = new Date(e.start_timestamp * 1000);
      const endTime = new Date(e.end_timestamp * 1000);

      if (curTime > startTime && curTime < endTime)
        return true;
      return false;
    })
  } else if (context.filterMode === 2) {
    raffles = raffles.filter(e => {
      const curTime = new Date();
      const startTime = new Date(e.start_timestamp * 1000);
      const endTime = new Date(e.end_timestamp * 1000);

      if (curTime > endTime)
        return true;
      return false;
    })
  }

  // sort
  if (context.filter === "expire") {
    raffles.sort((a, b) => a.end_timestamp - b.end_timestamp);
  } else if (context.filter === "price_l_h") {
    raffles.sort((a, b) => a.ticket_price - b.ticket_price);
  } else if (context.filter === "price_h_l") {
    raffles.sort((a, b) => b.ticket_price - a.ticket_price);
  } else if (context.filter === "flooe_l_h") {

  } else if (context.filter === "flooe_h_l") {

  }

  console.log("###########", raffles)

  return (
    <main className="flex min-h-screen flex-col items-center s-welcome">
      <Header />
      <MobileHeader />
      <Branding />
      <Splitter />
      <Filters />
      <Splitter />
      <div className="scrollable-section">
        <DashboardRaffles raffles={raffles} />
      </div>
      <Footer />
    </main>
  );
}
