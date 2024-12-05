import { Component } from 'solid-js'
import { useNetwork } from '../../context/Network'
import PairCard from '../PairCard'
import { OrderBook } from '../../context/interface'
import styles from './pairlist.module.css'

/**
 * The PairList component.
 *
 * This component displays a list of PairCards, each representing a trading pair.
 * It fetches the list of order books from the network context and maps them to PairCard components.
 *
 * @component
 * @example
 * <PairList />
 *
 * @returns {JSX.Element} The rendered PairList component.
 */
const PairList: Component = () => {
    const { books } = useNetwork()

    return (
        <div class={styles.wrapper}>
            {books().map((book: OrderBook) => (
                <PairCard name={book.pair} />
            ))}
        </div>
    )
}

export default PairList

