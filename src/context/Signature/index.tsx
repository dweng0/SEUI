import {
    createSignal,
    createContext,
    useContext,
    ParentComponent,
    createEffect,
} from 'solid-js'

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

export const SignatureProvider: ParentComponent = (props) => {
    const [address, setAddress] = createSignal<string>('')
    const [apiKey, setApiKey] = createSignal<string>('')

    //read from local storage
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

    //write to local storage
    createEffect(() => {
        if (address() && apiKey()) {
            localStorage.setItem('address', address())
            localStorage.setItem('apiKey', apiKey())
        }
    })

    const disconnect = () => {
        setAddress('')
        setApiKey('')

        //clear local storage
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

export const useSignature = (): SignatureContextType => {
    const context = useContext(SignatureContext)
    if (!context) {
        throw new Error('useSignature must be used within a SignatureProvider')
    }
    return context
}
