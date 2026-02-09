import React, { useState, useEffect } from 'react'
import HarvestEntryTable from '../components/HarvestEntryTable'
import { Button, Alert } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { harvestEntriesSaved, testData } from '../utils/testData'
import Loader from '../components/Loader'

const TimeEntriesPage5 = () => {
    const [loading, setLoading] = useState(false)
    const [entryStatuses, setEntryStatuses] = useState({})
    const harvestEntries = useSelector((state) => state.timeEntries.harvestEntries)
    const { allProjects } = useSelector((state) => state.projects);
    const { allTasks } = useSelector((state) => state.tasks);
    // const allProjects = testData.projects.allProjects;
    // const harvestEntries = harvestEntriesSaved;
    const [mappedEntries, setMappedEntries] = useState([]); // State to hold mapped entries


    console.log('harvestEntries', harvestEntries)
    console.log('allProjects', allProjects);

    useEffect(() => {
        if (allProjects.length > 0) {
            const mapped = harvestEntries.map(entry => {
                console.log('entry', entry)
                const project = allProjects.find(p => String(p.id) === String(entry.project_id));
                const task = allTasks.find(t => String(t.id) === String(entry.task_id));
                return {
                    ...entry,
                    code: project ? project.code : 'Unknown',
                    projectName: project ? project.name : 'Unknown',
                    taskName: task ? task.name : 'Unknown',
                };
            });
            setMappedEntries(mapped);
        }
    }, [allProjects, allTasks, harvestEntries]); // Run when projects/tasks are fetched

    console.log('mappedEntries', mappedEntries)
    // const harvestEntries = harvestEntriesSaved;
    // Function to post newHarvestEntries to the API
    const postNewHarvestEntries = async () => {
        console.log(JSON.stringify(harvestEntries))
        setLoading(true)
        setEntryStatuses({})

        for (let i = 0; i < harvestEntries.length; i++) {
            const entry = harvestEntries[i]
            try {
                console.log('submitting post request for entry', entry)
                const response = await fetch(
                    'https://harvest-tracker-api.onrender.com/api/create-harvest-time-entries',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(entry),
                    }
                )

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }

                const data = await response.json()
                console.log('Success:', data)
                setEntryStatuses((prev) => ({ ...prev, [i]: 'success' }))
            } catch (error) {
                console.error('Error posting entry:', error)
                setEntryStatuses((prev) => ({ ...prev, [i]: 'error' }))
            }
        }

        setLoading(false)
    }

    return (
        <div className="time-entries-page">
            <h1>Time Entry Submission</h1>
            <div>
                {mappedEntries && mappedEntries.length > 0 && (
                    <>
                        <HarvestEntryTable
                            harvestEntries={mappedEntries}
                            entryStatuses={entryStatuses}
                        />
                        {loading && <Loader />}
                        {!loading && Object.keys(entryStatuses).length > 0 && (
                            <Alert
                                variant={
                                    Object.values(entryStatuses).every((s) => s === 'success')
                                        ? 'success'
                                        : 'warning'
                                }
                            >
                                {Object.values(entryStatuses).filter((s) => s === 'success').length} of{' '}
                                {mappedEntries.length} entries submitted successfully.
                                {Object.values(entryStatuses).some((s) => s === 'error') &&
                                    ` ${Object.values(entryStatuses).filter((s) => s === 'error').length} failed.`}
                            </Alert>
                        )}
                        {!loading && Object.keys(entryStatuses).length === 0 && (
                            <Button
                                variant="primary"
                                onClick={postNewHarvestEntries}
                            >
                                Submit New Entries
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default TimeEntriesPage5
