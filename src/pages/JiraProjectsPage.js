import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJiraProjects } from '../store/actions/jiraActions';
import { Table } from 'react-bootstrap';
// import JiraUserList from '../components/JiraUserList'

const JiraProjectsPage = () => {
    const dispatch = useDispatch()
    const { jiraProjects, loading, error } = useSelector((state) => state.jira)

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(fetchJiraProjects())
        }

        fetchData()
    }, [dispatch])

    return (
        <div className="container mx-auto p-4">
            <h1>Jira Projects</h1>
            {loading ? ( // Conditional rendering for loading state
                <p>Loading...</p>
            ) : (
                <Table>
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Key</th>
                            <th>Issues</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jiraProjects.values.length > 0 &&
                            jiraProjects.values.map((project) => (
                                // Map through projects to create rows
                                <tr key={project.key}>
                                    <td>
                                        {project.name}
                                    </td>
                                    <td>
                                        {project.key}
                                    </td>
                                    <td>
                                        <a href={`/jira-issues?projectId=${project.id}`}>issues</a>
                                    </td>
                                </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    )
}

export default JiraProjectsPage
