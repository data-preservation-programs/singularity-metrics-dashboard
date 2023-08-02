import {NextRequest, NextResponse} from "next/server";
import {getCarsTimeSeries, getDealsTimeSeries, getVerifiedClients, GlobalCacheKey} from "@/app/api/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
    console.log(request.url)
    const type = request.nextUrl.searchParams.get('type') as GlobalCacheKey
    if (type === "carsGlobal") {
        const timeSeries = await getCarsTimeSeries()
        return NextResponse.json(timeSeries)
    }

    if (type === "dealsGlobal") {
        const timeSeries = await getDealsTimeSeries()
        return NextResponse.json(timeSeries)
    }

    if (type === "verifiedClients") {
        const data = await getVerifiedClients()
        return NextResponse.json(data)
    }

    return NextResponse.json("invalid type", {
        status: 400
    })
}
