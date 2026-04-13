import '../stylesheets/DisplayingComics.css'

function ComicCard({ image, name, volume }){
    return(
        <div className="comic-card col-3">
            <img src={image} alt="name" className="comic-card_img" />
            {volume ? <p className='comic-card_name'>{volume}: {name}</p> : <p className="comic-card_name">{name}</p>}
            
        </div>
    )
}

export default ComicCard