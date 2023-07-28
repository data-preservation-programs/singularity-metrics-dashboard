'use client'

import {Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {ViewType} from "@/components/types";

interface SideBarProps {
    drawerWidth: number
    view: ViewType
    setView: (view: ViewType) => void
}

export default function SideBar({drawerWidth, view, setView}: SideBarProps) {
    const views = [
        {
            id: 'overview',
            label: 'Overview',
            icon: (<DashboardIcon/>),
        },
    ]
    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
        >
            <Toolbar/>
            <List>
                {
                    views.map(({id, label, icon}) => (
                        <ListItem key={id} disablePadding >
                            <ListItemButton onClick={() => setView(id as ViewType)} selected={id === view}>
                                <ListItemIcon>
                                    {icon}
                                </ListItemIcon>
                                <ListItemText primary={label}/>
                            </ListItemButton>
                        </ListItem>
                    ))
                }
            </List>
        </Drawer>
    )
}
