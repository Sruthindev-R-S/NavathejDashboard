import { useEffect, useState, useMemo } from 'react'
import { apiFetch } from '../config/api'
import '../styles/pages.css'

function formatDate(dateString) {
    if (!dateString || dateString === '-') return '-'
    const str = String(dateString).trim()
    const parts = str.split('T')[0].split('-')
    if (parts.length === 3) {
        const [p1, p2, p3] = parts
        if (p1.length === 4) {
            return `${p3.padStart(2, '0')}-${p2.padStart(2, '0')}-${p1}`
        }
        if (p3.length === 4) {
            return `${p1.padStart(2, '0')}-${p2.padStart(2, '0')}-${p3}`
        }
    }
    const date = new Date(str)
    if (isNaN(date.getTime())) return str
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
}

function getTimestamp(dateString) {
    if (!dateString) return Infinity
    const str = String(dateString).trim()
    const parts = str.split('T')[0].split('-')
    if (parts.length === 3) {
        const [p1, p2, p3] = parts
        if (p1.length === 4) {
            return new Date(Number(p1), Number(p2) - 1, Number(p3)).getTime()
        }
        if (p3.length === 4) {
            return new Date(Number(p3), Number(p2) - 1, Number(p1)).getTime()
        }
    }
    const d = new Date(str)
    return isNaN(d.getTime()) ? Infinity : d.getTime()
}

function getYearlyRenewInfo(dateString) {
    if (!dateString || dateString === '-') {
        return { formattedDate: '-', timestamp: Infinity, isOver: false }
    }
    const str = String(dateString).trim()
    let day = null
    let month = null
    const parts = str.split('T')[0].split('-')
    if (parts.length === 3) {
        const [p1, p2, p3] = parts
        if (p1.length === 4) {
            day = Number(p3)
            month = Number(p2)
        } else if (p3.length === 4) {
            day = Number(p1)
            month = Number(p2)
        }
    }
    if (day === null || month === null || isNaN(day) || isNaN(month)) {
        const d = new Date(str)
        if (!isNaN(d.getTime())) {
            day = d.getDate()
            month = d.getMonth() + 1
        }
    }
    if (day === null || month === null || isNaN(day) || isNaN(month)) {
        return { formattedDate: '-', timestamp: Infinity, isOver: false }
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const isCurrentYearLeap = (currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0)
    const dayThisYear = (month === 2 && day === 29 && !isCurrentYearLeap) ? 28 : day
    const thisYearDate = new Date(currentYear, month - 1, dayThisYear)

    let targetYear = currentYear
    let targetDay = dayThisYear
    let isOver = false

    if (thisYearDate < todayMidnight) {
        isOver = true
        targetYear = currentYear + 1
        const isNextYearLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0)
        targetDay = (month === 2 && day === 29 && !isNextYearLeap) ? 28 : day
    }

    const finalDate = new Date(targetYear, month - 1, targetDay)
    const formattedDate = `${String(targetDay).padStart(2, '0')}-${String(month).padStart(2, '0')}-${targetYear}`

    return {
        formattedDate,
        timestamp: finalDate.getTime(),
        isOver
    }
}

function getYearlyRenewDate(dateString) {
    return getYearlyRenewInfo(dateString).formattedDate
}

function getStatusInfo(status) {
    const num = Number(status)
    switch (num) {
        case 0:
            return { label: 'Upcoming', className: 'status-upcoming' }
        case 1:
            return { label: 'Customer', className: 'status-customer' }
        case 2:
            return { label: 'Pending', className: 'status-pending' }
        case 3:
            return { label: 'Ignored', className: 'status-ignored' }
        default:
            return { label: `Status ${status ?? 'N/A'}`, className: 'status-other' }
    }
}

function formatKey(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

function renderValue(val) {
    if (val === null || val === undefined || val === '') return '-'
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    if (typeof val === 'object') {
        if (Array.isArray(val)) {
            return val.length === 0 ? '-' : val.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(', ')
        }
        return JSON.stringify(val)
    }
    return String(val)
}

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all') // 'all' | '0' | '2' | '1'
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedVehicle, setSelectedVehicle] = useState(null)
    const [copied, setCopied] = useState(false)
    const [activeModalTab, setActiveModalTab] = useState('overview') // 'overview' | 'all' | 'raw'

    useEffect(() => {
        let isMounted = true

        async function getData() {
            setLoading(true)
            setError(null)
            try {
                const response = await apiFetch('/getVehicle')
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`)
                }
                const data = await response.json()
                if (isMounted) {
                    setVehicles(Array.isArray(data) ? data : data.vehicles ?? [])
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Unable to load vehicles:', err)
                    setError(err.message || 'Failed to load vehicle data.')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        getData()

        return () => {
            isMounted = false
        }
    }, [])

    // Close modal on Escape key
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                setSelectedVehicle(null)
            }
        }
        if (selectedVehicle) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [selectedVehicle])

    // Filter to Upcoming (0), Pending (2), and Customers (1)
    const relevantVehicles = useMemo(() => {
        return vehicles.filter(
            (v) => v.status !== null && v.status !== undefined && [0, 1, 2].includes(Number(v.status))
        )
    }, [vehicles])

    // Counts for filter pills
    const counts = useMemo(() => {
        let upcoming = 0
        let pending = 0
        let customers = 0
        relevantVehicles.forEach((v) => {
            const num = Number(v.status)
            if (num === 0) upcoming++
            else if (num === 2) pending++
            else if (num === 1) customers++
        })
        return {
            all: relevantVehicles.length,
            upcoming,
            pending,
            customers
        }
    }, [relevantVehicles])

    // Filtered by status tab and search query, then sorted by expiry
    const displayedVehicles = useMemo(() => {
        let filtered = relevantVehicles

        if (statusFilter !== 'all') {
            const targetStatus = Number(statusFilter)
            filtered = filtered.filter((v) => Number(v.status) === targetStatus)
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            filtered = filtered.filter((v) => {
                const num = (v.vehicle_number || v.vehicle_no || '').toLowerCase()
                const owner = (v.data?.owner_name || v.Owner_name || v.owner_name || '').toLowerCase()
                const phone = String(v.mobile_number || v.data?.mobile_number || '')
                const company = (v.data?.insurance_company || v.insurance_company || '').toLowerCase()
                return num.includes(q) || owner.includes(q) || phone.includes(q) || company.includes(q)
            })
        }

        return [...filtered].sort((a, b) => {
            const dateA = a.data?.insurance_upto || a.insuance_date || a.insurance_expiry
            const dateB = b.data?.insurance_upto || b.insuance_date || b.insurance_expiry
            return getTimestamp(dateA) - getTimestamp(dateB)
        })
    }, [relevantVehicles, statusFilter, searchQuery])

    const handleCopyDetails = (vehicle) => {
        if (!vehicle) return
        const text = JSON.stringify(vehicle, null, 2)
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    // Collect all properties from vehicle and vehicle.data for the complete API details view
    const allApiProperties = useMemo(() => {
        if (!selectedVehicle) return []
        const entries = []
        const seen = new Set()

        // Top level properties
        Object.entries(selectedVehicle).forEach(([key, val]) => {
            if (key !== 'data' && key !== '_id' && !seen.has(key)) {
                seen.add(key)
                entries.push({ source: 'Vehicle Info', key, label: formatKey(key), value: val })
            }
        })

        // Nested data properties
        if (selectedVehicle.data && typeof selectedVehicle.data === 'object') {
            Object.entries(selectedVehicle.data).forEach(([key, val]) => {
                if (!seen.has(key)) {
                    seen.add(key)
                    entries.push({ source: 'Vehicle Data', key, label: formatKey(key), value: val })
                }
            })
        }

        return entries
    }, [selectedVehicle])

    return (
        <div className="vehicles-page">
            {/* Controls Bar: Filters & Search */}
            <div className="vehicles-controls">
                <div className="filter-tabs" role="tablist" aria-label="Status Filter">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === 'all'}
                        className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All <span className="filter-badge">{counts.all}</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === '0'}
                        className={`filter-pill ${statusFilter === '0' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('0')}
                    >
                        Upcoming <span className="filter-badge">{counts.upcoming}</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === '2'}
                        className={`filter-pill ${statusFilter === '2' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('2')}
                    >
                        Pending <span className="filter-badge">{counts.pending}</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === '1'}
                        className={`filter-pill ${statusFilter === '1' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('1')}
                    >
                        Customers <span className="filter-badge">{counts.customers}</span>
                    </button>
                </div>

                <div className="vehicles-search-wrapper">
                    <input
                        type="text"
                        className="vehicles-search-input"
                        placeholder="Search vehicle, owner, mobile..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search vehicles"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="vehicles-search-clear"
                            onClick={() => setSearchQuery('')}
                            aria-label="Clear search"
                        >
                            &times;
                        </button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="vehicles-state-message">
                    <p>Loading vehicle details...</p>
                </div>
            )}

            {error && (
                <div className="vehicles-state-message vehicles-error-message">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && displayedVehicles.length === 0 && (
                <div className="vehicles-state-message">
                    <p>No vehicles found matching your criteria.</p>
                </div>
            )}

            {/* Table layout matching Upcoming.jsx */}
            {!loading && !error && displayedVehicles.length > 0 && (
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Vehicle Number</th>
                                <th>Owner Name</th>
                                <th>Status</th>
                                <th>Insurance Expiry</th>
                                <th>Insurance Company</th>
                                <th>Mobile Number</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedVehicles.map((vehicle, index) => {
                                const vehicleNumber = vehicle.vehicle_number || vehicle.vehicle_no || '-'
                                const ownerName = vehicle.data?.owner_name || vehicle.Owner_name || vehicle.owner_name || '-'
                                const rawExpiryDate = vehicle.data?.insurance_upto || vehicle.insuance_date || vehicle.insurance_expiry
                                const insuranceExpiry = formatDate(rawExpiryDate)
                                const insuranceCompany = vehicle.data?.insurance_company || vehicle.insurance_company || '-'
                                const mobileNumber = vehicle.mobile_number || vehicle.data?.mobile_number || '-'
                                const statusInfo = getStatusInfo(vehicle.status)

                                return (
                                    <tr key={vehicle.vehicle_number || vehicle.vehicle_no || index}>
                                        <td><strong>{vehicleNumber}</strong></td>
                                        <td>{ownerName}</td>
                                        <td>
                                            <span className={`status-badge ${statusInfo.className}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td>{insuranceExpiry}</td>
                                        <td>{insuranceCompany}</td>
                                        <td>{mobileNumber}</td>
                                        <td>
                                            <div className="Table-content">
                                                <button
                                                    type="button"
                                                    className="details-action-btn"
                                                    onClick={() => {
                                                        setSelectedVehicle(vehicle)
                                                        setActiveModalTab('overview')
                                                    }}
                                                    title={`View full details for ${vehicleNumber}`}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Details Modal */}
            {selectedVehicle && (
                <div
                    className="modal-backdrop"
                    onClick={() => setSelectedVehicle(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-vehicle-title"
                >
                    <div
                        className="modal-container"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="modal-header">
                            <div className="modal-title-group">
                                <h2 id="modal-vehicle-title">
                                    {selectedVehicle.vehicle_number || selectedVehicle.vehicle_no || 'Vehicle Details'}
                                </h2>
                                <span className={`status-badge ${getStatusInfo(selectedVehicle.status).className}`}>
                                    {getStatusInfo(selectedVehicle.status).label}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setSelectedVehicle(null)}
                                aria-label="Close vehicle details"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="modal-tabs">
                            <button
                                type="button"
                                className={`modal-tab ${activeModalTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveModalTab('overview')}
                            >
                                Overview
                            </button>
                            <button
                                type="button"
                                className={`modal-tab ${activeModalTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveModalTab('all')}
                            >
                                ALL Data ({allApiProperties.length})
                            </button>
                            <button
                                type="button"
                                className={`modal-tab ${activeModalTab === 'raw' ? 'active' : ''}`}
                                onClick={() => setActiveModalTab('raw')}
                            >
                                Raw JSON
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body">
                            {/* OVERVIEW TAB */}
                            {activeModalTab === 'overview' && (
                                <div className="overview-tab-content">
                                    <div className="modal-section">
                                        <h3 className="modal-section-title">Primary Information</h3>
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">Vehicle Number</span>
                                                <span className="detail-value highlight">
                                                    {selectedVehicle.vehicle_number || selectedVehicle.vehicle_no || '-'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Owner Name</span>
                                                <span className="detail-value">
                                                    {selectedVehicle.data?.owner_name || selectedVehicle.Owner_name || selectedVehicle.owner_name || '-'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Mobile Number</span>
                                                <span className="detail-value">
                                                    {selectedVehicle.mobile_number || selectedVehicle.data?.mobile_number || '-'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Current Status</span>
                                                <span className="detail-value">
                                                    {getStatusInfo(selectedVehicle.status).label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-section">
                                        <h3 className="modal-section-title">Insurance Details</h3>
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">Insurance Company</span>
                                                <span className="detail-value">
                                                    {selectedVehicle.data?.insurance_company || selectedVehicle.insurance_company || '-'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Insurance Expiry Date</span>
                                                <span className="detail-value">
                                                    {formatDate(selectedVehicle.data?.insurance_upto || selectedVehicle.insuance_date || selectedVehicle.insurance_expiry)}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Yearly Renew</span>
                                                <span className="detail-value">
                                                    {getYearlyRenewDate(selectedVehicle.data?.insurance_upto || selectedVehicle.insuance_date || selectedVehicle.insurance_expiry)}
                                                </span>
                                            </div>
                                            {selectedVehicle.data?.policy_number && (
                                                <div className="detail-item">
                                                    <span className="detail-label">Policy Number</span>
                                                    <span className="detail-value">
                                                        {selectedVehicle.data.policy_number}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Specifications if available */}
                                    <div className="modal-section">
                                        <h3 className="modal-section-title">Registration & Technical Specs</h3>
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">Maker / Model</span>
                                                <span className="detail-value">
                                                    {selectedVehicle.data?.maker_model || selectedVehicle.data?.model || selectedVehicle.model || '-'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Vehicle Class</span>
                                                <span className="detail-value">
                                                    {selectedVehicle.data?.vehicle_class || selectedVehicle.vehicle_class || '-'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Fuel Type</span>
                                                <span className="detail-value">
                                                    {selectedVehicle.data?.fuel_type || selectedVehicle.fuel_type || '-'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Registration Date</span>
                                                <span className="detail-value">
                                                    {formatDate(selectedVehicle.data?.registration_date || selectedVehicle.registration_date)}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Engine Number</span>
                                                <span className="detail-value">
                                                    {selectedVehicle.data?.engine_number || selectedVehicle.data?.engine_no || '-'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Chassis Number</span>
                                                <span className="detail-value">
                                                    {selectedVehicle.data?.chassis_number || selectedVehicle.data?.chassis_no || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ALL DATA TAB */}
                            {activeModalTab === 'all' && (
                                <div className="all-fields-tab-content">
                                    <p className="tab-hint">
                                        Showing all vehicle data received from the API:
                                    </p>
                                    <div className="api-fields-table-wrapper">
                                        <table className="api-fields-table">
                                            <thead>
                                                <tr>
                                                    <th>Field Key</th>
                                                    <th>Source</th>
                                                    <th>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allApiProperties.map((prop, i) => (
                                                    <tr key={i}>
                                                        <td className="field-key-cell">
                                                            <strong>{prop.label}</strong>
                                                            <small className="field-raw-key">{prop.key}</small>
                                                        </td>
                                                        <td className="field-source-cell">{prop.source}</td>
                                                        <td className="field-value-cell">{renderValue(prop.value)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* RAW JSON TAB */}
                            {activeModalTab === 'raw' && (
                                <div className="raw-tab-content">
                                    <div className="raw-json-header">
                                        <span>Raw API Response Object</span>
                                        <button
                                            type="button"
                                            className="copy-json-btn"
                                            onClick={() => handleCopyDetails(selectedVehicle)}
                                        >
                                            {copied ? 'Copied!' : 'Copy JSON'}
                                        </button>
                                    </div>
                                    <pre className="raw-json-pre">
                                        {JSON.stringify(selectedVehicle, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="copy-json-btn"
                                onClick={() => handleCopyDetails(selectedVehicle)}
                            >
                                {copied ? 'Copied to Clipboard!' : 'Copy All Details'}
                            </button>
                            <button
                                type="button"
                                className="modal-close-action"
                                onClick={() => setSelectedVehicle(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
