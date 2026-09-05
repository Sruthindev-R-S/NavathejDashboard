import { useState } from 'react'
import { apiFetch } from '../config/api'
import '../styles/pages.css'

export default function Update(){
    const [vehicleNumber, setVehicleNumber] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)

    async function onSubmit(event){
        event.preventDefault()
        setMessage('')
        setIsError(false)

        const trimmedVehicle = vehicleNumber.trim()
        const trimmedPhone = phoneNumber.trim()

        if (!trimmedVehicle || !trimmedPhone) {
            setIsError(true)
            setMessage('Vehicle number and mobile number are required.')
            return
        }

        setLoading(true)
        try {
            const response = await apiFetch('/updateVehicle', {
                method: 'PATCH',
                body: JSON.stringify({
                    vehicle_number: trimmedVehicle,
                    phone_number: trimmedPhone
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || `Update failed with status ${response.status}`)
            }

            setMessage('Vehicle updated successfully!')
            setIsError(false)
            setVehicleNumber('')
            setPhoneNumber('')
        } catch (error) {
            console.error('Unable to update vehicle:', error)
            setIsError(true)
            setMessage(error.message || 'Failed to update vehicle.')
        } finally {
            setLoading(false)
        }
    }

    return(
        <div className='Update-body'>
            <form className='Update-text' onSubmit={onSubmit}>
                <input
                    type="text"
                    placeholder="Enter vehicle Number"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    required
                />
                <input
                    type="tel"
                    placeholder="Enter Mobile Number"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                />
                <button type='submit' className='Accept-Button' disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                </button>
                {message && (
                    <p style={{ color: isError ? '#ff8080' : '#80ff80', fontSize: '14px', margin: 0, textAlign: 'center', padding: '0 10px' }}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    )
}