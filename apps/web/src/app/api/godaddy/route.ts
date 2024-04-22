import {NextRequest, NextResponse} from "next/server";
import { DomainRegister } from "@/types";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const domain = params.get('domain')
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ORIGIN}/domain/godaddy?domain=${domain}`)
    if (response.ok) {
      const json = await response.json()
      return NextResponse.json({
        data: {
          ...json.data,
          register: DomainRegister.byCrawl.godaddy,
          icon: 'https://img6.wsimg.com/ux/favicon/favicon-32x32.png'
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