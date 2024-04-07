import { Controller, Query } from '@nestjs/common';
import { DomainService } from './domain.service';

@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}
  async godaddy(@Query() domain: string) {
    const result = await this.domainService.godaddy(domain)

  }
}
