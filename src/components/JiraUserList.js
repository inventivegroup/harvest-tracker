import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from './Loader'
import { fetchJiraUsers, setActiveJiraUsers } from '../store/actions/jiraActions'

const JiraUserList = () => {
    const dispatch = useDispatch()
    const { jiraUsers, loading, error, activeJiraUsers } = useSelector(
        (state) => state.jira
    )

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(fetchJiraUsers())
        }

        fetchData()
    }, [dispatch])

    useEffect(() => {
        // Filter active Jira users whenever jiraUsers changes
        if (jiraUsers.length > 0) {
            filterActiveJiraUsers()
        }
    }, [jiraUsers]) // Add jiraUsers as a dependency

    const filterActiveJiraUsers = () => {
        const filtered = jiraUsers.filter((user) => user.active === true)
        console.log('filtered', filtered)
        dispatch(setActiveJiraUsers(filtered)) // Dispatch action to save filtered active users
    }

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    // Sort activeJiraUsers by displayName
    const sortedActiveJiraUsers = [...activeJiraUsers].sort((a, b) => {
        return a.displayName.localeCompare(b.displayName) // Sort by displayName
    })

    return (
        <div>
            {sortedActiveJiraUsers.length === 0 ? (
                <p>No Jira users available.</p>
            ) : (
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Display Name</th>
                            <th>Jira Account ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedActiveJiraUsers.map((user) => {
                            return (
                                <tr key={user.accountId}>
                                    <td>{user.displayName}</td>
                                    <td>
                                        <a
                                            href={`/jira-tickets?userId=${user.accountId}`}
                                        >
                                            {user.accountId}
                                        </a>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default JiraUserList
