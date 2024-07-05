'use client'
import Header from "../../components/layout/header";
import Footer from "../../components/layout/footer";
import { useContext, useEffect, useState } from "react";
import { TodoContext } from "../../third-provider";
import MyProfile from "@/app/components/profile";
import MobileHeader from "../../components/layout/mheader";
import { getFromLocalStorage } from "@/app/components/common/localStorage";
import { useRouter } from "next/navigation";

export default function Profile({ params }: { params: { wallet: string } }) {
  const router = useRouter();
  const context = useContext(TodoContext);  
  return (
    <main className="flex min-h-screen flex-col items-center s-welcome">
      <Header />
      <MobileHeader />
      <MyProfile walletAddress={params.wallet} />
      <Footer />
    </main>
  );
}
