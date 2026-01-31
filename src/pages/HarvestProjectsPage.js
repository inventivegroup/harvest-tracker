import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux' // Correctly import useSelector
import { fetchProjects } from '../store/actions/projectActions' // Import the fetchProjects action

const HarvestProjectsPage = () => {
    const dispatch = useDispatch() // Initialize dispatch
    const allProjectsArray = useSelector((state) => state.projects.allProjects)
    const [loading, setLoading] = useState(true) // State to manage loading status
    const [error, setError] = useState(null) // State to manage error messages

    useEffect(() => {
        const fetchData = async () => {
            try {
                await dispatch(fetchProjects())
            } catch (error) {
                setError(error.message) // Handle any errors
            } finally {
                setLoading(false) // Set loading to false after fetching
            }
        }

        fetchData()
    }, [dispatch]) // Empty dependency array means this runs once when the component mounts

    if (loading) {
        return <div>Loading...</div> // Show loading message while fetching data
    }

    if (error) {
        return <div>Error: {error}</div> // Show error message if there is an error
    }

    return (
        <div className="container mx-auto p-4">
            <h1>Harvest Projects</h1>
            {allProjectsArray.length > 0 ? (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Project ID</th>
                            <th>Project Name</th>
                            <th>Client Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allProjectsArray.map((project) => (
                            <tr key={project.id}>
                                {' '}
                                {/* Assuming each project has a unique id */}
                                <td>{project.id}</td>
                                <td>{project.code}</td>
                                <td>{project.client.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No projects found.</p> // Message if no projects are available
            )}
        </div>
    )
}

export default HarvestProjectsPage
