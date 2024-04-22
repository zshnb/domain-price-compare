import { PlaywrightCrawler, ProxyConfiguration, RequestQueue } from "@crawlee/playwright";
import { v4 as uuid } from "uuid";
import { DomainInfo } from "./domain.type";
import { Page } from "playwright";
import { BrowserName, DeviceCategory, OperatingSystemsName } from "@crawlee/browser-pool";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Crawler {
  constructor(private readonly configService: ConfigService) {
  }
  async doCrawler({
    url,
    processPage,
    headless = false
  }: {
    url: string
    processPage: (page: Page) => Promise<DomainInfo>
    headless: boolean
  }): Promise<DomainInfo> {
    const requestQueue = await RequestQueue.open(uuid());
    await requestQueue.addRequest({ url });
    return new Promise(async (resolve, reject) => {
      const crawler = new PlaywrightCrawler({
        requestQueue,
        requestHandlerTimeoutSecs: 20,
        maxRequestRetries: 3,
        headless,
        requestHandler: async ({ page }) => {
          try {
            const result = await processPage(page);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        proxyConfiguration: process.env.NODE_ENV === 'prod' ? undefined :  new ProxyConfiguration({
          proxyUrls: [this.configService.get('PROXY_URL')]
        }),
        browserPoolOptions: {
          fingerprintOptions: {
            fingerprintGeneratorOptions: {
              browsers: [BrowserName.firefox, BrowserName.chrome],
              devices: [DeviceCategory.desktop],
              operatingSystems: [OperatingSystemsName.macos, OperatingSystemsName.windows, OperatingSystemsName.linux],
              locales: ["en-US", "fr", "de"]
            }
          }
        }
      });

      await crawler.run();
    });
  }
}