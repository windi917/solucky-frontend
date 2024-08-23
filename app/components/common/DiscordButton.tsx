import React, { useState, useEffect } from 'react';
import axios from 'axios';
import S_Button from './button';
import { updateUser, getUserByWallet } from '@/app/api/user';
import { saveToLocalStorage, getFromLocalStorage } from './localStorage';

require('dotenv').config();

const YOUR_CLIENT_ID = "1276261459763920977";
const YOUR_REDIRECT_URI = `${process.env.NEXT_PUBLIC_FRONTEND}/guide/`;

const DiscordAuthButton = ({ user, setUser }) => {
    const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${YOUR_CLIENT_ID}&redirect_uri=${encodeURIComponent(YOUR_REDIRECT_URI)}&response_type=code&scope=identify`;    

    const loginwithDiscord = () => {
        saveToLocalStorage("tempStore", user);
        window.location.href = discordLoginUrl;
    }

    return (
        <div>
            <S_Button click={loginwithDiscord} b_name="Link Discord" color="#76ED97" width="123px" height="47px" t_color="#1A2828" />
        </div>
    );
}

export default DiscordAuthButton;