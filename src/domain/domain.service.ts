import { Injectable } from '@nestjs/common';
import { PlaywrightCrawler, ProxyConfiguration, RequestQueue } from "@crawlee/playwright";

@Injectable()
export class DomainService {
  async godaddy(domain: string) {
    const requestQueue = await RequestQueue.open()
    await requestQueue.addRequest({ url: 'https://www.godaddy.com' })
    return new Promise(async (resolve, reject) => {
      const crawler = new PlaywrightCrawler({
        requestQueue,
        requestHandlerTimeoutSecs: 60 * 60,
        requestHandler: async ({ page }) => {
          await page.locator('.ux-search')
            .getByPlaceholder('Type the domain you want')
            .fill('sleek123.com')
          await page.getByTestId('domain-search-box-button')
            .click()
          await page.getByTestId('price-line')
            .click()
          const mainPrice = page.getByTestId('pricing-main-price')
          const oldPrice = page.getByTestId('pricing-strikethrough-price')
          resolve({
            mainPrice,
            oldPrice
          })
        },
        proxyConfiguration: new ProxyConfiguration({
          proxyUrls: ['http:127.0.0.1:7890']
        })
      })

      await crawler.run()
    })
  }
}
