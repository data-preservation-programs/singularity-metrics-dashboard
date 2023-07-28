import {NextRequest} from "next/server";

export type Version = '1' | '2'

export interface Params {
    clients: string[]
    providers: string[]
    versions: Version[]
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
