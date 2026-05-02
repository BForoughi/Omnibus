import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AppNavbar from "../components/Navbar";
import '../stylesheets/App.css'
import '../stylesheets/Reviews.css'
import InfoModal from "../components/InfoModal";
import { useAuth } from '../context/AuthContext';
import ComicCarousel from "../components/ComicCarousel";

function InformationPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");

    const [resource, setResource] = useState(null);

    // reviews usestates
    const [reviews, setReviews] = useState([])
    const [reviewTitle, setReviewTitle] = useState('')
    const [reviewBody, setReviewBody] = useState('')
    const [replyingTo, setReplyingTo] = useState(null) // stores the id of review being replied to
    const [replyBody, setReplyBody] = useState('')
    const [reviewError, setReviewError] = useState(null)
    const { isLoggedIn } = useAuth()
    const [showReviewForm, setShowReviewForm] = useState(false)

    const [seriesIssues, setSeriesIssues] = useState([])

    const fetchSeriesIssues = async (volumeId) => {
        try {
            const res = await fetch(`/api/volume/${volumeId}/issues`)
            const data = await res.json()
            if(data.success) setSeriesIssues(data.issues)
        } catch(err) {
            console.error("Failed to fetch series issues:", err)
        }
    };

    useEffect(() => {
        const fetchComic = async () => {
        try {
            const res = await fetch(`/api/info/${id}?type=${type}`);
            const data = await res.json();
            setResource(data);

            // fetch series issues if applicable
            if(type === 'volume') fetchSeriesIssues(id)
            if(type === 'issue' && data.volume?.id) fetchSeriesIssues(data.volume.id)
        } catch (err) {
            console.error("Failed to fetch comics:", err);
        }
        };

        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews/${id}`)
                const data = await res.json();
                if(data.success) setReviews(data.reviews)
            } catch(err) {
                console.error("Failed to fetch reviews:", err)
            }
        };

        fetchComic();
        fetchReviews();
    }, [id, type]);


    const [expanded, setExpanded] = useState(false);
    
    const [activeModal, setActiveModal] = useState(null);
    const [saved, setSaved] = useState(false)
    const [saveError, setSaveError] = useState(null)

    if (!resource) return (<div className="d-flex justify-content-center"><h3>Loading your request as fast as we can...</h3></div>);

    // const shortenedDescription = resource.description.slice(0, 350);

    const stripHTML = (html = "") => {
        const div = document.createElement("div");
        div.innerHTML = html;
            return div.textContent || div.innerText || "";
        };

    const plainText = stripHTML(resource.description);
    const shortenedDescription = plainText.slice(0, 350);

    // wanted to have different image styling for publishers
    const elementId = type === "publisher" ? "publisher-image" : "resource-image";

    const handleSave = async () => {
        const token = localStorage.getItem('token')
        if(!token) return setSaveError('You need to be logged in to save comics')

        try {
            const res = await fetch('/api/library', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    comicId: String(resource.id),
                    comicName: resource.volume ? `${resource.volume.name}: ${resource.name}` : resource.name, // .volume means its an issue and is apart of a volume
                    type: type,
                    coverImage: resource.image?.medium_url,
                    issueNumber: resource.issue_number || null,
                    publisher: resource.volume?.publisher?.name || null
                })
            })
            const data = await res.json()

            if(data.success){
                setSaved(true)
            } else {
                setSaveError(data.message) // e.g. "Already in library"
            }
        } catch(err) {
            console.error("Save error:", err)
            setSaveError('Something went wrong')
        }
    };

    // review POST
    const handleReview = async () => {
        const token = localStorage.getItem('token')
        if(!token) return setReviewError('You need to be logged in to leave a review')
        if(!reviewTitle || !reviewBody) return setReviewError('Please fill in all fields')

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    comicId: String(resource.id),
                    comicType: type,
                    title: reviewTitle,
                    body: reviewBody,
                    parentId: null // top level review
                })
            })
            const data = await res.json()

            if(data.success){
                setReviews(prev => [...prev, data.review]) // add new review to state without refetching
                setReviewTitle('')
                setReviewBody('')
                setReviewError(null)
                setShowReviewForm(false)
            }
        } catch(err) {
            console.error("Review error:", err)
            setReviewError('Something went wrong')
        }
    };

    const handleReply = async (parentId) => {
        const token = localStorage.getItem('token')
        if(!token) return setReviewError('You need to be logged in to reply')
        if(!replyBody) return setReviewError('Please write a reply')

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    comicId: String(resource.id),
                    comicType: type,
                    title: '', // replies dont need a title
                    body: replyBody,
                    parentId // the review being replied to
                })
            })
            const data = await res.json()

            if(data.success){
                setReviews(prev => [...prev, data.review]) // add reply to state
                setReplyingTo(null)
                setReplyBody('')
            }
        } catch(err) {
            console.error("Reply error:", err)
        }
    };

    const handleDeleteReview = async (reviewId) => {
        const token = localStorage.getItem('token')

        try {
            const res = await fetch(`/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()

            if(data.success){
                // remove from state without refetching
                setReviews(prev => prev.filter(r => r._id !== reviewId))
            }
        } catch(err) {
            console.error("Delete review error:", err)
        }
    };

    // this next function - renderReplies was taken from claude.ai I explained that replies would show but not replies of replies but they were being stored and I couldn't figure out why they wouldn't appear
    // so I asked what to do and showed it what i already had and it gave me this function to add
    const renderReplies = (parentId) => {
        const children = reviews.filter(r => String(r.parentId) === String(parentId))
        if(children.length === 0) return null

        return children.map(reply => (
            <div key={reply._id} className="reply-card">
                <div className="d-flex align-items-center gap-2">
                    <span className="review-username">{reply.username}:</span>
                    {isLoggedIn && reply.username === JSON.parse(localStorage.getItem('user'))?.username && (
                        <button 
                            className="review-delete-btn"
                            onClick={() => handleDeleteReview(reply._id)}
                        >
                            Delete
                        </button>
                    )}
                </div>
                <p className="review-body">{reply.body}</p>

                {isLoggedIn && (
                    <button
                        className="review-reply-btn"
                        onClick={() => setReplyingTo(replyingTo === reply._id ? null : reply._id)}
                    >
                        {replyingTo === reply._id ? 'Cancel' : 'Reply'}
                    </button>
                )}

                {replyingTo === reply._id && (
                    <div className="reply-form">
                        <textarea
                            className="review-input review-textarea"
                            placeholder="Write your reply..."
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                        />
                        <button className="info-btns" onClick={() => handleReply(reply._id)}>
                            Post Reply
                        </button>
                    </div>
                )}

                {/* recursively render replies to this reply */}
                {renderReplies(reply._id)}
            </div>
        ))
    }
    // -------------END-----------------

    return(
        <div className="information-page_container sticky-nav">
            <AppNavbar/>

            {/* -------MODAL CODE ------- */}
            {activeModal === 'creators' && (
                <InfoModal 
                    title="Creators" 
                    items={resource.person_credits} 
                    onClose={() => setActiveModal(null)} 
                />
            )}

            {activeModal === 'characters' && (
                <InfoModal 
                    title="Characters" 
                    items={resource.character_credits} 
                    onClose={() => setActiveModal(null)} 
                />
            )}

            <div className="information-page_inner">
                <div className="information-page_information-section">
                    {resource.volume ? (
                        <h1 className="information-title">{resource.volume?.name}: {resource.name}</h1>
                    ) : (
                        <h1 className="information-title">{resource.name}</h1>
                    )}

                    <div className="information-section_content d-flex gap-3">
                        <img id={elementId} src={resource.image?.medium_url} alt={resource.name} />
                        <div className="description">
                            {resource.deck && <p>{resource.deck}</p>}
                            {/* comic vine api returns html so this is needed - taken from chatgpt when i searched what is comic vines description return name */}
                            {expanded ? (
                                <div className="description-data"
                                    dangerouslySetInnerHTML={{ __html: resource.description }}
                                    onClick={(e) => {
                                        if (e.target.tagName === 'A') {
                                            e.preventDefault();
                                            const href = e.target.getAttribute('href');
                                            window.open(`https://comicvine.gamespot.com${href}`, '_blank');
                                        }
                                    }}
                            />
                            ) : (
                                <p>{shortenedDescription}...</p>
                            )}

                            <div className="d-flex justify-content-between info-btns_container">
                                {(type === "issue" || type === "volume") && 
                                    <div className="modal-btn_container">
                                        <button className="info-btns margin-btns" onClick={() => setActiveModal('creators')}>View Creators</button>
                                        <button className="info-btns margin-btns" onClick={() => setActiveModal('characters')}>View Characters</button>

                                        {/* save to library button */}
                                        <button 
                                            className="info-btns" 
                                            onClick={handleSave}
                                            disabled={saved}
                                        >
                                            {saved ? '✓ Saved' : 'Save to Library'}
                                        </button>
                                        {saveError && <p style={{color: 'red', fontSize: '0.8rem'}}>{saveError}</p>}
                                    </div>
                                }
                                
                                {expanded && (
                                    <div style={{
                                        position: 'fixed',
                                        bottom: '2rem',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        zIndex: 1000,
                                    }}>
                                        <button style={{backgroundColor: '#3d3d3d', borderRadius: '5px', padding: '10px 15px'}} className="info-btns" onClick={() => setExpanded(false)}>
                                            Show less
                                        </button>
                                    </div>
                                )}

                                <button className="info-btns" onClick={() => setExpanded(true)} style={{ display: expanded ? 'none' : 'inline-block' }}>
                                    Read more
                                </button>
                            </div>

                            {(type === "issue" || type === "volume") &&
                                <div className="details">
                                    <h2>Issue Details</h2>
                                    <div className="d-flex justify-content-between">
                                        <div className="details-headers">
                                            <p>Name: </p>
                                            <p>Issues: </p>
                                            <p>Cover Date: </p>
                                        </div>
                                        <div className="details-info">
                                            <p>{resource.name}</p>
                                            <p>{resource.issue_number ? resource.issue_number : "-/-"}</p>
                                            <p>{resource.cover_date ? new Date(resource.cover_date).toLocaleDateString('en-GB') : "-/-"}</p>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                {/* series issues panel */}
                {seriesIssues.length > 0 && (
                    <div className="series-panel">
                        <h2 className="series-panel_title">
                            {type === 'volume' ? 'Issues in this Series' : `Related issues for: ${resource.volume?.name}`}
                        </h2>
                        <ComicCarousel comics={seriesIssues} />
                    </div>
                )}

                {/* reviews section */}
                {(type === 'issue' || type === 'volume') && (
                    <div className="reviews-section">
                        <div className="reviews-header d-flex justify-content-between align-items-center">
                            <h2 className="reviews-title">User Reviews</h2>
                        </div>

                        {/* add a review form - only shown when logged in */}
                        {isLoggedIn && (
                            <div>
                                <button 
                                    className="info-btns" 
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                >
                                    {showReviewForm ? 'Cancel' : 'Add a Review'}
                                </button>

                                {showReviewForm && (
                                    <div className="review-form">
                                        <input
                                            className="review-input"
                                            type="text"
                                            placeholder="Review title"
                                            value={reviewTitle}
                                            onChange={(e) => setReviewTitle(e.target.value)}
                                        />
                                        <textarea
                                            className="review-input review-textarea"
                                            placeholder="Write your review..."
                                            value={reviewBody}
                                            onChange={(e) => setReviewBody(e.target.value)}
                                        />
                                        {reviewError && <p style={{color: 'red', fontSize: '0.8rem'}}>{reviewError}</p>}
                                        <button className="info-btns" onClick={handleReview}>Post Review</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* reviews list */}
                        <div className="reviews-list">
                            {reviews.filter(r => !r.parentId).length === 0 ? (
                                <p>No reviews yet — be the first!</p>
                            ) : (
                                reviews
                                    .filter(r => !r.parentId) // top level reviews only
                                    .map(review => (
                                        <div key={review._id} className="review-card">
                                            {/* review header */}
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="review-username">{review.username}:</span>
                                                {isLoggedIn && review.username === JSON.parse(localStorage.getItem('user'))?.username && (
                                                    <button 
                                                        className="review-delete-btn"
                                                        onClick={() => handleDeleteReview(review._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>

                                            <h4 className="review-card-title">{review.title}</h4>
                                            <p className="review-body">{review.body}</p>

                                            {/* reply button */}
                                            {isLoggedIn && (
                                                <button 
                                                    className="review-reply-btn"
                                                    onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
                                                >
                                                    {replyingTo === review._id ? 'Cancel' : 'Reply'}
                                                </button>
                                            )}

                                            {/* inline reply form */}
                                            {replyingTo === review._id && (
                                                <div className="reply-form">
                                                    <textarea
                                                        className="review-input review-textarea"
                                                        placeholder="Write your reply..."
                                                        value={replyBody}
                                                        onChange={(e) => setReplyBody(e.target.value)}
                                                    />
                                                    <button className="info-btns" onClick={() => handleReply(review._id)}>
                                                        Post Reply
                                                    </button>
                                                </div>
                                            )}

                                            {/* replies */}
                                            <div className="replies-list">
                                                {renderReplies(review._id)}
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}
                
                {/* btm */}
            </div>
        </div>
    )
}

export default InformationPage;
