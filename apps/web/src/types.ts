export type Currency = 'USD' | 'RMB'

export type DomainInfo = {
  register: string
  domain: string
  price: number
  realPrice: number
  currency: Currency
  available: boolean
  icon: string
  buyLink?: string
}

export const DomainRegister = {
  tencent: '腾讯云',
  aliyun: '阿里云',
  huawei: '华为云',
  westCN: '西部数码',
  xinnet: '新网',
  godaddy: 'GoDaddy',
  dynadot: 'dynadot',
  namesilo: 'NameSilo',
  namecheap: 'NameCheap',
  domain: 'Domain',
  register: 'register',
}
