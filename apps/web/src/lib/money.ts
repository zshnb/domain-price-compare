const crrncy: {
  [key: string]: {
    [key: string]: number
  }
} = {'RMB': {'USD': 0.13, 'HKD': 1.01}, 'USD': {'RMB': 7.20, 'HKD': 7.3}, 'HKD': {'RMB': 1.01, 'USD': 0.12}};

export function convertCurrency(amount: number, from: string, to: string) {
  let result: number
  if (from == to){
    result = amount;
  } else {
    result = amount * crrncy[from][to];
  }

  return Math.floor(result * 100) / 100
}