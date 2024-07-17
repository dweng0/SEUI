import {
    createSignal,
    createContext,
    useContext,
    ParentComponent,
} from 'solid-js'

interface ErrorContextType {
    error: () => string
    setError: (value: string) => void
    level: () => string
    setLevel: (value: string) => void
    appActivityLog: () => string[]
    setAppActivityLog: (value: string) => void
}

// Create a context with a default value of undefined
const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export const ErrorProvider: ParentComponent = (props) => {
    const [error, setError] = createSignal<string>('')
    const [level, setLevel] = createSignal<string>('')
    const [appActivityLog, setAppActivityLog] = createSignal<string[]>([])

    const updateAppActivityLog = (value: string) => {
        setAppActivityLog((prev) => {
            return [...prev, value]
        })
    }

    return (
        <ErrorContext.Provider
            value={{
                error,
                setError,
                level,
                setLevel,
                appActivityLog,
                setAppActivityLog: updateAppActivityLog,
            }}
        >
            {error() && <p>Error: {error()}</p>}
            {level() && <p>Level: {level()}</p>}
            {props.children}
        </ErrorContext.Provider>
    )
}

export const useErrorHandler = (): ErrorContextType => {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error(
            'useErrorHandler must be used within a ErrorContextProvider'
        )
    }
    return context
}
