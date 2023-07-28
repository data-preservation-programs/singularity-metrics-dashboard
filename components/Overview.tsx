'use client'


import {useEffect, useState} from "react";
import {CircularProgress, Grid, Paper, Typography} from "@mui/material";
import {CarRow, DealRow, Version} from "@/app/api/types";
import {ResponsiveLine} from "@nivo/line";
import byteSize from 'byte-size'
import {ResponsiveBar} from "@nivo/bar";

export default function Overview() {
    const [count, setCount] = useState(0)
    const [fileSize, setFileSize] = useState(0)
    const [numOfFiles, setNumOfFiles] = useState(0)
    const [pieceSize, setPieceSize] = useState(0)
    const [dailyPrepared, setDailyPrepared] = useState<{ id: Version, data: { x: string, y: number }[] }[]>([])
    const [totalPrepared, setTotalPrepared] = useState<{ id: Version, data: { x: string, y: number }[] }[]>([])

    const [proposed, setProposed] = useState(0)
    const [active, setActive] = useState(0)
    const [activeQap, setActiveQap] = useState(0)
    const [clients, setClients] = useState<Set<string>>(new Set())
    const [dailySealed, setDailySealed] = useState<{ id: Version, data: { x: string, y: number }[] }[]>([])
    const [totalSealed, setTotalSealed] = useState<{ id: Version, data: { x: string, y: number }[] }[]>([])
    const [monthlySealed, setMonthlySealed] = useState<{ [key: string]: string | number }[]>([])

    useEffect(() => {
        fetch('/api/global?type=carsGlobal').then(res => res.json()).then((cars: CarRow[]) => {
            let count = 0
            let fileSize = 0
            let numOfFiles = 0
            let pieceSize = 0
            const dailyPreparedMap: { [key in Version]: { x: string, y: number }[] } = {"v1": [], "v2": []}
            const totalPreparedMap: { [key in Version]: { x: string, y: number }[] } = {"v1": [], "v2": []}
            for (const car of cars) {
                count += car.count
                fileSize += car.fileSize
                numOfFiles += car.numOfFiles
                pieceSize += car.pieceSize
                dailyPreparedMap[car.version].push({x: car.date, y: car.pieceSize})
                totalPreparedMap[car.version].push({x: car.date, y: car.pieceSize + totalPreparedMap[car.version].slice(-1)[0]?.y || 0})
            }
            setCount(count)
            setFileSize(fileSize)
            setNumOfFiles(numOfFiles)
            setPieceSize(pieceSize)
            setDailyPrepared([{id: 'v1', data: dailyPreparedMap["v1"]}, {id: 'v2', data: dailyPreparedMap["v2"]}])
            setTotalPrepared([{id: 'v1', data: totalPreparedMap["v1"]}, {id: 'v2', data: totalPreparedMap["v2"]}])
        })
    }, [])

    useEffect(()=>{
        fetch('/api/global?type=dealsGlobal').then(res => res.json()).then((deals: DealRow[]) => {
            const clients = new Set<string>()
            let proposed = 0
            let active = 0
            let activeQap = 0
            const dailySealedMap: { [key in Version]: { x: string, y: number }[] } = {"v1": [], "v2": []}
            const totalSealedMap: { [key in Version]: { x: string, y: number }[] } = {"v1": [], "v2": []}
            const monthlySealedPerClientMap = new Map<string, {[id:string]:number}>()
            for (const deal of deals) {
                clients.add(deal.client)
                if (deal.state === 'active') {
                    active += deal.pieceSize
                    activeQap += deal.qap
                }
                proposed += deal.pieceSize
                if (deal.date < '2022-10-01') {
                    continue
                }
                dailySealedMap[deal.version].push({x: deal.date, y: deal.pieceSize})
                totalSealedMap[deal.version].push({x: deal.date, y: deal.pieceSize + totalSealedMap[deal.version].slice(-1)[0]?.y || 0})
                const month = deal.date.slice(0, 7)
                if (!monthlySealedPerClientMap.has(month)) {
                    monthlySealedPerClientMap.set(month, {})
                }
                const monthlySealedPerClient = monthlySealedPerClientMap.get(month)!
                if (!monthlySealedPerClient[deal.client]) {
                    monthlySealedPerClient[deal.client] = 0
                }
                monthlySealedPerClient[deal.client] += deal.pieceSize
            }
            setClients(clients)
            setProposed(proposed)
            setActive(active)
            setActiveQap(activeQap)
            setDailySealed([{id: 'v1', data: dailySealedMap["v1"]}, {id: 'v2', data: dailySealedMap["v2"]}])
            setTotalSealed([{id: 'v1', data: totalSealedMap["v1"]}, {id: 'v2', data: totalSealedMap["v2"]}])
            const monthlySealed: {[key: string]: string | number}[] = []
            for (const [month, monthlySealedPerClient] of monthlySealedPerClientMap) {
                monthlySealed.push({...monthlySealedPerClient, month})
            }
            setMonthlySealed(monthlySealed)
        })
    }, [])
    return (
        <div>
            <Grid container spacing={10} p={3}>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Number of CAR prepared
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {count === 0 ? (<CircularProgress />) : count.toLocaleString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Number of Files prepared
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {numOfFiles === 0 ? (<CircularProgress />) : numOfFiles.toLocaleString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Total Data Size prepared
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {fileSize === 0 ? (<CircularProgress />) : byteSize(fileSize).toString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Total Piece Size prepared
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {pieceSize === 0 ? (<CircularProgress />) : byteSize(pieceSize).toString()}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
            <Grid container spacing={10} p={3}>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Number of Clients
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {clients.size === 0 ? (<CircularProgress />) : clients.size.toLocaleString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Deals Proposed
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {proposed === 0 ? (<CircularProgress />) : byteSize(proposed).toString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Deals Active
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {active === 0 ? (<CircularProgress />) : byteSize(active).toString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            QAP Onboarded
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {activeQap === 0 ? (<CircularProgress />) : byteSize(activeQap).toString()}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
            <Grid container spacing={10} p={3}>
                <Grid item md={6}>
                    <Paper elevation={4} sx={{height: 600}}>
                        <Typography variant="h6" align={'center'}>
                            Daily Data Prepared
                        </Typography>
                        <ResponsiveLine
                          data={dailyPrepared}
                          margin={{top: 20, right: 20, bottom: 60, left: 70}}
                          curve={'monotoneX'}
                          enableSlices={"x"}
                          yScale={{type: 'linear', min: 0, max: 'auto', nice: true, stacked: true}}
                          axisLeft={{
                              legendPosition: 'middle',
                              legendOffset: -40,
                              format: (value: number) => byteSize(value).toString(),
                          }}
                          enableArea={true}
                          yFormat={(value: any) => byteSize(value).toString()}
                          xScale={{type: 'time', format: '%Y-%m-%d', useUTC: true}}
                          axisBottom={{
                              format: '%Y-%m-%d',
                              legendPosition: 'middle',
                              legendOffset: 40,
                          }}
                          legends={[{
                              anchor: 'top-left',
                              direction: 'column',
                              translateX: 20,
                              itemWidth: 80,
                              itemHeight: 20,
                          }]}
                        />
                    </Paper>
                </Grid>
                <Grid item md={6}>
                    <Paper elevation={4} sx={{height: 600}}>
                        <Typography variant="h6" align={'center'}>
                            Total Data Prepared
                        </Typography>
                        <ResponsiveLine
                            data={totalPrepared}
                            margin={{top: 20, right: 20, bottom: 60, left: 70}}
                            curve={'monotoneX'}
                            enableSlices={"x"}
                            yScale={{type: 'linear', min: 0, max: 'auto', nice: true, stacked: true}}
                            axisLeft={{
                                legendPosition: 'middle',
                                legendOffset: -40,
                                format: (value: number) => byteSize(value).toString(),
                            }}
                            enableArea={true}
                            yFormat={(value: any) => byteSize(value).toString()}
                            xScale={{type: 'time', format: '%Y-%m-%d', useUTC: true}}
                            axisBottom={{
                                format: '%Y-%m-%d',
                                legendPosition: 'middle',
                                legendOffset: 40,
                            }}
                            legends={[{
                                anchor: 'top-left',
                                direction: 'column',
                                translateX: 20,
                                itemWidth: 80,
                                itemHeight: 20,
                            }]}
                        />
                    </Paper>
                </Grid>
            </Grid>
            <Grid container spacing={10} p={3}>
                <Grid item md={6}>
                    <Paper elevation={4} sx={{height: 600}}>
                        <Typography variant="h6" align={'center'}>
                            Daily Deal Proposed
                        </Typography>
                        <ResponsiveLine
                            data={dailySealed}
                            margin={{top: 20, right: 20, bottom: 60, left: 70}}
                            curve={'monotoneX'}
                            enableSlices={"x"}
                            yScale={{type: 'linear', min: 0, max: 'auto', nice: true, stacked: true}}
                            axisLeft={{
                                legendPosition: 'middle',
                                legendOffset: -40,
                                format: (value: number) => byteSize(value).toString(),
                            }}
                            enableArea={true}
                            yFormat={(value: any) => byteSize(value).toString()}
                            xScale={{type: 'time', format: '%Y-%m-%d', useUTC: true}}
                            axisBottom={{
                                format: '%Y-%m-%d',
                                legendPosition: 'middle',
                                legendOffset: 40,
                            }}
                            legends={[{
                                anchor: 'top-left',
                                direction: 'column',
                                translateX: 20,
                                itemWidth: 80,
                                itemHeight: 20,
                            }]}
                        />
                    </Paper>
                </Grid>
                <Grid item md={6}>
                    <Paper elevation={4} sx={{height: 600}}>
                        <Typography variant="h6" align={'center'}>
                            Total Deal Proposed
                        </Typography>
                        <ResponsiveLine
                            data={totalSealed}
                            margin={{top: 20, right: 20, bottom: 60, left: 70}}
                            curve={'monotoneX'}
                            enableSlices={"x"}
                            yScale={{type: 'linear', min: 0, max: 'auto', nice: true, stacked: true}}
                            axisLeft={{
                                legendPosition: 'middle',
                                legendOffset: -40,
                                format: (value: number) => byteSize(value).toString(),
                            }}
                            enableArea={true}
                            yFormat={(value: any) => byteSize(value).toString()}
                            xScale={{type: 'time', format: '%Y-%m-%d', useUTC: true}}
                            axisBottom={{
                                format: '%Y-%m-%d',
                                legendPosition: 'middle',
                                legendOffset: 40,
                            }}
                            legends={[{
                                anchor: 'top-left',
                                direction: 'column',
                                translateX: 20,
                                itemWidth: 80,
                                itemHeight: 20,
                            }]}
                        />
                    </Paper>
                </Grid>
            </Grid>
            <Grid container spacing={10} p={3}>
                <Grid item md={12}>
                    <Paper elevation={4} sx={{height: 900}}>
                        <Typography variant="h6" align={'center'}>
                            Monthly deals Proposed by Client
                        </Typography>
                        <ResponsiveBar
                            data={monthlySealed}
                            margin={{top: 20, right: 20, bottom: 60, left: 70}}
                            keys={Array.from(clients.keys())}
                            indexBy={"month"}
                            groupMode={"stacked"}
                            layout={"vertical"}
                            minValue={0}
                            valueFormat={(value: number) => byteSize(value).toString()}
                            axisLeft={{
                                legendPosition: 'middle',
                                legendOffset: -40,
                                format: (value: number) => byteSize(value).toString(),
                            }}
                            axisBottom={{
                                legendPosition: 'middle',
                                legendOffset: 40,
                            }}
                            labelSkipHeight={12}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}
