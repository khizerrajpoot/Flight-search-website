import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PriceTrendPoint } from '../types/flights'

type PriceGraphProps = {
  data: PriceTrendPoint[]
  isDark?: boolean
}

export function PriceGraph({
  data,
  isDark = true,
}: PriceGraphProps) {
  const daysCount = data.length

  return (
    <div
      className={
        isDark
          ? 'rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40'
          : 'rounded-3xl border border-white/60 bg-white/70 p-4 shadow-lg shadow-indigo-200/60 backdrop-blur-xl'
      }
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2
            className={
              isDark
                ? 'text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'
                : 'text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500'
            }
          >
            Price graph
          </h2>
          <p
            className={
              isDark
                ? 'mt-1 text-xs text-slate-400'
                : 'mt-1 text-xs text-slate-500'
            }
          >
            Price trends from departure to return date. Shows minimum price per date. Updating live as you
            change search and filters.
          </p>
          {daysCount > 0 && (
            <p
              className={
                isDark
                  ? 'mt-1 text-[11px] text-slate-500'
                  : 'mt-1 text-[11px] text-slate-500'
              }
            >
              Showing {daysCount} price point{daysCount === 1 ? '' : 's'} from the current results
            </p>
          )}
        </div>
      </div>

      <div
        className={
          isDark
            ? 'mt-2 h-48 rounded-xl bg-linear-to-tr from-slate-950 via-slate-900 to-slate-950 p-3'
            : 'mt-2 h-48 rounded-xl bg-linear-to-tr from-slate-100 via-slate-50 to-white p-3'
        }
      >
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            Run a search to see price trends over your dates.
          </div>
        ) : data.every((d) => d.price === 0) ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            No flights found for the selected date range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -20, right: 0, top: 10 }}>
              <defs>
                <linearGradient id="priceAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={isDark ? '#1f2937' : '#e5e7eb'}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                tickMargin={6}
                axisLine={{ stroke: isDark ? '#1f2937' : '#e5e7eb' }}
                tickFormatter={(value: string) => {
                  const d = new Date(value)
                  if (Number.isNaN(d.getTime())) return value
                  return d.toLocaleDateString(undefined, {
                    month: 'short',
                    day: '2-digit',
                  })
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                tickMargin={4}
                axisLine={{ stroke: isDark ? '#1f2937' : '#e5e7eb' }}
                tickFormatter={(v) => `$${Math.round(v)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#020617' : '#ffffff',
                  border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
                  borderRadius: 12,
                  fontSize: 11,
                  color: isDark ? '#e5e7eb' : '#111827',
                }}
                labelStyle={{
                  color: isDark ? '#9ca3af' : '#6b7280',
                  marginBottom: 4,
                }}
                formatter={
                  ((value: number | undefined) => [
                    `$${(value ?? 0).toFixed(0)}`,
                    'Price',
                  ]) as any
                }
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#priceAvg)"
                dot={(props: any) => {
                  if (props.payload.price > 0) {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={3}
                        stroke="#0ea5e9"
                        strokeWidth={1}
                        fill="#0ea5e9"
                      />
                    )
                  }
                  return null
                }}
                activeDot={{ r: 5, stroke: '#0ea5e9', strokeWidth: 2 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

