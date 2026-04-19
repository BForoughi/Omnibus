import { useState } from "react";
import AppNavbar from "../components/Navbar"
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function SearchResultsPage (){
    const [results, setResults] = useState([]);
    // had to grab this from claude as i was getting the wrong results returned
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q'); // reads ?q=batman from the URL

    useEffect(() => {
        if (!query) return;

        const fetchData = async () => {
            try{
                const response = await fetch(`/api/search?query=${query}}&type=full`);
                const data = await response.json();
                setResults((data.results || []).slice(0, 15));
            } catch(err){
                console.error('Failed', err)
            }
        }
        fetchData();
    }, [query]); // refetches when the query (search) is changed
    
    return(
        <>
            <div id="search-results_container">
                <AppNavbar/>
                <ul className='search-results'>
                    {results.map((item, i) => (
                        <li key={i} className='search-result'>
                            <img 
                                src={item.image?.icon_url} 
                                alt={item.name}
                                className='search-result-img'
                            />
                            <span className='result-name'> {item.name}, {item.volume?.name} - </span>
                            <span className='result-type'>{item.resource_type}</span>
                        </li>
                    ))}
                </ul>
            </div>
        
        </>
    )
}

export default SearchResultsPage