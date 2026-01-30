import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom' // Import useNavigate
import { useDispatch } from 'react-redux' // Import useDispatch
import {
    setselectedHarvestEntries,
    setEntryType,
} from '../store/actions/timeEntriesActions' // Import the actions
import { Button, FormCheck } from 'react-bootstrap'
import { isEntryType } from '../utils/functions'

const TimeEntriesList = ({ userTimeEntries }) => {
    console.log('userTimeEntries', userTimeEntries)

    const navigate = useNavigate() // Use useNavigate instead of useHistory
    const dispatch = useDispatch() // Initialize dispatch
    const [selectedHarvestEntries, setselectedHarvestEntriesState] = useState(
        {}
    )

    const handleCheckboxChange = (entryId, entryType) => {
        dispatch(setEntryType(entryType))
        setselectedHarvestEntriesState((prevState) => ({
            ...prevState,
            [entryId]: !prevState[entryId], // Toggle the selected state
        }))
    }

    const handleSelectAll1x1 = () => {
        const entriesToSelect = userTimeEntries.filter((entry) =>
            entry.notes.includes('1x1')
        ) // Filter entries with "1x1" in the description
        const newselectedHarvestEntries = {}

        entriesToSelect.forEach((entry) => {
            newselectedHarvestEntries[entry.id] = true // Mark the entry as selected
        })

        setselectedHarvestEntriesState(newselectedHarvestEntries) // Update the selected entries state
        dispatch(setEntryType('1x1')) // Dispatch action to set entry type to '1x1'
    }

    const handleSelectAllBillToClient = () => {
        const entriesToSelect = userTimeEntries.filter(
            (entry) =>
                entry.task &&
                entry.task.name &&
                entry.task.name.includes('bill to client')
        ) // Filter entries with "bill to client" in task.name
        const newselectedHarvestEntries = {}

        entriesToSelect.forEach((entry) => {
            newselectedHarvestEntries[entry.id] = true // Mark the entry as selected
        })

        setselectedHarvestEntriesState(newselectedHarvestEntries) // Update the selected entries state
        dispatch(setEntryType('bill to client')) // Dispatch action to set entry type to 'bill to client'
    }

    // Function to clear all selected checkboxes
    const handleClearSelections = () => {
        setselectedHarvestEntriesState({}) // Reset selected entries state to an empty object
    }

    const handleSubmit = () => {
        // Create an array of selected entries
        const entriesToDisplay = Object.keys(selectedHarvestEntries)
            .filter((entryId) => selectedHarvestEntries[entryId]) // Filter selected entries
            .map((entryId) =>
                userTimeEntries.find((entry) => entry.id.toString() === entryId)
            ) // Ensure comparison is consistent

        console.log('entriesToDisplay', entriesToDisplay)

        // Dispatch the action to store selected entries in Redux
        dispatch(setselectedHarvestEntries(entriesToDisplay))

        // Navigate to the selectedHarvestEntries component
        navigate('/time-entries-step-3', {
            state: {
                selectedHarvestEntries: entriesToDisplay,
            },
        }) // Use navigate instead of history.push
    }

    // Group time entries by date and calculate total hours
    const groupedEntries = userTimeEntries.reduce((acc, entry) => {
        const date = entry.spent_date // Assuming spent_date is in YYYY-MM-DD format
        const hours = entry.hours // Assuming hours is a number

        if (!acc[date]) {
            acc[date] = { entries: [], totalHours: 0 } // Initialize with an array for entries and a totalHours counter
        }

        acc[date].entries.push(entry) // Add the entry to the date's entries
        acc[date].totalHours += hours // Sum the hours for the date

        return acc
    }, {})

    // Calculate the total hours for all entries and round to two decimal places
    const totalHours = Object.values(groupedEntries)
        .reduce((sum, group) => sum + group.totalHours, 0)
        .toFixed(2)

    return (
        <div>
            <h2>Time Entries</h2>
            <h3>Total Hours for All Entries: {totalHours} hours</h3>{' '}
            {/* Display total hours for all entries */}
            <Button variant="info" onClick={handleSelectAll1x1}>
                Select All 1x1 Entries
            </Button>{' '}
            {/* Button to select all entries with "1x1" in the description */}
            <Button variant="warning" onClick={handleSelectAllBillToClient}>
                Select All "Bill to Client" Entries
            </Button>{' '}
            {/* Button to select all entries with "bill to client" in task.name */}
            <Button variant="secondary" onClick={handleClearSelections}>
                Clear All Selections
            </Button>{' '}
            {/* Button to clear all selected checkboxes */}
            {Object.keys(groupedEntries).length > 0 ? (
                Object.keys(groupedEntries).map((date) => {
                    const dailyTotalHours =
                        groupedEntries[date].totalHours.toFixed(2) // Round daily total hours to two decimal places

                    return (
                        <div key={date}>
                            <h3>
                                {date} - Total Hours for This Day:{' '}
                                {dailyTotalHours} hours
                            </h3>{' '}
                            {/* Display total hours for the day */}
                            <table className="time-entries-table">
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th>Project Code</th>
                                        <th>Notes</th>
                                        <th>Hours</th>
                                        <th>Entry Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedEntries[date].entries.map(
                                        (entry) => {
                                            const entryType = isEntryType(
                                                entry,
                                                '1x1'
                                            )
                                                ? '1x1'
                                                : isEntryType(
                                                        entry,
                                                        'bill to client'
                                                    )
                                                  ? 'bill to client'
                                                  : 'other'
                                            // Determine the class to apply based on entry type
                                            const rowClass =
                                                entryType === '1x1'
                                                    ? 'one-x-one'
                                                    : entryType ===
                                                        'bill to client'
                                                      ? 'bill-to-client'
                                                      : ''

                                            return (
                                                <tr
                                                    key={entry.id}
                                                    className={`${selectedHarvestEntries[entry.id] ? 'selected-row' : ''} ${rowClass}`}
                                                >
                                                    <td>
                                                        <FormCheck
                                                            type="checkbox"
                                                            checked={
                                                                !!selectedHarvestEntries[
                                                                    entry.id
                                                                ]
                                                            } // Check if the entry is selected
                                                            onChange={() =>
                                                                handleCheckboxChange(
                                                                    entry.id,
                                                                    entryType
                                                                )
                                                            } // Handle checkbox change
                                                            disabled={
                                                                entryType ===
                                                                'other'
                                                            } // Disable checkbox if entry type is "other"
                                                        />
                                                    </td>
                                                    <td>
                                                        {entry.project.code}
                                                    </td>
                                                    <td>{entry.notes}</td>
                                                    <td>{entry.hours}</td>
                                                    <td>{entryType}</td>
                                                </tr>
                                            )
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )
                })
            ) : (
                <p>No time entries found.</p>
            )}
            <Button variant="primary" onClick={handleSubmit}>
                Go to Step 3
            </Button>{' '}
            {/* Button to navigate to selected entries */}
        </div>
    )
}

export default TimeEntriesList
