"use client"

import { cn } from "@/lib/utils"
import * as React from "react"
import * as RechartsPrimitive from "recharts"

/* ======================================================
   THEME CONFIG
====================================================== */

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

/* ======================================================
   CONTEXT
====================================================== */

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within <ChartContainer />")
  }
  return context
}

/* ======================================================
   CHART CONTAINER
====================================================== */

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

/* ======================================================
   STYLE INJECTOR
====================================================== */

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, c]) => c.color || c.theme
  )

  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart="${id}"] {
${colorConfig
                .map(([key, item]) => {
                  const color =
                    item.theme?.[theme as keyof typeof item.theme] || item.color
                  return color ? `--color-${key}: ${color};` : ""
                })
                .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

/* ======================================================
   TOOLTIP (shadcn/ui STYLE)
====================================================== */

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent(props: any) {
  const {
    active,
    payload,
    label,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey,
  } = props

  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  const tooltipLabel = !hideLabel
    ? (() => {
      const [item] = payload
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)

      const value =
        typeof label === "string"
          ? config[label]?.label || label
          : itemConfig?.label

      if (!value) return null

      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter ? labelFormatter(value, payload) : value}
        </div>
      )
    })()
    : null

  return (
    <div
      className={cn(
        "grid min-w-[8rem] gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {tooltipLabel}

      {payload.map((item: any, index: number) => {
        const key = `${nameKey || item.name || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)
        const indicatorColor = color || item.color || item.payload?.fill

        return (
          <div key={index} className="flex items-center gap-2">
            {!hideIndicator && (
              <div
                className="h-2.5 w-2.5 rounded"
                style={{ backgroundColor: indicatorColor }}
              />
            )}
            <span className="flex-1 text-fg-muted">
              {itemConfig?.label || item.name}
            </span>
            {item.value !== undefined && (
              <span className="font-mono font-medium">
                {formatter
                  ? formatter(item.value, item.name, item, index)
                  : item.value.toLocaleString()}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ======================================================
   LEGEND
====================================================== */

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.HTMLAttributes<HTMLDivElement> & {
  payload?: any[]
  verticalAlign?: "top" | "bottom"
  hideIcon?: boolean
  nameKey?: string
}) {
  const { config } = useChart()

  if (!payload?.length) return null

  return (
    <div
      className={cn(
        "flex justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            {!hideIcon ? (
              itemConfig?.icon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 rounded"
                  style={{ backgroundColor: item.color }}
                />
              )
            ) : null}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

/* ======================================================
   HELPER
====================================================== */

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
) {
  if (!payload) return undefined

  const rawPayload = payload.payload ?? null

  let configKey = key

  if (typeof payload[key] === "string") {
    configKey = payload[key]
  } else if (rawPayload && typeof rawPayload[key] === "string") {
    configKey = rawPayload[key]
  }

  return config[configKey] ?? config[key]
}

/* ======================================================
   EXPORTS
====================================================== */

export {
  ChartContainer, ChartLegend,
  ChartLegendContent, ChartStyle,
  ChartTooltip,
  ChartTooltipContent
}

