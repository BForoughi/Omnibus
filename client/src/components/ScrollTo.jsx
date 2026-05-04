import { useState, useEffect } from 'react'
import '../stylesheets/App.css'

function ScrollToTop(){
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            // show button when user is 400px from the bottom
            const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 400
            setVisible(scrolledToBottom)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if(!visible) return null

    return (
        <button className="scroll-to-top" onClick={scrollToTop}>
            ↑
        </button>
    )
}

export default ScrollToTop;