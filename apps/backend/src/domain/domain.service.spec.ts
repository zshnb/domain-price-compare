import { Test, TestingModule } from '@nestjs/testing';
import { DomainService } from "./domain.service";
import { DomainController } from "./domain.controller";
import { Crawler } from "./crawler";
import { ConfigModule } from "@nestjs/config";
import {ThrottlerModule} from "@nestjs/throttler";
import {describe, beforeEach, it, expect} from 'vitest'

describe('DomainService', () => {
  let domainService: DomainService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(async () => ({
          PROXY_URL: 'http://127.0.0.1:7890'
        })),
        ThrottlerModule.forRoot([{
          ttl: 60000,
          limit: 30,
        }]),
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
      console.log(result)
      expect(result.available).toBeTruthy()
    }, 600000)
    it('success with unavailable domain', async () => {
      const result = await domainService.aliyun('sleek.com')
      expect(result.available).toBeFalsy()
    }, 600000)
  });
  describe("tencent api", () => {
    it('success with available domain', async () => {
      const result = await domainService.tencent('domainprice.cc')
      console.log(result);
      expect(result.available).toBeTruthy()
    }, 600000)
    it('success with unavailable domain', async () => {
      const result = await domainService.tencent('sleek.com')
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
  describe("dynadot api", () => {
    it('success with available domain', async () => {
      const result = await domainService.dynadot('sleek123.com')
      expect(result.available).toBeTruthy()
    }, 600000)
    it('success with unavailable domain', async () => {
      const result = await domainService.dynadot('sleek.com')
      expect(result.available).toBeFalsy()
    }, 600000)
  });
  describe("register api", () => {
    it('success with available domain', async () => {
      const result = await domainService.register('sleek123.com')
      expect(result.available).toBeTruthy()
    }, 600000)
  });
  describe("west cn api", () => {
    it('success with available domain', async () => {
      const result = await domainService.westCN('sleek123.com')
      expect(result.available).toBeTruthy()
    }, 600000)
  });
  describe("xinnet api", () => {
    it('success with available domain', async () => {
      const result = await domainService.xinnet('sleek123.com')
      expect(result.available).toBeTruthy()
    }, 600000)
  });
  describe("huawei api", () => {
    it('success with available domain', async () => {
      const result = await domainService.huawei('sleek123.com')
      expect(result.available).toBeTruthy()
      expect(result.price).toBeGreaterThan(0)
    }, 600000)
  });
});
