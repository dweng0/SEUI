import { Component, createSignal } from 'solid-js'
import { useTrading } from '../../context/Trading'
import { useSignature } from '../../context/Signature'
import SignerButton from '../SignerButton'
import styles from './invoice.module.css'
import { rootAddress } from '../../context/Network/index'
import { useErrorHandler } from '../../context/Error'
const Invoice: Component = () => {
    const { docket, setDocket } = useTrading()
    const { address, apiKey } = useSignature()
    const { setAppActivityLog, setError, setLevel } = useErrorHandler()
    const [statusMessage, setStatusMessage] = createSignal('Cancel')

    const handleCancel = async () => {
        setStatusMessage('Cancelling...')
        const url = `${rootAddress}/orders/${docket()?.order_id}`

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'API-Key': apiKey(),
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.message)
                setLevel('CRITICAL')
                return
            }
            setDocket(undefined)
        } catch (e: any) {
            setAppActivityLog(`Failed to cancel order: ${docket()?.order_id}`)
            setError(e.message)
            setLevel('CRITICAL')
        } finally {
            setStatusMessage('Cancel')
        }
    }
    return (
        <>
            {!address() ? (
                <SignerButton />
            ) : (
                <div class={styles.wrapper}>
                    {docket() && (
                        <div class={styles.receiptsection}>
                            <div class={styles.receiptitem}>
                                <span>Order No</span>
                                <span class={styles.valueitem}>
                                    {docket()?.order_id}
                                </span>
                            </div>
                            <div class={styles.receiptitem}>
                                <span>Pair</span>
                                <span class={styles.valueitem}>
                                    {docket()?.pair}
                                </span>
                            </div>
                            <div class={styles.receiptitem}>
                                <span>Price</span>
                                <span class={styles.valueitem}>
                                    {docket()?.price}
                                </span>
                            </div>
                            <div class={styles.receiptitem}>
                                <span>Order Created</span>
                                <span class={styles.valueitem}>
                                    {docket()?.timestamp}
                                </span>
                            </div>
                            <div class={styles.receiptitem}>
                                <p></p>
                                <div
                                    onClick={handleCancel}
                                    class={styles.orderbutton}
                                >
                                    {statusMessage()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default Invoice
