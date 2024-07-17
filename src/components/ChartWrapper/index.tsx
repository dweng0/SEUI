import { Component, createEffect, createSignal } from 'solid-js'
import Chart from '../Chart'
import { useNetwork } from '../../context/Network'
import { LineData } from 'lightweight-charts'

const ChartWrapper: Component = () => {
    const { charts, chartsLoading, activePair } = useNetwork()
    const [plots, setPlots] = createSignal<LineData[]>([])

    createEffect(() => {
        if (activePair() && !chartsLoading() && charts()) {
            const selectedChart = charts()
                .filter((chart) => chart.name === activePair())
                .map((chart) =>
                    chart.plot.map((plot) => {
                        const date = new Date(plot.x)
                        const unixTimestamp = Math.floor(date.getTime() / 1000)
                        return {
                            time: unixTimestamp,
                            value: parseFloat(plot.y),
                        }
                    })
                )
            const flattenedSelectedChart: LineData[] =
                selectedChart.flat() as unknown as any

            // Use a Map to remove duplicates based on the time field
            const uniquePlotsMap = new Map()
            flattenedSelectedChart.forEach((plot) => {
                if (!uniquePlotsMap.has(plot.time)) {
                    uniquePlotsMap.set(plot.time, plot)
                }
            })
            const uniquePlots = Array.from(uniquePlotsMap.values())

            // Sort the uniquePlots array by the time field
            uniquePlots.sort((a, b) => a.time - b.time)

            setPlots(uniquePlots)
        }
    })

    return (
        <div>
            {chartsLoading() && plots().length !== 0 ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Chart data={plots()} />
                </>
            )}
        </div>
    )
}

export default ChartWrapper
