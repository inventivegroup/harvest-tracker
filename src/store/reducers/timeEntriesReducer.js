import {
    SET_SELECTED_ENTRIES,
    SET_BILLABLE_HOURS,
    SET_SELECTED_WEEK,
    SET_ENTRY_TYPE,
    SET_TIME_ENTRIES_BY_USER,
    SET_ADJUSTED_MINUTES_BY_USER,
    SET_SELECTED_USER_ID,
    SET_SPLIT_TIME_ENTRIES,
    SET_HARVEST_ENTRIES,
} from '../actions/timeEntriesActions'

const initialState = {
    timeEntriesByUser: [],
    timeEntriesByDate: [],
    selectedHarvestEntries: [],
    billableHours: [],
    loading: false,
    error: null,
    selectedWeek: 'thisWeek', // Default value
    entryType: null, // New state for entry type
    adjustedMinutesByUser: [],
    selectedUserId: null,
    splitTimeEntries: [],
    harvestEntries: [],
}

const timeEntriesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_TIME_ENTRIES_REQUEST':
            return { ...state, loading: true, error: null }
        case 'FETCH_TIME_ENTRIES_SUCCESS':
            // Check if the action payload contains user or date information
            if (action.payload.source === 'user') {
                return {
                    ...state,
                    loading: false,
                    timeEntriesByUser: action.payload.data,
                } // Update time entries by user
            } else if (action.payload.source === 'date') {
                return {
                    ...state,
                    loading: false,
                    timeEntriesByDate: action.payload.data,
                } // Update time entries by date
            }
            return state // Default case if no source is provided
        case 'FETCH_TIME_ENTRIES_FAILURE':
            return {
                ...state,
                loading: false,
                error: action.payload,
            }
        case SET_SELECTED_ENTRIES:
            return {
                ...state,
                selectedHarvestEntries: action.payload, // Update selected entries in the state
            }
        case SET_BILLABLE_HOURS:
            return {
                ...state,
                billableHours: action.payload, // Update billable hours in the state
            }
        case SET_SELECTED_WEEK:
            return {
                ...state,
                selectedWeek: action.payload, // Update the selected week
            }
        case SET_ENTRY_TYPE:
            return {
                ...state,
                entryType: action.payload, // Update the entry type
            }
        case SET_TIME_ENTRIES_BY_USER:
            console.log('SET_TIME_ENTRIES_BY_USER', action.payload)
            return {
                ...state,
                timeEntriesByUser: action.payload, // Update the time entries by user
            }
        case SET_ADJUSTED_MINUTES_BY_USER:
            return {
                ...state,
                adjustedMinutesByUser: action.payload,
            }
        case SET_SELECTED_USER_ID:
            return {
                ...state,
                selectedUserId: action.payload, // Update the selected user ID
            }
        case SET_SPLIT_TIME_ENTRIES:
            return {
                ...state,
                splitTimeEntries: action.payload, // Ensure this is always an array
            }
        case SET_HARVEST_ENTRIES:
            return {
                ...state,
                harvestEntries: [...state.harvestEntries, ...action.payload], // Add new entries to the existing array
            }
        default:
            return state
    }
}

export default timeEntriesReducer
