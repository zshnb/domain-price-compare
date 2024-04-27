import {NextRequest, NextResponse} from "next/server";
import { DomainRegister } from "@/types";
import {getRequestContext} from "@cloudflare/next-on-pages";
export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const domain = params.get('domain')
  try {
    const response = await fetch(`${(getRequestContext().env as any).NEXT_PUBLIC_SERVER_ORIGIN}/domain/tencent?domain=${domain}`)
    if (response.ok) {
      const json = await response.json()
      return NextResponse.json({
        data: {
          ...json.data,
          register: DomainRegister.byApi.tencent,
          icon: 'https://cloudcache.tencent-cloud.com/qcloud/favicon.ico'
        }
      })
    } else {
      return NextResponse.json({}, {
        status: 400
      })
    }
  } catch (error) {
    return NextResponse.json({}, {
      status: 400
    })
  }
}
