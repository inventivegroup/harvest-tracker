import { combineReducers } from 'redux'
import timeEntriesReducer from './timeEntriesReducer'
import userReducer from './userReducer'
import projectReducer from './projectReducer'
import taskReducer from './taskReducer'
import jiraReducer from './jiraReducer'

const rootReducer = combineReducers({
    timeEntries: timeEntriesReducer,
    users: userReducer,
    projects: projectReducer,
    tasks: taskReducer,
    jira: jiraReducer,
    // Add other reducers here if needed
})

export default rootReducer
