import {NextRequest, NextResponse} from "next/server";
import { DomainRegister } from "@/types";
export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const domain = params.get('domain')
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ORIGIN}/domain/westCN?domain=${domain}`)
    if (response.ok) {
      const json = await response.json() as any
      return NextResponse.json({
        data: {
          ...json.data,
          register: DomainRegister.byApi.westCN,
          icon: '/icons/westCN.ico'
        }
      })
    } else {
      return NextResponse.json({}, {
        status: 400
      })
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({}, {
      status: 400
    })
  }
}
