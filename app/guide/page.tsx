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
import MobileHeader from "../components/layout/mheader";
import BuyerTip from "../components/buyertip";

const YOUR_CLIENT_ID = "1238328515116666920";
const YOUR_CLIENT_SECRET = "2brjrzrSiRViRRb-rPx37A1wWcWGUUdb";
const YOUR_REDIRECT_URI = "https://frontdev.solucky.online/guide/";

export default function Guide() {
  const context = useContext(TodoContext);
  const { user, setUser } = context;
  useEffect(() => {
    // Get code from URL
    const url = window.location.href;
    const hasCode = url.includes("?code=");

    if (hasCode) {
      const newUrl = url.split("?code=");
      window.history.pushState({}, null, newUrl[0]);

      const requestData = {
        client_id: YOUR_CLIENT_ID,
        client_secret: YOUR_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: newUrl[1],
        redirect_uri: YOUR_REDIRECT_URI,
        scope: 'identify'
      };

      // Request for token
      axios.post('https://discord.com/api/oauth2/token', new URLSearchParams(requestData), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then(response => {
          axios.get('https://discord.com/api/users/@me', {
            headers: {
              'Authorization': `Bearer ${response.data.access_token}`
            }
          })
            .then(async response => {
              let d_user = response.data;
              const new_name = d_user.username + "#" + d_user.discriminator;
              const tempUser = getFromLocalStorage("tempStore");
              let newUser = { ...tempUser, name: new_name, discord: new_name };
              await updateUser(tempUser.id, newUser)
              setUser(newUser);
            })
            .catch(console.error);
        })
        .catch(console.error);
    }
  }, [setUser]);
  return (
    <main className="flex min-h-screen flex-col items-center s-welcome">
      <Header />
      <MobileHeader />
      <BuyerTip />
      <Footer />
    </main>
  );
}
