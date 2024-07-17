import { createSignal, onCleanup, onMount } from 'solid-js'
import { useSignature } from '../context/Signature'

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
        // todo clean up if required
    })

    return { data, loading, error }
}

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
                ? { ...defaultHeaders, ...{ 'API-Key': key } }
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
        // todo clean up if required
    })

    return { data, loading, error, performFetch }
}

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
        // todo clean up if required
    })

    return { data, loading, error, performFetch }
}
