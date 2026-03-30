import { useState } from "react";
import '../stylesheets/Navbar.css'

function NavSearchBar(){
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = (e) => {
        setQuery(e.target.value);
        // replace this code with logic that queries comic vine api
        if (e.target.value.length > 0) {
            setResults(['Result 1', 'Result 2', 'Result 3']);
        } else {
            setResults([]);
        }
    };

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
                />
            ) : (
                <span className='app-nav_link app-nav_search-trigger' onClick={() => setSearchOpen(true)}>
                    Search...
                </span>
            )}

            {/* displaying search results */}
            {results.length > 0 && (
                <ul className='app-nav_search-results'>
                    {results.map((r, i) => (
                        <li key={i} className='app-nav_search-result'>{r}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default NavSearchBar