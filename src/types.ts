export {}

declare global {
  interface Window {
    vitals: Vitals
  }
}

export type Vitals = {
  init: (siteId: string) => void
  report: (metric: Metric, siteId: string) => void
}

export type Metric = {
  name: 'FID' | 'TTFB' | 'LCP' | 'CLS' | 'FCP'
  value: number
  delta: number
  id: string
  entries: any[]
}
