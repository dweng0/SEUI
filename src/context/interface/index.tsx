import { Side } from '../Trading'

export interface OrderBook {
    base: string
    min_amount: string
    pair: string
    quote: string
    tick_size: string
}

export interface DepthPoint {
    amount: string
    price: string
}

export interface Depth {
    asks: DepthPoint[]
    bids: DepthPoint[]
}

export interface Quote {
    pair: string
    ask_amount: string
    ask_price: string
    bid_amount: string
    bid_price: string
    timestamp: string
    mid_price: string
}

export interface Symbol {
    address: string
    decimals: number
    name: string
    type: string
}

export type OrderStatus =
    | 'pending'
    | 'open'
    | 'partial'
    | 'closed'
    | 'cancelled'
    | 'rejected'

export interface Order {
    amount: string
    order_id: number
    pair: string
    price: string
    remain: string
    side: string
    status: OrderStatus
    timestamp: string
    type: string
}

export interface Plot {
    x: string
    y: string
}

export interface ChartPlot {
    time: number
    value: number
}

export interface ChartItem {
    name: string
    source: string
    plot: Plot[]
}

export interface LimitOrder {
    amount: string
    pair: string
    price: string
    side: Side
}

export interface LimitOrderDocket {
    amount: string
    order_id: number
    pair: string
    price: string
    remain: string
    side: string
    status: string
    timestamp: string
    type: string
}

export interface Balance {
    available: string
    balance: string
    symbol: string
}
