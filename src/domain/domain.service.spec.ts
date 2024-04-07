import { Test, TestingModule } from '@nestjs/testing';
import { DomainService } from "./domain.service";
import { DomainController } from "./domain.controller";

describe('DomainService', () => {
  let domainService: DomainService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DomainController],
      providers: [DomainService],
    }).compile();

    domainService = app.get<DomainService>(DomainService);
  });

  describe("godaddy api", () => {
    it('success with available domain', async () => {
      const result = await domainService.godaddy('sleek123.com')
      expect(result.available).toBeTruthy()
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
});
