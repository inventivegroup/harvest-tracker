export const fetchTimeEntriesByDate = (startDate, endDate) => {
    console.log('fetchTimeEntriesByDate', startDate, endDate)

    return async (dispatch) => {
        dispatch({ type: 'FETCH_TIME_ENTRIES_REQUEST' })

        try {
            const apiUrl =
                process.env.ENV === 'dev'
                    ? `http://localhost:3002/api/get-harvest-time-entries-by-date?from=${startDate}&to=${endDate}`
                    : `https://harvest-tracker-api.onrender.com/api/get-harvest-time-entries-by-date?from=${startDate}&to=${endDate}`

            console.log('Fetch Time Entries by Date API URL:', apiUrl)

            const response = await fetch(apiUrl)
            const data = await response.json()
            console.log('Fetch Time Entries by Date Response:', response)

            if (response.ok) {
                dispatch({
                    type: 'FETCH_TIME_ENTRIES_SUCCESS',
                    payload: {
                        source: 'date',
                        data: data.time_entries,
                    }, // Include source in payload
                })
            } else {
                dispatch({
                    type: 'FETCH_TIME_ENTRIES_FAILURE',
                    payload: data.error,
                })
            }
        } catch (error) {
            dispatch({
                type: 'FETCH_TIME_ENTRIES_FAILURE',
                payload: error.message,
            })
        }
    }
}

export const SET_SELECTED_ENTRIES = 'SET_SELECTED_ENTRIES'

export const setselectedHarvestEntries = (entries) => ({
    type: SET_SELECTED_ENTRIES,
    payload: entries,
})

export const SET_BILLABLE_HOURS = 'SET_BILLABLE_HOURS'

export const setBillableHours = (billableHours) => ({
    type: SET_BILLABLE_HOURS,
    payload: billableHours,
})

export const SET_SELECTED_WEEK = 'SET_SELECTED_WEEK'

export const setSelectedWeek = (week) => ({
    type: SET_SELECTED_WEEK,
    payload: week,
})

export const SET_ENTRY_TYPE = 'SET_ENTRY_TYPE'

export const setEntryType = (entryType) => ({
    type: SET_ENTRY_TYPE,
    payload: entryType,
})

export const SET_TIME_ENTRIES_BY_USER = 'SET_TIME_ENTRIES_BY_USER'

export const setTimeEntriesByUser = (timeEntriesByUser) => ({
    type: SET_TIME_ENTRIES_BY_USER,
    payload: timeEntriesByUser,
})

export const SET_ADJUSTED_MINUTES_BY_USER = 'SET_ADJUSTED_MINUTES_BY_USER'

export const setAdjustedMinutesByUser = (userId, userAdjustedMinutes) => ({
    type: SET_ADJUSTED_MINUTES_BY_USER,
    payload: { userId, userAdjustedMinutes },
})

export const SET_SELECTED_USER_ID = 'SET_SELECTED_USER_ID'

export const setSelectedUserId = (id) => ({
    type: SET_SELECTED_USER_ID,
    payload: id,
})

export const SET_SPLIT_TIME_ENTRIES = 'SET_SPLIT_TIME_ENTRIES'

export const setSplitTimeEntries = (entry) => ({
    type: SET_SPLIT_TIME_ENTRIES,
    payload: entry,
})

export const SET_HARVEST_ENTRIES = 'SET_HARVEST_ENTRIES'

export const setHarvestEntries = (entry) => ({
    type: SET_HARVEST_ENTRIES,
    payload: entry,
})
