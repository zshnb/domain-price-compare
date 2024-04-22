import {NextRequest, NextResponse} from "next/server";
import { DomainRegister } from "@/types";


export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const domain = params.get('domain')
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ORIGIN}/domain/namesilo?domain=${domain}`)
    if (response.ok) {
      const json = await response.json()
      return NextResponse.json({
        data: {
          ...json.data,
          register: DomainRegister.byApi.namesilo,
          icon: 'https://www.namesilo.com/favicon.ico'
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
