import AppNavbar from "../components/Navbar";
import Banner from "../components/Banner";
import landingPageComics from '../assets/landingpageComics.png';
import ComicCard from "../components/ComicCard";


function Discover(){
    return(
        <>
            <AppNavbar/>
            <Banner />
            <p id="slogan">Discover Your Favourite Comic Book Series</p>
            <div id="landingcomics-container" className="d-flex justify-content-center">
                <img src={landingPageComics} alt="Five randomly chosen comics from a couple different publishers fanned out together" id="landingPageComics"/>
            </div>
            <ComicCard image="https://comicvine.gamespot.com/a/uploads/scale_small/11156/111567728/8895271-batman-failsafev1%282023%29.jpg" name="Batman Vol. 1"/>
        </>
        
    )
}

export default Discover