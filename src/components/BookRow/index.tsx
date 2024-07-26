import { Component } from 'solid-js'
import styles from './bookrow.module.css'
import Big from 'big.js'
import { useTrading } from '../../context/Trading'

/**
 * Properties for the OrderBookRow component.
 *
 * @typedef {Object} OrderBookRowProps
 * @property {string} position - The position of the order ('left' or 'right').
 * @property {string} price - The price of the order.
 * @property {string} amount - The amount of the order.
 * @property {number} maxAmount - The maximum amount for scaling the bar width.
 */
interface OrderBookRowProps {
    position: string
    price: string
    amount: string
    maxAmount: number
}

/**
 * The OrderBookRow component.
 *
 * This component represents a row in the order book, displaying the price and amount,
 * and handling clicks to set limit orders.
 *
 * @component
 * @example
 * <OrderBookRow position="left" price="100.00" amount="1.5" maxAmount={10} />
 *
 * @param {OrderBookRowProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered OrderBookRow component.
 */
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
