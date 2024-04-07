import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  fetch("https://www.godaddy.com/zh-sg/domainfind/v1/search/exact?search_guid=f4e60e7d-474d-40a2-9f24-19d5af3e10d3&req_id=1712419186131&isc=&itc=dlp_cheapdomain_buy_domain&partial_query=sleek123.com&key=dlp_offer_all&q=sleek123.com", {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
    },
    method: "GET"
  }).then(res => {
    console.log(res)
  })
  return NextResponse.json({data: 'ok'})
}