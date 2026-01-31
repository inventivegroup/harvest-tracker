import React, { useEffect, useState } from 'react'
import remainingData from '../utils/remaining.json' // Adjust the path to your JSON file

const BudgetPage = () => {
    const [projectCodes, setProjectCodes] = useState([])
    const [selectedProjectCode, setSelectedProjectCode] = useState('')
    const [filteredData, setFilteredData] = useState([])

    useEffect(() => {
        // Extract project codes from the remaining.json data
        if (remainingData && Array.isArray(remainingData)) {
            // Create a Set to group unique project codes
            const codesSet = new Set(remainingData.map((item) => item.code)) // Assuming each item has a "code" property
            // Convert the Set back to an array and sort it
            const sortedCodes = Array.from(codesSet).sort()
            setProjectCodes(sortedCodes)
        }
    }, [])

    const handleProjectCodeChange = (e) => {
        const selectedCode = e.target.value
        console.log('selected project code: ', selectedCode)
        setSelectedProjectCode(selectedCode)

        // Filter the remainingData based on the selected project code
        const dataForSelectedCode = remainingData.filter(
            (item) => item.code === selectedCode
        )
        setFilteredData(dataForSelectedCode)
    }

    return (
        <div className="container mx-auto p-4">
            <h1>Remaining Budgets</h1>
            <label htmlFor="projectCode">Select Project Code:</label>
            <select
                id="projectCode"
                value={selectedProjectCode}
                onChange={handleProjectCodeChange}
            >
                <option value="">-- Select a Project Code --</option>
                {projectCodes.map((code, index) => (
                    <option key={index} value={code}>
                        {code}
                    </option>
                ))}
            </select>

            {selectedProjectCode && filteredData.length > 0 && (
                <div>
                    <h2>Data for {selectedProjectCode}</h2>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Date</th>
                                <th>Budget</th>
                                <th>Remaining</th>
                                <th>Chart Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.code}</td>
                                    <td>{item.date.$date}</td>
                                    <td>{item.budget}</td>
                                    <td>
                                        {parseFloat(item.remaining).toFixed(2)}
                                    </td>
                                    <td>{item.chart_type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default BudgetPage
