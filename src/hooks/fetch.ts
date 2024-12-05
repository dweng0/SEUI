import { createSignal, onCleanup, onMount } from 'solid-js'
import { useSignature } from '../context/Signature'

/**
 * Custom hook to fetch an array of data from a given URL.
 *
 * @template T
 * @param {string} url - The URL to fetch data from.
 * @returns {Object} An object containing the data, loading state, and error state.
 */
export const useFetchArray = <T>(url: string) => {
    const [data, setData] = createSignal<T[]>([])
    const [loading, setLoading] = createSignal<boolean>(true)
    const [error, setError] = createSignal<string | null>(null)

    const performFetch = async () => {
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`)
            }
            const responseData: T[] = await response.json()
            setData(responseData)
            setError(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    onMount(() => {
        performFetch()
    })

    onCleanup(() => {
        // TODO: Add cleanup if required
    })

    return { data, loading, error }
}

/**
 * Custom hook to fetch an array of data from a given URL with an API key.
 *
 * @template T
 * @param {string} url - The URL to fetch data from.
 * @param {boolean} [fetchStraightAway=true] - Whether to fetch data immediately on mount.
 * @returns {Object} An object containing the data, loading state, error state, and performFetch function.
 */
export const useFetchArrayWithKey = <T>(
    url: string,
    fetchStraightAway = true
) => {
    const [data, setData] = createSignal<T[]>([])
    const [loading, setLoading] = createSignal<boolean>(true)
    const [error, setError] = createSignal<string | null>(null)

    const performFetch = async (key?: string) => {
        try {
            const defaultHeaders = {
                'Content-Type': 'application/json',
            }

            let headers = key
                ? { ...defaultHeaders, 'API-Key': key }
                : defaultHeaders

            const options = {
                method: 'GET',
                headers,
            }

            const response = await fetch(url, options)
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`)
            }
            const responseData: T[] = await response.json()
            setData(responseData)
            setError(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    onMount(() => {
        if (fetchStraightAway) {
            performFetch()
        }
    })

    onCleanup(() => {
        // TODO: Add cleanup if required
    })

    return { data, loading, error, performFetch }
}

/**
 * Custom hook to perform a POST request.
 *
 * @returns {Object} An object containing the loading state, error state, and performPost function.
 */
export const usePost = () => {
    const [loading, setLoading] = createSignal<boolean>(true)
    const { apiKey } = useSignature()
    const [error, setError] = createSignal<string | null>(null)
    const url = 'https://cax.piccadilly.autonity.org/api'

    const performPost = async <S, R>(path: string, payload: S): Promise<R> => {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'API-Key': apiKey(),
                },
                body: JSON.stringify(payload),
            }
            const response = await fetch(`${url}${path}`, options)

            if (!response.ok) {
                throw new Error(`Error ${response.statusText}`)
            }
            const responseData: R = await response.json()
            setError(null)
            return responseData
        } catch (e: any) {
            throw new Error(e.message)
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        performPost,
    }
}

/**
 * Custom hook to fetch an object from a given URL.
 *
 * @template T
 * @param {string} proposedUrl - The URL to fetch data from.
 * @param {T} initialData - The initial data to set.
 * @returns {Object} An object containing the data, loading state, error state, and performFetch function.
 */
export const useFetchObject = <T>(proposedUrl: string, initialData: T) => {
    const [data, setData] = createSignal<T>(initialData)
    const [loading, setLoading] = createSignal<boolean>(true)
    const [error, setError] = createSignal<string | null>(null)

    const performFetch = async (url: string) => {
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`)
            }
            const responseData: T = await response.json()
            //@ts-ignore
            setData(responseData)
            setError(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    onMount(() => {
        performFetch(proposedUrl)
    })

    onCleanup(() => {
        // TODO: Add cleanup
    })

    return { data, loading, error, performFetch }
}
