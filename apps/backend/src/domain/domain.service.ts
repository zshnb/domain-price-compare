import { Injectable, Logger } from '@nestjs/common'
import {
  AliyunResponse,
  DomainInfo,
  DomainResponse,
  HuaweiResponse,
  NameCheapResponse,
  NameSiloResponse,
  RegisterResponse,
  WestCNResponse,
  XinnetResponse,
} from './domain.type'
import sleep from 'sleep-promise'
import { Crawler } from './crawler'
import parse from 'node-html-parser'
import { Page } from 'playwright'
import crc32 from 'crc-32'
import { HttpsProxyAgent } from 'https-proxy-agent'

// import fetch from "node-fetch";

@Injectable()
export class DomainService {
  private logger: Logger = new Logger(DomainService.name)

  constructor(private readonly crawler: Crawler) {}

  async godaddy(domain: string): Promise<DomainInfo> {
    const proxyAgent = new HttpsProxyAgent(`http://127.0.0.1:7890`)
    const response = await fetch(
      'https://hk.godaddy.com/AcqOMLrg/j4u37pA/y_38KqU/km/V7a1kwfwDc/UR4dAQ/AiUi/MDErEEg',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0',
          origin: 'https://hk.godaddy.com',
        },
        method: 'post',
        // agent: proxyAgent
      },
    )

    const headers = response.headers
    console.log(await response.json())

    const setCookie = headers.get('set-cookie')
    const _abck1 = /_abck=.*?(?=;)/.exec(setCookie)[0]

    const _abck2 =
      '_abck=3151CB683BC7F7424E5D0DE2F0E5BB30~-1~YAAQ65ZUaPsZrcuPAQAAdlnx5wz9oLqPqIkUG0/nzYUXBEWpTtIELT6DK0ID/uEXPAYv2+GMTAnRtA7PqmMb5yuFtLkijHoI62ZFQzhDz/qjcm2IwejXC7keUrIB06nysOoToZcsqH7wljc4ok/KoF0KJEupz6huhGFbTq/ovfIf7UuM2sRvPScFohCFI5we51lfFHxDR8gqEYCJx0ytDtOzHv/IeTE6I1NvyBP2n8nmdSftD+1xFCt0vVIYyGok3EWWt01xkcG1uJs7laNVcOZjs0PM+Bj4c2BQpoLndzlv+eRdFO49KstXieWEAQ8YC+qfsAI6++32Ih/ks+vmMGt3miU98v029Aj9ZesbSGgDzMlCDZeu3DH4iZFzp82n5WoQaGMSLeH+DOQ=~-1~||0||~-1'
    console.log(setCookie)
    console.log('abck1', _abck1)
    console.log('abck2', _abck2)
    // 需要继续逆向request的参数
    const response2 = await fetch(
      `https://hk.godaddy.com/domainfind/v1/search/exact?search_guid=e482be66-671a-4833-91a5-b937a73800a1&req_id=${Date.now()}&isc=&itc=dpp_absol1&partial_query=sleek1112.com&dbs_package=offer-dbsOffer-default&key=dpp_search&q=sleek1112.com`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0',
          cookie: `${_abck1};`,
          'x-referrer': 'https://hk.godaddy.com/',
        },
        // agent: proxyAgent
      },
    )

    console.log('search status', response2.status)
    const json = await response2.json()
    console.log('search result', json)
    const priceNumber = '1'
    return {
      domain,
      price: parseFloat(priceNumber),
      realPrice: parseFloat(priceNumber),
      currency: 'USD',
      available: true,
      buyLink: `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`,
    }
  }

  async namecheap(domain: string): Promise<DomainInfo> {
    /*
    /* use for namecheap api generate signature rcs
     * @param url: https://aftermarket.namecheapapi.com/domain/status
     *
    */

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function calculateRequestSignature(
      method: string,
      url: URL,
      type: string = 'nc',
    ) {
      const key =
        type === 'revved'
          ? '8f6c7d5691eebd3b5090dc6b06755d58'
          : '815e7ef93be85bebe5959f6f72d7e542'
      const nonce = [...Array(32)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')
      let toSign =
        key +
        ' ' +
        nonce +
        ' ' +
        method.toUpperCase() +
        ' ' +
        url.pathname +
        ' '
      const paramsToSign = []

      if (url.search && url.search.length > 0 && url.search[0] == '?') {
        const params = url.search.substring(1).split('&')
        for (let x = 0; x < params.length; x++) {
          const kv = params[x].split('=')
          if (kv.length == 2) {
            if (kv[0] != 'rcs') paramsToSign.push([kv[0], kv[1]])
          }
        }
      }
      paramsToSign.sort((a, b) => {
        if (a[0] < b[0]) return -1
        else if (a[0] > b[0]) return 1
        else return 0
      })
      toSign += paramsToSign
        .map((p) => p[0] + '=' + encodeURIComponent(p[1]))
        .join('&')

      const checksumStr = JSON.stringify({ val: crc32.str(toSign), n: nonce })
      let encodedStr = ''
      for (let x = 0; x < checksumStr.length; x++) {
        encodedStr += String.fromCharCode(checksumStr.charCodeAt(x) ^ 0x49)
      }

      return btoa(encodedStr)
    }

    const response = await fetch(
      'https://d1dijnkjnmzy2z.cloudfront.net/tlds.json',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0',
        },
      },
    )

    const array = domain.split('.')
    const data = (await response.json()) as NameCheapResponse[]
    const price = data.find((it) => it.Name === array[1])
    return {
      available: true,
      price: price.Pricing.Price,
      realPrice: price.Pricing.Price,
      currency: 'USD',
      domain,
      buyLink: `https://www.namecheap.com/domains/registration/results/?domain=${domain}`,
    }
  }

  async namesilo(domain: string): Promise<DomainInfo> {
    const array = domain.split('.')

    async function getCheckId() {
      const formData = new FormData()
      formData.append('domains[]', array[0])
      formData.append('tlds[]', array[1])
      const response = await fetch(
        'https://www.namesilo.com/public/api/domains/bulk-check',
        {
          method: 'POST',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0',
          },
          body: formData,
        },
      )
      if (!response.ok) {
        console.log(await response.text())
        return ''
      }
      const json = await response.json()
      return json.data.checkId
    }

    const checkId = await getCheckId()
    await sleep(1000)
    const response = await fetch(
      `https://www.namesilo.com/public/api/domains/results/${checkId}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0',
        },
      },
    )
    if (!response.ok) {
      throw new Error('namesilo search domain info error')
    }
    const json = (await response.json()) as NameSiloResponse
    const domainInfo = json.data.domains[0]
    return {
      available: domainInfo.available,
      price: domainInfo.currentPrice,
      realPrice: domainInfo.currentPrice,
      currency: 'USD',
      domain,
      buyLink: `https://www.namesilo.com/domain/search-domains?query=${domain}`,
    }
  }

  async aliyun(domain: string): Promise<DomainInfo> {
    async function getToken(now: number) {
      const response = await fetch(
        `https://promotion.aliyun.com/risk/getToken.htm?cback=jsonp_${now}_36781`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'content-type': 'application/json',
          },
        },
      )
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
      const response = await fetch(
        `https://checkapi.aliyun.com/check/search?domainName=${domain}&umidToken=${token}&callback=__jp0&_=${now}`,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/javascript',
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          },
        },
      )
      if (!response.ok) {
        console.error(`get aliyun productId error: ${await response.text()}`)
        return ''
      }
      const pattern = `(?<=(__jp0\\())(.|\\n)*(?=\\);)`
      const re = new RegExp(pattern, 'gm')
      const text = await response.text()
      const jsonStr = re.exec(text)?.at(0) as string
      const universalList = (
        jsonStr.match(/"universalList":\[.*]/g)?.at(0) as any
      ).replace('"universalList":', '')
      const firstObject = universalList.match(/\{.*?}/).at(0)
      return firstObject.match(/(?<="produceId":)".*"/)[0]
    }

    const now = Date.now()
    const token = await getToken(now)
    const productId = await getProductId(domain, now, token)

    const response = await fetch(
      `https://checkapi.aliyun.com/check/domaincheck?domain=${domain}&productID=${productId}&token=${token}&callback=__jp1&_=${now}`.replaceAll(
        '"',
        '',
      ),
      {
        method: 'get',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        },
      },
    )
    if (!response.ok) {
      throw new Error('get aliyun domain info error')
    }
    const text = await response.text()
    const pattern = `(?<=__jp1\\()(.|\\n)*(?=\\);)`
    const re = new RegExp(pattern, 'gm')
    const jsonStr = re.exec(text)?.at(0)
    const json = JSON.parse(`${jsonStr}`) as AliyunResponse
    const array = domain.split('.')
    return {
      available: true,
      price: json.module?.priceList?.at(0)?.money || 0,
      realPrice: json.module?.priceList?.at(0)?.money || 0,
      currency: 'RMB',
      domain,
      buyLink: `https://wanwang.aliyun.com/domain/searchresult/#/?keyword=${array[0]}&suffix=${array[1]}&=`,
    }
  }

  async tencent(domain: string): Promise<DomainInfo> {
    const now = Date.now()
    const response = await fetch(
      `https://qcwss.cloud.tencent.com/capi/ajax-v3?action=BatchCheckDomain&from=domain_buy&csrfCode=&uin=0&_=${now}&mc_gtk=&t=${now}&g_tk=&_format=json`,
      {
        method: 'post',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          DomainList: [domain],
          Filter: 0,
          Period: 1,
          HashId: now.toString(),
          SaveDomainSearch: false,
        }),
      },
    )
    const json = await response.json()
    const tencentDomainInfo = json.result.data.DomainList[0]
    if (tencentDomainInfo.Available) {
      return {
        domain: tencentDomainInfo.DomainName,
        available: tencentDomainInfo.Available,
        price: tencentDomainInfo.Price,
        realPrice: tencentDomainInfo.RealPrice,
        currency: 'RMB',
        buyLink: `https://buy.cloud.tencent.com/domain/?domain=${tencentDomainInfo.DomainName}`,
      }
    } else {
      return {
        domain: tencentDomainInfo.DomainName,
        available: tencentDomainInfo.Available,
        price: 0,
        realPrice: 0,
        currency: 'RMB',
      }
    }
  }

  async domain(domain: string): Promise<DomainInfo> {
    const array = domain.split('.')
    const request = {
      request: {
        requestInfo: {
          service: 'DomainAPI',
          method: 'searchDomain',
          clientId: 'Reggie',
          apiAccessKey: 'rfthmxdv2ghkycnodakkby4s9iu',
        },
        fromEdsPath: true,
        domainName: domain,
        domainNames: [domain],
        useConfigTlds: true,
        heckExactMatchAvailability: true,
        spinSearch: true,
        tlds: [array[1]],
        addToCart: false,
        aftermarket: true,
        registryPremium: true
      }
    };
    const response = await fetch('https://www.domain.com/sfcore.do?searchDomain', {
      method: 'post',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Content-Type': 'application/json',
        'x-api-key': 'rfthmxdv2ghkycnodakkby4s9iu',
        'x-client-id': 'Reggie'
      },
      body: JSON.stringify(request)
    })
    const json = await response.json() as DomainResponse
    const domainInfo = json.response.data.searchedDomains[0]
    return {
      domain,
      price: domainInfo.terms[0].price,
      realPrice: domainInfo.terms[0].price,
      currency: 'USD',
      available: true,
      buyLink: `https://www.domain.com/registration/?flow=jdomainDFE&endpoint=jarvis&search=${domain}#/jdomainDFE/1`
    }
  }

  async dynadot(domain: string): Promise<DomainInfo> {
    const urlencoded = new URLSearchParams()
    urlencoded.append('domain', `${domain}`)
    urlencoded.append('cmd', 'search_domain_ajax')
    urlencoded.append('displaySuggestions', '1')
    const response = await fetch('https://www.dynadot.com/domain/search', {
      method: 'post',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
      },
      body: urlencoded,
    })
    const json = await response.json()
    const dom = parse(json.content)
    const element = dom.querySelector(
      'div.exact-valid-row > div > div > div.middle-group > div.search-price-group > div.search-price',
    )
    const price = element.innerText
    const priceNumber = parseFloat(price.replace(/[$¥]/, ''))
    return {
      domain,
      price: priceNumber,
      realPrice: priceNumber,
      currency: price.startsWith('$') ? 'USD' : 'RMB',
      available: true,
      buyLink: `https://www.dynadot.com/domain/search`,
    }
  }

  async register(domain: string): Promise<DomainInfo> {
    const request = {
      "request": {
        "fromEdsPath": true,
        "domainNames": [domain],
        "useConfigTlds": true,
        "checkExactMatchAvailability": true,
        "spinSearch": false,
        "registryPremium": true,
        "spinDomainsWithoutTldsReq": true,
        "aftermktDomainsReq": true,
        "topTldReqPremiumDomains": true,
        "flowId": "pdafFlow",
        "requestInfo": {
          "service": "DomainAPI",
          "method": "searchDomain",
          "clientId": "NSI",
          "apiAccessKey": "yneujmorzfuezfwrczobxjr5jdg",
          "isloading": true
        }
      }
    }
    const response = await fetch(
      'https://www.register.com/sfcore.do',
      {
        method: 'post',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    )
    console.log(await response.text());
    const json = (await response.json()) as RegisterResponse
    const domainInfo = json.response.data.searchedDomains[0]
    return {
      domain,
      price: domainInfo.unitPrice,
      realPrice: domainInfo.unitPrice,
      currency: 'USD',
      available: true,
      buyLink: `https://www.register.com/products/domain/domain-search-results`,
    }
  }

  async westCN(domain: string): Promise<DomainInfo> {
    async function getAuthorizationToken() {
      const response = await fetch('https://www.west.cn/main/whois.asp', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        },
      })
      const html = await response.text()
      const dom = parse(html)
      const scripts = Array.from(dom.getElementsByTagName('script'))
      const pattern = /(?<=(var token='))([^';]|\n)*(?=')/
      let token = ''
      scripts.forEach((script) => {
        const matchResult = script.innerText.match(pattern)
        if (matchResult) {
          token = matchResult[0]
        }
      })
      return token
    }

    const token = await getAuthorizationToken()
    if (!token) {
      throw new Error('get westCN authorization token failed')
    }
    const response = await fetch(
      `https://netservice.west.cn/netcore/api/Whois/DomainWhois`,
      {
        method: 'post',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customdomain: [domain],
          domains: [],
          suffixs: [],
          ifhksite: '0',
        }),
      },
    )
    const json = (await response.json()) as WestCNResponse
    const domainInfo = json.success[0]
    return {
      domain,
      available: true,
      price: domainInfo.price,
      realPrice: domainInfo.price,
      currency: 'RMB',
      buyLink: `https://www.west.cn/main/whois.asp`,
    }
  }

  async xinnet(domain: string): Promise<DomainInfo> {
    const array = domain.split('.')
    const now = Date.now()
    const response = await fetch(
      `https://domaincheck.xinnet.com/domainCheck?callbackparam=jQuery1_${now}&searchRandom=8&prefix=${array[0]}&suffix=.${array[1]}&_=${now}`,
      {
        method: 'post',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        },
      },
    )
    const text = await response.text()
    const pattern = `(?<=jQuery1_${now}\\()(.|\\n)*(?=\\))`
    const re = new RegExp(pattern, 'gm')
    const jsonStr = re.exec(text)?.at(0)
    const json = JSON.parse(`${jsonStr}`) as XinnetResponse[]
    const domainInfo = json[0].result[0].yes[0]
    const oneYearPrice = domainInfo.prices.find((it) => it.timeAmount === 1)
    return {
      domain,
      available: true,
      price: oneYearPrice.price,
      realPrice: oneYearPrice.price,
      currency: 'RMB',
      buyLink: `https://www.xinnet.com/domain/domainQueryResult.html?prefix=${array[0]}&suffix=.${array[1]}`,
    }
  }

  async huawei(domain: string): Promise<DomainInfo> {
    const array = domain.split('.')
    const requestBody =
      '{"chargingMode":2,"periodNum":1,"periodType":3,"productInfos":[{"id":"register.com","cloudServiceType":"hws.service.type.domains","resourceType":"hws.resource.type.register","resourceSpecCode":"1.register.com"}],"regionId":"global-cbc-1","subscriptionNum":1,"tenantId":""}'
    const response = await fetch(
      'https://portal.huaweicloud.com/api/cbc/global/rest/BSS/billing/ratingservice/v2/inquiry/resource',
      {
        method: 'POST',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: requestBody,
      },
    )
    if (!response.ok) {
      console.log(await response.text())
      throw new Error('get huawei cloud domain info error')
    }
    const json = (await response.json()) as HuaweiResponse
    const priceInfo = json.productRatingResult[0]
    return {
      domain,
      price: priceInfo.originalAmount,
      realPrice: priceInfo.amount,
      currency: 'RMB',
      available: true,
      buyLink: `https://www.huaweicloud.com/product/domain/search.html?domainName=${array[0]}&domainSuffix=.${array[1]}`,
    }
  }

  private getRequestResponse(
    matchRequest: {
      matchUrl: (url: string) => boolean
      matchBody?: (body: any) => boolean
    },
    page: Page,
  ) {
    return new Promise((resolve, reject) => {
      page.on('requestfinished', async (request) => {
        let isRequestMatch = false
        const { matchUrl, matchBody } = matchRequest
        if (matchUrl(request.url())) {
          isRequestMatch = true
          if (matchBody) {
            const requestBody = request.postDataJSON()
            isRequestMatch = matchBody(requestBody)
          }
        }
        if (isRequestMatch) {
          const response = await request.response()
          if (!response.ok()) {
            reject(new Error(`listen request: ${request.url()} failed`))
          }
          const text = await response.text()
          try {
            resolve(JSON.parse(text))
          } catch (e) {
            this.logger.error(
              `get request json response error, request: ${request.url()}, response: ${text}`,
              e,
            )
          }
        }
      })
    })
  }
}
