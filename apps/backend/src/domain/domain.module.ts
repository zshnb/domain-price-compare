import { Module } from '@nestjs/common'
import { DomainService } from './domain.service'
import { DomainController } from './domain.controller'
import { Crawler } from './crawler'

@Module({
  providers: [DomainService, Crawler],
  controllers: [DomainController],
})
export class DomainModule {}
