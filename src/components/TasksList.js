import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table } from 'react-bootstrap'
import { fetchTasks } from '../store/actions/taskActions'
import Loader from './Loader'

const TasksList = () => {
    const dispatch = useDispatch()
    const { allTasks, loading, error } = useSelector((state) => state.tasks) // Include loading and error states

    useEffect(() => {
        dispatch(fetchTasks())
    }, [dispatch])

    const state = useSelector((state) => state)
    console.log(state) // Check the structure of the state

    return (
        <div className="tasks-list">
            {loading ? ( // Show loader while loading
                <Loader />
            ) : error ? ( // Show error message if there's an error
                <div className="error-message">{error}</div>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Task ID</th>
                            <th>Task Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allTasks.length > 0 ? (
                            allTasks.map((task) => (
                                <tr key={task.id}>
                                    <td>{task.id}</td>
                                    <td>{task.name}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2">No tasks available</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </div>
    )
}

export default TasksList
