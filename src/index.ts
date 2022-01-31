import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals'
import { finder } from '@medv/finder'
import { Metric } from 'types'
let registered = false

const vitalsUrl = 'https://vitals.sh/api/report'

export const reportMetric = (metric: Metric, siteId: string) => {
  const elements = []
  if (metric.name === 'LCP') {
    elements.push({
      element: finder(metric.entries[0].element),
      value: metric.value,
    })
  }
  if (metric.name === 'CLS') {
    metric.entries.forEach((entry) => {
      entry.sources.forEach((element: any) => {
        elements.push({
          element: finder(element.node),
          value: entry.value,
        })
      })
    })
  }

  const body = {
    sid: siteId,
    loc: location.href,
    evt: metric.name,
    val: metric.value.toString(),
    spd:
      'connection' in navigator &&
      navigator['connection'] &&
      'effectiveType' in navigator['connection']
        ? navigator['connection']['effectiveType']
        : '',
    elm: JSON.stringify(elements),
  }

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded',
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob)
  } else {
    fetch(vitalsUrl, {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    })
  }
}

const initVitals = (siteId: string) => {
  if (registered || !siteId) {
    return
  }
  registered = true

  try {
    getFID((metric) => reportMetric(metric, siteId))
    getTTFB((metric) => reportMetric(metric, siteId))
    getLCP((metric) => reportMetric(metric, siteId))
    getCLS((metric) => reportMetric(metric, siteId))
    getFCP((metric) => reportMetric(metric, siteId))
  } catch (err) {
    console.error('[vitals.sh]', err)
  }
}

const vitals = {
  report: reportMetric,
  init: initVitals,
}

window.vitals = vitals
export default vitals

if (typeof window !== 'undefined') {
  const siteId = document
    .querySelector('[data-vitals-id]')
    ?.getAttribute('data-vitals-id')
  siteId && vitals.init(siteId)
}
