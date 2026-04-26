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


    return
}

export default Library