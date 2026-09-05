import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/NavigationBar.css'
import logo from '../assets/logo.png'
import Button from './Button'

const NAV_ITEMS = [
    { id: 'Employees', label: 'Employees' },
    { id: 'Upcoming', label: 'Upcoming' },
    { id: 'Customers', label: 'Customers' },
    { id: 'Pending', label: 'Pending' },
    { id: 'Vehicles', label: 'All Vehicles' },
    { id: 'Update', label: 'Update' },
]

export default function NavigationBar({ activePage, onPageChange }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { logout, user } = useAuth()
    const navigate = useNavigate()

    const handleSelectPage = (pageId) => {
        onPageChange(pageId)
        setIsMenuOpen(false)
    }

    const handleLogout = () => {
        setIsMenuOpen(false)
        logout()
        navigate('/login')
    }

    return (
        <header className="NavigationHeader">
            <nav className="Navigation" aria-label="Main navigation">
                <div
                    className="NameAndLogo"
                    onClick={() => handleSelectPage('Update')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleSelectPage('Update')
                        }
                    }}
                >
                    <div className="logo">
                        <img src={logo} alt="CapitalEdge logo" />
                    </div>
                    <div className="Name">
                        <h1>CapitalEdge</h1>
                    </div>
                </div>

                <button
                    type="button"
                    className={`MenuToggle ${isMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={isMenuOpen}
                >
                    <span className="HamburgerBar"></span>
                    <span className="HamburgerBar"></span>
                    <span className="HamburgerBar"></span>
                </button>

                <div className={`ButtonDiv ${isMenuOpen ? 'open' : ''}`}>
                    {NAV_ITEMS.map((item) => (
                        <Button
                            key={item.id}
                            label={item.label}
                            onClick={() => handleSelectPage(item.id)}
                            isClick={activePage.toLowerCase() === item.id.toLowerCase()}
                        />
                    ))}
                    <button
                        type="button"
                        className="LogoutButton"
                        onClick={handleLogout}
                        title={user?.username ? `Logged in as ${user.username}` : 'Logout'}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {isMenuOpen && (
                <div
                    className="MenuBackdrop"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
        </header>
    )
}


