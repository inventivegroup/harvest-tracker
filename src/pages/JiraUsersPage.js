import React from 'react'

import JiraUserList from '../components/JiraUserList'

const JiraUsersPage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1>Jira Users</h1>
            <JiraUserList />
        </div>
    )
}

export default JiraUsersPage
