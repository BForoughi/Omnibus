import AppNavbar from "../components/Navbar"
import Banner from "../components/Banner"
import landingPageComics from '../assets/landingpageComics.png'

function Discover(){
    return(
        <>
            <AppNavbar/>
            <Banner />
            <p id="slogan">Discover Your Favourite Comic Book Series</p>
            <div id="landingcomics-container" className="d-flex justify-content-center">
                <img src={landingPageComics} alt="Five randomly chosen comics from a couple different publishers fanned out together" id="landingPageComics"/>
            </div>
            
        </>
        
    )
}

export default Discover