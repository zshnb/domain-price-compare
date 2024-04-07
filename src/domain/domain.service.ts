import { Injectable, Logger } from "@nestjs/common";
import { PlaywrightCrawler, ProxyConfiguration, RequestQueue } from "@crawlee/playwright";
import { DomainInfo } from "./domain.type";

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
}
