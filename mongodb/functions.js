exports = async function () {
    /*
      A Scheduled Trigger will always call a function without arguments.
      Documentation on Triggers: https://www.mongodb.com/docs/atlas/app-services/triggers/overview/

      Functions run by Triggers are run as System users and have full access to Services, Functions, and MongoDB Data.

      Access a mongodb service:
      const collection = context.services.get(<SERVICE_NAME>).db("db_name").collection("coll_name");
      const doc = collection.findOne({ name: "mongodb" });

      Note: In Atlas Triggers, the service name is defaulted to the cluster name.

      Call other named functions if they are defined in your application:
      const result = context.functions.execute("function_name", arg1, arg2);

      Access the default http client and execute a GET request:
      const response = context.http.get({ url: <URL> })

      Learn more about http client here: https://www.mongodb.com/docs/atlas/app-services/functions/context/#std-label-context-http
    */

    const cars = context.services.get("SingularityMetrics").db("singularity").collection("cars");
    const deals = context.services.get("SingularityMetrics").db("singularity").collection("deals");
    await cars.aggregate([
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
    ]).toArray();
    await deals.aggregate([
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
    ]).toArray();
    console.log("done!")
};
