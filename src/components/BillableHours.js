import React, { useState } from 'react'
import {
    calculateTotalBillableHours,
    numHoursToCrossOff,
} from '../utils/functions'
import {
    InputGroup,
    FloatingLabel,
    FormControl,
    FormSelect,
} from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { sortEntriesByTaskName } from '../utils/functions'

const BillableHours = ({ billableHours, calculatedMinutes, inputValues: propInputValues, setInputValues: propSetInputValues }) => {
    const [localInputValues, setLocalInputValues] = useState({})
    const inputValues = propInputValues || localInputValues
    const setInputValues = propSetInputValues || setLocalInputValues
    // Calculate total billable hours
    const totalBillableHours = parseFloat(
        calculateTotalBillableHours(billableHours).toFixed(2)
    )
    const filteredTasksArray = useSelector((state) => state.tasks.filteredTasks)
    const allProjectsArray = useSelector((state) => state.projects.allProjects)
    // const allProjectsArray = testData.projects.allProjects;
    // console.log("allProjectsArray", allProjectsArray);
    // const filteredTasksArray = sortEntriesByTaskName(testData.tasks.filteredTasks);
    const splitTimeEntries = useSelector(
        (state) => state.timeEntries.splitTimeEntries
    )
    const [tasksSelected, setTasksSelected] = useState(false)
    const successMessage = 'New entry/entries saved successfully!'

    // console.log("splitTimeEntries", splitTimeEntries);

    const handleTaskChange = (projectCode, taskId) => {
        setInputValues((prev) => ({
            ...prev,
            [projectCode]: {
                ...prev[projectCode],
                taskId: taskId,
                confirmedMinutes: prev[projectCode]?.confirmedMinutes || '',
            },
        }))

        setTasksSelected((prev) => ({
            ...prev,
            [projectCode]: true,
        }))
    }

    const handleInputChange = (e, projectCode, value) => {
        console.log('projectCode', projectCode)
        console.log('value', value)

        // const suggestedMinutesInput = event.target.closest('.entry-form-inputs').querySelector('input[name="suggestedMinutes"]');
        // const suggestedMinutes = parseInt(suggestedMinutesInput.value) || 0; // Default to 0 if not found

        // // Retrieve projectId and projectNotes from hidden inputs
        // const projectIdInput = event.target.closest('.entry-form-inputs').querySelector('input[name="projectId"]');
        // const projectId = projectIdInput ? projectIdInput.value : ''; // Default to empty string if not found

        // const projectNotesInput = event.target.closest('.entry-form-inputs').querySelector('input[name="projectNotes"]');
        // const projectNotes = projectNotesInput ? projectNotesInput.value : ''; // Default to empty string if not found

        // const userIdInput = event.target.closest('.entry-form-inputs').querySelector('input[name="userId"]');
        // const userId = userIdInput ? userIdInput.value : ''; // Default to empty string if not found

        // const spentDateInput = event.target.closest('.entry-form-inputs').querySelector('input[name="spentDate"]');
        // const spentDate = spentDateInput ? spentDateInput.value : ''; // Default to empty string if not found

        // setIsButtonDisabled(prev => ({
        //     ...prev,
        //     [entryId]: false
        // }));

        // Update the input values state
        setInputValues((prev) => ({
            ...prev,
            [projectCode]: {
                confirmedMinutes: value,
                taskId: prev[projectCode]?.taskId || '',
                // suggestedMinutes: suggestedMinutes, // Add the retrieved suggested minutes here
                // projectId: projectId, // Add the retrieved projectId here
            },
        }))
    }

    const InputFieldComponent = (projectCode) => {
        const projectEntry = allProjectsArray.find(
            (entry) => entry.code === projectCode
        )
        const projectId = projectEntry ? projectEntry.id : null // Get projectId if found
        const suggestedMinutes = calculatedMinutes[projectCode] || {} // Get suggested minutes as an object

        // Ensure suggestedMinutes is an object and access its properties safely
        const allocatedMinutes = suggestedMinutes.allocatedMinutes || 0 // Default to 0 if not found

        return (
            <>
                {suggestedMinutes.allocatedMinutes > 0 && (
                    <>
                        <input
                            type="hidden"
                            className="projectId"
                            name="projectId"
                            value={projectId}
                        />
                        <InputGroup>
                            <FloatingLabel>
                                Confirmed Minutes (suggested: {allocatedMinutes}
                                )
                            </FloatingLabel>
                            <FormControl
                                type="number"
                                placeholder={allocatedMinutes}
                                required
                                className="confirmed-minutes"
                                value={
                                    inputValues[projectCode]
                                        ?.confirmedMinutes || ''
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        e,
                                        projectCode,
                                        e.target.value
                                    )
                                }
                            />
                        </InputGroup>
                        <InputGroup>
                            {allocatedMinutes > 0 && (
                                <FormSelect
                                    className="task-select"
                                    onChange={(e) =>
                                        handleTaskChange(
                                            projectCode,
                                            e.target.value
                                        )
                                    }
                                    value={
                                        inputValues[projectCode]?.taskId || ''
                                    }
                                    required
                                >
                                    <option value="">Select a task</option>
                                    {sortEntriesByTaskName(
                                        filteredTasksArray
                                    ).map((task) => (
                                        <option key={task.id} value={task.id}>
                                            {task.name}
                                        </option>
                                    ))}
                                </FormSelect>
                            )}
                        </InputGroup>
                    </>
                )}
            </>
        )
    }

    console.log('inputValues', inputValues)
    // console.log("billableHours", billableHours);

    return (
        <div>
            <h2>Billable Hours by Project</h2>
            <p>Total Billable Hours: {totalBillableHours} hours</p>
            {billableHours.length > 0 ? (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Project Code</th>
                            <th>Billable Hours</th>
                            <th>Percentage of Total</th>
                            {calculatedMinutes &&
                                Object.keys(calculatedMinutes).length > 0 && (
                                    <th>Calculated Minutes</th>
                                )}
                            {calculatedMinutes &&
                                Object.keys(calculatedMinutes).length > 0 && (
                                    <th>Inputs</th>
                                )}
                        </tr>
                    </thead>
                    <tbody>
                        {billableHours.map(
                            ({ projectCode, hours, percentage }) => {
                                const minutes =
                                    calculatedMinutes[projectCode]
                                        ?.allocatedMinutes || 'N/A' // Get calculated minutes or 'N/A' if not found
                                const isCrossedOff =
                                    (calculatedMinutes[projectCode] &&
                                        minutes === 'N/A') ||
                                    hours < numHoursToCrossOff // Determine if the row should be crossed off

                                return (
                                    <tr
                                        key={projectCode}
                                        style={{
                                            textDecoration: isCrossedOff
                                                ? 'line-through'
                                                : 'none',
                                        }}
                                    >
                                        <td>{projectCode}</td>
                                        <td>{parseFloat(hours.toFixed(2))}</td>
                                        <td>
                                            {percentage > 0
                                                ? `${parseFloat(percentage).toFixed(2)}%`
                                                : 'N/A'}
                                        </td>
                                        {calculatedMinutes &&
                                            Object.keys(calculatedMinutes)
                                                .length > 0 && (
                                                <td>{minutes}</td>
                                            )}
                                        {calculatedMinutes &&
                                            Object.keys(calculatedMinutes)
                                                .length > 0 && (
                                                <td>
                                                    {InputFieldComponent(
                                                        projectCode
                                                    )}
                                                </td>
                                            )}
                                    </tr>
                                )
                            }
                        )}
                    </tbody>
                </table>
            ) : (
                <p>No billable hours found.</p>
            )}
        </div>
    )
}

export default BillableHours
