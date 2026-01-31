import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    fetchTimeEntriesByDate,
    setBillableHours,
    setSelectedWeek,
    setTimeEntriesByUser,
} from '../store/actions/timeEntriesActions' // Import the new action
import BillableHours from '../components/BillableHours' // Import the new component
import Loader from '../components/Loader' // Import the Loader component
import { calculateDates } from '../utils/functions'
import { useNavigate } from 'react-router-dom' // Import useNavigate for navigation
import {
    calculateBillableHours,
    sortEntriesByProjectCode,
    organizeEntriesByUser,
} from '../utils/functions'
import { Button, FormSelect, FloatingLabel } from 'react-bootstrap'
import { fetchProjects } from '../store/actions/projectActions' // Import the fetchProjects action
import { fetchTasks } from '../store/actions/taskActions' // Import the fetchTasks action

const TimeEntriesPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const timeEntriesByDate = useSelector(
        (state) => state.timeEntries.timeEntriesByDate
    )
    const billableHours = useSelector(
        (state) => state.timeEntries.billableHours
    )
    const selectedWeek = useSelector((state) => state.timeEntries.selectedWeek)
    const [isHoursCalculated, setIsHoursCalculated] = useState(false)
    const [loadingBillableHours, setLoadingBillableHours] = useState(false)
    const [showBillableHours, setShowBillableHours] = useState(false)
    const calculatedMinutes = {}
    const [dateRange, setDateRange] = useState('')

    console.log('timeEntriesByDate', timeEntriesByDate)
    const handleCalculateHours = async () => {
        setLoadingBillableHours(true)
        setShowBillableHours(false)

        const { startDate, endDate } = calculateDates(selectedWeek)
        setDateRange(
            `From ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        ) // Update date range
        await dispatch(
            fetchTimeEntriesByDate(
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            )
        )
        await dispatch(fetchProjects())
        await dispatch(fetchTasks())
        setIsHoursCalculated(true)
    }

    const handleWeekChange = (e) => {
        const week = e.target.value
        dispatch(setSelectedWeek(week))

        // Calculate the date range based on the selected week
        const { startDate, endDate } = calculateDates(week)
        setDateRange(
            `From ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        ) // Format the date range
    }

    useEffect(() => {
        if (isHoursCalculated && timeEntriesByDate.length > 0) {
            const calculatedBillableHours =
                calculateBillableHours(timeEntriesByDate)
            const sortedBillableHours = sortEntriesByProjectCode(
                calculatedBillableHours
            )

            console.log('calculatedBillableHours', calculatedBillableHours)
            console.log('sortedBillableHours', sortedBillableHours)
            // Dispatch the action to store billable hours in Redux first

            dispatch(setBillableHours(sortedBillableHours))
            const organizedByUser = organizeEntriesByUser(timeEntriesByDate)
            console.log('organizedByUser', organizedByUser)
            dispatch(setTimeEntriesByUser(organizedByUser)) // Dispatch the organized entries

            setLoadingBillableHours(false) // Set loading state to false after calculation
            setShowBillableHours(true) // Show BillableHours component after data is ready
        }
    }, [timeEntriesByDate, isHoursCalculated, dispatch]) // Run this effect when timeEntriesByDate or isHoursCalculated changes

    return (
        <div>
            <h1>Time Entries</h1>
            <h2>Step 1: Fetch Time Entries by Date</h2>
            <label>
                <FloatingLabel>Week:</FloatingLabel>
                <FormSelect value={selectedWeek} onChange={handleWeekChange}>
                    <option value="thisWeek">This Week</option>
                    <option value="lastWeek">Last Week</option>
                </FormSelect>
            </label>
            <Button style={{ marginLeft: '1rem' }} onClick={handleCalculateHours}>Calculate Hours</Button>{' '}
            {/* Button to calculate billable hours */}
            {/* Display the chosen date range */}
            {dateRange && <p>{dateRange}</p>}
            {loadingBillableHours ? (
                <Loader />
            ) : (
                showBillableHours && (
                    <BillableHours
                        billableHours={billableHours}
                        calculatedMinutes={calculatedMinutes}
                    />
                )
            )}{' '}
            {/* Display the billable hours only when not loading and data is ready */}
            {showBillableHours && ( // Only show the button if BillableHours is visible
                <>
                    <Button onClick={() => navigate('/time-entries-step-2')}>
                        Go to Step 2
                    </Button>
                    <Button style={{ marginLeft: '0.5rem' }} onClick={() => navigate('/time-spent')}>
                        Go to Time Spent
                    </Button>
                </>
            )}
        </div>
    )
}

export default TimeEntriesPage
