export const fetchUsers = () => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_USERS_REQUEST' }) // Dispatch request action
        try {
            const apiUrl =
                process.env.ENV === 'dev'
                    ? `http://localhost:3002/api/harvest-users`
                    : `https://harvest-tracker-api.onrender.com/api/harvest-users`

            console.log('Fetch Users API URL:', apiUrl)
            const response = await fetch(apiUrl)
            console.log('Fetch Users Response:', response)
            const data = await response.json()
            dispatch({
                type: 'FETCH_USERS_SUCCESS',
                payload: data.users,
            }) // Dispatch success action
        } catch (error) {
            dispatch({
                type: 'FETCH_USERS_FAILURE',
                payload: error.message,
            }) // Dispatch failure action
        }
    }
}
export const FETCH_USERS_REQUEST = 'FETCH_USERS_REQUEST'
export const FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS'
export const FETCH_USERS_FAILURE = 'FETCH_USERS_FAILURE'
