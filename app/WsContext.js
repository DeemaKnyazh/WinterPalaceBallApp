const { useEffect, createContext, useRef, useState } = require("react")

const WebSocketContext = createContext()

function WebSocketProvider({ children }) {
    const [wsClient, setWsClient] = useState('None');
    const ws = useRef(null)
    const channels = useRef({}) // maps each channel to the callback
    /* called from a component that registers a callback for a channel */
    const subscribe = (channel, callback) => {
        channels.current = callback
        channels.current(wsClient)
    }
    /* remove callback  */
    const unsubscribe = (channel) => {
        delete channels.current[channel]
    }
    useEffect(() => {
        /* WS initialization and cleanup */
        ws.current = new WebSocket(process.env.wsurl)
        ws.current.onopen = () => { console.log('WS open') }
        ws.current.onclose = () => { console.log('WS close') }
        ws.current.onmessage = (message) => {
            const data = message.data

            if (data.startsWith("client:")) {
                setWsClient(data);
            }
            if (data.startsWith("status ")) {
                channels.current(data)
            }
        }
        return () => { ws.current.close() }
    }, [])

    /* WS provider dom */
    /* subscribe and unsubscribe are the only required prop for the context */
    return (
        <WebSocketContext.Provider value={[subscribe, unsubscribe]}>
            {children}
        </WebSocketContext.Provider>
    )
}

export { WebSocketContext, WebSocketProvider }