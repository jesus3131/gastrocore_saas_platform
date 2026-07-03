import { useState } from 'react'

interface DataPoint {
  label: string
  value: number
  secondary?: number
}

interface SvgAreaChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  gradientId?: string
  formatValue?: (v: number) => string
  title?: string
}

export function SvgAreaChart({
  data,
  height = 180,
  color = '#f59e0b',
  gradientId = 'areaGradient',
  formatValue = (v) => v.toLocaleString(),
  title,
}: SvgAreaChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const width = 600
  const padding = { top: 20, right: 16, bottom: 24, left: 48 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  if (!data.length) return null

  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.secondary || 0)), 1)
  const minVal = 0
  const range = maxVal - minVal || 1

  const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartW
  const yScale = (v: number) => padding.top + chartH - ((v - minVal) / range) * chartH

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.value).toFixed(1)}`)
    .join('')

  const areaPath = `${linePath}L${xScale(data.length - 1).toFixed(1)},${(padding.top + chartH).toFixed(1)}L${padding.left.toFixed(1)},${(padding.top + chartH).toFixed(1)}Z`

  const yTicks = 5
  const yLabels = Array.from({ length: yTicks }, (_, i) => {
    const v = minVal + (range * i) / (yTicks - 1)
    return v
  })

  return (
    <div className="relative">
      {title && <p className="text-xs font-semibold text-on-surface mb-2">{title}</p>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yLabels.map((v) => (
          <g key={v}>
            <line
              x1={padding.left}
              y1={yScale(v)}
              x2={width - padding.right}
              y2={yScale(v)}
              stroke="currentColor"
              className="text-on-surface-muted/10"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={yScale(v) + 3}
              textAnchor="end"
              className="fill-on-surface-muted text-[10px]"
            >
              {formatValue(v)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={xScale(i)}
              cy={yScale(d.value)}
              r={hovered === i ? 5 : 3}
              fill={color}
              className="transition-all cursor-pointer"
              stroke="white"
              strokeWidth="2"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
            {d.secondary !== undefined && (
              <circle
                cx={xScale(i)}
                cy={yScale(d.secondary)}
                r={hovered === i ? 4 : 2}
                fill="#10b981"
                className="transition-all cursor-pointer"
                stroke="white"
                strokeWidth="1.5"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            )}
          </g>
        ))}

        {data.map((d, i) => (
          <text
            key={i}
            x={xScale(i)}
            y={height - 4}
            textAnchor="middle"
            className="fill-on-surface-muted text-[9px]"
          >
            {d.label.length > 5 ? d.label.slice(0, 5) : d.label}
          </text>
        ))}
      </svg>

      {hovered !== null && (
        <div
          className="absolute bg-surface-container-high border border-on-surface-muted/20 rounded-lg px-3 py-2 shadow-xl pointer-events-none z-10 text-xs"
          style={{
            left: `${(hovered / (data.length - 1)) * 95 + 2.5}%`,
            top: '-8px',
            transform: 'translateX(-50%)',
          }}
        >
          <p className="font-medium text-on-surface">{data[hovered].label}</p>
          <p className="text-primary font-bold">{formatValue(data[hovered].value)}</p>
          {data[hovered].secondary !== undefined && (
            <p className="text-emerald-500">{formatValue(data[hovered].secondary)}</p>
          )}
        </div>
      )}
    </div>
  )
}

interface SvgBarChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  formatValue?: (v: number) => string
  title?: string
  horizontal?: boolean
}

export function SvgBarChart({
  data,
  height = 200,
  color = '#f59e0b',
  formatValue = (v) => v.toLocaleString(),
  title,
  horizontal,
}: SvgBarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const width = horizontal ? 400 : 500
  const padding = { top: 20, right: 16, bottom: horizontal ? 16 : 24, left: horizontal ? 100 : 48 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  if (!data.length) return null

  const maxVal = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="relative">
      {title && <p className="text-xs font-semibold text-on-surface mb-2">{title}</p>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {data.map((d, i) => {
          const barW = horizontal
            ? ((d.value / maxVal) * chartW)
            : (chartW / data.length) * 0.7
          const barH = horizontal
            ? (chartH / data.length) * 0.6
            : (d.value / maxVal) * chartH
          const x = horizontal
            ? padding.left
            : padding.left + (chartW / data.length) * i + (chartW / data.length) * 0.15
          const y = horizontal
            ? padding.top + (chartH / data.length) * i + (chartH / data.length) * 0.2
            : padding.top + chartH - barH

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={horizontal ? barW : barW}
                height={horizontal ? barH : barH}
                rx={3}
                fill={hovered === i ? color : color + 'cc'}
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {horizontal && (
                <text
                  x={padding.left - 8}
                  y={y + barH / 2 + 3}
                  textAnchor="end"
                  className="fill-on-surface-muted text-[10px]"
                >
                  {d.label}
                </text>
              )}
              {!horizontal && (
                <text
                  x={x + barW / 2}
                  y={height - 4}
                  textAnchor="middle"
                  className="fill-on-surface-muted text-[9px]"
                >
                  {d.label.length > 5 ? d.label.slice(0, 5) : d.label}
                </text>
              )}
              {hovered === i && (
                <text
                  x={horizontal ? x + barW + 8 : x + barW / 2}
                  y={horizontal ? y + barH / 2 + 3 : y - 6}
                  textAnchor={horizontal ? 'start' : 'middle'}
                  className="fill-on-surface text-[10px] font-bold"
                >
                  {formatValue(d.value)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

interface SvgSparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showDot?: boolean
}

export function SvgSparkline({
  data,
  width = 120,
  height = 32,
  color = '#f59e0b',
  showDot = true,
}: SvgSparklineProps) {
  if (!data.length) return null

  const maxVal = Math.max(...data, 1)
  const minVal = Math.min(...data, 0)
  const range = maxVal - minVal || 1
  const padding = 2
  const chartW = width - padding * 2
  const chartH = height - padding * 2

  const xScale = (i: number) => padding + (i / (data.length - 1)) * chartW
  const yScale = (v: number) => padding + chartH - ((v - minVal) / range) * chartH

  const path = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d).toFixed(1)}`)
    .join('')

  const trend = data[data.length - 1] - data[0]
  const finalColor = trend >= 0 ? '#10b981' : '#ef4444'
  const strokeColor = color || finalColor

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDot && (
        <circle cx={xScale(data.length - 1)} cy={yScale(data[data.length - 1])} r="2.5" fill={strokeColor} stroke="white" strokeWidth="1" />
      )}
    </svg>
  )
}

export function ArchitectureDiagram() {
  const [activeNode, setActiveNode] = useState<string | null>(null)

  const nodes = [
    { id: 'dns', label: 'DNS\nCloudflare', x: 300, y: 30, color: '#3b82f6' },
    { id: 'lb', label: 'Load\nBalancer', x: 300, y: 90, color: '#8b5cf6' },
    { id: 'api', label: 'API\nNode.js', x: 150, y: 160, color: '#f59e0b' },
    { id: 'web', label: 'Web\nReact SPA', x: 450, y: 160, color: '#10b981' },
    { id: 'redis', label: 'Redis\nCache', x: 150, y: 240, color: '#ef4444' },
    { id: 'db', label: 'PostgreSQL\nMulti-Tenant', x: 300, y: 240, color: '#06b6d4' },
    { id: 'analytics', label: 'Analytics\nPython', x: 450, y: 240, color: '#f97316' },
    { id: 's3', label: 'S3\nStorage', x: 300, y: 310, color: '#84cc16' },
  ]

  const connections = [
    { from: 'dns', to: 'lb' },
    { from: 'lb', to: 'api' },
    { from: 'lb', to: 'web' },
    { from: 'api', to: 'redis' },
    { from: 'api', to: 'db' },
    { from: 'web', to: 'api' },
    { from: 'api', to: 'analytics' },
    { from: 'analytics', to: 'db' },
    { from: 'redis', to: 'db' },
    { from: 's3', to: 'api' },
  ]

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">Arquitectura del Sistema</h3></div>
      <div className="card-body">
        <svg viewBox="0 0 600 360" className="w-full h-auto">
          {connections.map((conn) => {
            const from = nodeMap.get(conn.from)
            const to = nodeMap.get(conn.to)
            if (!from || !to) return null
            const isActive = activeNode === conn.from || activeNode === conn.to
            return (
              <line
                key={`${conn.from}-${conn.to}`}
                x1={from.x}
                y1={from.y + 18}
                x2={to.x}
                y2={to.y - 18}
                stroke={isActive ? '#f59e0b' : 'currentColor'}
                strokeWidth={isActive ? 2 : 1}
                strokeOpacity={isActive ? 0.8 : 0.15}
                className="transition-all"
              />
            )
          })}

          {nodes.map((node) => {
            const isActive = activeNode === node.id
            return (
              <g
                key={node.id}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                className="cursor-pointer"
              >
                <rect
                  x={node.x - 48}
                  y={node.y - 16}
                  width={96}
                  height={36}
                  rx={8}
                  fill={isActive ? node.color : node.color + '33'}
                  stroke={isActive ? node.color : node.color + '66'}
                  strokeWidth={isActive ? 2 : 1}
                  className="transition-all"
                />
                {node.label.split('\n').map((line, i) => (
                  <text
                    key={i}
                    x={node.x}
                    y={node.y + (i === 0 ? -2 : 10)}
                    textAnchor="middle"
                    className={`text-[9px] font-medium ${isActive ? 'fill-white' : 'fill-on-surface'}`}
                  >
                    {line}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
        <div className="flex flex-wrap gap-2 mt-2 justify-center">
          {nodes.map((n) => (
            <div
              key={n.id}
              className="flex items-center gap-1.5 text-2xs text-on-surface-muted"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />
              {n.id === 'api' ? 'API' : n.id === 'web' ? 'Web' : n.id === 'db' ? 'DB' : n.id === 'redis' ? 'Redis' : n.id === 'lb' ? 'LB' : n.id === 'dns' ? 'DNS' : n.id === 'analytics' ? 'Analytics' : n.id === 's3' ? 'S3' : n.id}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}