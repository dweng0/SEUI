import {
    createSignal,
    createContext,
    useContext,
    ParentComponent,
} from 'solid-js'

/**
 * Interface representing the Error Context type.
 *
 * @typedef {Object} ErrorContextType
 * @property {() => string} error - Function to get the current error message.
 * @property {(value: string) => void} setError - Function to set a new error message.
 * @property {() => string} level - Function to get the current error level.
 * @property {(value: string) => void} setLevel - Function to set a new error level.
 * @property {() => string[]} appActivityLog - Function to get the current application activity log.
 * @property {(value: string) => void} setAppActivityLog - Function to add a new entry to the application activity log.
 */
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

/**
 * The ErrorProvider component.
 *
 * This component provides error handling context to its children components.
 *
 * @component
 * @example
 * <ErrorProvider>
 *   <YourComponent />
 * </ErrorProvider>
 *
 * @param {Object} props - The properties for the component.
 * @returns {JSX.Element} The rendered ErrorProvider component.
 */
export const ErrorProvider: ParentComponent = (props) => {
    const [error, setError] = createSignal<string>('')
    const [level, setLevel] = createSignal<string>('')
    const [appActivityLog, setAppActivityLog] = createSignal<string[]>([])

    /**
     * Update the application activity log with a new entry.
     *
     * @param {string} value - The new log entry.
     */
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

/**
 * Custom hook to use the ErrorContext.
 *
 * @throws Will throw an error if used outside of an ErrorContextProvider.
 * @returns {ErrorContextType} The error context value.
 */
export const useErrorHandler = (): ErrorContextType => {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error(
            'useErrorHandler must be used within a ErrorContextProvider'
        )
    }
    return context
}

