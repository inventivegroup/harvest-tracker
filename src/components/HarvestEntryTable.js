import React, { useMemo } from 'react'
import { Table } from 'react-bootstrap'

const groupStyles = [
    { backgroundColor: '#e8f4fd', borderLeft: '4px solid #2196F3' },
    { backgroundColor: '#fff8e1', borderLeft: '4px solid #FFC107' },
    { backgroundColor: '#e8f5e9', borderLeft: '4px solid #4CAF50' },
    { backgroundColor: '#fce4ec', borderLeft: '4px solid #E91E63' },
    { backgroundColor: '#ede7f6', borderLeft: '4px solid #673AB7' },
    { backgroundColor: '#fff3e0', borderLeft: '4px solid #FF9800' },
]

const HarvestEntryTable = ({ harvestEntries }) => {
    const groupStyleMap = useMemo(() => {
        const map = {}
        let styleIndex = 0
        harvestEntries.forEach((entry) => {
            const key = entry.groupId || entry.spent_date + entry.notes
            if (!(key in map)) {
                map[key] = groupStyles[styleIndex % groupStyles.length]
                styleIndex++
            }
        })
        return map
    }, [harvestEntries])

    return (
        <Table bordered hover>
            <thead>
                <tr>
                    <th>Spent Date</th>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Minutes</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                {harvestEntries.map((entry, index) => {
                    const key = entry.groupId || entry.spent_date + entry.notes
                    return (
                        <tr key={index} style={groupStyleMap[key]}>
                            <td style={{ whiteSpace: 'nowrap' }}>{entry.spent_date}</td>
                            <td>{entry.code ? `${entry.code} - ${entry.projectName || ''}` : entry.project_id}</td>
                            <td>{entry.taskName || entry.task_id}</td>
                            <td>{Math.round(entry.hours * 60)}</td>
                            <td>{entry.notes}</td>
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}

export default HarvestEntryTable
