import { useState } from "react";
import '../stylesheets/Navbar.css'
import { useNavigate } from "react-router-dom";

function NavSearchBar(){
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    // The function that proccesses the users search and sends it to the backend route to be quried to the api
    const handleSearch = async (e) => {
        const value = e.target.value; // storing the users input into "value"
        setQuery(value);

        // search after 3 characters
        if (value.length > 2) {
            try{
                const response = await fetch(`/api/search?query=${value}&type=nav`); // passing "value" through the search route
                const data = await response.json(); // receiving data
                setResults((data.results || []).slice(0, 5));
            } catch (err){
                console.error('Search failed', err)
            }
        } else {
            setResults([]);
        }
    };

    // function that allows the user to go to a full page of search results
    const navigate = useNavigate();
    const handleSearchEntered = (e) =>{
        if(e.key === 'Enter' && query.length > 2){
            navigate(`/SearchPage?q=${query}`);
            setSearchOpen(false);
            setQuery("")
            setResults([])
        }
    }

    return (
        <div className='app-nav_search'>
            {/* if searchOpen is true aka it has been clicked (look at the onClick) */}
            {searchOpen ? (
                // show input box
                <input
                    autoFocus
                    type='text'
                    placeholder='Search'
                    value={query}
                    onChange={handleSearch}
                    // used for when the user clicks away
                    onBlur={() => { setSearchOpen(false); setQuery(''); setResults([]); }}
                    className='app-nav_search-input'
                    onKeyDown={handleSearchEntered}
                />
            ) : (
                <div className="app-nav_link search-container">
                    <span className='app-nav_label app-nav_search-trigger' onClick={() => setSearchOpen(true)}>
                        Search...
                    </span>
                </div>
                
            )}

            {/* displaying search results */}
            {results.length > 0 && (
                <ul className='app-nav_search-results'>
                    {results.map((item, i) => (
                        <li key={i} className='app-nav_search-result'>
                            <img 
                                src={item.image?.icon_url} 
                                alt={item.name}
                                className='app-nav_search-result-img'
                            />
                            <span className='result-name'> {item.name}, {item.volume?.name} - </span>
                            <span className='result-type'>{item.resource_type}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default NavSearchBar