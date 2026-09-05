export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vehicle-9srx.onrender.com'
export const RENDER_API_BASE_URL = API_BASE_URL

/**
 * Safely parses response body whether it is JSON or plain text.
 * Prevents JSON parse errors on text responses like 'User not found' or 'Invalid password'.
 */
export async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
        try {
            return await response.json()
        } catch {
            return { message: response.statusText }
        }
    }
    const text = await response.text()
    try {
        return JSON.parse(text)
    } catch {
        return { message: text || response.statusText }
    }
}

/**
 * Returns common headers including Authorization Bearer token if available.
 */
export function getAuthHeaders(customHeaders = {}) {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...customHeaders
    }
}

/**
 * Standard authenticated fetch wrapper for the deployed backend API.
 */
export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

    const token = localStorage.getItem('token')
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    }

    const response = await fetch(url, {
        ...options,
        headers
    })

    return response
}
