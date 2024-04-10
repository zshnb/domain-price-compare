import {NextRequest, NextResponse} from "next/server";
import {DomainRegister} from "@/components/domainTable/domainTable.type";
export const maxDuration = 60;


export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const domain = params.get('domain')
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ORIGIN}/domain/domain?domain=${domain}`)
    if (response.ok) {
      const json = await response.json()
      return NextResponse.json({
        data: {
          ...json.data,
          register: DomainRegister.domain
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
