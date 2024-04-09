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
    processPage
  }: {
    url: string
    processPage: (page: Page) => Promise<DomainInfo>
  }): Promise<DomainInfo> {
    const requestQueue = await RequestQueue.open(uuid());
    await requestQueue.addRequest({ url });
    return new Promise(async (resolve, reject) => {
      const crawler = new PlaywrightCrawler({
        requestQueue,
        requestHandlerTimeoutSecs: 60 * 60,
        maxRequestRetries: 10,
        headless: false,
        requestHandler: async ({ page }) => {
          try {
            const result = await processPage(page);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        proxyConfiguration: process.env.NODE_ENV === 'development' ? new ProxyConfiguration({
          proxyUrls: [this.configService.get('PROXY_URL')]
        }) : undefined,
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