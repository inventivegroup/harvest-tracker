import React from 'react'
import { Navbar, Nav } from 'react-bootstrap'

const Header = () => {
    return (
        <header>
            <Navbar
                expand="lg"
                variant="dark"
                style={{
                    backgroundColor: '#1B2A4A',
                    fontFamily: "'Playfair Display', Georgia, serif",
                }}
            >
                <Navbar.Brand
                    href="#home"
                    style={{
                        fontWeight: 700,
                        fontSize: '1.3rem',
                        letterSpacing: '0.05em',
                        color: '#FFF8F0',
                    }}
                >
                    Poppins Harvest
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <Nav.Link href="/" style={{ color: '#D4A0A0' }}>Home</Nav.Link>
                        <Nav.Link href="/time-entries" style={{ color: '#D4A0A0' }}>Harvest Time</Nav.Link>
                        <Nav.Link href="/users" style={{ color: '#D4A0A0' }}>Harvest Users</Nav.Link>
                        <Nav.Link href="/tasks" style={{ color: '#D4A0A0' }}>Harvest Tasks</Nav.Link>
                        <Nav.Link href="/harvest-projects" style={{ color: '#D4A0A0' }}>Harvest Projects</Nav.Link>
                        {/* <Nav.Link href="/jira-tickets">Jira Tickets</Nav.Link> */}
                        <Nav.Link href="/jira-users" style={{ color: '#D4A0A0' }}>Jira Users</Nav.Link>
                        <Nav.Link href="/jira-projects" style={{ color: '#D4A0A0' }}>Jira Projects</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </header>
    )
}

export default Header
