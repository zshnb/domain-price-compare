import { PlaywrightCrawler, ProxyConfiguration, RequestQueue } from "@crawlee/playwright";
import { v4 as uuid } from "uuid";
import { DomainInfo } from "./domain.type";
import { Page } from "playwright";
import { BrowserName, DeviceCategory, OperatingSystemsName } from "@crawlee/browser-pool";

export async function doCrawler({
  url,
  crawle
}: {
  url: string
  crawle: (page: Page) => Promise<DomainInfo>
}): Promise<DomainInfo> {
  const requestQueue = await RequestQueue.open(uuid())
  await requestQueue.addRequest({ url })
  return new Promise(async (resolve, reject) => {
    const crawler = new PlaywrightCrawler({
      requestQueue,
      requestHandlerTimeoutSecs: 60 * 60,
      maxRequestRetries: 10,
      headless: false,
      requestHandler: async ({ page }) => {
        try {
          const result = await crawle(page)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      proxyConfiguration: new ProxyConfiguration({
        proxyUrls: ['http://127.0.0.1:7890']
      }),
      browserPoolOptions: {
        fingerprintOptions: {
          fingerprintGeneratorOptions: {
            browsers: [BrowserName.firefox, BrowserName.chrome],
            devices: [DeviceCategory.desktop],
            operatingSystems: [OperatingSystemsName.macos, OperatingSystemsName.windows, OperatingSystemsName.linux],
            locales: ['en-US', 'fr', 'de']
          }
        }
      }
    })

    await crawler.run()
  })
}