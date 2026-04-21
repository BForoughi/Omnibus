import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AppNavbar from "../components/Navbar";
import '../stylesheets/App.css'

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

    

    if (!resource) return (<div className="d-flex justify-content-center"><h3>Loading your request as fast as we can...</h3></div>);

    return(
        <div className="information-page_container">
            <AppNavbar/>
            <div className="information-page_inner">
                <div className="information-page_information-section">
                    {resource.volume ? (
                        <h1 className="information-title">{resource.volume?.name}: {resource.name}</h1>
                    ) : (
                        <h1 className="information-title">{resource.name}</h1>
                    )}

                    <div className="information-section_content d-flex gap-3">
                        <img id="resource-image" src={resource.image?.medium_url} alt={resource.name} />
                        <div className="description">
                            {resource.deck && <p>{resource.deck}</p>}
                            {/* comic vine api returns html so this is needed - taken from chatgpt when i searched what is comic vines description return name */}
                            <div
                                dangerouslySetInnerHTML={{ __html: resource.description }}
                            />

                        </div>
                    </div>
                </div>

                {/* reviews section */}
            </div>
        </div>
    )
}

export default InformationPage;
