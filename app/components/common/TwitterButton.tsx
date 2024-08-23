import React, { useState, useEffect } from 'react';
import axios from 'axios';
import S_Button from './button';
import { updateUser, getUserByWallet } from '@/app/api/user';
import { saveToLocalStorage, getFromLocalStorage } from './localStorage';

require('dotenv').config();

const TwitterAuthButton = ({ user, setUser }) => {
    const twitterLoginURL = `${process.env.NEXT_PUBLIC_BACKEND}/auth/twitter`;

    const loginwithTwitter = async () => {
        saveToLocalStorage("tempStore", user);
        window.location.href = `${twitterLoginURL}?user_id=${user.id}`;

        // const data = { user_id: user.id }
        // const response = await fetch(twitterLoginURL, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data),
        // });
    
        // const response = await axios.post(twitterLoginURL, { user_id: user.id }, { withCredentials: true });
        // console.log("############", response)
        // window.location.href = twitterLoginURL + '/callback'; // Redirect to Twitter auth
    }

    return (
        <div>
            <S_Button click={loginwithTwitter} b_name="Link Twitter" color="#DBEF60" width="123px" height="47px" t_color="#1A2828" />
        </div>
    );
}

export default TwitterAuthButton;