'use client';
import Image from "next/image";
import S_Button from "../common/button"
import { useContext, useState, useEffect, useRef } from "react"
import { TodoContext } from "../../third-provider";

const sort_data = [
    {
        text: "Recently Added",
        value: "recent"
    },
    {
        text: "Expiring Soon",
        value: "expire"
    },
    {
        text: "Price: Low To High",
        value: "price_l_h"
    },
    {
        text: "Price: High To Low",
        value: "price_h_l"
    },
    // {
    //     text: "Flooe:Low To High",
    //     value: "flooe_l_h"
    // },
    // {
    //     text: "Flooe:High To Low",
    //     value: "flooe_h_l"
    // },
]


export default function Filters() {
    const context = useContext(TodoContext);
    const [input, setInput] = useState();
    const [nav, toggleNav] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                toggleNav(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const onChange = (e) => {
        context.setSearchText(e.target.value);
        setInput(e.target.value);
    }
    return (
        <div className="filters">
            <div className="filters-buttons">
                <S_Button click={() => context.setFilterMode(0)} b_name="Featured" color={context.filterMode == 0 ? "#FFFFFF4D" : "transparent"} border={context.filterMode == 0 ? "none" : "1px solid #76ED97"} width="110px" height="42px" t_color="white" />
                <S_Button click={() => context.setFilterMode(1)} b_name="All Raffles" color={context.filterMode == 1 ? "#FFFFFF4D" : "transparent"} border={context.filterMode == 1 ? "none" : "1px solid #76ED97"} width="110px" height="42px" t_color="white" />
                <S_Button click={() => context.setFilterMode(2)} b_name="Past Raffles" color={context.filterMode == 2 ? "#FFFFFF4D" : "transparent"} border={context.filterMode == 2 ? "none" : "1px solid #76ED97"} width="110px" height="42px" t_color="white" />
            </div>
            <div className="filters-info">
                <input
                    className="search-input"
                    value={input}
                    placeholder="&#128269;Search"
                    onChange={onChange}
                />
                <Image
                    src="/images/filter.svg"
                    alt="Vercel Logo"
                    className="light"
                    sizes="100vw"
                    style={{
                        height: 'auto',
                    }}
                    width={44}
                    height={44}
                    onClick={() => { toggleNav(!nav) }}
                />
            </div>
            <div className={(nav ? "show-animation-2 " : " ") + "filter"} ref={navRef}>
                <div className="filter-icon">
                    <Image
                        src="/images/sollucky.svg"
                        alt="Vercel Logo"
                        className="light"
                        sizes="100vw"
                        style={{
                            width: '100%',
                            height: 'auto',
                        }}
                        width={218}
                        height={54}
                    />
                </div>
                <div className="close-button" onClick={() => { toggleNav(!nav) }}>
                    <Image
                        src="/images/close.svg"
                        alt="Vercel Logo"
                        className="light"
                        sizes="100vw"
                        style={{
                            width: '100%',
                            height: 'auto',
                        }}
                        width={55}
                        height={54}
                    />
                </div>
                <div className="filter-menu">
                    <div className="filter-title">Sort</div>
                    {
                        sort_data.map((e, i) => (<div key={i} onClick={() => { context.setFilter(e.value) }}>
                            {e.text}
                        </div>))
                    }
                    <div className="filter-title">Filter</div>
                    <div>
                        <div className="filter-item">
                            {context.tokenRaffle && <Image
                                src="/images/circle.svg"
                                alt="Vercel Logo"
                                className="light"
                                sizes="100vw"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                }}
                                width={55}
                                height={54}
                            />}</div>
                        <div onClick={() => { context.setTokenRaffle(!context.tokenRaffle) }}>&nbsp;Token Raffles</div></div>
                    <div>
                        <div className="filter-item">
                            {context.nftRaffle && <Image
                                src="/images/circle.svg"
                                alt="Vercel Logo"
                                className="light"
                                sizes="100vw"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                }}
                                width={55}
                                height={54}
                            />}</div>
                        <div onClick={() => { context.setNFTRaffle(!context.nftRaffle) }}>&nbsp;NFT Raffles</div></div>
                </div>
            </div>
        </div >
    )
}