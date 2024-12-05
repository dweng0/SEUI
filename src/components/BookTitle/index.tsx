import { Component } from 'solid-js'
import styles from './booktitle.module.css'

/**
 * Properties for the TitleRow component.
 *
 * @typedef {Object} TitleRowProps
 * @property {string} price - The price title.
 * @property {string} amount - The amount title.
 * @property {'bid' | 'ask'} side - The side of the order ('bid' or 'ask').
 */
interface TitleRowProps {
    price: string
    amount: string
    side: 'bid' | 'ask'
}

/**
 * The TitleRow component.
 *
 * This component represents a title row in the order book, displaying the price and amount titles,
 * with styling based on the side ('bid' or 'ask').
 *
 * @component
 * @example
 * <TitleRow price="Price" amount="Amount" side="bid" />
 *
 * @param {TitleRowProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered TitleRow component.
 */
const TitleRow: Component<TitleRowProps> = ({ price, amount, side }) => {
    const sideStyle = side === 'bid' ? styles.bid : styles.ask
    return (
        <div>
            <div class={`${styles.subtitle} ${sideStyle}`}>
                <div class={styles.price}>{price}</div>
                <div class={styles.amount}>{amount}</div>
            </div>
        </div>
    )
}

export default TitleRow
