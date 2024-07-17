import { createSignal } from 'solid-js'
import { LimitOrder, LimitOrderDocket } from '../context/interface'
import { Side, useTrading } from '../context/Trading'
import { usePost } from './fetch'
interface tradePayload {
    price: string
    amount: string
    side: Side
    pair: string
}
const useTradeSubmitter = () => {
    const {
        pair,
        price,
        setDocket,
        setPrice,
        setSide,
        setAmount,
        amount,
        side,
    } = useTrading()

    const { performPost } = usePost()
    const [loading, setLoading] = createSignal(false)
    const [error, seterror] = createSignal<Error | undefined>(undefined)
    const submitTrade = async (submissionPayload: tradePayload) => {
        setLoading(true)

        setPrice(submissionPayload.price)
        setAmount(submissionPayload.amount)
        setSide(submissionPayload.side)

        const payload: LimitOrder = {
            amount: amount(),
            pair: pair(),
            price: price(),
            side: side(),
        }

        try {
            const response = await performPost<LimitOrder, LimitOrderDocket>(
                `/orders`,
                payload
            )
            setDocket(response)
        } catch (e: unknown) {
            seterror(e as Error)
        } finally {
            setLoading(false)
        }
    }
    return {
        loading,
        submitTrade,
        error,
    }
}
export default useTradeSubmitter
