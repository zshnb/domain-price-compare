export type Currency = 'USD' | 'RMB' | 'HKD'
export type DomainInfo ={
  domain: string
  price: number
  realPrice: number
  currency: Currency
  available: boolean
  buyLink?: string
}

export type NameCheapResponse = {
  Name: string
  Pricing: {
    Price: number
    Renewal: number
    Duration: number
    DurationType: string
  }
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

export type GodaddyResponse = {
  CurrentPriceDisplay: string
  ExactMatchDomain: {
    IsAvailable: boolean
  }
  ClientRequestIn: {
    CurrencyRate: number,
    Currency: string,
  }
}

export type RegisterResponse = {
  response: {
    data: {
      searchedDomains: {
        available: boolean
        currency: string
        unitPrice: number
        unitPriceWithCurrency: string
      }[]
    }
  }
}

export type WestCNResponse = {
  success: {
    price: number
  }[]
}

export type XinnetResponse = {
  result: {
    yes: {
      prices: {
        price: number
        activityPrice: number
        renewPrice: number
        timeAmount: number
      }[]
    }[]
  }[]
}

export type HuaweiResponse = {
  productRatingResult: {
    amount: number
    discountAmount: number
    originalAmount: number
  }[]
}