/// <reference types="vite/client" />

interface Window {
    ethereum: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: (request: { method: string, params?: Array | Record }) => Promise
    }
}