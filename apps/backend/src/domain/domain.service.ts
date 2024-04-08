import { Injectable, Logger } from "@nestjs/common";
import { PlaywrightCrawler, ProxyConfiguration, RequestQueue } from "@crawlee/playwright";
import {AliyunResponse, DomainInfo, NameSiloResponse} from "./domain.type";
import sleep from "sleep-promise";

@Injectable()
export class DomainService {
  private logger: Logger = new Logger(DomainService.name)
  constructor() {
  }
  async godaddy(domain: string): Promise<DomainInfo> {
    const requestQueue = await RequestQueue.open()
    await requestQueue.addRequest({ url: 'https://www.godaddy.com' })
    return new Promise(async (resolve, reject) => {
      const crawler = new PlaywrightCrawler({
        requestQueue,
        requestHandlerTimeoutSecs: 60 * 60,
        maxRequestRetries: 10,
        requestHandler: async ({ page }) => {
          await page.locator('.ux-search')
            .getByPlaceholder('Type the domain you want')
            .fill(domain)
          await page.getByTestId('domain-search-box-button')
            .click()

          await page.locator('.favorites-div')
            .click()

          const priceLineLocator = page.getByTestId('price-line')
          if (await priceLineLocator.isVisible()) {
            const mainPrice = (await page.getByTestId('pricing-main-price').innerText()) as string
            const oldPrice = (await page.getByTestId('pricing-strikethrough-price').innerText()) as string

            if (!mainPrice || !oldPrice) {
              this.logger.error('godaddy search domain info error')
              reject(new Error())
            } else {
              resolve({
                domain,
                price: oldPrice,
                realPrice: mainPrice,
                available: true
              })
            }
          } else {
            resolve({
              domain,
              price: '',
              realPrice: '',
              available: false
            })
          }

        },
        proxyConfiguration: new ProxyConfiguration({
          proxyUrls: ['http:127.0.0.1:7890']
        })
      })

      await crawler.run()
    })
  }

  async namecheap(domain: string): Promise<DomainInfo> {
    const requestQueue = await RequestQueue.open()
    await requestQueue.addRequest({ url: 'https://www.namecheap.com' })
    return new Promise(async (resolve, reject) => {
      const crawler = new PlaywrightCrawler({
        requestQueue,
        requestHandlerTimeoutSecs: 60 * 60,
        maxRequestRetries: 10,
        requestHandler: async ({ page }) => {
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
              reject(new Error('namecheap search domain info error'))
            }
            resolve({
              available: true,
              price,
              realPrice: price,
              domain
            })
          } else {
            resolve({
              domain,
              price: '',
              realPrice: '',
              available: false
            })
          }

        },
        proxyConfiguration: new ProxyConfiguration({
          proxyUrls: ['http:127.0.0.1:7890']
        })
      })

      await crawler.run()
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
    return {
      available: domainInfo.available,
      price: `$${domainInfo.currentPrice}`,
      realPrice: `$${domainInfo.currentPrice}`,
      domain
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
      return firstObject.match(/(?<="produceId":)".*"/).at(0)
    }

    const now = Date.now();
    const token = await getToken(now)
    const productId = await getProductId(domain, now, token)
    await sleep(1000)
    const token2 = await getToken(now)
    const response = await fetch(`https://checkapi.aliyun.com/check/domaincheck?domain=${domain}&productID=${productId}&token=${token2}&callback=__jp1&_=${now}`, {
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
      realPrice: `$${json.module?.priceList?.at(0)?.money || 0}`,
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
    const result = await response.json();
    return {
      domain: result.DomainName,
      available: result.Available,
      price: result.Price,
      realPrice: result.RealPrice,
      buyLink: `https://buy.cloud.tencent.com/domain/?domain=${result.DomainName}`,
    }
  }
}
