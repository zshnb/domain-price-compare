import {NextRequest, NextResponse} from "next/server";
import { DomainRegister } from "@/types";


export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const domain = params.get('domain')
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ORIGIN}/domain/register?domain=${domain}`)
    if (response.ok) {
      const json = await response.json()
      return NextResponse.json({
        data: {
          ...json.data,
          register: DomainRegister.register,
          icon: 'https://www.register.com/favicon.ico'
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
