export const dynamic = "force-static";
export default function sitemap() { const paths = ["","/cars-for-sale","/sell-my-car","/value-my-car","/finance-calculator"]; return paths.map((url) => ({url:`https://garilink.tz${url}`,lastModified:new Date()})); }
