import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { roundToNearestFiveMinutes } from '../utils/functions'
import { Button, Form } from 'react-bootstrap'
import HarvestEntryInputs from '../components/HarvestEntryInputs'
import { setHarvestEntries } from '../store/actions/timeEntriesActions'

const TimeEntriesPage6 = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [inputValues, setInputValues] = useState({})
    const [savedEntries, setSavedEntries] = useState({})
    const [tasksSelected, setTasksSelected] = useState(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState({})
    const [excludedProjects, setExcludedProjects] = useState(new Set())
    const [allocationsLocked, setAllocationsLocked] = useState(false)
    const [confirmedAllocations, setConfirmedAllocations] = useState(null)

    const entryType = useSelector((state) => state.timeEntries.entryType)
    const harvestEntries = useSelector((state) => state.timeEntries.harvestEntries)
    const splitTimeEntries = useSelector((state) => state.timeEntries.splitTimeEntries)
    const allProjectsArray = useSelector((state) => state.projects.allProjects)
    const filteredTasksArray = useSelector((state) => state.tasks.filteredTasks)
    const billableHours = useSelector((state) => state.timeEntries.billableHours)

    const successMessage = 'New entry/entries saved successfully!'

    // --- Phase 1: Auto-compute project allocations ---

    const totalMinutesToDistribute = useMemo(() => {
        return splitTimeEntries.reduce((acc, entry) => {
            return acc + Math.round(entry.originalEntry.hours * 60)
        }, 0)
    }, [splitTimeEntries])

    const projectAllocations = useMemo(() => {
        // Filter to eligible projects (percentage > 0 already excludes <=1hr)
        const eligible = billableHours.filter((bh) => bh.percentage > 0)

        // Calculate allocated minutes per project
        let allocations = eligible.map((bh) => ({
            projectCode: bh.projectCode,
            hours: bh.hours,
            percentage: bh.percentage,
            allocatedMinutes: Math.max(
                5,
                roundToNearestFiveMinutes(
                    totalMinutesToDistribute * (bh.percentage / 100)
                )
            ),
        }))

        // Reconcile rounding so total matches
        const totalAllocated = allocations.reduce((s, p) => s + p.allocatedMinutes, 0)
        if (totalAllocated !== totalMinutesToDistribute && allocations.length > 0) {
            const diff = totalAllocated - totalMinutesToDistribute
            const largest = allocations.reduce((max, p) =>
                p.allocatedMinutes > max.allocatedMinutes ? p : max
            )
            largest.allocatedMinutes = Math.max(5, largest.allocatedMinutes - diff)
        }

        return allocations
    }, [billableHours, totalMinutesToDistribute])

    const adjustedAllocations = useMemo(() => {
        if (excludedProjects.size === 0) return projectAllocations

        const included = projectAllocations.filter(
            (p) => !excludedProjects.has(p.projectCode)
        )
        if (included.length === 0) return []

        const totalIncludedHours = included.reduce((s, p) => s + p.hours, 0)

        let adjusted = included.map((p) => {
            const newPercentage = (p.hours / totalIncludedHours) * 100
            return {
                projectCode: p.projectCode,
                hours: p.hours,
                percentage: newPercentage,
                allocatedMinutes: Math.max(
                    5,
                    roundToNearestFiveMinutes(
                        totalMinutesToDistribute * (newPercentage / 100)
                    )
                ),
            }
        })

        // Reconcile rounding so total matches
        const totalAllocated = adjusted.reduce((s, p) => s + p.allocatedMinutes, 0)
        if (totalAllocated !== totalMinutesToDistribute && adjusted.length > 0) {
            const diff = totalAllocated - totalMinutesToDistribute
            const largest = adjusted.reduce((max, p) =>
                p.allocatedMinutes > max.allocatedMinutes ? p : max
            )
            largest.allocatedMinutes = Math.max(5, largest.allocatedMinutes - diff)
        }

        return adjusted
    }, [projectAllocations, excludedProjects, totalMinutesToDistribute])

    // --- Pre-compute greedy distribution across entries ---
    // Fill entries with projects largest-first. An entry may get 1 project
    // or split between projects at the boundary.
    const entryDistributions = useMemo(() => {
        if (!confirmedAllocations || confirmedAllocations.length === 0) return {}

        // Sort projects largest allocation first
        const sortedProjects = [...confirmedAllocations].sort(
            (a, b) => b.allocatedMinutes - a.allocatedMinutes
        )

        // Track remaining minutes per project
        const projectRemaining = {}
        sortedProjects.forEach((p) => {
            projectRemaining[p.projectCode] = p.allocatedMinutes
        })

        // Build distribution: { [entryId]: [{ projectCode, suggestedMinutes }] }
        const distributions = {}

        splitTimeEntries.forEach((entry) => {
            const entryId = entry.originalEntry.id
            const entryMinutes = Math.round(entry.originalEntry.hours * 60)
            let remainingForEntry = entryMinutes
            distributions[entryId] = []

            for (const project of sortedProjects) {
                if (remainingForEntry <= 0) break
                if (projectRemaining[project.projectCode] <= 0) continue

                const minutesToAssign = Math.min(
                    remainingForEntry,
                    projectRemaining[project.projectCode]
                )

                // Round to nearest 5, but don't exceed what's available
                let rounded = roundToNearestFiveMinutes(minutesToAssign)
                rounded = Math.min(rounded, remainingForEntry)
                rounded = Math.min(rounded, projectRemaining[project.projectCode])
                if (rounded <= 0) rounded = minutesToAssign // fallback to exact

                distributions[entryId].push({
                    projectCode: project.projectCode,
                    percentage: project.percentage,
                    suggestedMinutes: rounded,
                })

                projectRemaining[project.projectCode] -= rounded
                remainingForEntry -= rounded
            }

            // Reconcile: if rounding caused the entry total to not match,
            // adjust the largest allocation for this entry
            const entryTotal = distributions[entryId].reduce(
                (s, d) => s + d.suggestedMinutes, 0
            )
            if (entryTotal !== entryMinutes && distributions[entryId].length > 0) {
                const diff = entryTotal - entryMinutes
                const largest = distributions[entryId].reduce((max, d) =>
                    d.suggestedMinutes > max.suggestedMinutes ? d : max
                )
                largest.suggestedMinutes = Math.max(0, largest.suggestedMinutes - diff)
                // Also adjust the project remaining tracker
                projectRemaining[largest.projectCode] += diff
            }
        })

        return distributions
    }, [confirmedAllocations, splitTimeEntries])

    const handleToggleProject = (projectCode) => {
        setExcludedProjects((prev) => {
            const next = new Set(prev)
            if (next.has(projectCode)) {
                next.delete(projectCode)
            } else {
                next.add(projectCode)
            }
            return next
        })
    }

    const handleConfirmAllocations = () => {
        setConfirmedAllocations([...adjustedAllocations])
        setAllocationsLocked(true)
    }

    const handleEditAllocations = () => {
        setAllocationsLocked(false)
        setConfirmedAllocations(null)
        setInputValues({})
        setSavedEntries({})
        setIsButtonDisabled({})
        setTasksSelected(false)
    }

    // --- Phase 2: Handlers (same as Step 4) ---

    const handleInputChange = (event, entryId, projectCode, value) => {
        const suggestedMinutesInput = event.target
            .closest('.entry-form-inputs')
            .querySelector('input[name="suggestedMinutes"]')
        const suggestedMinutes = parseInt(suggestedMinutesInput.value) || 0

        const projectIdInput = event.target
            .closest('.entry-form-inputs')
            .querySelector('input[name="projectId"]')
        const projectId = projectIdInput ? projectIdInput.value : ''

        const projectNotesInput = event.target
            .closest('.entry-form-inputs')
            .querySelector('input[name="projectNotes"]')
        const projectNotes = projectNotesInput ? projectNotesInput.value : ''

        const userIdInput = event.target
            .closest('.entry-form-inputs')
            .querySelector('input[name="userId"]')
        const userId = userIdInput ? userIdInput.value : ''

        const spentDateInput = event.target
            .closest('.entry-form-inputs')
            .querySelector('input[name="spentDate"]')
        const spentDate = spentDateInput ? spentDateInput.value : ''

        setIsButtonDisabled((prev) => ({
            ...prev,
            [entryId]: false,
        }))

        setInputValues((prev) => ({
            ...prev,
            [entryId]: {
                ...prev[entryId],
                [projectCode]: {
                    ...prev[entryId]?.[projectCode],
                    confirmedMinutes: value,
                    taskId: prev[entryId]?.[projectCode]?.taskId || '',
                    suggestedMinutes: suggestedMinutes,
                    projectId: projectId,
                    projectNotes: projectNotes,
                    userId: userId,
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

        const entryValues = inputValues[entryId] || {}
        const allValuesPresent = Object.values(entryValues).every(
            (projectData) => {
                return (
                    projectData.confirmedMinutes &&
                    projectData.taskId &&
                    projectData.projectId &&
                    projectData.userId &&
                    projectData.spentDate
                )
            }
        )

        if (!allValuesPresent) {
            console.warn('Cannot save entry: Not all required values are present.', entryValues)
            return
        }

        let newHarvestEntries = []

        Object.entries(inputValues[entryId] || {}).forEach(
            ([projectCode, projectData]) => {
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
                        notes: projectData.projectNotes || '',
                        groupId: entryId,
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

    // Check if all entries have been saved
    const allEntriesSaved =
        Object.keys(savedEntries).length === splitTimeEntries.length

    return (
        <div className="time-entries-page">
            <h1>Time Entries - Allocate Minutes</h1>

            {splitTimeEntries.length > 0 ? (
                <div className="split-time-entries-container">
                    {/* Phase 1: Summary table */}
                    <h2>Project Allocations</h2>
                    <p>Total minutes to distribute: {totalMinutesToDistribute}</p>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {!allocationsLocked && <th>Include</th>}
                                <th>Project Code</th>
                                <th>Billable Hours</th>
                                <th>Percentage</th>
                                <th>Allocated Minutes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectAllocations.map((project) => {
                                const isExcluded = excludedProjects.has(project.projectCode)
                                const adjusted = adjustedAllocations.find(
                                    (a) => a.projectCode === project.projectCode
                                )
                                return (
                                    <tr
                                        key={project.projectCode}
                                        style={isExcluded ? { opacity: 0.4, textDecoration: 'line-through' } : {}}
                                    >
                                        {!allocationsLocked && (
                                            <td>
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={!isExcluded}
                                                    onChange={() => handleToggleProject(project.projectCode)}
                                                />
                                            </td>
                                        )}
                                        <td>{project.projectCode}</td>
                                        <td>{parseFloat(project.hours.toFixed(2))}</td>
                                        <td>
                                            {isExcluded
                                                ? '(excluded)'
                                                : `${parseFloat(adjusted?.percentage ?? project.percentage).toFixed(2)}%`}
                                        </td>
                                        <td>
                                            {isExcluded
                                                ? 0
                                                : adjusted?.allocatedMinutes ?? project.allocatedMinutes}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                {!allocationsLocked && <td></td>}
                                <td><strong>Total</strong></td>
                                <td></td>
                                <td></td>
                                <td>
                                    <strong>
                                        {adjustedAllocations.reduce(
                                            (s, p) => s + p.allocatedMinutes, 0
                                        )}
                                    </strong>
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {!allocationsLocked ? (
                        <Button
                            variant="primary"
                            onClick={handleConfirmAllocations}
                            disabled={adjustedAllocations.length === 0}
                            style={{ marginBottom: '20px' }}
                        >
                            Confirm Allocations
                        </Button>
                    ) : (
                        <Button
                            variant="outline-secondary"
                            onClick={handleEditAllocations}
                            style={{ marginBottom: '20px' }}
                        >
                            Edit Allocations
                        </Button>
                    )}

                    {/* Phase 2: Entry-by-entry forms */}
                    {allocationsLocked && <h2>Distribute Time Entries</h2>}
                    {allocationsLocked && splitTimeEntries.map((entry, index) => {
                        const minutes = Math.round(
                            entry.originalEntry.hours * 60
                        )
                        const entryId = entry.originalEntry.id
                        const distribution = entryDistributions[entryId] || []

                        // Build input fields only for projects assigned to this entry
                        const inputFields = distribution.map((dist) => {
                            const matchingProject = allProjectsArray.find(
                                (p) => p.code === dist.projectCode
                            )
                            if (!matchingProject) {
                                console.warn(
                                    `No matching project found for project code: ${dist.projectCode}`
                                )
                                return null
                            }

                            const projectId = matchingProject.id
                            const projectNotes = entry.originalEntry.notes
                            const spentDate = entry.originalEntry.spent_date
                            const userId = entry.originalEntry.user.id

                            return (
                                <HarvestEntryInputs
                                    key={dist.projectCode}
                                    filteredProject={matchingProject}
                                    entry={entry}
                                    inputValues={inputValues}
                                    suggestedMinutes={dist.suggestedMinutes}
                                    projectCode={dist.projectCode}
                                    handleInputChange={handleInputChange}
                                    handleTaskChange={handleTaskChange}
                                    filteredTasksArray={filteredTasksArray}
                                    projectId={projectId}
                                    projectNotes={projectNotes}
                                    spentDate={spentDate}
                                    userId={userId}
                                    actualMinutes={dist.suggestedMinutes}
                                    minutes={minutes}
                                    entryType={entryType}
                                />
                            )
                        })

                        const totalConfirmedMinutesForEntry = Object.values(
                            inputValues[entry.originalEntry.id] || {}
                        ).reduce((acc, projectData) => {
                            return (
                                acc +
                                (parseInt(projectData.confirmedMinutes) || 0)
                            )
                        }, 0)

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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="split-time-entry">
                                            <td className="entry-item">
                                                {entry.originalEntry.project.code}
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
                    {allocationsLocked && allEntriesSaved && (
                        <div>
                            <Button
                                variant="success"
                                onClick={() =>
                                    navigate('/time-entries-step-5')
                                }
                            >
                                Preview the new Harvest Entries
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <p>No split time entries found.</p>
            )}
        </div>
    )
}

export default TimeEntriesPage6
