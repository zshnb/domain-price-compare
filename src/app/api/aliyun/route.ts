import {NextRequest, NextResponse} from "next/server";
import {DomainInfo, DomainRegister} from "@/components/domainTable/domainTable.type";
import {spawn} from "node:child_process";

type AliyunResult = {
  module: {
    domainDetail: {
      avail: number
      name: string
    }
    priceList?: {
      action: string
      money: number
      period: number
    }[]
  }
}

export async function GET(req: NextRequest) {
  const now = Date.now();
  const params = req.nextUrl.searchParams
  const token = await getToken(now)
  const domain = params.get('domain') || ''
  const productId = await getProductId(domain, now, token)
  // const text = await callDomainInfoApi({
  //   token, now, productId, domain
  // })
  const response = await fetch(`https://checkapi.aliyun.com/check/domaincheck?domain=${domain}&productID=${productId}&token=${token}&callback=__jp1&_=${now}`, {
    method: 'get',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    },
  })
  if (!response.ok) {
    throw new Error('get aliyun domain info error')
  }
  const text = await response.text();
  const pattern = `(?<=__jp1\\()(.|\\n)*(?=\\);)`
  const re = new RegExp(pattern, 'gm')
  const jsonStr = re.exec(text)?.at(0)
  const json = JSON.parse(`${jsonStr}`)
  const domainInfo = convert(json)
  return NextResponse.json({data: domainInfo})
}

async function getToken(now: number) {
  const response = await fetch(`https://promotion.aliyun.com/risk/getToken.htm?cback=jsonp_${now}_36781`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'content-type': 'application/json'
    }
  })
  if (!response.ok) {
    console.error(`get aliyun token error: ${await response.text()}`)
    return ''
  }
  const text = await response.text()
  const pattern = `(?<=jsonp_${now}_36781\\()(.|\\n)*(?=\\);)`
  const re = new RegExp(pattern, 'gm')
  const jsonStr = re.exec(text)?.at(0) as any
  const json = JSON.parse(`${jsonStr}`)
  return json.data
}

async function getProductId(domain: string, now: number, token: string) {
  const response = await fetch(`https://checkapi.aliyun.com/check/search?domainName=${domain}&umidToken=${token}&callback=__jp0&_=${now}`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/javascript',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'referer': 'https://wanwang.aliyun.com/domain/searchresult/',
      'accept-language': 'en,es-ES;q=0.9,es;q=0.8,zh-CN;q=0.7,zh;q=0.6'
    },
  })
  if (!response.ok) {
    console.error(`get aliyun productId error: ${await response.text()}`)
    return ''
  }
  const pattern = `(?<=(__jp0\\())(.|\\n)*(?=\\);)`
  const re = new RegExp(pattern, 'gm')
  const text = await response.text()
  const jsonStr = re.exec(text)?.at(0) as string
  const universalList = (jsonStr.match(/"universalList":\[.*]/g)?.at(0) as any).replace('"universalList":', '')
  const firstObject = universalList.match(/\{.*?}/).at(0)
  return firstObject.match(/(?<="produceId":)".*"/).at(0)
}

function callDomainInfoApi({token, now, productId, domain}: {
  token: string,
  now: number,
  productId: number,
  domain: string
}): Promise<string> {
  console.log(`https://checkapi.aliyun.com/check/domaincheck?domain=${domain}&productID=${productId}&token=${token}&callback=__jp1&_=${now}`)
  const curl = spawn('curl', [
    '-H \'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36\'',
    '-H \'referer: https://wanwang.aliyun.com/domain/searchresult/\'',
    '-H \'accept: */*\'',
    `https://checkapi.aliyun.com/check/domaincheck?domain=${domain}&productID=${productId}&token=${token}&callback=__jp1&_=${now}`,
  ])

  return new Promise((resolve, reject) => {
    curl.stdout.on('data', chunk => {
      console.log('data', chunk.toString())
      resolve(chunk.toString())
    })
  })
}

function convert(result: AliyunResult): DomainInfo {
  const domain = result.module.domainDetail.name
  const array = domain.split('.')
  return {
    available: result.module.domainDetail.avail === 1,
    domain,
    price: result?.module.priceList?.at(0)?.money || 0,
    realPrice: result?.module.priceList?.at(0)?.money || 0,
    buyLink: `https://wanwang.aliyun.com/domain/searchresult/#/?keyword=${array[0]}&suffix=${array[1]}&=`,
    register: DomainRegister.aliyun
  }
}