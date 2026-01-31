import React from 'react'
import { Table } from 'react-bootstrap'

const HarvestEntryTable = ({ harvestEntries }) => {
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>Project ID</th>
                    <th>Task ID</th>
                    <th>Spent Date</th>
                    <th>Hours</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                {harvestEntries.map((entry, index) => (
                    <tr key={index}>
                        <td>{entry.user_id}</td>
                        <td> {entry.project_id}<br></br>{entry.code}</td>
                        <td>{entry.task_id}</td>
                        <td>{entry.spent_date}</td>
                        <td>
                            {parseFloat(entry.hours).toFixed(2)} (
                            {Math.round(entry.hours * 60)} minutes)
                        </td>
                        <td>{entry.notes}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

export default HarvestEntryTable
