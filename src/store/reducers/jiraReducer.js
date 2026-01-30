// src/store/reducers/taskReducer.js
import {
    FETCH_JIRA_TICKETS_REQUEST,
    FETCH_JIRA_TICKETS_SUCCESS,
    FETCH_JIRA_TICKETS_FAILURE,
    FETCH_JIRA_USERS_SUCCESS,
    SET_ACTIVE_JIRA_USERS,
    FETCH_JIRA_PROJECTS_REQUEST,
    FETCH_JIRA_PROJECTS_SUCCESS,
    FETCH_JIRA_PROJECTS_FAILURE,
    FETCH_JIRA_PROJECT_ISSUES_REQUEST,
    FETCH_JIRA_PROJECT_ISSUES_SUCCESS,
    FETCH_JIRA_PROJECT_ISSUES_FAILURE,
} from '../actions/jiraActions'

const initialState = {
    loading: true,
    allJiraTickets: [],
    error: '',
    jiraUsers: [],
    activeJiraUsers: [],
    jiraProjects: [],
    jiraProjectIssues: [],
}

const jiraReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_JIRA_TICKETS_REQUEST:
            return {
                ...state,
                loading: true,
            }
        case FETCH_JIRA_TICKETS_SUCCESS:
            return {
                loading: false,
                allJiraTickets: action.payload,
                error: '',
            }
        case FETCH_JIRA_TICKETS_FAILURE:
            return {
                loading: false,
                allJiraTickets: [],
                error: action.payload,
            }
        case FETCH_JIRA_USERS_SUCCESS:
            return {
                ...state,
                jiraUsers: action.payload,
            }
        case SET_ACTIVE_JIRA_USERS:
            return {
                ...state,
                activeJiraUsers: action.payload,
                loading: false,
            }
        case FETCH_JIRA_PROJECTS_REQUEST:
            return {
                ...state,
                loading: true,
            }
        case FETCH_JIRA_PROJECTS_SUCCESS:
            return {
                loading: false,
                jiraProjects: action.payload,
                error: '',
            }
        case FETCH_JIRA_PROJECTS_FAILURE:
            return {
                loading: false,
                jiraProjects: [],
                error: action.payload,
            }
    case FETCH_JIRA_PROJECT_ISSUES_REQUEST:
            return {
                ...state,
                loading: true,
            }
        case FETCH_JIRA_PROJECT_ISSUES_SUCCESS:
            return {
                loading: false,
                jiraProjectIssues: action.payload,
                error: '',
            }
        case FETCH_JIRA_PROJECT_ISSUES_FAILURE:
            return {
                loading: false,
                jiraProjectIssues: [],
                error: action.payload,
            }
        default:
            return state
    }
}

export default jiraReducer
