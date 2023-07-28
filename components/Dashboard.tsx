'use client'

import {ViewType} from "@/components/types";
import Overview from "@/components/Overview";

export interface DashboardProps {
    view: ViewType
}

export default function Dashboard({
                                      view,
                                  }: DashboardProps) {
    switch(view) {
        case 'overview':
            return (
                <Overview />
            )
    }
    return (
        <></>
    )
}
