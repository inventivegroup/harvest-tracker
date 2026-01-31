import React from 'react'

import TasksList from '../components/TasksList'

const TasksPage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1>Tasks</h1>
            <TasksList />
        </div>
    )
}

export default TasksPage
