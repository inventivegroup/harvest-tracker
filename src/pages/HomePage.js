import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'

const HomePage = () => {
    const navigate = useNavigate()

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <img
                src="/hero.svg"
                alt="Poppins Harvest"
                style={{
                    width: '100%',
                    maxWidth: 700,
                    margin: '0 auto 2rem',
                    display: 'block',
                    borderRadius: 12,
                }}
            />

            <h1 style={{ borderBottom: 'none', marginBottom: '0.25rem' }}>
                Umbrella
            </h1>
            <p
                style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: 'italic',
                    color: '#D4A0A0',
                    fontSize: '1.1rem',
                    marginBottom: '0.25rem',
                }}
            >
                Poppins
            </p>
            <p
                style={{
                    fontFamily: "'Lato', sans-serif",
                    color: '#3A3A3A',
                    fontSize: '0.95rem',
                    marginBottom: '2rem',
                }}
            >
                Practically perfect time splitting in every way.
            </p>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                    textAlign: 'left',
                    marginBottom: '2.5rem',
                }}
            >
                <div
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 8,
                        padding: '1.25rem',
                        boxShadow: '0 2px 8px rgba(27,42,74,0.08)',
                        borderTop: '3px solid #C41E3A',
                    }}
                >
                    <h3 style={{ fontSize: '1.1rem', marginTop: 0 }}>
                        Fetch Time Entries
                    </h3>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                        Pull your Harvest time entries for this week or last
                        week and review them at a glance.
                    </p>
                </div>

                <div
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 8,
                        padding: '1.25rem',
                        boxShadow: '0 2px 8px rgba(27,42,74,0.08)',
                        borderTop: '3px solid #87CEEB',
                    }}
                >
                    <h3 style={{ fontSize: '1.1rem', marginTop: 0 }}>
                        Split by Project
                    </h3>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                        Distribute time across billable projects based on
                        percentage allocations, rounded to the nearest 5
                        minutes.
                    </p>
                </div>

                <div
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 8,
                        padding: '1.25rem',
                        boxShadow: '0 2px 8px rgba(27,42,74,0.08)',
                        borderTop: '3px solid #D4AF37',
                    }}
                >
                    <h3 style={{ fontSize: '1.1rem', marginTop: 0 }}>
                        Submit to Harvest
                    </h3>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                        Preview your new entries and submit them back to Harvest
                        with one click. 1x1s and bill-to-client handled
                        separately.
                    </p>
                </div>
            </div>

            <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/time-entries')}
            >
                Get Started
            </Button>
        </div>
    )
}

export default HomePage
