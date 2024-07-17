import { Component } from 'solid-js'

import styles from './bookrow.module.css'
import Big from 'big.js'
import { useTrading } from '../../context/Trading'

interface OrderBookRowProps {
    position: string
    price: string
    amount: string
    maxAmount: number
}

const OrderBookRow: Component<OrderBookRowProps> = ({
    position,
    price,
    amount,
    maxAmount,
}) => {
    const { setPrice, setSide } = useTrading()
    const amountBarStyle = `${styles.price} ${
        position === 'left' ? styles.bids : styles.asks
    }`

    const priceValueStyle = `${styles.pricevalue} ${
        position === 'left' ? styles.bids : styles.asks
    }`
    const currentSide = position === 'left' ? 'bid' : 'ask'

    const submitLimitOrder = (price: string) => {
        setPrice(price)
        setSide(currentSide)
    }

    return (
        <div class={styles.row} onClick={() => submitLimitOrder(price)}>
            <div
                class={amountBarStyle}
                style={{
                    width: `${Big(amount).div(maxAmount).mul(100).toString()}%`,
                }}
            ></div>
            <div class={styles.rowcontent}>
                <div class={priceValueStyle}>{price}</div>
                <div class={styles.amountvalue}>{amount}</div>
            </div>
        </div>
    )
}

export default OrderBookRow
