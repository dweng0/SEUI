import { Component, createEffect, createMemo, createSignal } from 'solid-js'
import { useNetwork } from '../../context/Network'
import styles from './paircard.module.css'

/**
 * Properties for the PairCard component.
 *
 * @typedef {Object} PriceCardProps
 * @property {string} name - The name of the trading pair.
 */
interface PriceCardProps {
    name: string
}

/**
 * The PairCard component.
 *
 * This component displays a card for a trading pair, showing its name and current price.
 * It highlights the card if it is the active pair and updates the price in real-time.
 *
 * @component
 * @example
 * <PairCard name="BTC/USD" />
 *
 * @param {PriceCardProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered PairCard component.
 */
const PairCard: Component<PriceCardProps> = ({ name }) => {
    const { setActivePair, activePair, quotes } = useNetwork()
    const [price, setPrice] = createSignal<string>('0.00')
    
    const styling = createMemo(() => {
        return activePair() === name
            ? `${styles.wrapper} ${styles.active}`
            : styles.wrapper
    })

    /**
     * Update the price based on the current quotes.
     */
    createEffect(() => {
        const quote = quotes().find((quote) => quote.pair === name)
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

