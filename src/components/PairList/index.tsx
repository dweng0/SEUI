import { Component } from 'solid-js'
import { useNetwork } from '../../context/Network'
import PairCard from '../PairCard'
import { OrderBook } from '../../context/interface'
import styles from './pairlist.module.css'

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
