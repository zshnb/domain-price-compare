import { BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { DomainService } from './domain.service';
import { ThrottlerGuard } from "@nestjs/throttler";

@Controller('domain')
@UseGuards(ThrottlerGuard)
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get('godaddy')
  async godaddy(@Query('domain') domain: string) {
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
  async namecheap(@Query('domain') domain: string) {
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
  async namesilo(@Query('domain') domain: string) {
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
  async aliyun(@Query('domain') domain: string) {
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
  async tencent(@Query('domain') domain: string) {
    try {
      const result = await this.domainService.tencent(domain)
      return {
        data: result,
      }
    } catch (e) {
      console.error('tencent api error', e);
      throw new BadRequestException()
    }
  }

  @Get('domain')
  async domain(@Query('domain') domain: string) {
    try {
      const result = await this.domainService.domain(domain)
      return {
        data: result,
      }
    } catch (e) {
      console.error('domain api error', e);
      throw new BadRequestException()
    }
  }

  @Get('dynadot')
  async dynadot(@Query('domain') domain: string) {
    try {
      const result = await this.domainService.dynadot(domain)
      return {
        data: result,
      }
    } catch (e) {
      console.error('domain api error', e);
      throw new BadRequestException()
    }
  }

  @Get('register')
  async register(@Query('domain') domain: string) {
    try {
      const result = await this.domainService.register(domain)
      return {
        data: result,
      }
    } catch (e) {
      console.error('domain api error', e);
      throw new BadRequestException()
    }
  }

  @Get('westCN')
  async westCN(@Query('domain') domain: string) {
    try {
      const result = await this.domainService.westCN(domain)
      return {
        data: result,
      }
    } catch (e) {
      console.error('domain api error', e);
      throw new BadRequestException()
    }
  }

  @Get('xinnet')
  async xinnet(@Query('domain') domain: string) {
    try {
      const result = await this.domainService.xinnet(domain)
      return {
        data: result,
      }
    } catch (e) {
      console.error('domain api error', e);
      throw new BadRequestException()
    }
  }

  @Get('huawei')
  async huawei(@Query('domain') domain: string) {
    try {
      const result = await this.domainService.huawei(domain)
      return {
        data: result,
      }
    } catch (e) {
      console.error('domain api error', e);
      throw new BadRequestException()
    }
  }
}
