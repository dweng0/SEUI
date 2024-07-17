import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const signMessage = async () => {
    const nonce = Date.now().toString()
    const message = JSON.stringify({ nonce })

    const walletClient = createWalletClient({
        chain: mainnet,
        //@ts-ignore
        transport: custom(window.ethereum!),
    })
    const [account] = await walletClient.getAddresses()
    const signature = await walletClient.signMessage({
        account,
        message,
    })
    return { signature, message }
}
