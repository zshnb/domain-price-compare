export type DomainInfo = {
  register: string
  domain: string
  price: string
  realPrice: string
  available: boolean
  buyLink?: string
}

export const DomainRegister = {
  tencent: '腾讯云',
  aliyun: '阿里云',
  godaddy: 'GoDaddy',
  namesilo: 'NameSilo',
  namecheap: 'NameCheap',
  domain: 'Domain',
}