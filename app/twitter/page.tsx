'use client'
import Image from "next/image";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import Branding from "../components/sub-layout/branding";
import Splitter from "../components/layout/splitter";
import Filters from "../components/sub-layout/filters";
import DashboardRaffles from "../components/sub-layout/dashboardraffle";
import { useContext, useEffect, useState } from "react";
import { TodoContext } from "../third-provider";
import axios from "axios";
import { updateUser } from "../api/user";
import { getFromLocalStorage } from "../components/common/localStorage";


export default function Guide() {
  const context = useContext(TodoContext);
  const { user, setUser } = context;
  
  const add_twitter_username = useCallback(async () => {
    const url = window.location.href;
    const hasCode = url.includes("?code=");

    if (hasCode) {
      const newUrl = url.split("?code=");
      const tempUser = getFromLocalStorage("tempStore");
      let newUser = { ...tempUser, twitter: url[1] };
      await updateUser(tempUser.id, newUser)
      setUser(newUser);
    }
  }, [setUser]);

  useEffect(() => {
    add_twitter_username();
  }, [add_twitter_username]);
  return (
    <main className="flex min-h-screen flex-col items-center s-welcome">
      <Header />
      <div>TWITTER return PAGE</div>
      <Footer />
    </main>
  );
}
