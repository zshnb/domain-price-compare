import { Injectable, Logger } from "@nestjs/common";
import {AliyunResponse, DomainInfo, DomainResponse, NameSiloResponse} from "./domain.type";
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
      url: 'https://www.godaddy.com/domainsearch/find?domainToCheck=sleek123.com',
      headless: false,
      processPage: async (page) => {
        await page.locator('[data-eid="uxp.hyd.sales_footer_seechange.sales_header.market_selector.click"]')
          .click({
            delay: 1000
          })
        const l = page.locator('.tray-content')
          .locator('a[data-eid="uxp.hyd.sales_footer_seechange.sales_header.market_selector.en_us.click"]')

          await l.click()
        await page.locator("#domain-search-box")
          .fill(domain)
        await page.locator("#domain-search-box")
          .focus()
        await page.keyboard.press('Enter')

        await page.waitForSelector('.favorites-div', {state: "visible"})
        const domainTakenLocator = page
          .locator('[data-cy="dbsV2-badge"]', {
            hasText: 'Domain Taken'
          })
        if (await domainTakenLocator.isVisible()) {
          return {
            domain,
            price: '',
            realPrice: '',
            available: false
          }
        } else {
          const mainPriceLocator = page
            .locator('[data-cy="availableCard"]')
            .getByTestId("pricing-main-price")
          const mainPrice = (await mainPriceLocator.innerText()) as string;
          const oldPriceLocator = page
            .locator('[data-cy="availableCard"]')
            .getByTestId('pricing-strikethrough-price')
          const oldPrice = (await oldPriceLocator.innerText()) as string

          if (!mainPrice || !oldPrice) {
            this.logger.error('godaddy search domain info error')
            throw new Error('godaddy search domain info error')
          } else {
            return {
              domain,
              price: oldPrice,
              realPrice: mainPrice,
              available: true,
              buyLink: `https://www.godaddy.com/domainsearch/find?domainToCheck=${domain}`
            }
          }
        }
      }
    })
  }

  async namecheap(domain: string): Promise<DomainInfo> {
    return this.crawler.doCrawler({
      url: 'https://www.namecheap.com',
      headless: false,
      processPage: async (page) => {
        await page.locator('#static-domain-search-domain-search-input')
          .fill(domain)
        await page.locator('#static-domain-search')
          .locator('[aria-label="Search"]')
          .click()

        await page.locator('section.standard', {
          has: page.locator('article.available,article.unavailable')
        })
          .waitFor({
            state: 'visible'
          })

        const locator = page.locator('section.standard > article.available')
        if (await locator.isVisible()) {
          const price = await locator.locator('div.price > strong')
            .innerText()
          if (!price) {
            throw new Error('namecheap search domain info error')
          }
          return {
            available: true,
            price,
            realPrice: price,
            domain,
            buyLink: `https://www.namecheap.com/domains/registration/results/?domain=${domain}`
          }
        } else {
          return {
            domain,
            price: '',
            realPrice: '',
            available: false
          }
        }
      }
    })
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
    if (domainInfo.available) {
      return {
        available: domainInfo.available,
        price: `$${domainInfo.currentPrice}`,
        realPrice: `$${domainInfo.currentPrice}`,
        domain,
        buyLink: `https://www.namesilo.com/domain/search-domains?query=${domain}`
      }
    } else {
      return {
        available: domainInfo.available,
        price: '',
        realPrice: '',
        domain,
        buyLink: ''
      }
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
      available: json.module.domainDetail.avail === 1,
      price: `¥${json.module?.priceList?.at(0)?.money || 0}`,
      realPrice: `¥${json.module?.priceList?.at(0)?.money || 0}`,
      domain,
      buyLink: `https://wanwang.aliyun.com/domain/searchresult/#/?keyword=${array[0]}&suffix=${array[1]}&=`,
    }
  }

  async tencent(domain: string) {
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
        price: `¥${tencentDomainInfo.Price}`,
        realPrice: `¥${tencentDomainInfo.RealPrice}`,
        buyLink: `https://buy.cloud.tencent.com/domain/?domain=${tencentDomainInfo.DomainName}`,
      }
    } else {
      return {
        domain: tencentDomainInfo.DomainName,
        available: tencentDomainInfo.Available,
        price: '¥0',
        realPrice: '¥0',
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

        return this.getRequestResponse(domain, page)
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
    if (element) {
      const price = element.innerText
      return {
        domain,
        price,
        realPrice: price,
        available: true,
        buyLink: `https://www.dynadot.com/domain/search`
      }
    } else {
      return {
        domain,
        price: '',
        realPrice: '',
        available: false
      }
    }
  }

  private getRequestResponse(domain: string, page: Page): Promise<DomainInfo> {
    return new Promise((resolve, reject) => {
      page.on('requestfinished', async (request) => {
        if (request.url() === 'https://www.domain.com/sfcore.do?searchDomain') {
          const response = await request.response()
          if (!response.ok()) {
            reject(new Error(`listen request: ${request.url()} failed`))
          }
          const json = await response.json() as DomainResponse
          const domainInfo = json.response.data.searchedDomains[0]
          if (domainInfo.isAvailable) {
            resolve({
              domain,
              price: `$${domainInfo.terms[0].price}`,
              realPrice: `$${domainInfo.terms[0].price}`,
              available: true,
              buyLink: `https://www.domain.com/registration/?flow=jdomainDFE&endpoint=jarvis&search=${domain}#/jdomainDFE/1`
            })
          } else {
            resolve({
              domain,
              price: '',
              realPrice: '',
              available: false
            })
          }
        }
      })
    })
  }
}
