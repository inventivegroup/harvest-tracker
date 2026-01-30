// src/redux/projectActions.js
export const FETCH_TASKS_REQUEST = 'FETCH_TASKS_REQUEST'
export const FETCH_TASKS_SUCCESS = 'FETCH_TASKS_SUCCESS'
export const FETCH_TASKS_FAILURE = 'FETCH_TASKS_FAILURE'

export const fetchTasksRequest = () => ({
    type: FETCH_TASKS_REQUEST,
})

export const fetchTasksSuccess = (tasks) => ({
    type: FETCH_TASKS_SUCCESS,
    payload: tasks,
})

export const fetchTasksFailure = (error) => ({
    type: FETCH_TASKS_FAILURE,
    payload: error,
})

// Thunk action to fetch tasks from API
export const fetchTasks = () => {
    return async (dispatch) => {
        dispatch(fetchTasksRequest())
        try {
            const apiUrl =
                process.env.ENV === 'dev'
                    ? `http://localhost:3002/api/harvest-tasks`
                    : `https://harvest-tracker-api.onrender.com/api/harvest-tasks`

            console.log('Fetch Tasks API URL:', apiUrl)
            const response = await fetch(apiUrl)
            console.log('Fetch Tasks Response:', response)
            const data = await response.json()
            dispatch(fetchTasksSuccess(data))
        } catch (error) {
            dispatch(fetchTasksFailure(error.message))
        }
    }
}
