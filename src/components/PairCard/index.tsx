import { Component, createEffect, createMemo, createSignal } from 'solid-js'
import { useNetwork } from '../../context/Network'
import styles from './paircard.module.css'

interface PriceCardProps {
    name: string
}

const PairCard: Component<PriceCardProps> = ({ name }) => {
    const { setActivePair, activePair, quotes } = useNetwork()
    const [price, setPrice] = createSignal<string>('0.00')
    const styling = createMemo(() => {
        return activePair() === name
            ? `${styles.wrapper} ${styles.active}`
            : styles.wrapper
    })

    //find quote
    createEffect(() => {
        const quote = quotes().find((quote) => {
            if (quote.pair === name) {
                return quote
            }
        })
        setPrice(quote?.mid_price || '...')
    })

    return (
        <div class={styling()} onClick={() => setActivePair(name)}>
            <span>{name}</span>
            <span class={styles.price}>{price()}</span>
        </div>
    )
}

export default PairCard
