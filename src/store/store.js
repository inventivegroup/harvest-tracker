import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducers' // Adjust the path as necessary
import loggerMiddleware from './loggerMiddleware' // Import the logger middleware
import { thunk } from 'redux-thunk' // Import redux-thunk

const store = createStore(
    rootReducer,
    applyMiddleware(thunk, loggerMiddleware) // Apply redux-thunk and logger middleware
)

export default store
