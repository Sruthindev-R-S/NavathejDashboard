import { createContext, useContext, useState } from 'react'
import { API_BASE_URL, parseResponse } from '../config/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem('token') || null
        } catch {
            return null
        }
    })

    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('capitaledge_user') || localStorage.getItem('cardhekho_user')
            return saved ? JSON.parse(saved) : null
        } catch {
            return null
        }
    })

    const login = async (username, password) => {
        const trimmedUser = username.trim()
        const trimmedPass = password.trim()

        if (!trimmedUser || !trimmedPass) {
            throw new Error('Please enter both username and password.')
        }

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: trimmedUser,
                password: trimmedPass
            })
        })

        const data = await parseResponse(response)

        if (!response.ok) {
            const errorMessage =
                data?.message ||
                data?.error ||
                (typeof data === 'string' ? data : null) ||
                `Login failed with status ${response.status}`
            throw new Error(errorMessage)
        }

        const jwtToken = data?.token
        if (!jwtToken) {
            throw new Error('Authentication succeeded but no token was provided by the server.')
        }

        const userData = {
            username: trimmedUser,
            token: jwtToken,
            loginTime: new Date().toISOString()
        }

        localStorage.setItem('token', jwtToken)
        localStorage.setItem('capitaledge_user', JSON.stringify(userData))
        setToken(jwtToken)
        setUser(userData)

        return userData
    }

    const register = async (username, password) => {
        const trimmedUser = username.trim()
        const trimmedPass = password.trim()

        if (!trimmedUser || !trimmedPass) {
            throw new Error('Please enter both username and password.')
        }

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: trimmedUser,
                password: trimmedPass
            })
        })

        const data = await parseResponse(response)

        if (!response.ok) {
            const errorMessage =
                data?.message ||
                data?.error ||
                (typeof data === 'string' ? data : null) ||
                `Registration failed with status ${response.status}`
            throw new Error(errorMessage)
        }

        return data
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('capitaledge_user')
        localStorage.removeItem('cardhekho_user')
        setUser(null)
        setToken(null)
    }

    const isAuthenticated = Boolean(token && user)

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
