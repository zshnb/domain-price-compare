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
  byApi: {
    tencent: '腾讯云',
    aliyun: '阿里云',
    dynadot: 'Dynadot',
    namesilo: 'NameSilo',
    xinnet: '新网',
    westCN: '西部数码',
    huawei: '华为云',
  },
  byCrawl: {
    godaddy: 'GoDaddy',
    namecheap: 'NameCheap',
    domain: 'Domain',
    register: 'Register',
  }
}
