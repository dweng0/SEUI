import { Component, createSignal, createEffect } from 'solid-js'
import styles from './tradetable.module.css'
import { useSignature } from '../../context/Signature'
import SignerButton from '../SignerButton'
import { useFetchArrayWithKey } from '../../hooks/fetch'
import { rootAddress } from '../../context/Network/index'
import { Order, OrderStatus } from '../../context/interface'
import appstyles from '../../App.module.css'
import OrderRow from './tradeitem'

const { imageicon } = appstyles

const byStatus = (status: OrderStatus) => (order: Order) =>
    order.status === status

type AllOrderStatus = OrderStatus | 'all'

const TradeTable: Component = () => {
    const { apiKey } = useSignature()
    const [activeTab, setActiveTab] = createSignal<AllOrderStatus>('all')
    const [openOrders, setOpenOrders] = createSignal<Order[]>([])
    const [partialOrders, setPartialOrders] = createSignal<Order[]>([])
    const [pendingOrders, setPendingOrders] = createSignal<Order[]>([])
    const [cancelledOrders, setCancelledOrders] = createSignal<Order[]>([])
    const [closedOrders, setClosedOrders] = createSignal<Order[]>([])
    const [rejectedOrders, setRejectedOrders] = createSignal<Order[]>([])
    const [allOrders, setAllOrders] = createSignal<Order[]>([])

    const { data, loading, performFetch } = useFetchArrayWithKey<Order>(
        `${rootAddress}/orders`,
        false
    )

    // Fetch orders when the component mounts
    createEffect(() => {
        if (apiKey()) {
            performFetch(apiKey())
        }
    })

    createEffect(() => {
        if (loading()) {
            //todo something to inform user table is loading
        }
    })

    createEffect(() => {
        if (data()) {
            setOpenOrders(data().filter(byStatus('open')))
            setPendingOrders(data().filter(byStatus('pending')))
            setPartialOrders(data().filter(byStatus('partial')))
            setCancelledOrders(data().filter(byStatus('cancelled')))
            setClosedOrders(data().filter(byStatus('closed')))
            setRejectedOrders(data().filter(byStatus('rejected')))
            setAllOrders(data())
        }
    })

    return (
        <div class={styles.wrapper}>
            {!apiKey() ? (
                <div class={styles.connectPrompt}>
                    <p>Please connect your wallet to view your trades.</p>
                    <SignerButton />
                </div>
            ) : (
                <>
                    <div class={styles.tabwrapper}>
                        <span
                            class={activeTab() === 'open' ? styles.active : ''}
                            onClick={() => setActiveTab('open')}
                        >
                            Open
                        </span>
                        <span
                            class={
                                activeTab() === 'closed' ? styles.active : ''
                            }
                            onClick={() => setActiveTab('closed')}
                        >
                            Closed
                        </span>
                        <span
                            class={
                                activeTab() === 'pending' ? styles.active : ''
                            }
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending
                        </span>
                        <span
                            class={
                                activeTab() === 'partial' ? styles.active : ''
                            }
                            onClick={() => setActiveTab('partial')}
                        >
                            Partial
                        </span>
                        <span
                            class={
                                activeTab() === 'cancelled' ? styles.active : ''
                            }
                            onClick={() => setActiveTab('cancelled')}
                        >
                            Cancelled
                        </span>
                        <span
                            class={
                                activeTab() === 'rejected' ? styles.active : ''
                            }
                            onClick={() => setActiveTab('rejected')}
                        >
                            Rejected
                        </span>
                        <span
                            class={activeTab() === 'all' ? styles.active : ''}
                            onClick={() => setActiveTab('all')}
                        >
                            All
                        </span>
                    </div>
                    <div>
                        {activeTab() === 'open' && (
                            <OrderList orders={openOrders()} />
                        )}
                        {activeTab() === 'closed' && (
                            <OrderList orders={closedOrders()} />
                        )}
                        {activeTab() === 'pending' && (
                            <OrderList orders={pendingOrders()} />
                        )}
                        {activeTab() === 'partial' && (
                            <OrderList orders={partialOrders()} />
                        )}
                        {activeTab() === 'cancelled' && (
                            <OrderList orders={cancelledOrders()} />
                        )}
                        {activeTab() === 'rejected' && (
                            <OrderList orders={rejectedOrders()} />
                        )}
                        {activeTab() === 'all' && (
                            <OrderList orders={allOrders()} />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

interface OrderListPropts {
    orders: Order[]
}
const OrderList: Component<OrderListPropts> = ({ orders }) => {
    return (
        <div>
            {orders.length === 0 ? (
                <p class={styles.notrades}>No orders found.</p>
            ) : (
                <ul>
                    {orders.map((order) => (
                        <OrderRow order={order} />
                    ))}
                </ul>
            )}
        </div>
    )
}

export default TradeTable
