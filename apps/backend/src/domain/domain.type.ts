export type DomainInfo ={
  domain: string
  price: string
  realPrice: string
  available: boolean
  buyLink?: string
}

export type NameSiloResponse = {
  data: {
    domains: {
      available: boolean,
      domain: string,
      currentPrice: number
    }[]
  }
}

export type AliyunResponse = {
  module: {
    domainDetail: {
      avail: number
      name: string
    }
    priceList?: {
      action: string
      money: number
      period: number
    }[]
  }
}

export type DomainResponse = {
  response: {
    data: {
      searchedDomains: {
        isAvailable: boolean
        terms: {
          price: number
          termUnit: string
          term: number
        }[]
      }[]
    }
  }
}