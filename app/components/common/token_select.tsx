import Image from "next/image"
import { useState } from "react"
export default function TokenSelect({ tokens, token, setToken }) {
    const handleChange = (e) => {
        setToken(e.target.value);
    }
    return (
        <div className="raffle-text">
            <select value={token} onChange={(e) => { handleChange(e) }} className="token-select-value">
                {
                    tokens.map((e,i) => (
                        <option key={i} value={e.tokenMint}>{e.tokenSymbol}</option>
                    ))
                }
            </select>
        </div>
    )
}