export type DomainInfo ={
  domain: string
  price: string
  realPrice: string
  available: boolean
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