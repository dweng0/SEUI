import {
    createSignal,
    createContext,
    useContext,
    ParentComponent,
    createEffect,
} from 'solid-js'

/**
 * Interface representing the Signature Context type.
 *
 * @typedef {Object} SignatureContextType
 * @property {() => string} address - Function to get the current address.
 * @property {(value: string) => void} setAddress - Function to set a new address.
 * @property {() => string} apiKey - Function to get the current API key.
 * @property {(value: string) => void} setApiKey - Function to set a new API key.
 * @property {() => void} disconnect - Function to disconnect and clear stored data.
 */
interface SignatureContextType {
    address: () => string
    setAddress: (value: string) => void
    apiKey: () => string
    setApiKey: (value: string) => void
    disconnect: () => void
}

// Create a context with a default value of undefined
const SignatureContext = createContext<SignatureContextType | undefined>(
    undefined
)

/**
 * The SignatureProvider component.
 *
 * This component provides signature-related context to its children components,
 * including managing the address and API key, and handling disconnects.
 *
 * @component
 * @example
 * <SignatureProvider>
 *   <YourComponent />
 * </SignatureProvider>
 *
 * @param {Object} props - The properties for the component.
 * @returns {JSX.Element} The rendered SignatureProvider component.
 */
export const SignatureProvider: ParentComponent = (props) => {
    const [address, setAddress] = createSignal<string>('')
    const [apiKey, setApiKey] = createSignal<string>('')

    // Read from local storage
    createEffect(() => {
        const address = localStorage.getItem('address')
        const apiKey = localStorage.getItem('apiKey')
        if (address) {
            setAddress(address)
        }
        if (apiKey) {
            setApiKey(apiKey)
        }
    })

    // Write to local storage
    createEffect(() => {
        if (address() && apiKey()) {
            localStorage.setItem('address', address())
            localStorage.setItem('apiKey', apiKey())
        }
    })

    /**
     * Disconnect and clear stored data.
     */
    const disconnect = () => {
        setAddress('')
        setApiKey('')

        // Clear local storage
        localStorage.removeItem('address')
        localStorage.removeItem('apiKey')
    }

    return (
        <SignatureContext.Provider
            value={{
                address,
                setAddress,
                apiKey,
                setApiKey,
                disconnect,
            }}
        >
            {props.children}
        </SignatureContext.Provider>
    )
}

/**
 * Custom hook to use the SignatureContext.
 *
 * @throws Will throw an error if used outside of a SignatureProvider.
 * @returns {SignatureContextType} The signature context value.
 */
export const useSignature = (): SignatureContextType => {
    const context = useContext(SignatureContext)
    if (!context) {
        throw new Error('useSignature must be used within a SignatureProvider')
    }
    return context
}

