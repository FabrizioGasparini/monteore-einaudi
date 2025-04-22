export const fetcher = (url: string) => fetch(url).then((r: any) => r.json())
