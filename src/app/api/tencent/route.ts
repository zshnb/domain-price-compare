import {NextRequest, NextResponse} from "next/server";
import {DomainInfo} from "@/components/domainTable/domainTable.type";

type TencentResult = {
  DomainName: string
  Available: boolean
  Price: number
  RealPrice: number
}
export async function GET(req: NextRequest) {
  const now = Date.now();
  const params = req.nextUrl.searchParams
  const response = await fetch(`https://qcwss.cloud.tencent.com/capi/ajax-v3?action=BatchCheckDomain&from=domain_buy&csrfCode=&uin=0&_=${now}&mc_gtk=&t=${now}&g_tk=&_format=json`, {
    method: 'post',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      DomainList: [params.get('domain')],
      Filter: 0,
      Period: 1,
      HashId: now.toString(),
      SaveDomainSearch: false
    })
  })
  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
  const domainInfo = convert(json.result.data.DomainList[0])
  return NextResponse.json({data: domainInfo})
}

function convert(result: TencentResult): DomainInfo {
  return {
    domain: result.DomainName,
    available: result.Available,
    price: result.Price,
    realPrice: result.RealPrice,
    buyLink: `https://buy.cloud.tencent.com/domain/?domain=${result.DomainName}`
  }
}