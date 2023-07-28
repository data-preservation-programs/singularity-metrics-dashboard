import {NextRequest} from "next/server";

export type Version = 'v1' | 'v2'

export interface Params {
    clients: string[]
    providers: string[]
    versions: Version[]
}

export interface CarRow {
    count: number
    fileSize: number
    numOfFiles: number
    pieceSize: number
    date: string
    version: Version
}

export interface DealRow {
    date: string
    version: Version
    client: string
    state: string
    count: number,
    pieceSize: number,
    qap: number,
}

export function ExtractParams(request: NextRequest): Params {
    const versionsParam = request.nextUrl.searchParams.get('versions')
    const versions = versionsParam == null || versionsParam == '' ? [] : versionsParam.split(' ') as Version[]
    const providersParam = request.nextUrl.searchParams.get('providers')
    const providers = providersParam == null || providersParam == '' ? [] : providersParam.split(' ')
    const clientsParam = request.nextUrl.searchParams.get('clients')
    const clients = clientsParam == null || clientsParam == '' ? [] : clientsParam.split(' ')
    return {providers, clients, versions}
}
