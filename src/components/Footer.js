import React from 'react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer
            style={{
                backgroundColor: '#1B2A4A',
                borderRadius: '12px',
                color: '#D4A0A0',
                textAlign: 'center',
                padding: '1rem',
                marginTop: '2rem',
                fontFamily: "'Lato', sans-serif",
                fontSize: '0.85rem',
            }}
        >
            &copy; {currentYear} Christina Harder
        </footer>
    )
}

export default Footer
