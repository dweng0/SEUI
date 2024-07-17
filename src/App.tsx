import { Component } from 'solid-js'
import { SignatureProvider } from './context/Signature'
import styles from './App.module.css'
import { ErrorProvider } from './context/Error'
import StatusBar from './components/StatusBar'
import { NetworkProvider } from './context/Network'
import PairList from './components/PairList'
import ChartWrapper from './components/ChartWrapper'
import OrderBook from './components/OrderBook'
import { TradingProvider } from './context/Trading'
import Trade from './components/Trade'
import Invoice from './components/Invoice'
import TradeTable from './components/TradeTable'

/**
 * The main application component.
 *
 * This component sets up the application context providers and
 * renders the main layout of the trading interface.
 *
 * @component
 * @example
 * return (
 *   <App />
 * )
 */
const App: Component = () => {
    return (
        <ErrorProvider>
            <NetworkProvider>
                <SignatureProvider>
                    <TradingProvider>
                        <div class={styles.App}>
                            <StatusBar />
                            <div class={`${styles.row} ${styles.expand}`}>
                                <div class={styles.column}>
                                    <PairList />
                                </div>
                                <div
                                    class={`${styles.column} ${styles.expand} ${styles.chart}`}
                                >
                                    <ChartWrapper />
                                    <TradeTable />
                                </div>
                                <div class={`${styles.column} ${styles.trade}`}>
                                    <OrderBook />
                                    <Trade />
                                    <Invoice />
                                </div>
                            </div>
                        </div>
                    </TradingProvider>
                </SignatureProvider>
            </NetworkProvider>
        </ErrorProvider>
    )
}

export default App
