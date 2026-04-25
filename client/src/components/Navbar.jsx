import {Navbar, Nav, Container} from 'react-bootstrap'
import {NavLink, useNavigate} from 'react-router-dom'
import "../stylesheets/Navbar.css"
import NavSearchBar from './SearchBar'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
// Edited from react bootstrap docs

function AppNavbar(){
    const navigate = useNavigate()
    const { isLoggedIn, logout } = useAuth()
    // !! converts the value to a boolean - if token exists = true, if null = false

    // logout
    const handleLogout = () => {
        logout() // handles localStorage and state in one go
        navigate('/RegisterPage')
    }

    return(
        <Navbar expand="lg" className='app-nav'>
            <Container className='app-nav_inner ms-0 ps-0'>
                <Navbar.Toggle aria-controls='app-navbar-nav' className='app-nav_toggle'/>

                <Navbar.Collapse id='app-navbar-nav'>
                    <Nav className='app-nav_links flex-column align-items-start'>
                        <Nav.Link as={NavLink} to="/" className='app-nav_link'>
                            <span className='app-nav_label'>Discover</span>
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/LibraryPage" className='app-nav_link'>
                            <span className='app-nav_label'>Library</span>
                        </Nav.Link>
                        <NavSearchBar />
                        <Nav.Link as={NavLink} to="/RegisterPage" className='app-nav_link'>
                            {isLoggedIn
                                ? <button style={{border: "none", backgroundColor: "#FDFFF8"}} className='app-nav_label app-nav_register-label' onClick={handleLogout}>Logout</button>
                                : <span className='app-nav_label app-nav_register-label'>Register</span>
                            }
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default AppNavbar