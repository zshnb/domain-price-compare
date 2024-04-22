const crrncy: {
  [key: string]: {
    [key: string]: number
  }
} = {'RMB': {'USD': 0.13}, 'USD': {'RMB': 7.20}}

export function convertCurrency(amount: number, from: string, to: string) {
  let result: number
  if (from == to){
    result = amount;
  } else {
    result = amount * crrncy[from][to];
  }

  return Math.floor(result * 100) / 100
}