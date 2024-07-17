import { createSignal, onCleanup } from 'solid-js'

export const useWebSocket = <T>(url: string) => {
    const [data, setData] = createSignal<T | null>(null)
    const [error, setError] = createSignal<string | null>(null)
    const [connected, setConnected] = createSignal<boolean>(false)

    let socket: WebSocket

    const connect = () => {
        socket = new WebSocket(url)

        socket.onopen = () => {
            setConnected(true)
        }

        socket.onmessage = (event) => {
            setData(JSON.parse(event.data))
        }

        socket.onerror = (event) => {
            setError(`WebSocket error: ${event}`)
        }

        socket.onclose = () => {
            setConnected(false)
        }
    }

    onCleanup(() => {
        socket.close()
    })

    return { data, error, connected, connect }
}
