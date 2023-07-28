import {MongoClient} from "mongodb";
import {LRUCache} from "lru-cache";
import {CarRow, DealRow} from "@/app/api/types.js";

const client = new MongoClient(process.env.MONGODB_URI!)

export type GlobalCacheKey = 'carsGlobal' | 'dealsGlobal'

export const GlobalCacheKeyList: GlobalCacheKey[] = [
    'carsGlobal', 'dealsGlobal'
]
const GlobalHandlerMap: { [key in GlobalCacheKey]: () => Promise<any> } = {
    'carsGlobal': getCarsTimeSeries,
    'dealsGlobal': getDealsTimeSeries,
}

const globalCacheOptions: LRUCache.Options<GlobalCacheKey, any, unknown> = {
    max: 1000,
    allowStale: true,
    ttl: 3600 * 1000,
    fetchMethod: async (key): Promise<any> => {
        return GlobalHandlerMap[key]()
    },
    ttlAutopurge: false,
}
export const GlobalCache = new LRUCache(globalCacheOptions)

async function getDealsTimeSeries(): Promise<DealRow[]> {
    const query = [
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
                    $sum: '$pieceSize'
                },
                qap : {
                    $sum: {
                        $cond: {
                            if: '$verified',
                            then: {
                                $multiply: ['$pieceSize', 10]
                            },
                            else: '$pieceSize',
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
        }, {
            $sort: {
                date: 1,
            }
        }
    ]
    const documents = await client.db('singularity').collection('deals').aggregate(query).toArray()
    console.log("Got time series for deals", documents.length)
    return documents as any
}

async function getCarsTimeSeries(): Promise<CarRow[]> {
    const query = [
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
        }, {
            $sort: {
                date: 1,
            }
        }
    ]
    const documents = await client.db('singularity').collection('cars').aggregate(query).toArray()
    console.log("Got time series for cars", documents.length)
    return documents as any
}
