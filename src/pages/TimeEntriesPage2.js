import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUserId } from '../store/actions/timeEntriesActions' // Import the new action
import { fetchUsers } from '../store/actions/userActions'
import TimeEntriesList from '../components/TimeEntriesList'
import Loader from '../components/Loader' // Import the Loader component
import { Button, FormSelect, FloatingLabel } from 'react-bootstrap'
import { sortEntriesByUserFirstName } from '../utils/functions'

const TimeEntriesPage2 = () => {
    const dispatch = useDispatch()
    const users = useSelector((state) => state.users.users)
    const timeEntriesByUser = useSelector(
        (state) => state.timeEntries.timeEntriesByUser
    )
    const selectedWeek = useSelector((state) => state.timeEntries.selectedWeek)
    const [selectedUser, setSelectedUser] = useState('3145393') // Default to Christina
    const [loading, setLoading] = useState(true)
    const [isUserSubmitted, setIsUserSubmitted] = useState(false)
    const [loadingTimeEntries, setLoadingTimeEntries] = useState(false)
    const [filteredTimeEntries, setFilteredTimeEntries] = useState([])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoadingTimeEntries(true) // Set loading state to true while fetching time entries
        console.log('selectedUser', selectedUser)
        console.log('timeEntriesByUser', timeEntriesByUser)
        // Filter time entries by the selected user ID
        const entriesForUser = timeEntriesByUser.find(
            (entry) => entry.id === Number(selectedUser)
        ) // Find the entry for the selected user ID
        console.log('entriesForUser', entriesForUser)
        const filteredTimeEntries = entriesForUser
            ? entriesForUser.timeEntries
            : [] // If entries exist, use them; otherwise, use an empty array
        console.log('Filtered Time Entries:', filteredTimeEntries)
        console.log('entriesForUser:', entriesForUser)
        setFilteredTimeEntries(filteredTimeEntries) // Set filtered time entries
        setIsUserSubmitted(true) // Set user submission state
        setLoadingTimeEntries(false) // Set loading state to false after fetching
        dispatch(setSelectedUserId(selectedUser)) // Save selected user ID to the store
    }

    useEffect(() => {
        dispatch(fetchUsers())
        setLoading(false)
    }, [dispatch])

    if (loading) {
        return <Loader /> // Show loader while loading users
    }

    return (
        <div>
            <h1>Time Entries</h1>
            <h2>Step 2: Fetch Time Entries by User</h2>
            <form onSubmit={handleSubmit}>
                <FloatingLabel>Time period: {selectedWeek}</FloatingLabel>

                <FloatingLabel>User</FloatingLabel>
                <FormSelect
                    name="user"
                    required
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                >
                    <option value="">Select a user</option>
                    {sortEntriesByUserFirstName(users).map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.first_name}
                        </option>
                    ))}
                </FormSelect>

                <Button type="submit">Fetch Time Entries</Button>
            </form>

            {loadingTimeEntries ? (
                <Loader /> // Show loader while fetching time entries
            ) : (
                isUserSubmitted && (
                    <TimeEntriesList userTimeEntries={filteredTimeEntries} />
                ) // Pass filtered entries to TimeEntriesList
            )}
        </div>
    )
}

export default TimeEntriesPage2
