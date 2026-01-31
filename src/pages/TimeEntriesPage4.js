import React, { useState, state } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
    roundToNearestFiveMinutes,
    sortEntriesByTaskName,
} from '../utils/functions'
import { Button, Form } from 'react-bootstrap'
import { testData } from '../utils/testData'
import HarvestEntryInputs from '../components/HarvestEntryInputs'
import { setHarvestEntries } from '../store/actions/timeEntriesActions'

const TimeEntriesPage4 = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [inputValues, setInputValues] = useState({})
    const [savedEntries, setSavedEntries] = useState({})

    const entryType = useSelector((state) => state.timeEntries.entryType)
    const harvestEntries = useSelector(
        (state) => state.timeEntries.harvestEntries
    )
    const splitTimeEntries = useSelector(
        (state) => state.timeEntries.splitTimeEntries
    )
    const timeEntriesByUser = useSelector(
        (state) => state.timeEntries.timeEntriesByUser
    )
    const allProjectsArray = useSelector((state) => state.projects.allProjects)
    console.log('allProjectsArray', allProjectsArray)
    const filteredTasksArray = useSelector((state) => state.tasks.filteredTasks)
    console.log('filteredTasksArray', filteredTasksArray)
    // const splitTimeEntries = testData.timeEntries.splitTimeEntries;
    // const timeEntriesByUser = testData.timeEntries.timeEntriesByUser;
    // const allProjectsArray = testData.projects.allProjects;
    // const filteredTasksArray = sortEntriesByTaskName(testData.tasks.filteredTasks);
    const successMessage = 'New entry/entries saved successfully!'

    const [showHarvestEntries, setShowHarvestEntries] = useState(false)
    const [tasksSelected, setTasksSelected] = useState(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState({})

    const handleInputChange = (event, entryId, projectCode, value) => {
        // Retrieve suggested minutes from the hidden input
        const suggestedMinutesInput = event.target
            .closest('.entry-form-inputs')
            .querySelector('input[name="suggestedMinutes"]')
        const suggestedMinutes = parseInt(suggestedMinutesInput.value) || 0 // Default to 0 if not found

        // Retrieve projectId and projectNotes from hidden inputs
        const projectIdInput = event.target
            .closest('.entry-form-inputs')
            .querySelector('input[name="projectId"]')
        const projectId = projectIdInput ? projectIdInput.value : '' // Default to empty string if not found

        const projectNotesInput = event.target
            .closest('.entry-form-inputs')
            .querySelector('input[name="projectNotes"]')
        const projectNotes = projectNotesInput ? projectNotesInput.value : '' // Default to empty string if not found

        const userIdInput = event.target
            .closest('.entry-form-inputs')
            .querySelector('input[name="userId"]')
        const userId = userIdInput ? userIdInput.value : '' // Default to empty string if not found

        const spentDateInput = event.target
            .closest('.entry-form-inputs')
            .querySelector('input[name="spentDate"]')
        const spentDate = spentDateInput ? spentDateInput.value : '' // Default to empty string if not found

        setIsButtonDisabled((prev) => ({
            ...prev,
            [entryId]: false,
        }))

        // Update the input values state
        setInputValues((prev) => ({
            ...prev,
            [entryId]: {
                ...prev[entryId],
                [projectCode]: {
                    ...prev[entryId]?.[projectCode],
                    confirmedMinutes: value,
                    taskId: prev[entryId]?.[projectCode]?.taskId || '',
                    suggestedMinutes: suggestedMinutes, // Add the retrieved suggested minutes here
                    projectId: projectId, // Add the retrieved projectId here
                    projectNotes: projectNotes, // Add the retrieved projectNotes here
                    userId: userId, // Add the retrieved userId here
                    spentDate: spentDate,
                },
            },
        }))
    }

    const handleTaskChange = (entryId, projectCode, taskId) => {
        setInputValues((prev) => ({
            ...prev,
            [entryId]: {
                ...prev[entryId],
                [projectCode]: {
                    ...prev[entryId]?.[projectCode],
                    taskId: taskId,
                    confirmedMinutes:
                        prev[entryId]?.[projectCode]?.confirmedMinutes || '',
                },
            },
        }))

        setTasksSelected((prev) => ({
            ...prev,
            [entryId]: true,
        }))
    }

    const handleSave = (event, entryId) => {
        event.preventDefault()

        // Calculate total minutes from splitTimeEntries
        const totalMinutes = splitTimeEntries.reduce((acc, entry) => {
            return acc + Math.round(entry.originalEntry.hours * 60) // Convert hours to minutes
        }, 0)

        // Calculate total confirmed minutes
        const totalConfirmedMinutesForEntry = Object.values(
            inputValues[entryId] || {}
        ).reduce((acc, projectData) => {
            return acc + (parseInt(projectData.confirmedMinutes) || 0)
        }, 0)

        // Check if all required values are present in inputValues for the entryId
        const entryValues = inputValues[entryId] || {}
        const allValuesPresent = Object.values(entryValues).every(
            (projectData) => {
                return (
                    projectData.confirmedMinutes &&
                    projectData.taskId &&
                    projectData.projectId &&
                    projectData.projectNotes &&
                    projectData.userId &&
                    projectData.spentDate
                )
            }
        )

        if (!allValuesPresent) {
            console.warn(
                'Cannot save entry: Not all required values are present.'
            )
            return // Exit the function if conditions are not met
        }

        // Proceed with saving the entry if all conditions are met
        let newHarvestEntries = []

        Object.entries(inputValues[entryId] || {}).forEach(
            ([projectCode, projectData]) => {

                console.log('projectData confirmed minutes', projectData.confirmedMinutes)
                // Skip entries with zero or empty minutes
                if (
                    projectData.confirmedMinutes &&
                    Number(projectData.confirmedMinutes) > 0
                ) {
                    const entryData = {
                        project_id: projectData.projectId,
                        task_id: projectData.taskId,
                        spent_date: projectData.spentDate,
                        hours: projectData.confirmedMinutes / 60,
                        user_id: projectData.userId,
                        notes: projectData.projectNotes,
                    }
                    newHarvestEntries.push(entryData)
                }
            }
        )

        console.log('newHarvestEntries', newHarvestEntries)

        dispatch(setHarvestEntries(newHarvestEntries))

        setSavedEntries((prev) => ({
            ...prev,
            [entryId]: true,
        }))

        setIsButtonDisabled((prev) => ({
            ...prev,
            [entryId]: true,
        }))
    }

    console.log('harvestEntries', harvestEntries)

    // Check if all entries have been saved
    const allEntriesSaved =
        Object.keys(savedEntries).length === splitTimeEntries.length

    return (
        <div className="time-entries-page">
            <h1>Time Entries Page 4 1x1</h1>

            {splitTimeEntries.length > 0 ? (
                <div className="split-time-entries-container">
                    {splitTimeEntries.map((entry, index) => {
                        const minutes = Math.round(
                            entry.originalEntry.hours * 60
                        )
                        let inputFields = ''

                        const userProjects = timeEntriesByUser.find(
                            (user) =>
                                user.id ===
                                parseInt(entry.correspondingUserId, 10)
                        )
                        if (userProjects) {
                            const filteredProjects =
                                userProjects.projects.filter(
                                    (project) => project.percentage > 0
                                )
                            if (filteredProjects.length > 0) {
                                inputFields = filteredProjects.map(
                                    (filteredProject) => {
                                        const matchingProject =
                                            allProjectsArray.find(
                                                (thisProject) =>
                                                    thisProject.code ===
                                                    filteredProject.projectCode
                                            )
                                        if (matchingProject) {
                                            const projectId = matchingProject.id
                                            const projectNotes =
                                                entry.originalEntry.notes
                                            const spentDate =
                                                entry.originalEntry.spent_date
                                            const userId =
                                                entry.originalEntry.user.id
                                            const suggestedMinutes =
                                                roundToNearestFiveMinutes(
                                                    minutes *
                                                        (filteredProject.percentage /
                                                            100)
                                                )
                                            const actualMinutes = (
                                                minutes *
                                                (filteredProject.percentage /
                                                    100)
                                            ).toFixed(2)

                                            return (
                                                <HarvestEntryInputs
                                                    filteredProject={
                                                        matchingProject
                                                    }
                                                    entry={entry}
                                                    inputValues={inputValues}
                                                    suggestedMinutes={
                                                        suggestedMinutes
                                                    }
                                                    projectCode={
                                                        filteredProject.projectCode
                                                    }
                                                    handleInputChange={
                                                        handleInputChange
                                                    }
                                                    handleTaskChange={
                                                        handleTaskChange
                                                    }
                                                    filteredTasksArray={
                                                        filteredTasksArray
                                                    }
                                                    projectId={projectId}
                                                    projectNotes={projectNotes}
                                                    spentDate={spentDate}
                                                    userId={userId}
                                                    actualMinutes={
                                                        actualMinutes
                                                    }
                                                    minutes={minutes}
                                                    entryType={entryType}
                                                />
                                            )
                                        } else {
                                            console.warn(
                                                `No matching project found for project code: ${filteredProject.projectCode}`
                                            )
                                            return null
                                        }
                                    }
                                )
                            } else {
                                console.log(
                                    `No projects found for user ID: ${entry.correspondingUserId}`
                                )
                            }
                        }

                        const totalConfirmedMinutesForEntry = Object.values(
                            inputValues[entry.originalEntry.id] || {}
                        ).reduce((acc, projectData) => {
                            return (
                                acc +
                                (parseInt(projectData.confirmedMinutes) || 0)
                            )
                        }, 0)

                        console.log(
                            'totalConfirmedMinutesForEntry',
                            totalConfirmedMinutesForEntry
                        )

                        return (
                            <div
                                className="split-time-entry-container"
                                key={index}
                                id={entry.originalEntry.id}
                            >
                                <table className="split-time-entries-table">
                                    <thead>
                                        <tr>
                                            <th>Project Code</th>
                                            <th>Notes</th>
                                            <th>Hours</th>
                                            <th>Minutes</th>
                                            <th>Corresponding User ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="split-time-entry">
                                            <td className="entry-item">
                                                {
                                                    entry.originalEntry.project
                                                        .code
                                                }
                                            </td>
                                            <td className="entry-item">
                                                {entry.originalEntry.notes}
                                            </td>
                                            <td className="entry-item">
                                                {entry.originalEntry.hours}
                                            </td>
                                            <td className="entry-item">
                                                {minutes}
                                            </td>
                                            <td className="entry-item">
                                                {entry.correspondingUserId !==
                                                false
                                                    ? entry.correspondingUserId
                                                    : 'Not Assigned'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <Form
                                    className="entry-form"
                                    id={entry.originalEntry.id}
                                    onSubmit={(e) =>
                                        handleSave(e, entry.originalEntry.id)
                                    }
                                >
                                    {inputFields}

                                    {isButtonDisabled[
                                        entry.originalEntry.id
                                    ] && (
                                        <div className="alert alert-success">
                                            {successMessage}
                                            <br></br>
                                        </div>
                                    )}

                                    <div className="confirmed-minutes">
                                        Confirmed minutes so far:{' '}
                                        {totalConfirmedMinutesForEntry}
                                        <br></br>
                                        (total should be {minutes} minutes)
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={
                                            isButtonDisabled[
                                                entry.originalEntry.id
                                            ] ||
                                            !tasksSelected ||
                                            totalConfirmedMinutesForEntry !==
                                                minutes
                                        }
                                    >
                                        Save Entries
                                    </Button>
                                </Form>
                            </div>
                        )
                    })}
                    {allEntriesSaved && (
                        <div>
                            {!showHarvestEntries && (
                                <Button
                                    variant="success"
                                    onClick={() =>
                                        navigate('/time-entries-step-5')
                                    }
                                >
                                    Preview the new Harvest Entries
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <p>Need to add code for bill to client split type</p>
            )}
        </div>
    )
}

export default TimeEntriesPage4
