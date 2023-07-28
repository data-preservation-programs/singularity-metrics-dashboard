'use client'


import {useEffect, useState} from "react";
import {Grid, Paper, Typography} from "@mui/material";
import xbytes from 'xbytes';

interface CarEntry {
    count: number
    fileSize: number
    numOfFiles: number
    pieceSize: number
    date: string
    version: '1' | '2'
}
export default function Overview() {
    const [count, setCount] = useState(0)
    const [fileSize, setFileSize] = useState(0)
    const [numOfFiles, setNumOfFiles] = useState(0)
    const [pieceSize, setPieceSize] = useState(0)

    useEffect(() => {
        fetch('/api/global?type=carsGlobal').then(res => res.json()).then((cars : CarEntry[]) => {
            let count = 0
            let fileSize = 0
            let numOfFiles = 0
            let pieceSize = 0
            for (const car of cars) {
                count += car.count
                fileSize += car.fileSize
                numOfFiles += car.numOfFiles
                pieceSize += car.pieceSize
            }
            setCount(count)
            setFileSize(fileSize)
            setNumOfFiles(numOfFiles)
            setPieceSize(pieceSize)
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
                            {count.toLocaleString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Number of Files prepared
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {numOfFiles.toLocaleString()}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Total Data Size prepared
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {xbytes(fileSize, {iec: true})}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item md={2}>
                    <Paper elevation={4}>
                        <Typography variant={"subtitle1"} align={"center"}>
                            Total Piece Size prepared
                        </Typography>
                        <Typography variant="h4" align={'center'}>
                            {xbytes(pieceSize, {iec: true})}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}
