import Image from "next/image";
import Link from "next/link";
export default function Footer() {
    return (
        <div className="footer">
            <div className="footer-top flex-col">
                <Image
                    src="/images/footer_solucky.svg"
                    alt="Vercel Logo"
                    className="light"
                    sizes="100vw"
                    width={469}
                    height={117}
                />
                <div className="footer-menu">
                    <Link href="/">Home</Link>
                    <Link href="/dashboard">Dashboard</Link>
                    {/* <div>Connect Wallet</div>
                    <div>
                        <Image
                            src="/images/plus.svg"
                            alt="Vercel Logo"
                            className="light"
                            sizes="100vw"
                            style={{
                                width: '100%',
                                height: 'auto',
                            }}
                            width={23}
                            height={23}
                        />
                    </div> */}
                </div>
            </div>
            <div className="footer-bottom">
                Copyright © 2023 - 2023 Solucky. Todos los derechos reservados.
            </div>
        </div>
    )
}