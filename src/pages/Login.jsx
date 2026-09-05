import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import '../styles/Login.css'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/dashboard'

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true })
        }
    }, [isAuthenticated, navigate, from])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const trimmedUser = username.trim()
        const trimmedPass = password.trim()

        if (!trimmedUser || !trimmedPass) {
            setError('Please enter both username and password.')
            return
        }

        setLoading(true)
        try {
            await login(trimmedUser, trimmedPass)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.message || 'Login failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="Login-container">
            <div className="Login-card">
                <div className="Login-brand">
                    <img src={logo} alt="CapitalEdge logo" />
                    <h1>CapitalEdge</h1>
                </div>

                <p className="Login-subtitle">
                    Sign in to access your dashboard
                </p>

                {error && <div className="Login-error">{error}</div>}

                <form className="Login-form" onSubmit={handleSubmit}>
                    <div className="Login-input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="Login-input-group">
                        <label htmlFor="password">Password</label>
                        <div className="Password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="Password-toggle"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="Login-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}
