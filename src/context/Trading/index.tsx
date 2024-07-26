import {
    createSignal,
    createContext,
    useContext,
    ParentComponent,
    createEffect,
} from 'solid-js'
import { useNetwork } from '../Network'
import { Balance, LimitOrderDocket } from '../interface'
import { useSignature } from '../Signature'
import { useFetchArrayWithKey } from '../../hooks/fetch'
import { rootAddress } from '../Network/index'

export type Side = 'bid' | 'ask'

/**
 * Interface representing the Trading Context type.
 *
 * @typedef {Object} TradingContextType
 * @property {() => Balance[]} balances - Function to get the current balances.
 * @property {() => string} amount - Function to get the current amount.
 * @property {(value: string) => void} setAmount - Function to set a new amount.
 * @property {() => string} pair - Function to get the current trading pair.
 * @property {(value: string) => void} setPair - Function to set a new trading pair.
 * @property {() => string} price - Function to get the current price.
 * @property {(value: string) => void} setPrice - Function to set a new price.
 * @property {() => Side} side - Function to get the current side (bid or ask).
 * @property {(value: Side) => void} setSide - Function to set a new side.
 * @property {() => LimitOrderDocket | undefined} docket - Function to get the current docket.
 * @property {(value: LimitOrderDocket | undefined) => void} setDocket - Function to set a new docket.
 */
interface TradingContextType {
    balances: () => Balance[]
    amount: () => string
    setAmount: (value: string) => void
    pair: () => string
    setPair: (value: string) => void
    price: () => string
    setPrice: (value: string) => void
    side: () => Side
    setSide: (value: Side) => void
    docket: () => LimitOrderDocket | undefined
    setDocket: (value: LimitOrderDocket | undefined) => void
}

// Create a context with a default value of undefined
const TradingContext = createContext<TradingContextType | undefined>(undefined)

/**
 * The TradingProvider component.
 *
 * This component provides trading-related context to its children components,
 * including managing balances, amount, pair, price, side, and docket.
 *
 * @component
 * @example
 * <TradingProvider>
 *   <YourComponent />
 * </TradingProvider>
 *
 * @param {Object} props - The properties for the component.
 * @returns {JSX.Element} The rendered TradingProvider component.
 */
export const TradingProvider: ParentComponent = (props) => {
    const { activePair } = useNetwork()
    const { apiKey } = useSignature()
    const [amount, setAmount] = createSignal<string>('')
    const [pair, setPair] = createSignal<string>('')
    const [price, setPrice] = createSignal<string>('')
    const [side, setSide] = createSignal<Side>('bid')
    const [docket, setDocket] = createSignal<LimitOrderDocket | undefined>()
    const [balances, setBalances] = createSignal<Balance[]>([])
    const { data, performFetch } = useFetchArrayWithKey<Balance>(
        `${rootAddress}/balances`,
        false
    )

    // Reset state if the user changes the active pair
    createEffect(() => {
        if (activePair()) {
            setAmount('')
            setPair('')
            setPrice('')
            setSide('bid')
        }
    })

    /**
     * Fetch balances if we have an API key.
     */
    createEffect(() => {
        if (apiKey()) {
            performFetch(apiKey())
        }
    })

    /**
     * Set the balances to the data response.
     */
    createEffect(() => {
        if (data()) {
            setBalances(data())
        }
    })

    /**
     * Poll for trades data every 30 seconds.
     */
    createEffect(() => {
        const intervalId = setInterval(() => {
            console.log('poll fetch')
            performFetch(apiKey())
        }, 30000) // Poll every 30 seconds
        return () => clearInterval(intervalId)
    })

    return (
        <TradingContext.Provider
            value={{
                amount,
                setAmount,
                price,
                setPrice,
                pair,
                setPair,
                side,
                setSide,
                docket,
                setDocket,
                balances,
            }}
        >
            {props.children}
        </TradingContext.Provider>
    )
}

/**
 * Custom hook to use the TradingContext.
 *
 * @throws Will throw an error if used outside of a TradingProvider.
 * @returns {TradingContextType} The trading context value.
 */
export const useTrading = (): TradingContextType => {
    const context = useContext(TradingContext)
    if (!context) {
        throw new Error('useTrading must be used within a TradingProvider')
    }
    return context
}
