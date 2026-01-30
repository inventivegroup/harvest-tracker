// src/store/reducers/taskReducer.js
import {
    FETCH_TASKS_REQUEST,
    FETCH_TASKS_SUCCESS,
    FETCH_TASKS_FAILURE,
} from '../actions/taskActions'

const initialState = {
    loading: false,
    allTasks: [],
    filteredTasks: [],
    error: '',
}

const taskReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_TASKS_REQUEST:
            return {
                ...state,
                loading: true,
            }
        case FETCH_TASKS_SUCCESS:
            return {
                loading: false,
                allTasks: action.payload.tasks,
                filteredTasks: action.payload.tasks.filter(
                    (task) => task.default_hourly_rate !== null
                ),
                error: '',
            }
        case FETCH_TASKS_FAILURE:
            return {
                loading: false,
                allTasks: [],
                error: action.payload,
            }
        default:
            return state
    }
}

export default taskReducer
