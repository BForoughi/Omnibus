import AppNavbar from "../components/Navbar"
import ScrollToTop from "../components/ScrollTo"
import '../stylesheets/App.css'

function HowToUse(){
    return (
        <div className="information-page_container">
            <AppNavbar />
            <div className="howto-container">
                <h1 className="information-title">How to Use Omnibus</h1>

                <div className="howto-inner">

                    <div className="howto-section">
                        <h2 className="howto-section_title">Welcome to Omnibus</h2>
                        <p>Omnibus is a comic book discovery platform where you can explore comics, build a personal library and leave reviews. Here's how to get the most out of it.</p>
                    </div>

                    <div className="howto-section">
                        <h2 className="howto-section_title">Creating an Account</h2>
                        <p>To access the full features of Omnibus you'll need an account. Click <span className="howto-highlight">Register</span> in the navigation menu and choose a username and password. If you already have an account click <span className="howto-highlight">Login</span> instead. Once logged in you'll have access to your library and the ability to leave reviews.</p>
                    </div>

                    <div className="howto-section">
                        <h2 className="howto-section_title">Discovering Comics</h2>
                        <p>The Discover page is your home for finding new comics. It is split into four sections: <span className="howto-highlight">Featured</span>, <span className="howto-highlight">Recent</span>, <span className="howto-highlight">Popular</span> and <span className="howto-highlight">Series</span>. Use the section links at the top to jump straight to what interests you. Click any comic cover to open its information page.</p>
                    </div>

                    <div className="howto-section">
                        <h2 className="howto-section_title">Searching for Comics</h2>
                        <p>Use the search bar in the navigation menu to search for comics, volumes, characters and publishers. Results will appear as a dropdown as you type. For a full results page press Enter or click the search icon.</p>
                    </div>

                    <div className="howto-section">
                        <h2 className="howto-section_title">Comic Information Page</h2>
                        <p>Clicking any comic will take you to its information page where you can read a description, view creators and characters, see issue details and browse related issues in the same series. From here you can also save the comic to your library.</p>
                    </div>

                    <div className="howto-section">
                        <h2 className="howto-section_title">Your Library</h2>
                        <p>Your library stores all the comics you have saved. You can filter your library by <span className="howto-highlight">All Comics</span>, <span className="howto-highlight">Recently Added</span>, <span className="howto-highlight">Read</span> and <span className="howto-highlight">Unread</span>. Click the tick next to any comic title to mark it as read or unread. Click a comic cover to go back to its information page.</p>
                    </div>

                    <div className="howto-section">
                        <h2 className="howto-section_title">Reviews</h2>
                        <p>On any comic or volume information page you can read reviews left by other users. If you are logged in you can add your own review by clicking <span className="howto-highlight">Add a Review</span>, giving it a title and writing your thoughts. You can also reply to other users reviews to start a discussion. You can delete your own reviews and replies at any time.</p>
                    </div>

                </div>
            </div>
            <ScrollToTop />
        </div>
    )
}

export default HowToUse