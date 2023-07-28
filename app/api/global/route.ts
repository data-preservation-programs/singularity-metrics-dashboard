import {NextRequest, NextResponse} from "next/server";
import {GlobalCache, GlobalCacheKey, GlobalCacheKeyList} from "@/app/api/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
    console.log(request.url)
    const type = request.nextUrl.searchParams.get('type') as GlobalCacheKey
    if (GlobalCacheKeyList.includes(type)) {
        const timeSeries = await GlobalCache.fetch(type)
        return NextResponse.json(timeSeries)
    }

    return NextResponse.json("invalid type", {
        status: 400
    })
}
