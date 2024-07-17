import { createMemo, Component, Show } from 'solid-js'
import OrderBookRow from '../BookRow'
import OrderBookLoading from '../BookLoading'
import TitleRow from '../BookTitle'
import { useNetwork } from '../../context/Network'
import Big from 'big.js'
import { DepthPoint } from '../../context/interface'
import styles from './orderbook.module.css'
const depth_size = 10
const tick_size = 2
const mapToBig = (bid: DepthPoint) => {
    return {
        price: Big(bid.price),
        amount: Big(bid.amount),
    }
}
const OrderBook: Component = () => {
    const { currentPairDepth } = useNetwork()

    const data = createMemo(() => ({
        bids:
            currentPairDepth()
                ?.bids.map(mapToBig)
                .sort((a, b) => b.price.minus(a.price).toNumber())
                .slice(0, depth_size) ?? [],
        asks:
            currentPairDepth()
                ?.asks.map(mapToBig)
                .sort((a, b) => a.price.minus(b.price).toNumber()) //sort this way first, clip then sort correctly to get prices to match
                .slice(0, 10)
                .sort((a, b) => b.price.minus(a.price).toNumber()) ?? [],
    }))

    const maxAmount = createMemo(() => {
        const { bids, asks } = data()
        //map bids and asks so that price and amount are numbers

        return Math.max(
            ...bids.map((bid) => bid.amount.toNumber()),
            ...asks.map((ask) => ask.amount.toNumber())
        )
    })

    const bidsRows = createMemo(() =>
        data().bids.map((bid) => (
            <OrderBookRow
                position="left"
                price={bid.price.toFixed(tick_size)}
                amount={bid.amount.toString()}
                maxAmount={maxAmount()}
            />
        ))
    )

    const asksRows = createMemo(() =>
        data().asks.map((ask) => (
            <OrderBookRow
                position="right"
                price={ask.price.toFixed(tick_size)}
                amount={ask.amount.toString()}
                maxAmount={maxAmount()}
            />
        ))
    )

    return (
        <div class={styles.wrapper}>
            <div class={styles.side}>
                <TitleRow price="Ask Price" amount="Amount" side="ask" />
                <Show when={data} fallback={<OrderBookLoading />}>
                    {asksRows()}
                </Show>
            </div>
            <div class={styles.side}>
                <TitleRow price="Bid Price" amount="Amount" side="bid" />
                <Show when={data} fallback={<OrderBookLoading />}>
                    {bidsRows()}
                </Show>
            </div>
        </div>
    )
}

export default OrderBook
