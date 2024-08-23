'use client'
import Image from "next/image";
import Header from "../../components/layout/header";
import Raffle from "../../components/raffle";
import Footer from "../../components/layout/footer";
import { useState, useContext, useEffect, useCallback } from "react";
import { TodoContext } from "@/app/third-provider";
import MobileHeader from "@/app/components/layout/mheader";
import { getMetadataPDA } from "@/app/solana/transaction";
import { PublicKey } from "@solana/web3.js";
import axios, { AxiosResponse } from "axios";

export default function Home({ params }: { params: { slug: string } }) {

  const [imageUri, setImageUri] = useState('');
  const context = useContext(TodoContext);
  const raffle = context.raffles.find(e => e.raffleKey == params.slug);

  const getProgramNFTs = useCallback(async () => {
      const metadata = await getMetadataPDA(new PublicKey(raffle.token_mint));
      const uriPromises: AxiosResponse<any> | { error: any } = await axios.get(metadata.data.uri.replace(/\u0000/g, ""))
        .catch((error) => ({ error }));

      const response = uriPromises as AxiosResponse<any>;
      setImageUri(response.data.image);
  }, [raffle]);

  useEffect(() => {
    getProgramNFTs();
  }, [getProgramNFTs])

  return (
    <main className="flex min-h-screen flex-col items-center s-welcome">
      <Header />
      <MobileHeader />
      {
        raffle ? <Raffle raffle={raffle} image={imageUri} /> : <>Loading</>
      }
      <Footer />
    </main>
  );
}
