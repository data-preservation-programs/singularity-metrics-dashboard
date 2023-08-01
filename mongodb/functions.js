updateCarsTimeSeries = function() {
    db.cars.aggregate([
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt',
                            timezone: 'UTC',
                        }
                    },
                    version: {
                        $cond: {
                            if: '$isV1',
                            then: 'v1',
                            else: 'v2',
                        }
                    }
                },
                count: {
                    $sum: 1
                },
                fileSize: {
                    $sum: '$fileSize'
                },
                numOfFiles: {
                    $sum: '$numOfFiles'
                },
                pieceSize: {
                    $sum: '$pieceSize'
                },
            }
        },
        {
            $project: {
                _id: 0,
                date: '$_id.date',
                version: '$_id.version',
                count: 1,
                fileSize: 1,
                numOfFiles: 1,
                pieceSize: 1,
            }
        },
        {
            $out: "carsTimeSeries"
        }
    ])
}

updateDealsTimeSeries = function() {
    db.deals.aggregate([
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt',
                            timezone: 'UTC',
                        }
                    },
                    version: {
                        $cond: {
                            if: '$isV1',
                            then: 'v1',
                            else: 'v2',
                        }
                    },
                    client: '$client',
                    state: '$state',
                },
                count: {
                    $sum: 1
                },
                pieceSize: {
                    $sum: {
                        $cond: {
                            if: {$eq: ['$pieceSize', 0]},
                            then: 34359738368,
                            else: '$pieceSize',
                        }
                    }
                },
                qap: {
                    $sum: {
                        $cond: {
                            if: {$eq: ['$pieceSize', 0]},
                            then: {
                                $cond: {
                                    if: '$verified',
                                    then: 343597383680,
                                    else: 34359738368,
                                }
                            },
                            else: {
                                $cond: {
                                    if: '$verified',
                                    then: {
                                        $multiply: ['$pieceSize', 10]
                                    },
                                    else: '$pieceSize',
                                }
                            },
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                date: '$_id.date',
                version: '$_id.version',
                client: '$_id.client',
                state: '$_id.state',
                count: 1,
                pieceSize: 1,
                qap: 1,
            }
        },
        {
            $out: "dealsTimeSeries"
        }
    ])
}
