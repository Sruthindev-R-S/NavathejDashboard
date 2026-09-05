import { useEffect, useState } from 'react'
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

    // If the yearly renew date for the current year is already over, show the new renew date for next year
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

function getYearlyRenewTimestamp(dateString) {
    return getYearlyRenewInfo(dateString).timestamp
}

export default function Upcoming(){
    const [vehicles, setVehicles] = useState([])

    useEffect(() => {
        async function getData() {
            const response = await apiFetch('/getVehicle')
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }
            const data = await response.json()
            setVehicles(Array.isArray(data) ? data : data.vehicles ?? [])
        }

        getData().catch((error) => {
            console.error('Unable to load vehicles:', error)
        })
    }, [])

    async function handleAction(vehicleNumber, action) {
        if (!vehicleNumber || vehicleNumber === '-') return

        try {
            const response = await apiFetch('/updateAction', {
                method: 'PATCH',
                body: JSON.stringify({
                    vehicle_number: vehicleNumber,
                    action: action
                })
            })

            if (!response.ok) {
                throw new Error(`Action update failed with status ${response.status}`)
            }

            setVehicles((currentVehicles) =>
                currentVehicles.map((vehicle) =>
                    (vehicle.vehicle_number === vehicleNumber || vehicle.vehicle_no === vehicleNumber)
                        ? { ...vehicle, status: action }
                        : vehicle
                )
            )
        } catch (error) {
            console.error('Unable to update vehicle action:', error)
        }
    }

    const displayedVehicles = vehicles
        .filter((vehicle) => vehicle.status !== null && vehicle.status !== undefined && Number(vehicle.status) === 0)
        .sort((a, b) => {
            const dateA = a.data?.insurance_upto || a.insuance_date || a.insurance_expiry
            const dateB = b.data?.insurance_upto || b.insuance_date || b.insurance_expiry
            return getYearlyRenewTimestamp(dateA) - getYearlyRenewTimestamp(dateB)
        })

    return(
        <div className='table-responsive'>
            <table>
                <thead>
                    <tr>
                        <th>
                            Vehicle Number
                        </th>
                        <th>
                            Owner Name
                        </th>
                        <th>
                            Insurance Expiry
                        </th>
                        <th>
                            Yearly Renew
                        </th>
                        <th>
                            Insurance Company
                        </th>
                        <th>
                            Mobile Number
                        </th>
                        <th>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {displayedVehicles.map((vehicle, index) => {
                        const vehicleNumber = vehicle.vehicle_number || vehicle.vehicle_no || '-'
                        const ownerName = vehicle.data?.owner_name || vehicle.Owner_name || vehicle.owner_name || '-'
                        const rawExpiryDate = vehicle.data?.insurance_upto || vehicle.insuance_date || vehicle.insurance_expiry
                        const insuranceExpiry = formatDate(rawExpiryDate)
                        const renewInfo = getYearlyRenewInfo(rawExpiryDate)
                        const insuranceCompany = vehicle.data?.insurance_company || vehicle.insurance_company || '-'
                        const mobileNumber = vehicle.mobile_number || vehicle.data?.mobile_number || '-'

                        return (
                            <tr key={vehicle.vehicle_number || vehicle.vehicle_no || index}>
                                <td>{vehicleNumber}</td>
                                <td>{ownerName}</td>
                                <td>{insuranceExpiry}</td>
                                <td>
                                    <div className="renew-cell">
                                        <span>{renewInfo.formattedDate}</span>
                                        {renewInfo.isOver && (
                                            <span
                                                className="renew-over-tag"
                                                title="Renewal date for this year has passed; showing next year's renewal"
                                            >
                                                Next Year
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>{insuranceCompany}</td>
                                <td>{mobileNumber}</td>
                                <td>
                                    <div className='Table-content'>
                                        <button
                                            type='button'
                                            className='delete'
                                            onClick={() => handleAction(vehicleNumber, 3)}
                                        >
                                            Ignore
                                        </button>
                                        <button
                                            type='button'
                                            className='Accept-Button'
                                            onClick={() => handleAction(vehicleNumber, 1)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            type='button'
                                            className='waiting'
                                            onClick={() => handleAction(vehicleNumber, 2)}
                                        >
                                            Waiting
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}