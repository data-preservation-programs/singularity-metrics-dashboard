'use client'
import {useState} from "react";
import {ViewType} from "@/components/types";
import {Box} from "@mui/material";
import SideBar from "@/components/SideBar";
import Dashboard from "@/components/Dashboard";

export default function Page() {
  const drawerWidth = 200;
  const [view, setView] = useState<ViewType>('overview')
  return (
    <main>
      <Box>
        <SideBar view={view} setView={setView} drawerWidth={drawerWidth}/>
        <Box sx={{marginLeft: `${drawerWidth}px`}}>
          <Dashboard
              view={view}
          />
        </Box>
      </Box>
    </main>
  )
}
