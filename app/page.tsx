'use client';
import Image from "next/image";
import S_Button from "./components/common/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-around p-24 s-welcome">
      <div>
        <Image
          src="/images/logo.svg"
          alt="Vercel Logo"
          className="light"
          sizes="100vw"
          style={{
            width: '100%',
            height: 'auto',
          }}
          width={1187}
          height={469}
        />
      </div>
      <S_Button b_name="Raffle" color="#DBEF60" width="153px" height="47px" click={()=>{router.push("/dashboard")}}/>      
    </main>
  );
}
