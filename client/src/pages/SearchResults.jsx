import { useState } from "react";
import AppNavbar from "../components/Navbar"
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function SearchResultsPage (){
    const [results, setResults] = useState([]);
    // had to grab this from claude as i was getting the wrong results returned
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q'); // reads ?q="user's search" from the URL
    
    const [inputValue, setInputValue] = useState(query || ''); // this is used to store the orginal search to allow for an edit search

    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter' && e.target.value.length > 2) {
            setSearchParams({ q: e.target.value }); // updates the URL which triggers useEffect
        }
    };

    useEffect(() => {
        setInputValue(query || ''); // sync input when URL changes

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
                <div id="search-results_inner">
                    <input
                        type='text'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleSearch}
                        className='search-results_searchbar'
                    />
                    <ul className='search-results'>
                        {results.map((item, i) => (
                            <li key={i} className='search-result' onClick={() => navigate(`/info/${item.id}?type=${item.resource_type}`)}>
                                <img 
                                    src={item.image?.icon_url} 
                                    alt={item.name}
                                    className='search-result-img'
                                />
                                <span className='result-name'> {item.name}, {item.volume?.name}</span>
                                {/* <span className='result-type'>{item.resource_type}</span> */}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        
        </>
    )
}

export default SearchResultsPage