import React from 'react'
import { Navbar, Nav } from 'react-bootstrap'

const Header = () => {
    return (
        <header>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Navbar.Brand href="#home">
                    Time Splitter, a Poppins brand
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link href="/time-entries">Harvest Time</Nav.Link>
                        <Nav.Link href="/users">Harvest Users</Nav.Link>
                        <Nav.Link href="/tasks">Harvest Tasks</Nav.Link>
                        <Nav.Link href="/harvest-projects">Harvest Projects</Nav.Link>
                        {/* <Nav.Link href="/jira-tickets">Jira Tickets</Nav.Link> */}
                        <Nav.Link href="/jira-users">Jira Users</Nav.Link>
                        <Nav.Link href="/jira-projects">Jira Projects</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </header>
    )
}

export default Header
