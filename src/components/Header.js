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
                    borderRadius: '12px',
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
                    <img src="/logo.svg" alt="Umbrella" style={{ marginLeft: '0.75rem' }} />
                    <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1.1 }}>
                        <span>Umbrella</span>
                        <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#D4A0A0', fontWeight: 400 }}>Poppins</span>
                    </span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <Nav.Link href="/" style={{ color: '#D4A0A0' }}>Home</Nav.Link>
                        <Nav.Link href="/time-entries" style={{ color: '#D4A0A0' }}>Harvest Time</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </header>
    )
}

export default Header
