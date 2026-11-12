import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2, Calendar } from 'lucide-react'
import * as echarts from 'echarts'
import { reportApi, type SalesRankItem } from '@/api/report'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


const DS_COLORS = {
  primary: '#4F6035',
  secondary: '#F0BEB7',
  accent: '#E7E57C',
  textSub: '#7A847D',
  border: '#E6E2DA',
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function ReportPage() {
  const [begin, setBegin] = useState(daysAgo(30))
  const [end, setEnd] = useState(today())
  const [loading, setLoading] = useState(false)

  const [salesRank, setSalesRank] = useState<SalesRankItem[]>([])
  const [orderReport, setOrderReport] = useState<{ dateList: string[]; orderCountList: number[]; turnoverList: number[] } | null>(null)

  const barRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const barInstance = useRef<echarts.ECharts | null>(null)
  const lineInstance = useRef<echarts.ECharts | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [rankRes, orderRes] = await Promise.all([
        reportApi.top10(begin, end).catch(() => []),
        reportApi.orderReport(begin, end).catch(() => null),
      ])
      setSalesRank(rankRes)
      setOrderReport(orderRes)
    } catch {
      // interceptor handles
    } finally {
      setLoading(false)
    }
  }, [begin, end])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    if (!barRef.current) return
    if (barInstance.current && barInstance.current.isDisposed()) {
      barInstance.current = null
    }
    if (!barInstance.current) {
      barInstance.current = echarts.init(barRef.current)
    }
    const chart = barInstance.current

    const rank = salesRank.slice(0, 10)

    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 48, right: 24, top: 32, bottom: 56 },
      xAxis: {
        type: 'category',
        data: rank.length > 0 ? rank.map((item) => item.name) : ['暂无数据'],
        axisLabel: { color: DS_COLORS.textSub, fontSize: 10, rotate: 35, overflow: 'truncate', width: 60 },
        axisLine: { lineStyle: { color: DS_COLORS.border } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: DS_COLORS.textSub, fontSize: 12 },
        splitLine: { lineStyle: { color: DS_COLORS.border, type: 'dashed' } },
        axisLine: { show: false },
      },
      series: [
        {
          name: '销量',
          type: 'bar',
          data: rank.map((item) => item.number),
          itemStyle: { color: DS_COLORS.primary },
          barWidth: 16,
          barMaxWidth: 24,
        },
      ],
    })

    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [salesRank])

  useEffect(() => {
    if (!lineRef.current) return
    if (lineInstance.current && lineInstance.current.isDisposed()) {
      lineInstance.current = null
    }
    if (!lineInstance.current) {
      lineInstance.current = echarts.init(lineRef.current)
    }
    const chart = lineInstance.current

    if (!orderReport) {
      chart.setOption({
        title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: DS_COLORS.textSub } },
        xAxis: { show: false },
        yAxis: { show: false },
        series: [],
      })
      return
    }

    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['订单数', '营业额'], textStyle: { color: DS_COLORS.textSub } },
      grid: { left: 56, right: 56, top: 48, bottom: 24 },
      xAxis: {
        type: 'category',
        data: orderReport.dateList,
        axisLabel: { color: DS_COLORS.textSub, fontSize: 12 },
        axisLine: { lineStyle: { color: DS_COLORS.border } },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: '订单数',
          axisLabel: { color: DS_COLORS.textSub, fontSize: 12 },
          splitLine: { lineStyle: { color: DS_COLORS.border, type: 'dashed' } },
          axisLine: { show: false },
        },
        {
          type: 'value',
          name: '营业额',
          axisLabel: { color: DS_COLORS.textSub, fontSize: 12, formatter: (v: number) => `¥${v}` },
          splitLine: { show: false },
          axisLine: { show: false },
        },
      ],
      series: [
        {
          name: '订单数',
          type: 'line',
          data: orderReport.orderCountList,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: DS_COLORS.primary, width: 2 },
          itemStyle: { color: DS_COLORS.primary },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(79,96,53,0.15)' },
            { offset: 1, color: 'rgba(79,96,53,0)' },
          ]) },
        },
        {
          name: '营业额',
          type: 'line',
          yAxisIndex: 1,
          data: orderReport.turnoverList,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: DS_COLORS.accent, width: 2 },
          itemStyle: { color: DS_COLORS.accent },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(231,229,124,0.15)' },
            { offset: 1, color: 'rgba(231,229,124,0)' },
          ]) },
        },
      ],
    })

    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [orderReport])

  useEffect(() => {
    return () => {
      barInstance.current?.dispose()
      barInstance.current = null
      lineInstance.current?.dispose()
      lineInstance.current = null
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="数据报表" description="销量排行与订单趋势" />

      <div className="card-border p-4">
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-2">
            <Label>开始日期</Label>
            <Input type="date" value={begin} onChange={(e) => setBegin(e.target.value)} className="w-40" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>结束日期</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-40" />
          </div>
          <Button variant="outline" onClick={fetch} disabled={loading}>
            {loading ? <Loader2 size={16} strokeWidth={1.5} className="animate-spin" /> : <Calendar size={16} strokeWidth={1.5} />}
            查询
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>销量排行</CardTitle></CardHeader>
          <CardContent>
            <div ref={barRef} className="h-80 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>订单趋势</CardTitle></CardHeader>
          <CardContent>
            <div ref={lineRef} className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
