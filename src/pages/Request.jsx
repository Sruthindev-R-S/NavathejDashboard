import { useEffect, useState } from 'react'
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

export default function Request(){
    const [vehicles, setVehicles] = useState([])

    useEffect(() => {
        async function getData() {
            const response = await fetch('https://vehicle-9srx.onrender.com/getVehicle')
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
            const response = await fetch('https://vehicle-9srx.onrender.com/updateAction', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vehicle_number: vehicleNumber,
                    action: action === 0 ? '0' : action
                })
            })

            if (!response.ok) {
                throw new Error(`Action update failed with status ${response.status}`)
            }

            setVehicles((currentVehicles) =>
                currentVehicles.map((vehicle) =>
                    (vehicle.vehicle_number === vehicleNumber || vehicle.vehicle_no === vehicleNumber)
                        ? { ...vehicle, status: Number(action) }
                        : vehicle
                )
            )
        } catch (error) {
            console.error('Unable to update vehicle action:', error)
        }
    }

    const displayedVehicles = vehicles
        .filter((vehicle) => vehicle.status !== null && vehicle.status !== undefined && Number(vehicle.status) === 2)
        .sort((a, b) => {
            const dateA = a.data?.insurance_upto || a.insuance_date || a.insurance_expiry
            const dateB = b.data?.insurance_upto || b.insuance_date || b.insurance_expiry
            return getTimestamp(dateA) - getTimestamp(dateB)
        })

    return(
        <div>
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
                        const insuranceCompany = vehicle.data?.insurance_company || vehicle.insurance_company || '-'
                        const mobileNumber = vehicle.mobile_number || vehicle.data?.mobile_number || '-'

                        return (
                            <tr key={vehicle.vehicle_number || vehicle.vehicle_no || index}>
                                <td>{vehicleNumber}</td>
                                <td>{ownerName}</td>
                                <td>{insuranceExpiry}</td>
                                <td>{insuranceCompany}</td>
                                <td>{mobileNumber}</td>
                                <td>
                                    <div className='Table-content'>
                                        <button
                                            type='button'
                                            className='delete'
                                            onClick={() => handleAction(vehicleNumber, 0)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            type='button'
                                            className='Accept-Button'
                                            onClick={() => handleAction(vehicleNumber, 1)}
                                        >
                                            Accept
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