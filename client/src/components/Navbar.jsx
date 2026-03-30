import {Navbar, Nav, Container} from 'react-bootstrap'
import {NavLink} from 'react-router-dom'
import "../stylesheets/Navbar.css"
import NavSearchBar from './SearchBar'
// Edited from react bootstrap docs

function AppNavbar(){
    return(
        <Navbar expand="lg" className='app-nav'>
            <Container className='app-nav_inner ms-0 ps-0'>
                <Navbar.Toggle aria-controls='app-navbar-nav' className='app-nav_toggle'/>

                <Navbar.Collapse id='app-navbar-nav'>
                    <Nav className='app-nav_links flex-column align-items-start'>
                        <Nav.Link as={NavLink} to="/" className='app-nav_link mb-2 ps-1'>
                            <span className='app-nav_label'>Discover</span>
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/LibraryPage" className='app-nav_link mb-2 ps-1'>
                            <span className='app-nav_label'>Library</span>
                        </Nav.Link>
                        <NavSearchBar />
                        <Nav.Link as={NavLink} to="/RegisterPage" className='app-nav_link ps-1'>
                            <span className='app-nav_label'>Register</span>
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default AppNavbar