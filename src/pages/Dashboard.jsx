import { useParams, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar'
import Customers from './Customers'
import Employee from './employees'
import Pending from './Pending'
import Upcoming from './Upcoming'
import Update from './Update'
import Vehicles from './Vehicles'
import '../styles/App.css'

const TAB_MAP = {
    employees: 'Employees',
    upcoming: 'Upcoming',
    customers: 'Customers',
    pending: 'Pending',
    request: 'Pending',
    vehicles: 'Vehicles',
    allvehicles: 'Vehicles',
    all: 'Vehicles',
    update: 'Update',
}

export default function Dashboard() {
    const { tab } = useParams()
    const navigate = useNavigate()

    const normalizedTab = tab ? tab.toLowerCase() : 'update'
    const activePage = TAB_MAP[normalizedTab] || 'Update'

    const handlePageChange = (pageId) => {
        navigate(`/dashboard/${pageId.toLowerCase()}`)
    }

    const renderPage = () => {
        switch (activePage) {
            case 'Employees':
                return <Employee />
            case 'Upcoming':
                return <Upcoming />
            case 'Customers':
                return <Customers />
            case 'Pending':
            case 'Request':
                return <Pending />
            case 'Vehicles':
                return <Vehicles />
            case 'Update':
            default:
                return <Update />
        }
    }

    return (
        <div className="Main">
            <div className="NavigationMain">
                <NavigationBar activePage={activePage} onPageChange={handlePageChange} />
                <div className="body">
                    {renderPage()}
                </div>
            </div>
        </div>
    )
}
