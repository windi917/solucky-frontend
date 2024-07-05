import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
require("@solana/wallet-adapter-react-ui/styles.css");
import ThirdProvider from "./third-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solucky",
  description: "Solucky Raffle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdProvider>{children}</ThirdProvider>
      </body>
    </html>
  );
}
