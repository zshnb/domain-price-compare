import { Test, TestingModule } from '@nestjs/testing';
import { DomainService } from "./domain.service";
import { DomainController } from "./domain.controller";
import { Crawler } from "./crawler";
import { ConfigModule } from "@nestjs/config";

describe('DomainService', () => {
  let domainService: DomainService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(async () => ({
          PROXY_URL: 'http://127.0.0.1:7890'
        }))
      ],
      controllers: [DomainController],
      providers: [DomainService, Crawler],
    }).compile();

    domainService = app.get<DomainService>(DomainService);
  });

  describe("godaddy api", () => {
    it('success with available domain', async () => {
      const result = await domainService.godaddy('sleek123.com')
      expect(result.available).toBeTruthy()
      console.log(result);
    }, 600000)
    it('success with unavailable domain', async () => {
      const result = await domainService.godaddy('sleek.com')
      expect(result.available).toBeFalsy()
    }, 600000)
  });
  describe("namecheap api", () => {
    it('success with available domain', async () => {
      const result = await domainService.namecheap('sleek123.com')
      expect(result.available).toBeTruthy()
    }, 600000)
    it('success with unavailable domain', async () => {
      const result = await domainService.namecheap('sleek.com')
      expect(result.available).toBeFalsy()
    }, 600000)
  });
  describe("namesilo api", () => {
    it('success with available domain', async () => {
      const result = await domainService.namesilo('sleek123.com')
      expect(result.available).toBeTruthy()
    }, 600000)
    it('success with unavailable domain', async () => {
      const result = await domainService.namesilo('sleek.com')
      expect(result.available).toBeFalsy()
    }, 600000)
  });
  describe("aliyun api", () => {
    it('success with available domain', async () => {
      const result = await domainService.aliyun('sleek123.com')
      expect(result.available).toBeTruthy()
    }, 600000)
    it('success with unavailable domain', async () => {
      const result = await domainService.aliyun('sleek.com')
      expect(result.available).toBeFalsy()
    }, 600000)
  });
  describe("domain api", () => {
    it('success with available domain', async () => {
      const result = await domainService.domain('sleek123.com')
      expect(result.available).toBeTruthy()
    }, 600000)
    it('success with unavailable domain', async () => {
      const result = await domainService.domain('sleek.com')
      expect(result.available).toBeFalsy()
    }, 600000)
  });
});
