import React, { useEffect } from 'react'
import {
    InputGroup,
    FloatingLabel,
    FormControl,
    FormSelect,
} from 'react-bootstrap'
const HarvestEntryInputs = ({
    filteredProject,
    entry,
    inputValues,
    handleInputChange,
    handleTaskChange,
    filteredTasksArray,
    projectId,
    projectNotes,
    suggestedMinutes,
    spentDate,
    userId,
    actualMinutes,
    minutes,
    entryType,
}) => {
    // Auto-select Engineering Manager task by default
    useEffect(() => {
        if (filteredTasksArray && filteredTasksArray.length > 0) {
            const currentTaskId = inputValues[entry.originalEntry.id]?.[filteredProject.code]?.taskId
            if (!currentTaskId) {
                const engineeringManagerTask = filteredTasksArray.find(
                    (task) => task.name === 'Engineering Manager'
                )
                if (engineeringManagerTask) {
                    handleTaskChange(
                        entry.originalEntry.id,
                        filteredProject.code,
                        engineeringManagerTask.id
                    )
                }
            }
        }
    }, [filteredTasksArray, entry.originalEntry.id, filteredProject.code])
    return (
        <div key={filteredProject.code} className="entry-form-inputs">
            <h5>{filteredProject.code}</h5>
            <input
                type="hidden"
                className="projectId"
                name="projectId"
                value={projectId}
            />
            <input
                type="hidden"
                className="projectNotes"
                name="projectNotes"
                value={projectNotes}
            />
            <input
                type="hidden"
                className="suggestedMinutes"
                name="suggestedMinutes"
                value={suggestedMinutes || 0}
            />
            <input
                type="hidden"
                className="spentDate"
                name="spentDate"
                value={spentDate}
            />
            <input
                type="hidden"
                className="userId"
                name="userId"
                value={userId}
            />
            <input
                type="hidden"
                className="minutes"
                name="minutes"
                value={minutes}
            />
            <InputGroup>
                <FloatingLabel>
                    Confirmed Minutes (suggested: {suggestedMinutes}, actual:{' '}
                    {actualMinutes})
                </FloatingLabel>
                <FormControl
                    type="number"
                    placeholder={suggestedMinutes || 0}
                    required
                    className="confirmed-minutes"
                    value={
                        inputValues[entry.originalEntry.id]?.[
                            filteredProject.code
                        ]?.confirmedMinutes || ''
                    }
                    onChange={(e) =>
                        handleInputChange(
                            e,
                            entry.originalEntry.id,
                            filteredProject.code,
                            e.target.value
                        )
                    }
                />
            </InputGroup>
            <InputGroup>
                <FloatingLabel>Select Task</FloatingLabel>
                <FormSelect
                    className="task-select"
                    onChange={(e) =>
                        handleTaskChange(
                            entry.originalEntry.id,
                            filteredProject.code,
                            e.target.value
                        )
                    }
                    value={
                        inputValues[entry.originalEntry.id]?.[
                            filteredProject.code
                        ]?.taskId || ''
                    }
                    required
                >
                    <option value="">Select a task</option>
                    {filteredTasksArray.map((task) => (
                        <option key={task.id} value={task.id}>
                            {task.name}
                        </option>
                    ))}
                </FormSelect>
            </InputGroup>
        </div>
    )
}

export default HarvestEntryInputs
