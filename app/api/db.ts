import {MongoClient} from "mongodb";
import {LRUCache} from "lru-cache";
import {Version} from "@/app/api/types.js";

const client = new MongoClient(process.env.MONGODB_URI!)

export type GlobalCacheKey = 'carsGlobal'

export const GlobalCacheKeyList: GlobalCacheKey[] = [
    'carsGlobal',
]
const GlobalHandlerMap: { [key in GlobalCacheKey]: () => Promise<any> } = {
    'carsGlobal': getCarsTimeSeries
}

const globalCacheOptions: LRUCache.Options<GlobalCacheKey, any, unknown> = {
    allowStale: true,
    ttl: 3600 * 1000,
    fetchMethod: async (key): Promise<any> => {
        return GlobalHandlerMap[key]()
    },
    ttlAutopurge: false,
}
export const GlobalCache = new LRUCache(globalCacheOptions)

const cacheOptions: LRUCache.Options<string, any, unknown> = {
    max: 1000,
    allowStale: true,
    ttl: 600 * 1000,
}
const cache = new LRUCache(cacheOptions)

async function getCarsTimeSeries(): Promise<{
    date: string,
    version: Version,
    count: number,
    fileSize: number,
    numOfFiles: number,
    pieceSize: number,
}[]> {
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
                            then: '1',
                            else: '2',
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
