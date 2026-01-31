import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers } from '../store/actions/userActions'
import { roleMapping } from '../utils/roleMapping'
import Loader from '../components/Loader'

const TimeSpentPage = () => {
    const dispatch = useDispatch()
    const timeEntriesByDate = useSelector(
        (state) => state.timeEntries.timeEntriesByDate
    )
    const users = useSelector((state) => state.users.users) // Get users from state
    const selectedWeek = useSelector((state) => state.timeEntries.selectedWeek)

    const [loading, setLoading] = useState(true)
    const [groupedHours, setGroupedHours] = useState({})
    const [nullReferenceHours, setNullReferenceHours] = useState(0)
    const [notNullReferenceHours, setNotNullReferenceHours] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(fetchUsers())
            setLoading(false)
        }
        fetchData()
    }, [dispatch])

    useEffect(() => {
        // Group total hours by project code and role whenever timeEntriesByDate changes
        const groupHoursByProjectAndRole = () => {
            const hoursByProjectAndRole = {}
            let totalNullReferenceHours = 0
            let totalNotNullReferenceHours = 0

            // Check if timeEntriesByDate is defined and iterate through it
            if (timeEntriesByDate) {
                timeEntriesByDate.forEach((entry) => {
                    const projectCode = entry.project.code // Assuming each entry has a projectCode
                    const hours = entry.hours || 0 // Get hours, default to 0 if not present
                    const userId = entry.user.id // Get user ID from the entry

                    // Find the user
                    const user = users.find((user) => user.id === userId)
                    if (!user) return // Skip if user not found

                    // Get the primary role from the role mapping
                    const primaryRole = roleMapping.find(
                        (role) => role.harvest_id === userId
                    )?.primary_role

                    // Initialize project code in hoursByProjectAndRole if not already present
                    if (!hoursByProjectAndRole[projectCode]) {
                        hoursByProjectAndRole[projectCode] = {}
                    }

                    // Initialize the primary role in the project code if not already present
                    if (primaryRole) {
                        if (!hoursByProjectAndRole[projectCode][primaryRole]) {
                            hoursByProjectAndRole[projectCode][primaryRole] = {
                                totalHours: 0,
                                nullReferenceHours: 0,
                                notNullReferenceHours: 0,
                            }
                        }

                        // Accumulate total hours for the project code and primary role
                        hoursByProjectAndRole[projectCode][
                            primaryRole
                        ].totalHours += hours

                        // Sum hours based on external_reference
                        if (entry.external_reference === null) {
                            hoursByProjectAndRole[projectCode][
                                primaryRole
                            ].nullReferenceHours += hours
                            totalNullReferenceHours += hours // Update total null reference hours
                        } else {
                            hoursByProjectAndRole[projectCode][
                                primaryRole
                            ].notNullReferenceHours += hours
                            totalNotNullReferenceHours += hours // Update total not null reference hours
                        }
                    }
                })
            }

            setGroupedHours(hoursByProjectAndRole) // Update state with grouped hours
            setNullReferenceHours(totalNullReferenceHours) // Update state for null reference hours
            setNotNullReferenceHours(totalNotNullReferenceHours) // Update state for not null reference hours
        }

        groupHoursByProjectAndRole()
    }, [timeEntriesByDate, users])

    if (loading) {
        return <Loader /> // Show loader while loading users
    }

    // Sort project codes
    const sortedProjectCodes = Object.keys(groupedHours).sort()

    // Function to determine color based on percentage
    const getColor = (percentage) => {
        if (percentage === 100) return 'green'
        if (percentage >= 75) return 'blue'
        if (percentage >= 50) return 'purple'
        if (percentage >= 25) return 'darkorange'
        return 'red'
    }

    return (
        <div className="container mx-auto p-4">
            <h1>Time Spent for {selectedWeek}</h1>
            {sortedProjectCodes.length === 0 ? (
                <p>No time entries available.</p>
            ) : (
                <>
                    {sortedProjectCodes.map((projectCode) => {
                        const roles = Object.keys(
                            groupedHours[projectCode]
                        ).sort()
                        const projectTotals = {
                            totalHours: 0,
                            notNullReferenceHours: 0,
                            nullReferenceHours: 0,
                        }

                        return (
                            <div
                                className="time-spent-container"
                                key={projectCode}
                            >
                                <h2>{projectCode}</h2>
                                <table className="user-table">
                                    <thead>
                                        <tr>
                                            <th>Role</th>
                                            <th>Total Hours</th>
                                            <th>Jira Ticket Hours</th>
                                            <th>
                                                Other Hours (Meetings, PR
                                                reviews, etc.)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map((role) => {
                                            const totals =
                                                groupedHours[projectCode][role]
                                            projectTotals.totalHours +=
                                                totals.totalHours || 0
                                            projectTotals.notNullReferenceHours +=
                                                totals.notNullReferenceHours ||
                                                0
                                            projectTotals.nullReferenceHours +=
                                                totals.nullReferenceHours || 0
                                            const percentOfTotalNotNullReferenceHours =
                                                (totals.notNullReferenceHours /
                                                    totals.totalHours) *
                                                100
                                            const percentOfTotalNullReferenceHours =
                                                (totals.nullReferenceHours /
                                                    totals.totalHours) *
                                                100

                                            return (
                                                <tr key={role}>
                                                    <td>{role}</td>
                                                    <td>
                                                        {(
                                                            totals.totalHours ||
                                                            0
                                                        ).toFixed(2)}
                                                    </td>{' '}
                                                    {/* Display total hours */}
                                                    <td
                                                        style={{
                                                            color: getColor(
                                                                percentOfTotalNotNullReferenceHours
                                                            ),
                                                        }}
                                                    >
                                                        {(
                                                            totals.notNullReferenceHours ||
                                                            0
                                                        ).toFixed(2)}{' '}
                                                        (
                                                        {percentOfTotalNotNullReferenceHours.toFixed(
                                                            0
                                                        )}
                                                        %)
                                                    </td>
                                                    <td
                                                        style={{
                                                            color: getColor(
                                                                percentOfTotalNullReferenceHours
                                                            ),
                                                        }}
                                                    >
                                                        {(
                                                            totals.nullReferenceHours ||
                                                            0
                                                        ).toFixed(2)}{' '}
                                                        (
                                                        {percentOfTotalNullReferenceHours.toFixed(
                                                            0
                                                        )}
                                                        %)
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        <tr>
                                            <td>
                                                <strong>Totals</strong>
                                            </td>
                                            <td>
                                                <strong>
                                                    {projectTotals.totalHours.toFixed(
                                                        2
                                                    )}
                                                </strong>
                                            </td>{' '}
                                            {/* Total hours for the project */}
                                            <td>
                                                <strong>
                                                    {projectTotals.notNullReferenceHours.toFixed(
                                                        2
                                                    )}
                                                </strong>
                                            </td>{' '}
                                            {/* Total hours with external reference */}
                                            <td>
                                                <strong>
                                                    {projectTotals.nullReferenceHours.toFixed(
                                                        2
                                                    )}
                                                </strong>
                                            </td>{' '}
                                            {/* Total hours without external reference */}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )
                    })}
                </>
            )}
        </div>
    )
}

export default TimeSpentPage
