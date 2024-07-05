'use client'
import Image from "next/image";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import MobileHeader from "../components/layout/mheader";
import AboutComponent from "../components/about"

export default function About() {

  return (
    <main className="flex min-h-screen flex-col items-center s-welcome">
      <Header />
      <MobileHeader />
      <AboutComponent />
      <Footer />
    </main>
  );
}
