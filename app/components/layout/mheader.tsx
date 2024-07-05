import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import S_Button from "../common/button"
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { ToastContainer, toast } from 'react-toastify';

export default function MobileHeader() {
    const router = useRouter();
    const { connected } = useWallet();

    const onClickCreate = useCallback(() => {
        if (!connected) {
            toast.error("Wallet is not connected.", {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return;
        }
        router.push('/create');
    }, [connected, router]);

    return (
        <div className="mobile-header-buttons">
            {/* <S_Button b_name="Auctions" color="#DBEF60" width="93px" height="47px" /> */}
            <S_Button b_name="+" color="#76ED97" width="43px" height="47px" click={onClickCreate}/>
            <WalletMultiButton className="connect-button"></WalletMultiButton>
            
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                stacked
            />
        </div>
    )
}