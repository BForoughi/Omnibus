import ComicCard from "./ComicCard";
import '../stylesheets/DisplayingComics.css'
import { useRef } from 'react';

export default function ComicCarousel ({ comics }){
    const scrollRef = useRef(null);
    
    // these scrolls work by measuring the width of a card and then added the width of the gap
    // to know exactly how much to scroll over
    const scrollLeft = () => {
        const card = scrollRef.current.querySelector('.comic-card');
        const cardWidth = card.offsetWidth + 17; // card + gap
        scrollRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }

    const scrollRight = () => {
        const card = scrollRef.current.querySelector('.comic-card');
        const cardWidth = card.offsetWidth + 17;
        scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    };

    return(
        <div className="carousel-wrapper">
            <button className='carousel-btn carousel-btn--left' onClick={scrollLeft}>
                &#8249;
            </button>

            <div className="discover-row carousel-track" ref={scrollRef}>
                {comics.map((comic, i) => (
                    <ComicCard 
                        key={i}
                        image={comic.image?.medium_url}
                        volume={comic.volume?.name}
                        name={comic.name}
                    />
                ))}
            </div>

            <button className='carousel-btn carousel-btn--right' onClick={scrollRight}>
                &#8250;
            </button>
        </div>
    )
}