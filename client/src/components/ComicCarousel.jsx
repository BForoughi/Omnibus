import ComicCard from "./ComicCard";
import '../stylesheets/DisplayingComics.css'
import { useRef, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

export default function ComicCarousel ({ comics }){
    const scrollRef = useRef(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    const handleScroll = () => {
        const scrollState = scrollRef.current;
        setAtStart(scrollState.scrollLeft === 0);
        setAtEnd(scrollState.scrollLeft + scrollState.offsetWidth >= scrollState.scrollWidth - 1)
    }
    
    // these scrolls work by measuring the width of a card and then added the width of the gap
    // to know exactly how much to scroll over
    const scrollLeft = () => {
        // so the user cant spam click and mess up the measuring of the carousel
        if (isScrolling) return;  // ignore clicks while scrolling
        setIsScrolling(true);

        const card = scrollRef.current.querySelector('.comic-card');
        const cardWidth = card.offsetWidth + 17; // card + gap
        scrollRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });

        // update state immediately on click
        const scrollState = scrollRef.current;
        setAtStart(scrollState.scrollLeft - cardWidth <= 0);
        setAtEnd(false);

        setTimeout(() => setIsScrolling(false), 300);  // matched to the scroll animation duration
    }

    const scrollRight = () => {
        if (isScrolling) return; 
        setIsScrolling(true);

        const card = scrollRef.current.querySelector('.comic-card');
        const cardWidth = card.offsetWidth + 17;
        scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });

        // update state immediately on click
        const scrollState = scrollRef.current;
        setAtStart(false);
        setAtEnd(scrollState.scrollLeft + cardWidth + scrollState.offsetWidth >= scrollState.scrollWidth - 1);

        setTimeout(() => setIsScrolling(false), 300);
    };

    const navigate = useNavigate();
    
    return(
        <div className="carousel-wrapper">
                <button className={`carousel-btn carousel-btn--left ${atStart ? 'hidden' : ''}`} onClick={scrollLeft}>
                    &#8249;
                </button>

            <div className="discover-row carousel-track" ref={scrollRef}>
                {comics.map((comic, i) => (
                    <Link key={i} to={`/info/${comic.id}?type=${comic.resource_type}`} style={{ textDecoration: 'none' }}>
                        <ComicCard 
                            image={comic.image?.medium_url}
                            volume={comic.volume?.name}
                            name={comic.name}
                        />
                    </Link>
                ))}
            </div>

                <button className={`carousel-btn carousel-btn--right ${atEnd ? 'hidden' : ''}`}  onClick={scrollRight}>
                    &#8250;
                </button>
        </div>
    )
}