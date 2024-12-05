import { onCleanup, onMount, createEffect, Component } from 'solid-js'
import {
    ColorType,
    createChart,
    IChartApi,
    IPriceLine,
    LineData,
    PriceLineOptions,
} from 'lightweight-charts'
import { useErrorHandler } from '../../context/Error'

/**
 * Properties for the PriceLineChart component.
 *
 * @typedef {Object} PriceLineChartProps
 * @property {LineData[]} data - The line data to be displayed in the chart.
 */
interface PriceLineChartProps {
    data: LineData[]
}

/**
 * The PriceLineChart component.
 *
 * This component creates and manages a price line chart using the lightweight-charts library.
 *
 * @component
 * @example
 * <PriceLineChart data={[{ time: '2022-01-01', value: 100 }, { time: '2022-01-02', value: 110 }]} />
 *
 * @param {PriceLineChartProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered PriceLineChart component.
 */
const PriceLineChart: Component<PriceLineChartProps> = (props) => {
    const { setAppActivityLog } = useErrorHandler()
    let priceLines: IPriceLine[] = []
    let chartContainer: HTMLDivElement | undefined
    let chart: IChartApi | undefined
    let series: any

    onMount(() => {
        if (chartContainer) {
            chart = createChart(chartContainer, {
                autoSize: true,
                layout: {
                    textColor: 'black',
                    background: { type: ColorType.Solid, color: 'white' },
                },
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                },
            })

            series = chart.addLineSeries({
                color: '#111',
                lineWidth: 2,
                lastValueVisible: false,
                priceLineVisible: false,
            })

            onCleanup(() => {
                chart?.remove()
            })
        }
    })

    createEffect(() => {
        const currentData = props.data

        if (!series || currentData.length === 0) return

        // Clear existing data and price lines
        series.setData(currentData)
        priceLines.forEach((line) => series.removePriceLine(line))

        let minimumPrice = currentData[0].value
        let maximumPrice = minimumPrice

        for (let i = 1; i < currentData.length; i++) {
            const price = currentData[i].value
            if (price > maximumPrice) {
                maximumPrice = price
            }
            if (price < minimumPrice) {
                minimumPrice = price
            }
        }

        const avgPrice = (maximumPrice + minimumPrice) / 2
        const lineWidth = 2

        const minPriceLine: Partial<PriceLineOptions> = {
            price: minimumPrice,
            color: '#ef5350',
            lineWidth: lineWidth,
            lineStyle: 2,
            axisLabelVisible: true,
            title: 'min price',
        }
        const avgPriceLine: Partial<PriceLineOptions> = {
            price: avgPrice,
            color: 'black',
            lineWidth: lineWidth,
            lineStyle: 1,
            axisLabelVisible: true,
            title: 'ave price',
        }
        const maxPriceLine: Partial<PriceLineOptions> = {
            price: maximumPrice,
            color: '#26a69a',
            lineWidth: lineWidth,
            lineStyle: 2,
            axisLabelVisible: true,
            title: 'max price',
        }

        const newPriceLines = [
            series.createPriceLine(minPriceLine),
            series.createPriceLine(avgPriceLine),
            series.createPriceLine(maxPriceLine),
        ]

        priceLines = newPriceLines

        chart?.timeScale().fitContent()
        setAppActivityLog('Price line chart updated')
    })

    return (
        <div
            ref={(el) => (chartContainer = el)}
            style={{ width: '100%', height: '500px' }}
        ></div>
    )
}

export default PriceLineChart
