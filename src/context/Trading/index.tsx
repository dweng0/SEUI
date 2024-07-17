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
    //need ot handle resetting if a user changes active pair
    createEffect(() => {
        if (activePair()) {
            setAmount('')
            setPair('')
            setPrice
            setSide('bid')
        }
    })

    /**
     * Fetch if we have an api key
     */
    createEffect(() => {
        if (apiKey()) {
            performFetch(apiKey())
        }
    })

    /**
     * Set the balances to that of the data response
     */
    createEffect(() => {
        console.log('data', data())
        if (data()) {
            setBalances(data())
        }
    })
    console.log('here')

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

export const useTrading = (): TradingContextType => {
    const context = useContext(TradingContext)
    if (!context) {
        throw new Error('useTrading must be used within a TradingProvider')
    }
    return context
}
