import {
    createContext,
    useContext,
    ParentComponent,
    createSignal,
    createEffect,
} from 'solid-js'
import { useFetchArray, useFetchObject } from '../../hooks/fetch'
import { OrderBook, Quote, ChartItem, Depth } from '../interface'
import { useErrorHandler } from '../Error'
import { fetchQuotes } from './service'

/**
 * Interface representing the Network Context type.
 *
 * @typedef {Object} NetworkContextType
 * @property {() => string} activePair - Function to get the current active pair.
 * @property {(value: string) => void} setActivePair - Function to set a new active pair.
 * @property {() => OrderBook[]} books - Function to get the list of order books.
 * @property {() => boolean} booksLoading - Function to get the loading state of the order books.
 * @property {(value: OrderBook[]) => void} setBooks - Function to set the order books.
 * @property {() => ChartItem[]} charts - Function to get the list of chart items.
 * @property {() => boolean} chartsLoading - Function to get the loading state of the charts.
 * @property {(value: ChartItem[]) => void} setCharts - Function to set the chart items.
 * @property {() => Quote[]} quotes - Function to get the list of quotes.
 * @property {() => Depth} currentPairDepth - Function to get the depth of the current pair.
 */
interface NetworkContextType {
    activePair: () => string
    setActivePair: (value: string) => void
    books: () => OrderBook[]
    booksLoading: () => boolean
    setBooks: (value: OrderBook[]) => void
    charts: () => ChartItem[]
    chartsLoading: () => boolean
    setCharts: (value: ChartItem[]) => void
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

/**
 * The NetworkProvider component.
 *
 * This component provides network-related context to its children components.
 *
 * @component
 * @example
 * <NetworkProvider>
 *   <YourComponent />
 * </NetworkProvider>
 *
 * @param {Object} props - The properties for the component.
 * @returns {JSX.Element} The rendered NetworkProvider component.
 */
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

    /**
     * Update the active trading pair.
     *
     * @param {string} pair - The new active pair.
     */
    const updateActivePair = (pair: string) => {
        setAppActivityLog(`Active pair changed to ${pair}`)
        setActivePair(pair)
    }

    /**
     * Fetch depth if activePair changes.
     */
    createEffect(() => {
        if (activePair()) {
            depth.performFetch(
                `${rootAddress}/orderbooks/${activePair()}/depth`
            )
        }
    })

    /**
     * Effect for handling state change on the chart fetcher.
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
     * An effect that loops through the order books and gets the /quote for each pair.
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
     * An effect for getting the depth of the active book.
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
     * Effect for handling the state change on the orderbook fetcher.
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

/**
 * Custom hook to use the NetworkContext.
 *
 * @throws Will throw an error if used outside of a NetworkProvider.
 * @returns {NetworkContextType} The network context value.
 */
export const useNetwork = (): NetworkContextType => {
    const context = useContext(NetworkContext)
    if (!context) {
        throw new Error('useNetwork must be used within a NetworkProvider')
    }
    return context
}

