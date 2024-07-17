import { Component } from 'solid-js'
import styles from './booktitle.module.css'

interface TitleRowProps {
    price: string
    amount: string
    side: 'bid' | 'ask'
}

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
