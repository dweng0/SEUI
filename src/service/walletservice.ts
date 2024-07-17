import { createSignal } from 'solid-js'
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { ethers } from 'ethers'
import logo from '../assets/alt-unicorn.png'
export const walletService = () => {
    // Create a signal to hold the wallet
    const [wallet, setWallet] = createSignal('') // the name of the wallet e.g. Metamask
    const [address, setAddress] = createSignal('0x')

    // Inject default wallets
    const injected = injectedModule()
    // todo add more wallet modules

    // initialise the wallet framework
    const decimalValue = import.meta.env.VITE_CHAIN_ID ?? 65010003
    const hexValue = decimalValue.toString(16)
    const onboard = Onboard({
        wallets: [injected],
        chains: [
            {
                id: `0x${hexValue}`,
                token: 'ATN',
                label: 'Autonity',
                rpcUrl: import.meta.env.VITE_RPC,
                blockExplorerUrl: import.meta.env.VITE_BLOCK_EXPLORER,
            },
        ],
        appMetadata: {
            name: 'Autonity Sim Ex UI',
            description: 'An Exchange',
            icon: logo,
        },
    })

    // onboard the wallet and set states based on RXJS signals piped from wallet framework
    const getWallet = async () => {
        const wallets = await onboard.connectWallet()
        const state = onboard.state.select('wallets')
        const { unsubscribe } = state.subscribe((update: any) =>
            setAddress(update[0].accounts[0].address)
        )
        if (!wallets || wallets.length === 0 || !wallets[0].accounts) return
        setAddress(wallets[0].accounts[0].address)
        setWallet(wallets[0].label)
    }

    // starts the wallet connection process
    const connectWallet = () => {
        getWallet()
    }

    const signMessage = async () => {
        const wallets = onboard.state.get().wallets
        if (wallets.length === 0) {
            console.error('No wallet connected')
            throw new Error('No wallet connected, unable to sign message')
        }

        const walletProvider = wallets[0].provider
        const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
        const signer = ethersProvider.getSigner()

        const nonce = Date.now().toString()
        const message = JSON.stringify({ nonce })

        try {
            const signature = await signer.signMessage(message)
            return { signature, message }
        } catch (error) {
            throw new Error('Failed to get signature from wallet')
        }
    }

    return {
        connectWallet,
        wallet,
        address,
        onboard,
        signMessage,
    }
}
