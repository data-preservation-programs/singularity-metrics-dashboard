'use client'


import {useEffect, useState} from "react";
import {CircularProgress, Grid, Paper, Typography} from "@mui/material";
import {CarRow, DealRow, VerifiedClient, Version} from "@/app/api/types";
import {ResponsiveLine} from "@nivo/line";
import byteSize from 'byte-size'
import {ResponsiveBar} from "@nivo/bar";

function mapToArray(map: Map<any, Map<string, number>>): { id: any, data: { x: string, y: number }[] }[] {
    const output: { id: any, data: { x: string, y: number }[] }[] = [];

    map.forEach((valueMap, key) => {
        const data: { x: string, y: number }[] = [];

        valueMap.forEach((value, innerKey) => {
            data.push({x: innerKey, y: value});
        });

        output.push({id: key, data: data});
    });

    return output;
}

function toAccumulative(daily: Map<any, Map<string, number>>): Map<any, Map<string, number>> {
    const out = new Map<any, Map<string, number>>();

    daily.forEach((dailyValueMap, version) => {
        let totalValueMap = out.get(version);
        if (!totalValueMap) {
            totalValueMap = new Map<string, number>();
            out.set(version, totalValueMap);
        }

        let totalValue = 0
        dailyValueMap.forEach((value, key) => {
            totalValue += value;
            totalValueMap!.set(key, totalValue);
        });
    });

    return out;
}

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
    const [dailyDeal, setDailyDeal] = useState<{ id: string, data: { x: string, y: number }[] }[]>([])
    const [totalDeal, setTotalDeal] = useState<{ id: string, data: { x: string, y: number }[] }[]>([])
    const [monthlySealed, setMonthlySealed] = useState<{ [key: string]: string | number }[]>([])
    const [verifiedClientsMap, setVerifiedClientsMap] = useState<Map<string, VerifiedClient>>(new Map())

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
                totalPreparedMap[car.version].push({
                    x: car.date,
                    y: car.pieceSize + totalPreparedMap[car.version].slice(-1)[0]?.y || 0
                })
            }
            setCount(count)
            setFileSize(fileSize)
            setNumOfFiles(numOfFiles)
            setPieceSize(pieceSize)
            setDailyPrepared([{id: 'v1', data: dailyPreparedMap["v1"]}, {id: 'v2', data: dailyPreparedMap["v2"]}])
            setTotalPrepared([{id: 'v1', data: totalPreparedMap["v1"]}, {id: 'v2', data: totalPreparedMap["v2"]}])
        })
    }, [])

    useEffect(() => {
        Promise.all([fetch('/api/global?type=dealsGlobal'), fetch('/api/global?type=verifiedClients')])
            .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
            .then(([deals, verifiedClients] : [DealRow[], VerifiedClient[]]) => {
                const clients = new Set<string>()
                let proposed = 0
                let active = 0
                let activeQap = 0
                const dailySealedMap = new Map<Version, Map<string, number>>
                const dailyDealMap = new Map<string, Map<string, number>>
                const monthlySealedPerClientMap = new Map<string, { [id: string]: number }>()
                for (const deal of deals) {
                    clients.add(deal.client)
                    if (deal.state === 'active' || deal.state === 'expired') {
                        active += deal.pieceSize
                        activeQap += deal.qap
                    }
                    proposed += deal.pieceSize
                    const month = deal.date.slice(0, 7)
                    if (deal.state === 'active' || deal.state === 'expired') {
                        monthlySealedPerClientMap.has(month) || monthlySealedPerClientMap.set(month, {})
                        monthlySealedPerClientMap.get(month)![deal.client] = deal.pieceSize + (monthlySealedPerClientMap.get(month)![deal.client] || 0)
                        dailySealedMap.has(deal.version) || dailySealedMap.set(deal.version, new Map())
                        dailySealedMap.get(deal.version)!.set(deal.date, deal.pieceSize + (dailySealedMap.get(deal.version)!.get(deal.date) || 0))
                    }
                    dailyDealMap.has(deal.state) || dailyDealMap.set(deal.state, new Map())
                    dailyDealMap.get(deal.state)!.set(deal.date, deal.pieceSize + (dailyDealMap.get(deal.state)!.get(deal.date) || 0))
                }
                const totalSealedMap = toAccumulative(dailySealedMap)
                const totalDealMap = toAccumulative(dailyDealMap)
                setClients(clients)
                setProposed(proposed)
                setActive(active)
                setActiveQap(activeQap)
                setDailySealed(mapToArray(dailySealedMap))
                setTotalSealed(mapToArray(totalSealedMap))
                setDailyDeal(mapToArray(dailyDealMap))
                setTotalDeal(mapToArray(totalDealMap))
                const verifiedClientsMap = new Map<string, VerifiedClient>()
                for (const client of verifiedClients) {
                    if (verifiedClientsMap.has(client.address)) {
                        if (parseFloat(verifiedClientsMap.get(client.address)!.initialAllowance) > parseFloat(client.initialAllowance)) {
                            continue
                        }
                    }
                    verifiedClientsMap.set(client.address, client)
                    verifiedClientsMap.set(client.addressId, client)
                }
                setVerifiedClientsMap(verifiedClientsMap)

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
                            {count === 0 ? (<CircularProgress/>) : count.toLocaleString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Number of Files prepared
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {numOfFiles === 0 ? (<CircularProgress/>) : numOfFiles.toLocaleString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Total Data Size prepared
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {fileSize === 0 ? (<CircularProgress/>) : byteSize(fileSize).toString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Total Piece Size prepared
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {pieceSize === 0 ? (<CircularProgress/>) : byteSize(pieceSize).toString()}
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
                            {clients.size === 0 ? (<CircularProgress/>) : clients.size.toLocaleString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Deals Proposed
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {proposed === 0 ? (<CircularProgress/>) : byteSize(proposed).toString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Deals Active
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {active === 0 ? (<CircularProgress/>) : byteSize(active).toString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            QAP Onboarded
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {activeQap === 0 ? (<CircularProgress/>) : byteSize(activeQap).toString()}
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
                            Daily Deal Sealed
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
                            Total Deal Sealed
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
                <Grid item md={6}>
                    <Paper elevation={4} sx={{height: 600}}>
                        <Typography variant="h6" align={'center'}>
                            Daily Deal
                        </Typography>
                        <ResponsiveLine
                            data={dailyDeal}
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
                            Total Deal
                        </Typography>
                        <ResponsiveLine
                            data={totalDeal}
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
                            Monthly deals Sealed by Client
                        </Typography>
                        <ResponsiveBar
                            data={monthlySealed}
                            margin={{top: 20, right: 20, bottom: 60, left: 70}}
                            keys={Array.from(clients.keys())}
                            indexBy={"month"}
                            groupMode={"stacked"}
                            layout={"vertical"}
                            colors={{scheme: 'set3'}}
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
                            label={data => {
                                const client = verifiedClientsMap.get(data.id as string)
                                if (client === undefined) {
                                    return data.id as string
                                }
                                const value = client.orgName !== "" ? client.orgName : client.name
                                const split = value.split(" ")
                                if (split.length <= 1) {
                                    return value
                                }
                                if (split[0].length > 10) {
                                    return split[0]
                                }
                                return split[0] + " " + split[1]
                            }}
                            tooltip={data => {
                                const client = verifiedClientsMap.get(data.id as string)
                                if (client === undefined) {
                                    return <div style={{padding:12, color: data.color, background: '#444444'}}>
                                        <strong>{data.id}: {data.formattedValue}</strong>
                                    </div>
                                }
                                return <div style={{padding:12, color: data.color, background: '#444444'}}>
                                    <strong>{client.name}{client.orgName}</strong>
                                    <br/>
                                    <span>{data.formattedValue}</span>
                                    {client.region === "" ? "" : (<><br/><span>Region: {client.region}</span></>)}
                                    {client.industry === "" ? "" : (<><br/><span>Industry: {client.industry}</span></>)}
                                    {client.website === "" ? "" : (<><br/><span>Website: {client.website}</span></>)}
                                </div>
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}
