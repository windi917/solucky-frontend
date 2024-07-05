'use client'
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import Create from "../components/creating";
import MobileHeader from "../components/layout/mheader";

export default function Guide() {
  return (
    <main className="flex min-h-screen flex-col items-center s-welcome">
      <Header />
      <MobileHeader />
      <Create />
      <Footer />
    </main>
  );
}
