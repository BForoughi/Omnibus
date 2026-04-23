import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AppNavbar from "../components/Navbar";
import '../stylesheets/App.css'
import InfoModal from "../components/InfoModal";

function InformationPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");

    const [resource, setResource] = useState(null);

    useEffect(() => {
        const fetchComic = async () => {
        try {
            const res = await fetch(`/api/info/${id}?type=${type}`);
            const data = await res.json();
            setResource(data);
        } catch (err) {
            console.error(err);
        }
        };

        fetchComic();
    }, [id, type]);


    const [expanded, setExpanded] = useState(false);
    
    const [activeModal, setActiveModal] = useState(null);

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

    return(
        <div className="information-page_container">
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
                            />
                            ) : (
                                <p>{shortenedDescription}...</p>
                            )}

                            

                            <div className="d-flex justify-content-between">
                                <div className="modal-btn_container">
                                    <button className="info-btns" id="creators-btn" onClick={() => setActiveModal('creators')}>View Creators</button>
                                    <button className="info-btns" onClick={() => setActiveModal('characters')}>View Characters</button>
                                </div>
                                <button className="info-btns" onClick={() => setExpanded(!expanded)}>
                                    {expanded ? "Show less" : "Read more"}
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

                {/* reviews section */}
            </div>
        </div>
    )
}

export default InformationPage;
