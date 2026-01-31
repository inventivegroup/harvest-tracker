import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom' // Import useLocation
import Loader from '../components/Loader' // Import a Loader component if you have one
import { fetchJiraProjectIssues } from '../store/actions/jiraActions' // Import your action to fetch Jira tickets

const JiraIssuesPage = () => {
    const dispatch = useDispatch()
    const location = useLocation() // Get the current location
    const queryParams = new URLSearchParams(location.search) // Parse the query parameters
    const projectId = queryParams.get('projectId') // Extract userId from query parameters
    const { jiraProjectIssues, loading, error } = useSelector((state) => state.jira)
    const [isDataFetched, setIsDataFetched] = useState(false)

    console.log('Captured projectId:', projectId) // Log the captured userId

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(fetchJiraProjectIssues(projectId)) // Pass userId to fetchJiraTickets
            setIsDataFetched(true)
        }
        fetchData()
    }, [dispatch, projectId])

    if (loading) {
        return <Loader /> // Show loader while fetching data
    }

    if (error) {
        return <div>Error: {error}</div> // Show error message if there's an error
    }

    console.log('jiraProjectIssues', jiraProjectIssues)
    console.log('Project ID from URL:', projectId) // Log the user ID for debugging

    // Group tickets by project key and calculate totals
    const groupedTickets = jiraProjectIssues.reduce((acc, ticket) => {
        const projectKey = ticket.fields.project.key // Get the project key
        if (!acc[projectKey]) {
            acc[projectKey] = {
                tickets: [], // Array to hold tickets
                totalEstimate: 0, // Total time estimate
                totalSpent: 0, // Total time spent
                totalRemaining: 0, // Total time remaining
                name: ticket.fields.project.name, // Project name
            }
        }
        acc[projectKey].tickets.push(ticket) // Add the ticket to the corresponding project key

        // Sum time estimates and time spent
        const timeEstimate = ticket.fields.timeoriginalestimate
            ? ticket.fields.timeoriginalestimate / 3600
            : 0 // Convert to hours
        const timeSpent = ticket.fields.timespent
            ? ticket.fields.timespent / 3600
            : 0 // Convert to hours

        acc[projectKey].totalEstimate += timeEstimate // Update total estimate
        acc[projectKey].totalSpent += timeSpent // Update total spent
        acc[projectKey].totalRemaining += timeEstimate - timeSpent // Update total remaining

        return acc
    }, {})

    // Function to format date to month/day/year
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const options = {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
        }
        return date.toLocaleDateString(undefined, options)
    }

    return (
        <div>
            <h1>Jira Tickets for {projectId}</h1>{' '}
            {/* Display user's name or userId if not found */}
            {isDataFetched && jiraProjectIssues.length === 0 ? (
                <p>No tickets available.</p>
            ) : (
                Object.keys(groupedTickets).map((projectKey) => {
                    const {
                        tickets,
                        totalEstimate,
                        totalSpent,
                        totalRemaining,
                    } = groupedTickets[projectKey]
                    const projectName = groupedTickets[projectKey].name
                    return (
                        <div className="time-spent-container" key={projectKey}>
                            <h2>{projectName}</h2>
                            <table className="jira-tickets-table">
                                <thead>
                                    <tr>
                                        <th>Key</th>
                                        <th>Summary</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Time Estimate (hours)</th>
                                        <th>Time Spent (hours)</th>
                                        <th>Time Remaining (hours)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => {
                                        const timeEstimate = ticket.fields
                                            .timeoriginalestimate
                                            ? ticket.fields
                                                .timeoriginalestimate / 3600
                                            : 0 // Convert to hours
                                        const timeSpent = ticket.fields
                                            .timespent
                                            ? ticket.fields.timespent / 3600
                                            : 0 // Convert to hours
                                        const timeRemaining =
                                            timeEstimate - timeSpent // Calculate time remaining
                                        const createdDate = formatDate(
                                            ticket.fields.created
                                        ) // Format the created date

                                        return (
                                            <tr key={ticket.id}>
                                                <td>
                                                    <a
                                                        href={`https://inventivegroup.atlassian.net/browse/${ticket.key}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {ticket.key}
                                                    </a>
                                                </td>
                                                <td>{ticket.fields.summary}</td>
                                                <td>
                                                    {ticket.fields.status.name}
                                                </td>
                                                <td>{createdDate}</td>{' '}
                                                {/* Display formatted date */}
                                                <td>
                                                    {timeEstimate.toFixed(2)}
                                                </td>
                                                <td>{timeSpent.toFixed(2)}</td>
                                                <td>
                                                    {timeRemaining.toFixed(2)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    <tr>
                                        <td
                                            colSpan="4"
                                            style={{
                                                textAlign: 'right',
                                            }}
                                        >
                                            <strong>Total:</strong>
                                        </td>
                                        <td>
                                            <strong>
                                                {totalEstimate.toFixed(2)}
                                            </strong>
                                        </td>
                                        <td>
                                            <strong>
                                                {totalSpent.toFixed(2)}
                                            </strong>
                                        </td>
                                        <td>
                                            <strong>
                                                {totalRemaining.toFixed(2)}
                                            </strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )
                })
            )}
        </div>
    )
}

export default JiraIssuesPage
