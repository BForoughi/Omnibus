import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AppNavbar from "../components/Navbar";
import '../stylesheets/DisplayingComics.css'

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

    

    if (!resource) return <div>Loading...</div>;

    return(
        <div className="information-page_container">
            <AppNavbar/>
            <div className="information-page_inner">
                <div className="information-page_information-section">
                    <h1 className="discover-header">{resource.name}</h1>
                </div>
            </div>
        </div>
    )
}

export default InformationPage;
