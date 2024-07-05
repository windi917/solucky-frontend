import Image from "next/image";
import S_Button from "../common/button";
import { useContext } from "react";
import { TodoContext } from "@/app/third-provider";
import { useRouter } from "next/navigation";


export default function SELECT_NFT({ nfts }) {
    const context = useContext(TodoContext);
    const router = useRouter();
    const setNFT = (nft: any) => {
        context.setCurrnetNFT(nft);
        router.push('/create');
    }
    return (
        <div className="selectnft">
            {
                nfts.map((e, i) => {
                    return (
                        <div className="selectnft-item" key={i}>
                            <Image
                                src={e.image}
                                alt="Vercel Logo"
                                className="light"
                                sizes="100vw"
                                style={{
                                    width: '240px',
                                    height: 'auto',
                                }}
                                width={350}
                                height={500}
                            />
                            <div className="selectnft-title">
                                {e.name}
                            </div>
                            <S_Button b_name="Select" color="#DBEF60" width="90px" height="31px" click={() => { setNFT(e) }} />
                        </div>
                    )
                })
            }
        </div >
    )
}