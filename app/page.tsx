'use client'

import Header from "@/components/header";
import Footer from "@/components/footer";
import Dashboard from "@/components/dashboard";

import '@styles/settings.scss';

export default function Page() {
  return (
    <main>
      <Header />
      <Dashboard />
      <Footer />
    </main>
  )
}
