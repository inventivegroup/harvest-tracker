import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUsers } from '../store/actions/userActions'
import { setSplitTimeEntries } from '../store/actions/timeEntriesActions'
import Loader from './Loader'
import Button from 'react-bootstrap/Button'
import { useNavigate } from 'react-router-dom' // Import useNavigate
import { isEntryType, sortEntriesByUserFirstName } from '../utils/functions'

// Fuzzy match a name against user first names
const fuzzyMatchUser = (notes, users) => {
    if (!notes || !users || users.length === 0) return null

    // Names to exclude from matching
    const excludedNames = ['christina', 'andy', 'james']

    // Name aliases for matching (nickname -> full name)
    const nameAliases = {
        alex: 'alexander',
    }

    // Extract potential names from notes by splitting on common separators
    const words = notes
        .replace(/[❇️⏸]/g, '') // Remove emojis
        .split(/[\s/\-:,]+/) // Split on spaces, slashes, dashes, colons, commas
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 2 && word !== '1x1' && word !== 'with')

    // Try to find a matching user
    for (const word of words) {
        // Skip excluded names
        if (excludedNames.some((name) => word.startsWith(name) || name.startsWith(word))) {
            continue
        }

        for (const user of users) {
            const firstName = user.first_name.toLowerCase()
            // Skip excluded users
            if (excludedNames.includes(firstName)) {
                continue
            }
            // Check if word has an alias and use it for matching
            const wordToMatch = nameAliases[word] || word
            // Check for exact match or if one contains the other
            if (
                firstName === wordToMatch ||
                firstName.startsWith(wordToMatch) ||
                wordToMatch.startsWith(firstName)
            ) {
                return user.id
            }
        }
    }

    return null
}

const SelectedEntriesTable = ({ selectedHarvestEntries }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate() // Initialize useNavigate
    const entryType = useSelector((state) => state.timeEntries.entryType) // Get entry type from Redux store
    const splitTimeEntries = useSelector(
        (state) => state.timeEntries.splitTimeEntries
    ) // Get split time entries from Redux store
    const users = useSelector((state) => state.users.users)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch users when the component mounts
        dispatch(fetchUsers())
        setLoading(false)
    }, [dispatch])

    if (loading) {
        return <Loader /> // Show loader while loading users
    }

    const handleSplitTimeChange = (entryId) => {
        const entry = selectedHarvestEntries.find((e) => e.id === entryId)
        const isChecked = !splitTimeEntries.some(
            (e) => e.originalEntry.id === entryId
        ) // Check if the entry is already in the array

        let newSplitTimeEntries
        if (isChecked) {
            // Try to fuzzy match a user from the notes for 1x1 entries
            const matchedUserId = isEntryType(entry, '1x1')
                ? fuzzyMatchUser(entry.notes, users)
                : null

            // Add the entry to the array with correspondingUserId set to matched user or false
            newSplitTimeEntries = [
                ...splitTimeEntries,
                {
                    originalEntry: entry, // Add the entire entry object
                    correspondingUserId: matchedUserId || false, // Set to matched user or false
                    splitType: 'proportional', // Default split type
                },
            ]
        } else {
            // Remove the entry from the array
            newSplitTimeEntries = splitTimeEntries.filter(
                (e) => e.originalEntry.id !== entryId
            )
        }

        dispatch(setSplitTimeEntries(newSplitTimeEntries)) // Dispatch action to update split time entries
    }

    const handleUserChange = (entryId, userId) => {
        const updatedEntries = splitTimeEntries.map((entry) => {
            if (entry.originalEntry.id === entryId) {
                return {
                    ...entry,
                    correspondingUserId: userId || false, // Set to userId or false if no user is selected
                }
            }
            return entry
        })

        dispatch(setSplitTimeEntries(updatedEntries)) // Dispatch action to update the corresponding user ID
    }

    const handleSplitTypeChange = (entryId, splitType) => {
        const updatedEntries = splitTimeEntries.map((entry) => {
            if (entry.originalEntry.id === entryId) {
                return {
                    ...entry,
                    splitType: splitType, // Update the splitType
                }
            }
            return entry
        })

        dispatch(setSplitTimeEntries(updatedEntries)) // Dispatch action to update the split type
    }

    // Check if all required users are selected
    const allUsersSelected = selectedHarvestEntries.every((entry) => {
        return (
            !splitTimeEntries.some((e) => e.originalEntry.id === entry.id) ||
            (splitTimeEntries.some((e) => e.originalEntry.id === entry.id) &&
                splitTimeEntries.find((e) => e.originalEntry.id === entry.id)
                    .correspondingUserId)
        )
    })

    // Check if all entries are selected
    const allEntriesSelected =
        selectedHarvestEntries.length > 0 &&
        selectedHarvestEntries.every((entry) =>
            splitTimeEntries.some((e) => e.originalEntry.id === entry.id)
        )

    const handleSelectAll = () => {
        if (allEntriesSelected) {
            // Deselect all
            dispatch(setSplitTimeEntries([]))
        } else {
            // Select all with fuzzy matched users for 1x1 entries
            const allEntries = selectedHarvestEntries.map((entry) => {
                const matchedUserId = isEntryType(entry, '1x1')
                    ? fuzzyMatchUser(entry.notes, users)
                    : null
                return {
                    originalEntry: entry,
                    correspondingUserId: matchedUserId || false,
                    splitType: 'proportional',
                }
            })
            dispatch(setSplitTimeEntries(allEntries))
        }
    }

    const handleReadyToSplit = () => {
        navigate('/time-entries-step-4')
    }

    return (
        <div>
            <h2>Selected Entries</h2>
            {selectedHarvestEntries.length > 0 ? (
                <table className="selected-entries-table">
                    <thead>
                        <tr>
                            <th>
                                <label style={{ cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={allEntriesSelected}
                                        onChange={handleSelectAll}
                                    />{' '}
                                    Select all
                                </label>
                            </th>
                            <th>Project Code</th>
                            <th>Notes</th>
                            <th>Hours</th>
                            {entryType === '1x1' && <th>Select User</th>}{' '}
                            {/* New column for split time */}
                        </tr>
                    </thead>
                    <tbody>
                        {selectedHarvestEntries.map((entry) => {
                            const entryType = isEntryType(entry, '1x1')
                                ? '1x1'
                                : isEntryType(entry, 'bill to client')
                                  ? 'bill to client'
                                  : 'other'

                            return (
                                <tr key={entry.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={splitTimeEntries.some(
                                                (e) =>
                                                    e.originalEntry.id ===
                                                    entry.id
                                            )} // Check if the split time checkbox is selected
                                            onChange={() =>
                                                handleSplitTimeChange(entry.id)
                                            } // Handle split time checkbox change
                                        />
                                    </td>
                                    <td>{entry.project.code}</td>
                                    <td>{entry.notes}</td>
                                    <td>{entry.hours}</td>

                                    <td>
                                        {entryType === '1x1' &&
                                            splitTimeEntries.some(
                                                (e) =>
                                                    e.originalEntry.id ===
                                                    entry.id
                                            ) && ( // Show dropdown if split time is checked
                                                <select
                                                    value={
                                                        splitTimeEntries.find(
                                                            (e) =>
                                                                e.originalEntry
                                                                    .id ===
                                                                entry.id
                                                        )
                                                            ?.correspondingUserId ||
                                                        ''
                                                    } // Set the value of the dropdown
                                                    onChange={(e) =>
                                                        handleUserChange(
                                                            entry.id,
                                                            e.target.value
                                                        )
                                                    } // Handle user selection
                                                >
                                                    <option value="">
                                                        Select User
                                                    </option>
                                                    {sortEntriesByUserFirstName(
                                                        users
                                                    ).map((user) => (
                                                        <option
                                                            key={user.id}
                                                            value={user.id}
                                                        >
                                                            {user.first_name}{' '}
                                                            {/* Assuming user has an id and first_name */}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            ) : (
                <p>No selected entries found.</p>
            )}
        </div>
    )
}

export default SelectedEntriesTable
