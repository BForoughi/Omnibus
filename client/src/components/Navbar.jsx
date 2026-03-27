import {Navbar, Nav, Container} from 'react-bootstrap'
import {NavLink} from 'react-router-dom'
import "../stylesheets/Navbar.css"
// Taken from react bootstrap docs

function AppNavbar(){
    return(
        <Navbar expand="lg" className='app-nav'>
            <Container className='app-nav_inner'>
                <Navbar.Toggle aria-controls='app-navbar-nav' className='app-nav_toggle'/>

                <Navbar.Collapse id='app-navbar-nav'>
                    <Nav className='app-nav_links ms-auto'>
                        <Nav.Link as={NavLink} to="/" className='app-nav_link'>
                            <span className='app-nav_label'>Discover</span>
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/LibraryPage" className='app-nav_link'>
                            <span className='app-nav_label'>Library</span>
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/RegisterPage" className='app-nav_link'>
                            <span className='app-nav_label'>Register</span>
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default AppNavbar