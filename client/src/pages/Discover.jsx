import AppNavbar from "../components/Navbar";
import Banner from "../components/Banner";
import landingPageComics from '../assets/landingpageComics.png';
import ComicCard from "../components/ComicCard";
import { useState, useEffect } from 'react';
import ComicCarousel from "../components/ComicCarousel";

function Discover(){
    const [featured, setFeatured] = useState([]);
    const [popular, setPopular] = useState([]);
    const [recent, setRecent] = useState([]);
    const [series, setSeries] = useState([]);

    useEffect(() => {
        const fetchDiscover = async () => {
            try{
                const res = await fetch('/api/discover');
                const data = await res.json();

                setFeatured(data.featured)
                setPopular(data.popular)
                setRecent(data.recent)
                setSeries(data.series)
            } catch (err) {
                console.error('Failed to fetch discover data:', err);
            }
        }

        fetchDiscover();
    }, [])
    
    return(
        <>
            <AppNavbar/>
            <Banner />
            <p id="slogan">Discover Your Favourite Comic Book Series</p>
            <div id="landingcomics-container" className="d-flex justify-content-center">
                <img src={landingPageComics} alt="Five randomly chosen comics from a couple different publishers fanned out together" id="landingPageComics"/>
            </div>
            
            <div className="discover-container">
                <section className="discover-section">
                    <div className="discover-header_container">
                        <h2 className="discover-header">Featured</h2>
                    </div>
                    <div className="featured-wrapper">
                        <div className="discover-row featured-row">
                            {featured.map((comic, i) => (
                                <ComicCard 
                                    key={i}
                                    image={comic.image?.medium_url}
                                    name={comic.name}
                                    volume={comic.volume?.name}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="discover-section">
                    <div className="discover-header_container">
                        <h2 className="discover-header">Recent</h2>
                    </div>
                    <ComicCarousel comics={recent}/>
                    
                </section>

                <section className="discover-section">
                    <div className="discover-header_container">
                        <h2 className="discover-header">Popular</h2>
                    </div>
                    <ComicCarousel comics={popular}/>
                </section>

                <section className="discover-section">
                    <div className="discover-header_container">
                        <h2 className="discover-header">Series</h2>
                    </div>
                    <ComicCarousel comics={series}/>
                </section>
            </div>
        </>
        
    )
}

export default Discover