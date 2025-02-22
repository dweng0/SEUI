import { Component, createEffect, createSignal } from 'solid-js'
import styles from './trade.module.css'
import { useTrading } from '../../context/Trading'
import { useNetwork } from '../../context/Network'
import { usePost } from '../../hooks/fetch'
import { LimitOrder, LimitOrderDocket } from '../../context/interface'
import useTradeSubmitter from '../../hooks/useTradeSubmitter'

const Trade: Component = () => {
    const { activePair } = useNetwork()
    const { submitTrade } = useTradeSubmitter()
    const {
        amount,
        setAmount,
        price,
        setPrice,
        setSide,
        side,
        setPair,
        pair,
        setDocket,
    } = useTrading()
    const { performPost } = usePost()
    const [loading, setLoading] = createSignal(false)
    const [tradeAmount, setTradeAmount] = createSignal(amount())
    const [tradePrice, setTradePrice] = createSignal(price())
    const [tradeSide, setTradeSide] = createSignal(side())
    const [message, setMessage] = createSignal('')
    const [isAutoUpdate, setIsAutoUpdate] = createSignal(true)
    const [valid, setValid] = createSignal(true)
    const clear = () => {
        setTradeAmount('')
        setPrice('')
        setAmount('')
        setTradePrice('')
    }

    const handleSubmit = async (e: Event) => {
        e.preventDefault()
        if (!valid()) {
            return
        }
        setLoading(true)
        setMessage('Submitting order')

        setPrice(tradePrice())
        setAmount(tradeAmount())
        setSide(tradeSide())

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
        } catch (e) {
        } finally {
            setLoading(false)
            setMessage('Order submitted!')
            // Set a timeout to clear the message after 3 seconds
            setTimeout(() => {
                setMessage('')
            }, 2500)
            clear()
        }
    }

    createEffect(() => {
        if (!valid()) {
            console.log('warning, not valid')
        } else {
            console.log('valid')
        }
    })

    /**
     * Amount is always manually input, so update the context
     */
    createEffect(() => {
        if (tradeAmount()) {
            setAmount(tradeAmount())
        }
    })

    /**
     * Clear trade amount and price, and set the pair based on the active pair
     */
    createEffect(() => {
        const pair = activePair()
        // Clear other trade items and set the active pair
        setTradeAmount('')
        setTradePrice('')
        setPair(pair)
    })

    /**
     * Auto update the trade price based on if auto update is true
     */
    createEffect(() => {
        if (isAutoUpdate()) {
            setTradePrice(price())
        }
    })

    /**
     * Auto update side based on if auto update is set
     */
    createEffect(() => {
        if (isAutoUpdate()) {
            setTradeSide(side())
        }
    })

    const getSideStyle = (side: string) => {
        return `${styles.sideitem} ${side === tradeSide() ? styles.active : ''}`
    }
    console.log('valid?', valid())
    return (
        <form class={styles.wrapper} onSubmit={handleSubmit}>
            <div>
                <input
                    placeholder="Amount"
                    id="amount"
                    value={tradeAmount()}
                    autocomplete="off"
                    onInput={(e) => {
                        const value = e.currentTarget.value
                        if (/^\d*\.?\d*$/.test(value)) {
                            setValid(true)
                            setMessage('')
                            setTradeAmount(value)
                        } else {
                            setValid(false)
                            setMessage('Only numbers allowed')
                        }
                    }}
                />
            </div>
            <div>
                <input
                    id="price"
                    placeholder="Price"
                    value={tradePrice()}
                    autocomplete="off"
                    onInput={(e) => {
                        const value = e.currentTarget.value
                        if (/^\d*\.?\d*$/.test(value)) {
                            setMessage('')
                            setValid(true)
                            setTradePrice(value)
                        } else {
                            setValid(false)
                            setMessage('Only numbers allowed')
                        }
                    }}
                />
            </div>
            <div class={styles.side}>
                <div
                    class={getSideStyle('bid')}
                    onClick={() => setTradeSide('bid')}
                >
                    Buy
                </div>
                <div
                    class={getSideStyle('ask')}
                    onClick={() => setTradeSide('ask')}
                >
                    Sell
                </div>
            </div>
            <div>
                <input
                    id="autoUpdate"
                    type="checkbox"
                    checked={isAutoUpdate()}
                    onChange={(e) => setIsAutoUpdate(e.currentTarget.checked)}
                />
                <label for="autoUpdate">Auto Update</label>
            </div>
            <button class={styles.submit} type="submit">
                Submit
            </button>
            {message() && <p>{message()}</p>}
        </form>
    )
}

export default Trade
