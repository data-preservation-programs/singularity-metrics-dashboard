import { Long, MongoClient } from "mongodb"
import { CarRow, DealRow, VerifiedClient } from "@/app/api/types.js"
import { getCache, setCache } from './cache'

const client = new MongoClient(process.env.MONGODB_URI!)

export type GlobalCacheKey = 'carsGlobal' | 'dealsGlobal'

export async function getDealsTimeSeries(): Promise<DealRow[]> {
    const cachedData = getCache('dealsTimeSeries')
    if (cachedData) {
      console.log("Cache hit for dealsTimeSeries") // Log cache hit
      return cachedData
    }

    console.log("Fetching dealsTimeSeries from database") // Log database fetch
    const documents = await client.db('singularity').collection('dealsTimeSeries').find({}).sort({date: 1}).toArray()
    const data = documents.map((doc) => {
      if (doc.qap instanceof Long) {
        doc.qap = doc.qap.toNumber()
      }
      return doc
    }) as any
  
    setCache('dealsTimeSeries', data)
    return data
}

export async function getCarsTimeSeries(): Promise<CarRow[]> {
    const cachedData = getCache('carsTimeSeries')
    if (cachedData) {
        console.log("Cache hit for carsTimeSeries") // Log cache hit
        return cachedData
    }

    console.log("Fetching carsTimeSeries from database") // Log database fetch
    const documents = await client.db('singularity').collection('carsTimeSeries').find({}).sort({date: 1}).toArray()
    const data = documents as any

    setCache('carsTimeSeries', data)
    return data
}

export async function getVerifiedClients(): Promise<VerifiedClient[]> {
    const cachedData = getCache('verifiedClients')
    if (cachedData) {
        console.log("Cache hit for verifiedClients") // Log cache hit
        return cachedData
    }
  
    console.log("Fetching verifiedClients from database") // Log database fetch
    const documents = await client.db('singularity').collection('verifiedClients').find({}).toArray()
    const data = documents as any
  
    setCache('verifiedClients', data)
    return data
}
