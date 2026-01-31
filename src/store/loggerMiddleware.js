const loggerMiddleware = (store) => (next) => (action) => {
    const result = next(action) // Call the next middleware or reducer
    console.log('Current State:', store.getState()) // Log the current state
    return result // Return the result of the next middleware
}

export default loggerMiddleware
