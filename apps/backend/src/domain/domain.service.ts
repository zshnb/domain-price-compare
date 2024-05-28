import { Injectable, Logger } from "@nestjs/common";
import {
  AliyunResponse, Currency,
  DomainInfo,
  DomainResponse,
  GodaddyResponse, HuaweiResponse, NameCheapResponse,
  NameSiloResponse,
  RegisterResponse, WestCNResponse, XinnetResponse
} from "./domain.type";
import sleep from "sleep-promise";
import { Crawler } from "./crawler";
import parse from "node-html-parser";
import {Page} from "playwright";

@Injectable()
export class DomainService {
  private logger: Logger = new Logger(DomainService.name)
  constructor(private readonly crawler: Crawler) {
  }
  async godaddy(domain: string): Promise<DomainInfo> {
    return this.crawler.doCrawler({
      url: 'https://www.godaddy.com',
      headless: false,
      processPage: async (page) => {
        await page.getByTestId('domain-search-box-input')
          .fill(domain)
        await page.getByTestId('domain-search-box-input')
          .focus()
        await page.waitForTimeout(500)
        await page.keyboard.press('Enter')
        const json = (await this.getRequestResponse({
          matchUrl: (url) => /https:\/\/.*godaddy.com(\/.*)?\/domainfind\/v1\/search\/exact.*/.test(url)
        }, page)) as GodaddyResponse
        const priceNumber = /\d+\.\d+/.exec(json.CurrentPriceDisplay)[0]
        return {
          domain,
          price: parseFloat(priceNumber),
          realPrice: parseFloat(priceNumber),
          currency: json.ClientRequestIn.Currency as Currency,
          available: true,
          buyLink: `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`
        }
      }
    })
  }

  async namecheap(domain: string): Promise<DomainInfo> {
    const response = await fetch('https://d1dijnkjnmzy2z.cloudfront.net/tlds.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0'
      },
    })

    const array = domain.split('.');
    const data = (await response.json()) as NameCheapResponse[]
    const price = data.find(it => it.Name === array[1])
    return {
      available: true,
      price: price.Pricing.Price,
      realPrice: price.Pricing.Price,
      currency: 'USD',
      domain,
      buyLink: `https://www.namecheap.com/domains/registration/results/?domain=${domain}`
    }
  }

  async namesilo(domain: string): Promise<DomainInfo> {
    const array = domain.split('.')
    async function getCheckId() {
      const formData = new FormData();
      formData.append("domains[]", array[0]);
      formData.append("tlds[]", array[1]);
      const response = await fetch('https://www.namesilo.com/public/api/domains/bulk-check', {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0'
        },
        body: formData
      })
      if (!response.ok) {
        console.log(await response.text());
        return ''
      }
      const json = await response.json()
      return json.data.checkId
    }

    const checkId = await getCheckId()
    await sleep(1000)
    const response = await fetch(`https://www.namesilo.com/public/api/domains/results/${checkId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0'
      },
    })
    if (!response.ok) {
      throw new Error('namesilo search domain info error')
    }
    const json = await response.json() as NameSiloResponse
    const domainInfo = json.data.domains[0]
    return {
      available: domainInfo.available,
      price: domainInfo.currentPrice,
      realPrice: domainInfo.currentPrice,
      currency: 'USD',
      domain,
      buyLink: `https://www.namesilo.com/domain/search-domains?query=${domain}`
    }
  }

  async aliyun(domain: string): Promise<DomainInfo> {
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
      return firstObject.match(/(?<="produceId":)".*"/)[0]
    }

    const now = Date.now();
    const token = await getToken(now)
    const productId = await getProductId(domain, now, token)

    const response = await fetch(`https://checkapi.aliyun.com/check/domaincheck?domain=${domain}&productID=${productId}&token=${token}&callback=__jp1&_=${now}`.replaceAll('"', ''), {
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
    const now = Date.now();
    const response = await fetch(`https://qcwss.cloud.tencent.com/capi/ajax-v3?action=BatchCheckDomain&from=domain_buy&csrfCode=&uin=0&_=${now}&mc_gtk=&t=${now}&g_tk=&_format=json`, {
      method: 'post',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        DomainList: [domain],
        Filter: 0,
        Period: 1,
        HashId: now.toString(),
        SaveDomainSearch: false
      })
    })
    const json = await response.json();
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
        currency: 'RMB'
      }
    }
  }

  async domain(domain: string): Promise<DomainInfo> {
    return this.crawler.doCrawler({
      url: 'https://www.domain.com',
      headless: false,
      processPage: async (page) => {
        await page.getByPlaceholder('Find and purchase a domain name')
          .fill(domain)

        const searchButton = page.locator('.body')
          .locator('.domainSearch__form')
          .locator('.domainSearch__submit')
          .first()
        await searchButton.click()

        const json = (await this.getRequestResponse({
          matchUrl: (url) => url === 'https://www.domain.com/sfcore.do?searchDomain'
        },  page)) as DomainResponse
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
    })
  }

  async dynadot(domain: string): Promise<DomainInfo> {
    const urlencoded = new URLSearchParams();
    urlencoded.append("domain", `${domain}`);
    urlencoded.append("cmd", "search_domain_ajax");
    urlencoded.append("displaySuggestions", "1");
    const response = await fetch('https://www.dynadot.com/domain/search', {
      method: 'post',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest'
      },
      body: urlencoded
    })
    const json = await response.json();
    const dom = parse(json.content)
    const element = dom.querySelector('div.exact-valid-row > div > div > div.middle-group > div.search-price-group > div.search-price')
    const price = element.innerText
    const priceNumber = parseFloat(price.replace(/[$¥]/, ''))
    return {
      domain,
      price: priceNumber,
      realPrice: priceNumber,
      currency: price.startsWith('$') ? 'USD' : 'RMB',
      available: true,
      buyLink: `https://www.dynadot.com/domain/search`
    }
  }

  async register(domain: string): Promise<DomainInfo> {
    return this.crawler.doCrawler({
      url: 'https://www.register.com/products/domain/domain-search-results',
      headless: false,
      processPage: async (page) => {
        await page.getByPlaceholder('Search again')
          .fill(domain)

        const searchButton = page.locator('button', {hasText: 'SEARCH'})
          .first()
        await page.waitForTimeout(200)
        await searchButton.click()

        const json = (await this.getRequestResponse({
          matchUrl: (url) => url === 'https://www.register.com/sfcore.do',
          matchBody: (body: any) => {
            return body.request.requestInfo.method === 'searchDomain'
          }
        },  page)) as RegisterResponse
        const domainInfo = json.response.data.searchedDomains[0]
        return {
          domain,
          price: domainInfo.unitPrice,
          realPrice: domainInfo.unitPrice,
          currency: 'USD',
          available: true,
          buyLink: `https://www.register.com/products/domain/domain-search-results`
        }
      }
    })
  }

  async westCN(domain: string): Promise<DomainInfo> {
    async function getAuthorizationToken() {
      const response = await fetch('https://www.west.cn/main/whois.asp', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        }
      })
      const html = await response.text()
      const dom = parse(html)
      const scripts = Array.from(dom.getElementsByTagName('script'))
      const pattern = /(?<=(var token='))([^';]|\n)*(?=')/
      let token = ''
      scripts.forEach(script => {
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
    const response = await fetch(`https://netservice.west.cn/netcore/api/Whois/DomainWhois`, {
      method: 'post',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'content-type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        customdomain: [domain],
        domains: [],
        suffixs: [],
        ifhksite: '0'
      })
    })
    const json = await response.json() as WestCNResponse
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
    const now = Date.now();
    const response = await fetch(`https://domaincheck.xinnet.com/domainCheck?callbackparam=jQuery1_${now}&searchRandom=8&prefix=${array[0]}&suffix=.${array[1]}&_=${now}`, {
      method: 'post',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      }
    })
    const text = await response.text()
    const pattern = `(?<=jQuery1_${now}\\()(.|\\n)*(?=\\))`
    const re = new RegExp(pattern, 'gm')
    const jsonStr = re.exec(text)?.at(0)
    const json = JSON.parse(`${jsonStr}`) as XinnetResponse[]
    const domainInfo = json[0].result[0].yes[0]
    const oneYearPrice = domainInfo.prices.find(it => it.timeAmount === 1)
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
    const requestBody = '{"chargingMode":2,"periodNum":1,"periodType":3,"productInfos":[{"id":"register.com","cloudServiceType":"hws.service.type.domains","resourceType":"hws.resource.type.register","resourceSpecCode":"1.register.com"}],"regionId":"global-cbc-1","subscriptionNum":1,"tenantId":""}'
    const response = await fetch('https://portal.huaweicloud.com/api/cbc/global/rest/BSS/billing/ratingservice/v2/inquiry/resource', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: requestBody
    })
    if (!response.ok) {
      console.log(await response.text());
      throw new Error('get huawei cloud domain info error')
    }
    const json = await response.json() as HuaweiResponse
    const priceInfo = json.productRatingResult[0]
    return {
      domain,
      price: priceInfo.originalAmount,
      realPrice: priceInfo.amount,
      currency: "RMB",
      available: true,
      buyLink: `https://www.huaweicloud.com/product/domain/search.html?domainName=${array[0]}&domainSuffix=.${array[1]}`
    };
  }

  private getRequestResponse(
    matchRequest: {
      matchUrl: (url: string) => boolean
      matchBody?: (body: any) => boolean
    }, page: Page) {
    return new Promise((resolve, reject) => {
      page.on('requestfinished', async (request) => {
        let isRequestMatch = false
        const {matchUrl, matchBody} = matchRequest
        if (matchUrl(request.url())) {
          isRequestMatch = true
          if (matchBody) {
            const requestBody = request.postDataJSON()
            isRequestMatch = matchBody(requestBody);
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
            this.logger.error(`get request json response error, request: ${request.url()}, response: ${text}`, e)
          }
        }
      })
    })
  }
}
