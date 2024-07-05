'use client'
import Image from "next/image";
import Header from "../../../components/layout/header";
import Raffle from "../../../components/raffle";
import Footer from "../../../components/layout/footer";
import { useContext } from "react";
import { TodoContext } from "@/app/third-provider";
import MobileHeader from "@/app/components/layout/mheader";

export default function Home({ params }: { params: { slug: string, image: string } }) {  
  const context = useContext(TodoContext);
  const imageUri = params.image === "undefine" ? "" : decodeURIComponent(params.image);
  const raffle = context.raffles.find(e => e.raffleKey == params.slug);
  return (
    <main className="flex min-h-screen flex-col items-center s-welcome">
      <Header />      
      <MobileHeader />
      {
        raffle ? <Raffle raffle={raffle} image={imageUri}/> : <>Loading</>
      }
      <Footer />
    </main>
  );
}
