import { createContext, useContext, useState } from 'react'
const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)

    // setting the token and user on login
    const login = (token, userData) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setIsLoggedIn(true)
        setUser(userData)
    }

    // removing it on logout
    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsLoggedIn(false)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// custom hook so any component can easily access the auth context
export const useAuth = () => useContext(AuthContext)