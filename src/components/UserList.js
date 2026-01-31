import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers } from '../store/actions/userActions'
import Loader from './Loader'
import { sortEntriesByUserFirstName } from '../utils/functions'
import { Table, FloatingLabel, FormSelect, Button } from 'react-bootstrap'
import {
    setSelectedWeek,
    fetchTimeEntriesByDate,
    setTimeEntriesByUser,
} from '../store/actions/timeEntriesActions'
import {
    fetchJiraUsers,
    setActiveJiraUsers,
} from '../store/actions/jiraActions'
import {
    calculateDates,
    secondsToHours,
    organizeEntriesByUser,
} from '../utils/functions'

const UserList = () => {
    const dispatch = useDispatch()
    const { users, loading, error } = useSelector((state) => state.users)
    const {
        jiraUsers,
        loading: jiraLoading,
        error: jiraError,
    } = useSelector((state) => state.jira)
    const selectedWeek = useSelector((state) => state.timeEntries.selectedWeek)
    const timeEntriesByDate = useSelector(
        (state) => state.timeEntries.timeEntriesByDate
    )
    const [isHoursCalculated, setIsHoursCalculated] = useState(false)
    const [showHours, setShowHours] = useState(false)
    const [organizedEntries, setOrganizedEntries] = useState({})
    const [totalHoursByUser, setTotalHoursByUser] = useState({})
    const [dateRange, setDateRange] = useState('')
    const { activeJiraUsers } = useSelector((state) => state.jira)

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(fetchUsers())
            const { startDate, endDate } = calculateDates(selectedWeek)
            await dispatch(
                fetchTimeEntriesByDate(
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0]
                )
            )
            await dispatch(fetchJiraUsers())
            filterActiveJiraUsers() // Call to filter active Jira users
        }

        fetchData()
    }, [dispatch, selectedWeek])

    console.log('jiraUsers', jiraUsers)
    console.log('activeJiraUsers', activeJiraUsers)

    const filterActiveJiraUsers = () => {
        // Filter users from jiraUsers where active is true
        const filtered = jiraUsers.filter((user) => user.active === true)
        // console.log("filtered", filtered);
        dispatch(setActiveJiraUsers(filtered))
    }

    const getAccountIdByFullName = (firstName, lastName) => {
        const fullName = `${firstName} ${lastName}`
        const user = activeJiraUsers.find(
            (user) => user.displayName === fullName
        )
        return user ? user.accountId : null // Return accountId if found, otherwise null
    }

    const handleCalculateHours = async () => {
        console.log('handleCalculateHours', timeEntriesByDate)
        const organized = await organizeEntriesByUser(timeEntriesByDate)
        console.log('organized', organized)
        setOrganizedEntries(organized)
        dispatch(setTimeEntriesByUser(organized))

        const { startDate, endDate } = calculateDates(selectedWeek)
        setDateRange(
            `From ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        ) // Update date range
        const totalHoursByUser = {}

        // Loop through each entry in the organized array
        for (const user in organized) {
            const userEntries = organized[user] // Get entries for the current user

            const totalHours = userEntries.timeEntries.reduce((acc, entry) => {
                return acc + (entry.hours || 0) // Sum the hours, defaulting to 0 if not present
            }, 0)

            // Calculate billable hours
            const billableHours = userEntries.timeEntries.reduce(
                (acc, entry) => {
                    return acc + (entry.billable ? entry.hours || 0 : 0) // Sum only billable hours
                },
                0
            )

            totalHoursByUser[userEntries.id] = {
                totalHours,
                billableHours,
            } // Store both total and billable hours for this user
        }

        console.log('Total hours by user:', totalHoursByUser)
        setTotalHoursByUser(totalHoursByUser) // Update state with total hours by user
        setIsHoursCalculated(true)
        setShowHours(true)
    }

    const handleWeekChange = (e) => {
        setIsHoursCalculated(false)
        setShowHours(false)
        const week = e.target.value
        dispatch(setSelectedWeek(week)) // Update the selected week
    }


    const calculatePercentOfCapacity = (totalHours, weeklyCapacity) => {
        const percentOfCapacity = (totalHours / weeklyCapacity) * 100
        return percentOfCapacity.toFixed(0)
    }

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    console.log('totalHoursByUser', totalHoursByUser)
    return (
        <div>
            {users.length === 0 ? (
                <p>No users available.</p>
            ) : (
                <>
                    <label>
                        <FloatingLabel>Week:</FloatingLabel>
                        <FormSelect
                            value={selectedWeek}
                            onChange={handleWeekChange}
                        >
                            <option value="thisWeek">This Week</option>
                            <option value="lastWeek">Last Week</option>
                        </FormSelect>
                    </label>

                    <Button style={{ marginLeft: '0.5rem' }} onClick={handleCalculateHours}>
                        Calculate Hours
                    </Button>

                    {dateRange && <p>{dateRange}</p>}

                    <Table className="user-table">
                        <thead>
                            <tr>
                                <th>Harvest ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Roles</th>
                                <th>Weekly Capacity (Hours)</th>
                                <th>Billable Hours</th>
                                <th>Total Hours</th>
                                <th>Jira Account ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortEntriesByUserFirstName(users).map((user) => {
                                const jiraAccountId = getAccountIdByFullName(
                                    user.first_name,
                                    user.last_name
                                ) // Get Jira account ID
                                return (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.first_name}</td>
                                        <td>{user.last_name}</td>
                                        <td>{user.roles.join(', ')}</td>
                                        <td>{secondsToHours(user.weekly_capacity)}</td>
                                        <td
                                            className={
                                                showHours &&
                                                isHoursCalculated &&
                                                (totalHoursByUser[user.id]
                                                    ?.billableHours === 0 ||
                                                    !totalHoursByUser[user.id])
                                                    ? 'gray-out'
                                                    : ''
                                            }
                                        >
                                            {showHours && isHoursCalculated
                                                ? totalHoursByUser[user.id]?.billableHours.toFixed(2) || '0.00'
                                                : 'N/A'
                                            }
                                           
                                        </td>
                                        <td
                                            className={
                                                showHours &&
                                                isHoursCalculated &&
                                                (totalHoursByUser[user.id]
                                                    ?.totalHours === 0 ||
                                                    !totalHoursByUser[user.id])
                                                    ? 'gray-out'
                                                    : ''
                                            }
                                        >
                                            {showHours && isHoursCalculated
                                                ? totalHoursByUser[
                                                      user.id
                                                  ]?.totalHours.toFixed(2) ||
                                                  '0.00'
                                                : 'N/A'}
                                            <br />
                                            {calculatePercentOfCapacity(totalHoursByUser[user.id]?.billableHours, secondsToHours(user.weekly_capacity))}%
                                        </td>
                                        <td>{jiraAccountId || 'N/A'}</td>{' '}
                                        {/* Display Jira Account ID */}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </>
            )}
        </div>
    )
}

export default UserList
