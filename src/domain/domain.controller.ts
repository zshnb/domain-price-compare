import { Controller, Get, Query } from "@nestjs/common";
import { DomainService } from './domain.service';

@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get('godaddy')
  async godaddy(@Query() domain: string) {
    const result = await this.domainService.godaddy(domain)
    return {
      data: result,
    }
  }
}
