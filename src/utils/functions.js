export const numHoursToCrossOff = 1;

export const calculateDates = (week) => {
    const today = new Date()
    let startDate, endDate

    if (week === 'thisWeek') {
        const firstDayOfWeek = today.getDate() - today.getDay() + 1 // Monday
        startDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            firstDayOfWeek,
            0,
            0,
            0,
            0
        ) // Set to midnight
        endDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            firstDayOfWeek + 6,
            0,
            0,
            0,
            0
        ) // Set to midnight
    } else if (week === 'lastWeek') {
        const firstDayOfLastWeek = today.getDate() - today.getDay() - 6 // Last Monday
        startDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            firstDayOfLastWeek,
            0,
            0,
            0,
            0
        ) // Set to midnight
        endDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            firstDayOfLastWeek + 6,
            0,
            0,
            0,
            0
        ) // Set to midnight
    }
    return { startDate, endDate }
}

export const calculateBillableHours = (timeEntries) => {
    const projectHours = {} // Object to accumulate hours by project code

    // Loop through each time entry
    timeEntries.forEach((entry) => {
        if (entry.billable && entry.client.id !== 11188314) {
            // Check if the entry is billable
            const projectCode = entry.project.code // Assuming project code is available in entry
            const hours = entry.hours // Assuming hours are available in entry

            // Initialize project code if it doesn't exist
            if (!projectHours[projectCode]) {
                projectHours[projectCode] = 0 // Initialize with 0 if project code doesn't exist
            }

            // Sum the billable hours for the project
            projectHours[projectCode] += hours
        }
    })

    // Calculate total billable hours only for projects with more than numHoursToCrossOff hours
    const totalBillableHours = Object.values(projectHours).reduce(
        (sum, hours) => {
            return hours > numHoursToCrossOff ? sum + hours : sum // Only add hours if greater than numHoursToCrossOff
        },
        0
    ) // Calculate total billable hours

    // Convert the accumulated object into an array of projects with their total hours and percentage
    return Object.entries(projectHours).map(([projectCode, hours]) => {
        const percentage =
            hours > numHoursToCrossOff ? (hours / totalBillableHours) * 100 : 0 // Calculate percentage

        return {
            projectCode,
            hours: hours,
            percentage: parseFloat(percentage),
        }
    })
}

export const calculateTotalBillableHours = (calculatedBillableHours) =>
    Object.values(calculatedBillableHours).reduce((sum, { hours }) => {
        return hours > numHoursToCrossOff ? sum + hours : sum // Only add hours if greater than numHoursToCrossOff
    }, 0)

export const sortEntriesByProjectCode = (entries) => {
    return entries.sort((a, b) => {
        const projectCodeA = a.projectCode.toLowerCase() // Get project code for entry A
        const projectCodeB = b.projectCode.toLowerCase() // Get project code for entry B
        return projectCodeA.localeCompare(projectCodeB) // Compare project codes
    })
}

export const sortEntriesByTaskName = (tasks) => {
    return tasks.sort((a, b) => {
        const taskA = a.name.toLowerCase() // Get project code for entry A
        const taskB = b.name.toLowerCase() // Get project code for entry B
        return taskA.localeCompare(taskB) // Compare project codes
    })
}

export const sortEntriesByUserFirstName = (users) => {
    return users.sort((a, b) => {
        const userA = a.first_name.toLowerCase() // Get project code for entry A
        const userB = b.first_name.toLowerCase() // Get project code for entry B
        return userA.localeCompare(userB) // Compare project codes
    })
}

export const organizeEntriesByUser = (timeEntries) => {
    console.log('timeEntries', timeEntries)
    // Filter out entries with client.id of 11188314 or 7044177 (Inventive Group and Inventive Projects)
    const filteredEntries = timeEntries.filter(
        (entry) => entry.client.id !== 11188314 && entry.client.id !== 7044177
    )
    const userProjects = {} // Object to hold user entries grouped by project code

    filteredEntries.forEach((entry) => {
        const userId = entry.user.id // Get user ID
        const projectCode = entry.project.code // Get project code
        const hours = entry.hours // Get hours from the entry

        // Initialize user entry if it doesn't exist
        if (!userProjects[userId]) {
            userProjects[userId] = {
                id: userId,
                projects: {},
                totalHours: 0,
                timeEntries: [],
                filteredEntries: [],
            }
        }

        // Initialize project entry if it doesn't exist
        if (!userProjects[userId].projects[projectCode]) {
            userProjects[userId].projects[projectCode] = 0 // Initialize with 0 if project code doesn't exist
        }

        // Sum the hours for the project
        userProjects[userId].projects[projectCode] += hours

        // Store the time entry in the user's timeEntries array
        userProjects[userId].filteredEntries.push(entry) // Add the current entry to the user's timeEntries
    })

    timeEntries.forEach((entry) => {
        const userId = entry.user.id // Get user ID

        // Initialize user entry if it doesn't exist
        if (!userProjects[userId]) {
            userProjects[userId] = {
                id: userId,
                projects: {},
                totalHours: 0,
                timeEntries: [],
                filteredEntries: [],
            }
        }
        // Store the time entry in the user's timeEntries array
        userProjects[userId].timeEntries.push(entry) // Add the current entry to the user's timeEntries
    })

    // Convert the userProjects object into the desired format
    return Object.values(userProjects).map((user) => {
        // Calculate total hours only for projects with more than numHoursToCrossOff hours
        user.totalHours = Object.values(user.projects).reduce(
            (sum, totalHours) => {
                return totalHours > numHoursToCrossOff ? sum + totalHours : sum // Only add hours if greater than numHoursToCrossOff
            },
            0
        )

        return {
            id: user.id,
            projects: Object.entries(user.projects).map(
                ([projectCode, totalHours]) => {
                    const percentage =
                        totalHours > numHoursToCrossOff
                            ? ((totalHours / user.totalHours) * 100).toFixed(2)
                            : 0 // Calculate percentage
                    return {
                        projectCode,
                        totalHours: parseFloat(totalHours.toFixed(2)), // Round to two decimal places
                        percentage: parseFloat(percentage), // Include percentage
                    }
                }
            ),
            timeEntries: user.timeEntries, // Include the time entries for the user
            filteredEntries: user.filteredEntries,
        }
    })
}

// Function to round to the nearest 5 minutes
export const roundToNearestFiveMinutes = (minutes) => {
    return Math.round(minutes / 5) * 5
}

export const isEntryType = (entry, type) => {
    return entry.notes.includes(type) || entry.task.name.includes(type)
}

// Function to convert seconds to hours
export const secondsToHours = (seconds) => {
    return seconds ? (seconds / 3600).toFixed(2) : '0.00' // Convert seconds to hours and format to 2 decimal places
}
