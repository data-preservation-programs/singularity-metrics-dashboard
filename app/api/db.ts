import {Long, MongoClient} from "mongodb";
import {CarRow, DealRow, VerifiedClient} from "@/app/api/types.js";

const client = new MongoClient(process.env.MONGODB_URI!)

export type GlobalCacheKey = 'carsGlobal' | 'dealsGlobal'

export async function getDealsTimeSeries(): Promise<DealRow[]> {
    const documents = await client.db('singularity').collection('dealsTimeSeries').find({}).sort({date: 1}).toArray()
    console.log("Got time series for deals", documents.length)
    return documents.map((doc) => {
        if (doc.qap instanceof Long) {
            doc.qap = doc.qap.toNumber()
        }
        return doc
    } ) as any
}

export async function getCarsTimeSeries(): Promise<CarRow[]> {
    const documents = await client.db('singularity').collection('carsTimeSeries').find({}).sort({date: 1}).toArray()
    console.log("Got time series for cars", documents.length)
    return documents as any
}

export async function getVerifiedClients(): Promise<VerifiedClient[]> {
    const documents = await client.db('singularity').collection('verifiedClients').find({}).toArray()
    console.log("Got verified clients", documents.length)
    return documents as any
}
