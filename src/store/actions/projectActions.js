// src/redux/projectActions.js
export const FETCH_PROJECTS_REQUEST = 'FETCH_PROJECTS_REQUEST'
export const FETCH_PROJECTS_SUCCESS = 'FETCH_PROJECTS_SUCCESS'
export const FETCH_PROJECTS_FAILURE = 'FETCH_PROJECTS_FAILURE'

export const fetchProjectsRequest = () => ({
    type: FETCH_PROJECTS_REQUEST,
})

export const fetchProjectsSuccess = (projects) => ({
    type: FETCH_PROJECTS_SUCCESS,
    payload: projects,
})

export const fetchProjectsFailure = (error) => ({
    type: FETCH_PROJECTS_FAILURE,
    payload: error,
})

// Thunk action to fetch projects from API
export const fetchProjects = () => {
    return async (dispatch) => {
        dispatch(fetchProjectsRequest())
        try {
            const apiUrl =
                process.env.ENV === 'dev'
                    ? `http://localhost:3002/api/harvest-users`
                    : `https://harvest-tracker-api.onrender.com/api/harvest-projects`

            console.log('Fetch Projects API URL:', apiUrl)
            const response = await fetch(apiUrl)
            console.log('Fetch Projects Response:', response)
            const data = await response.json()
            dispatch(fetchProjectsSuccess(data))
        } catch (error) {
            dispatch(fetchProjectsFailure(error.message))
        }
    }
}
