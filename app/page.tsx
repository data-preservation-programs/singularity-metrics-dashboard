'use client'

import Header from "@/components/header";
import Overview from "@/components/overview";
import OverviewOld from "@/components/overview-old";

import '@styles/settings.scss';

export default function Page() {
  return (
    <main>
      <Header />
      <Overview />
      {/* <OverviewOld /> */}
    </main>
  )
}
