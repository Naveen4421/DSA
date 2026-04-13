import { render, screen } from '@testing-library/react'
import Header from '../components/Header'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, whileHover, whileTap, initial, animate, exit, ...props }) => <div {...props}>{children}</div>,
        span: ({ children, whileHover, whileTap, initial, animate, exit, ...props }) => <span {...props}>{children}</span>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}))

describe('Header component', () => {
    const defaultProps = {
        user: { email: 'test@example.com' },
        solvedCount: 10,
        totalCount: 100,
        streak: 5,
        theme: 'dark',
        onLogout: jest.fn(),
        onToggleTheme: jest.fn(),
        onOpenBadges: jest.fn(),
        onShowExplore: jest.fn(),
    }

    it('renders the branding title', () => {
        render(<Header {...defaultProps} />)
        expect(screen.getByText(/DSA/i)).toBeInTheDocument()
        // Use getAllByText because 'Astra' appears in the logo and the 'Astra Log' menu item
        const astraElements = screen.getAllByText(/Astra/i)
        expect(astraElements.length).toBeGreaterThanOrEqual(1)
    })


    it('displays the correct solved count', () => {
        render(<Header {...defaultProps} />)
        expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('displays the user streak', () => {
        render(<Header {...defaultProps} />)
        expect(screen.getByText('5')).toBeInTheDocument()
    })
})
