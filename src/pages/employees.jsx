import { useEffect, useState } from 'react'
import '../styles/pages.css'

export default function Employee(){
    const [users, setUsers] = useState([])

    async function getData() {
        try {
            const response = await fetch('https://vehicle-9srx.onrender.com/getEmployee')
            const data = await response.json()
            setUsers(Array.isArray(data) ? data : data.users ?? data.employees ?? [])
        } catch (error) {
            console.error('Unable to load employees:', error)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    async function onSubmit(event){
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        const newEmployee = {
            phone_number: formData.get('phone_number'),
            name: formData.get('name')
        }

        try {
            const response = await fetch('https://vehicle-9srx.onrender.com/addEmployee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEmployee)
            })

            if (!response.ok) {
                throw new Error(`Add request failed with status ${response.status}`)
            }

            await getData()
            form.reset()
        } catch (error) {
            console.error('Unable to add employee:', error)
        }
    }
   
    
    async function onClick(phoneNumber){
        try {
            const query = new URLSearchParams({ phone_number: String(phoneNumber) })
            const response = await fetch(
                `https://vehicle-9srx.onrender.com/deleteEmployee?${query}`,
                { method: 'DELETE' }
            )

            if (!response.ok) {
                throw new Error(`Delete request failed with status ${response.status}`)
            }

            setUsers((currentUsers) => currentUsers.filter(
                (employee) => employee.Phone_number !== phoneNumber
            ))
        } catch (error) {
            console.error('Unable to delete employee:', error)
        }
    }
    return(<div>
         <div className='add-employee'>
            <form onSubmit={onSubmit}>
                <label htmlFor='employee-name'>Name</label>
                <input id='employee-name' name='name' type='text' required />
                <label htmlFor='employee-phone'>Phone Number</label>
                <input id='employee-phone' name='phone_number' type='tel' required />
                <button type='submit'>Submit</button>
            </form>
         </div>
        <div>
            <table>
            <thead>
                <tr>
                    <th>
                        Id
                    </th>
                    <th>
                        Name
                    </th>
                    <th>Phone Number</th>
                    <th>
                        Action
                    </th>
                </tr>
    
            </thead>
            <tbody>
                {users.map((employee, index)=>(
                    <tr key={employee.Id ?? employee.id ?? `${employee.Name}-${employee.Phone_number}`}>
                        <td>
                            {employee.Id ?? employee.id ?? index + 1}
                        </td>
                        <td>
                            {employee.Name}
                        </td>
                        <td>
                            {employee.Phone_number}
                        </td>
                        <td>
                            <button type='button' className='delete' onClick={() => onClick(employee.Phone_number)}>Delete</button>
                        </td>

                    </tr>
                ))}
            </tbody>
        </table>

        </div>
    </div>
       
        
    )
}