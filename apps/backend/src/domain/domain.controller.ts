import {BadRequestException, Controller, Get, Query} from "@nestjs/common";
import { DomainService } from './domain.service';

@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get('godaddy')
  async godaddy(@Query() domain: string) {
    try {
      const result = await this.domainService.godaddy(domain)
      return {
        data: result,
      }
    } catch (e) {
      throw new BadRequestException()
    }
  }

  @Get('namecheap')
  async namecheap(@Query() domain: string) {
    try {
      const result = await this.domainService.namecheap(domain)
      return {
        data: result,
      }
    } catch (e) {
      throw new BadRequestException()
    }
  }

  @Get('namesilo')
  async namesilo(@Query() domain: string) {
    try {
      const result = await this.domainService.namesilo(domain)
      return {
        data: result,
      }
    } catch (e) {
      throw new BadRequestException()
    }
  }

  @Get('aliyun')
  async aliyun(@Query() domain: string) {
    try {
      const result = await this.domainService.aliyun(domain)
      return {
        data: result,
      }
    } catch (e) {
      throw new BadRequestException()
    }
  }

  @Get('tencent')
  async tencent(@Query() domain: string) {
    try {
      const result = await this.domainService.tencent(domain)
      return {
        data: result,
      }
    } catch (e) {
      throw new BadRequestException()
    }
  }
}
