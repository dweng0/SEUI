import { Component, createEffect, createSignal } from 'solid-js'
import { useSignature } from '../../context/Signature'
import { useErrorHandler } from '../../context/Error'
import styles from './signerbutton.module.css'
import { walletService } from '../../service/walletservice'

/**
 * The SignerButton component.
 *
 * This component handles the wallet connection and manual address/API key submission.
 * It provides the UI for connecting a wallet or manually entering the address and API key.
 *
 * @component
 * @example
 * <SignerButton />
 *
 * @returns {JSX.Element} The rendered SignerButton component.
 */
const SignerButton: Component = () => {
    const {
        address: walletAddress,
        connectWallet,
        signMessage,
    } = walletService()
    const { setAddress, setApiKey } = useSignature()
    const { setError, setLevel, setAppActivityLog } = useErrorHandler()
    const [loading, setLoading] = createSignal(false)
    const [manualAddress, setManualAddress] = createSignal('')
    const [manualApiKey, setManualApiKey] = createSignal('')
    const [enterManually, setEnterManually] = createSignal(false)

    /**
     * Handle the click event for connecting the wallet.
     */
    const handleClick = async () => {
        setLoading(true)
        connectWallet()
    }

    /**
     * Handle manual submission of address and API key.
     *
     * @param {string} address - The manual address input.
     * @param {string} apiKey - The manual API key input.
     */
    const manualSubmission = (address: string, apiKey: string) => {
        setApiKey(apiKey)
        setAddress(address)
    }

    /**
     * Update the API key using the provided signature and message.
     *
     * @param {string} signature - The signature from the wallet.
     * @param {string} message - The message to be signed.
     */
    const updateApiKey = async (signature: string, message: string) => {
        try {
            setAppActivityLog('Signature and message')
            const response = await fetch(
                'https://cax.piccadilly.autonity.org/api/apikeys',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'API-Sig': signature.trim(),
                    },
                    body: message,
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.message)
                setLevel('CRITICAL')
                return
            }

            const data = await response.json()
            setApiKey(data.apikey)
            setAddress(data.account)
        } catch (e: any) {
            setError('Requires a browser with a wallet installed: ' + e.message)
            setLevel('CRITICAL')
        } finally {
            setLoading(false)
        }
    }

    createEffect(async () => {
        if (walletAddress() && walletAddress() !== '0x') {
            setAddress(walletAddress())

            // Now sign the message
            const { signature, message } = await signMessage()
            updateApiKey(signature, message)
        }
    })

    return (
        <>
            {!enterManually() && walletAddress() === '0x' && (
                <div class={styles.buttonwrapper}>
                    <button class={styles.submit} onClick={handleClick}>
                        Connect to CAX
                    </button>
                    <a
                        onClick={() => setEnterManually(true)}
                        class={styles.entermanually}
                        title="manually set key"
                    >
                        or set key
                    </a>
                </div>
            )}
            {enterManually() && (
                <div class={styles.manualinputwrapper}>
                    <input
                        id="addressinput"
                        type="text"
                        placeholder="address"
                        onInput={(e) => setManualAddress(e.currentTarget.value)}
                    />
                    <input
                        id="apikeyinput"
                        type="password"
                        placeholder="api key"
                        onInput={(e) => setManualApiKey(e.currentTarget.value)}
                    />
                    <div>
                        <button
                            onClick={() =>
                                manualSubmission(
                                    manualAddress(),
                                    manualApiKey()
                                )
                            }
                            class={styles.manualsubmit}
                        >
                            Submit
                        </button>
                    </div>
                    <a
                        onClick={() => setEnterManually(false)}
                        class={styles.entermanually}
                        title="manually set key"
                    >
                        or connect wallet
                    </a>
                </div>
            )}
        </>
    )
}

export default SignerButton

