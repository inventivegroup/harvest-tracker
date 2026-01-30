// src/redux/projectReducer.js
import {
    FETCH_PROJECTS_REQUEST,
    FETCH_PROJECTS_SUCCESS,
    FETCH_PROJECTS_FAILURE,
} from '../actions/projectActions'

const initialState = {
    loading: false,
    allProjects: [],
    error: '',
}

const projectReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_PROJECTS_REQUEST:
            return {
                ...state,
                loading: true,
            }
        case FETCH_PROJECTS_SUCCESS:
            return {
                loading: false,
                allProjects: action.payload.projects,
                error: '',
            }
        case FETCH_PROJECTS_FAILURE:
            return {
                loading: false,
                allProjects: [],
                error: action.payload,
            }
        default:
            return state
    }
}

export default projectReducer
