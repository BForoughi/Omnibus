import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import AppNavbar from '../components/Navbar'

function Library(){
    const { isLoggedIn } = useAuth()
    const [comics, setComics] = useState([])
    const [filter, setFilter] = useState('all') // tracks active filter
    const [publishers, setPublishers] = useState([]) // unique publishers from library
    const [selectedPublisher, setSelectedPublisher] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLibrary()
    }, []);

    const fetchLibrary = async () => {
        try{
            const token = localStorage.getItem('token')
            const res = await fetch('/api/library', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()

            if(data.success){
                setComics(data.comics)
                // extract unique publishers from saved comics
                const uniquePublishers = [...new Set( // this line was taken from claude as it suggested it during error testing as to not create duplicates
                    data.comics
                        .filter(c => c.publisher) // only ones that have a publisher
                        .map(c => c.publisher)
                )]
                setPublishers(uniquePublishers)
            }
        }catch (err) {
            console.error("Failed to fetch library:", err)
        } finally {
            setLoading(false)
        }
    }

    // returns the correct comics based on active filter
    const getFilteredComics = () => {
        switch(filter) { // I stumbled across a "switch" when scrolling on tiktok but forgot the save the video to reference
            case 'recent':
                return [...comics].sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                )
            case 'read':
                return comics.filter(c => c.read)
            case 'unread':
                return comics.filter(c => !c.read)
            case 'publisher':
                return comics.filter(c => c.publisher === selectedPublisher)
            default:
                return comics // all comics
        }
    }

    // changes the header based on the active filter
    const getTitle = () => {
        switch(filter) {
            case 'recent': return 'Recently Added'
            case 'read': return 'Read Comics'
            case 'unread': return 'Unread Comics'
            case 'publisher': return selectedPublisher
            default: return 'All Comics'
        }
    }

    // a toggle that tells the user if they've read the comic or not
    const toggleRead = async (id, a) => {
        a.stopPropagation() // this stops anything behing the button being clicked or set off

        const token = localStorage.getItem('token')
        // patch request - the backend handles the toggle change already
        const res = await fetch(`/api/library/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if(data.success){
            // this updates just the one comic state so it doesnt refetch the whole page
            setComics(prev => prev.map(c => // prev is the current state
                c._id === id ? { ...c, read: data.read } : c // ": c" means all the other comics not changed stays the same
            ))
        }
    }

    const filtered = getFilteredComics()

    return (
        <div className="d-flex gap-5">
            <AppNavbar />
            <div className="library-container">
                <h1 className="library-main-title discover-header">Library</h1>

                {/* filter bar */}
                <div className="library-filters d-flex gap-2">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Comics
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'recent' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('recent')}
                    >
                        Recent
                    </button>

                    {/* publishers dropdown */}
                    <div className="dropdown">
                        <button 
                            className={`filter-btn dropdown-toggle ${filter === 'publisher' ? 'filter-btn--active' : ''}`}
                            data-bs-toggle="dropdown"
                        >
                            Publishers
                        </button>
                        <ul className="dropdown-menu">
                            {publishers.map(p => (
                                <li key={p}>
                                    <button 
                                        className="dropdown-item"
                                        onClick={() => {
                                            setFilter('publisher')
                                            setSelectedPublisher(p)
                                        }}
                                    >
                                        {p}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button 
                        className={`filter-btn ${filter === 'read' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('read')}
                    >
                        Read
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'unread' ? 'filter-btn--active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                    </button>
                </div>

                {/* dynamic title */}
                <h1 className="library-filter-title discover-header">{getTitle()}</h1>

                {/* comics grid */}
                {loading ? (
                    <p>Loading...</p>
                ) : filtered.length === 0 ? (
                    <p>No comics found</p>
                ) : (
                    <div className="library-grid">
                        {filtered.map(comic => (
                            <div key={comic._id} className="library-card">
                                <img 
                                    src={comic.coverImage} 
                                    alt={comic.title}
                                    className="library-card_img"
                                />
                                <div className="library-card_info d-flex justify-content-between align-items-center">
                                    <span className="library-card_title">{comic.title}</span>
                                    {/* read/unread tick */}
                                    <button 
                                        className={`read-btn ${comic.read ? 'read-btn--read' : ''}`}
                                        onClick={(e) => toggleRead(comic._id, e)}
                                        title={comic.read ? 'Mark as unread' : 'Mark as read'}
                                    >
                                        ✓
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}



export default Library