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

    


    return
}

export default Library