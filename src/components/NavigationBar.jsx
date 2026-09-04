import { useState } from 'react'
import '../styles/NavigationBar.css'
import logo from '../assets/logo.png'
import Button from './Button'

const NAV_ITEMS = [
    { id: 'Employees', label: 'Employees' },
    { id: 'Upcoming', label: 'Upcoming' },
    { id: 'Customers', label: 'Customers' },
    { id: 'Request', label: 'Request' },
    { id: 'Update', label: 'Update' },
]

export default function NavigationBar({ activePage, onPageChange }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleSelectPage = (pageId) => {
        onPageChange(pageId)
        setIsMenuOpen(false)
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
                        <img src={logo} alt="CarDhekho logo" />
                    </div>
                    <div className="Name">
                        <h1>CarDhekho</h1>
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
                            isClick={activePage === item.id}
                        />
                    ))}
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

