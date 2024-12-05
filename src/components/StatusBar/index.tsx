import { Component, createEffect, createMemo, createSignal } from 'solid-js'
import { useSignature } from '../../context/Signature'
import { useErrorHandler } from '../../context/Error'
import SignerButton from '../SignerButton'
import styles from './statusbar.module.css'
import { useTrading } from '../../context/Trading'
import { Balance } from '../../context/interface'
import Big from 'big.js'

/**
 * Shortens an Ethereum address for display.
 *
 * @param {string} address - The Ethereum address to shorten.
 * @returns {string} The shortened address.
 */
const clipAddress = (address: string) => {
    if (!address) return ''
    return `${address.substring(0, 4)}...${address.substring(
        address.length - 4
    )}`
}

/**
 * The StatusBar component.
 *
 * This component displays the status of the connection, balances, and handles user interactions such as disconnecting.
 *
 * @component
 * @example
 * <StatusBar />
 *
 * @returns {JSX.Element} The rendered StatusBar component.
 */
const StatusBar: Component = () => {
    const { address, apiKey, disconnect } = useSignature()
    const { error, level, appActivityLog } = useErrorHandler()
    const { balances } = useTrading()
    // Check for 'debug' parameter in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const isDebug = createMemo(() => urlParams.get('debug') === 'true')

    const [status, setStatus] = createSignal('Updating...')

    /**
     * Determine the current status based on error, level, and connection state.
     *
     * @returns {string} The current status.
     */
    const getStatus = () => {
        if (error()) {
            return 'Error'
        } else if (level()) {
            return 'Level: ' + level()
        } else if (!apiKey()) {
            return 'Not Connected'
        } else if (address() && apiKey()) {
            return 'Connected'
        }
        return 'Not Connected' // Ensure a default return value
    }

    /**
     * Format the balance for display.
     *
     * @param {Balance} balance - The balance object.
     * @returns {JSX.Element} The formatted balance item.
     */
    const returnBalance = (balance: Balance) => {
        return (
            <div class={styles.balanceitem}>
                <span>{balance.symbol}</span>
                <span class={styles.balancevalue}>
                    {Big(balance.balance).toFixed(3)}
                </span>
            </div>
        )
    }

    createEffect(() => {
        setStatus(getStatus())
    })

    return (
        <div class={styles.wrapper}>
            <span>{status()}</span>

            {isDebug() && (
                <pre class={styles.console}>
                    {appActivityLog().map((log) => (
                        <div>{log}</div>
                    ))}
                </pre>
            )}
            <div>{!apiKey() && <SignerButton />}</div>

            {address() && (
                <div class={styles.connectedwrapper}>
                    <a class={styles.disconnect} onClick={disconnect}>
                        disconnect
                    </a>
                    <span class={styles.address} title={address()}>
                        {clipAddress(address())}
                    </span>
                    <span>|</span>
                    <div class={styles.balancewrapper}>
                        {balances().map(returnBalance)}
                    </div>
                </div>
            )}
        </div>
    )
}

export default StatusBar

