import { createSignal } from 'solid-js'
import { LimitOrder, LimitOrderDocket } from '../context/interface'
import { Side, useTrading } from '../context/Trading'
import { usePost } from './fetch'

/**
 * Interface representing the payload for a trade submission.
 *
 * @typedef {Object} tradePayload
 * @property {string} price - The price of the trade.
 * @property {string} amount - The amount of the trade.
 * @property {Side} side - The side of the trade (bid or ask).
 * @property {string} pair - The trading pair.
 */
interface tradePayload {
    price: string
    amount: string
    side: Side
    pair: string
}

/**
 * Custom hook to handle trade submissions.
 *
 * This hook provides a function to submit trades, handles loading and error states,
 * and updates the trading context with the new trade data.
 *
 * @returns {Object} An object containing the loading state, submitTrade function, and error state.
 */
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

    /**
     * Submit a trade with the given payload.
     *
     * @param {tradePayload} submissionPayload - The payload for the trade submission.
     */
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

