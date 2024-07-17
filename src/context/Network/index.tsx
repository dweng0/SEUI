import {
    createContext,
    useContext,
    ParentComponent,
    createSignal,
    createEffect,
} from 'solid-js'
import { useFetchArray, useFetchObject } from '../../hooks/fetch'
import { OrderBook, Quote } from '../interface'
import { useErrorHandler } from '../Error'
import { ChartItem, Depth } from '../interface/index'
import { fetchQuotes } from './service'

interface NetworkContextType {
    activePair: () => string
    setActivePair: (value: string) => void
    books: () => OrderBook[]
    booksLoading: () => boolean
    setBooks: (value: string) => void
    charts: () => ChartItem[]
    chartsLoading: () => boolean
    setCharts: (value: string) => void
    quotes: () => Quote[]
    currentPairDepth: () => Depth
}

export const rootAddress = 'https://cax.piccadilly.autonity.org/api'
const websocketAddress = 'wss://cax.piccadilly.autonity.org/api'
const chartAddress = 'https://d1ryfh2h40xr35.cloudfront.net/charts.json'

const initialDepthData = {
    asks: [],
    bids: [],
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export const NetworkProvider: ParentComponent = (props) => {
    const { setAppActivityLog } = useErrorHandler()
    const [activePair, setActivePair] = createSignal<string>('NTN-USDC')
    const [books, setBooks] = createSignal<OrderBook[]>([])
    const [charts, setCharts] = createSignal<ChartItem[]>([])
    const [chartsLoading, setChartsLoading] = createSignal<boolean>(true)
    const [booksLoading, setBooksLoading] = createSignal<boolean>(true)
    const [quotes, setQuotes] = createSignal<Quote[]>([])
    const [currentPairDepth, setCurrentPairDepth] =
        createSignal<Depth>(initialDepthData)

    const orderbooks = useFetchArray<OrderBook>(`${rootAddress}/orderbooks`)
    const depth = useFetchObject<Depth>(
        `${rootAddress}/orderbooks/${activePair()}/depth`,
        initialDepthData
    )

    const chartsResponse = useFetchArray<ChartItem>(chartAddress)
    // const socketFeed = useWebSocket<OrderBook>(
    //     `${websocketAddress}/orderbooks/NTN-USDC/feed`
    // )
    // socketFeed.connect()

    const updateActivePair = (pair: string) => {
        setAppActivityLog(`Active pair changed to ${pair}`)
        setActivePair(pair)
    }

    /**
     * Fetch depth if activepair changes
     */
    createEffect(() => {
        if (activePair()) {
            depth.performFetch(
                `${rootAddress}/orderbooks/${activePair()}/depth`
            )
        }
    })

    /**
     * Effect for handling state change on the chart fetcher
     */
    createEffect(() => {
        if (chartsResponse.loading()) {
            setAppActivityLog('Loading initial chartsResponse...')
            setChartsLoading(true)
        } else {
            setChartsLoading(false)
        }
        if (chartsResponse.error()) {
            setAppActivityLog(
                `Failed to fetch charts: ${chartsResponse.error()}`
            )
        } else if (!chartsResponse.loading() && chartsResponse.data()) {
            setAppActivityLog('Charts fetched successfully')
            setCharts(chartsResponse.data())
        }
    })

    /**
     * An effect that that loops through the order books and gets the /quote for each pair
     */
    createEffect(async () => {
        const booksList = books()
        if (booksList.length > 0) {
            try {
                setAppActivityLog('Fetching quotes for books...')
                const fetchedQuotes = await fetchQuotes(booksList, rootAddress)
                setQuotes(fetchedQuotes)
            } catch (e) {
                setAppActivityLog(`Failed to fetch quotes: ${e}`)
            }
        }
    })

    /**
     * An effect for getting the depth of the active book
     */
    createEffect(() => {
        if (depth.loading()) {
            setAppActivityLog('Loading market depth...')
        } else if (depth.error()) {
            setAppActivityLog(`Failed to fetch market depth: ${depth.error()}`)
        }
        setCurrentPairDepth(depth.data())
    })

    /**
     * Effect for handling the state change on the ordebook fetcher
     */
    createEffect(() => {
        if (orderbooks.loading()) {
            setAppActivityLog('Loading orderbooks...')
            setBooksLoading(true)
        } else {
            setBooksLoading(false)
        }
        if (orderbooks.error()) {
            setAppActivityLog(
                `Failed to fetch activity books: ${orderbooks.error()}`
            )
        } else if (!orderbooks.loading() && orderbooks.data()) {
            setAppActivityLog('Orderbooks fetched successfully')
            setBooks(orderbooks.data())
            // if no active pair, set the first pair as active
            if (!activePair()) {
                updateActivePair(orderbooks.data()[0].pair)
            }
        }
    })

    return (
        <NetworkContext.Provider
            value={{
                activePair,
                setActivePair: updateActivePair,
                books,
                setBooks,
                charts,
                setCharts,
                booksLoading,
                chartsLoading,
                quotes,
                currentPairDepth,
            }}
        >
            {props.children}
        </NetworkContext.Provider>
    )
}

export const useNetwork = (): NetworkContextType => {
    const context = useContext(NetworkContext)
    if (!context) {
        throw new Error('useNetwork must be used within a UseNetworkProvider')
    }
    return context
}
