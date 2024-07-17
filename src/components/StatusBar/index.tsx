import { Component, createEffect, createMemo, createSignal } from 'solid-js'
import { useSignature } from '../../context/Signature'
import { useErrorHandler } from '../../context/Error'
import SignerButton from '../SignerButton'
import styles from './statusbar.module.css'
import { useTrading } from '../../context/Trading'
import { Balance } from '../../context/interface'
import Big from 'big.js'

const clipAddress = (address: string) => {
    if (!address) return ''
    return `${address.substring(0, 4)}...${address.substring(
        address.length - 4
    )}`
}

const StatusBar: Component = () => {
    const { address, apiKey, disconnect } = useSignature()
    const { error, level, appActivityLog } = useErrorHandler()
    const { balances } = useTrading()
    // Check for 'debug' parameter in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const isDebug = createMemo(() => urlParams.get('debug') === 'true')

    const [status, setStatus] = createSignal('Updating...')

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
