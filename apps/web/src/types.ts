export type DomainInfo = {
  register: string
  domain: string
  price: string
  realPrice: string
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