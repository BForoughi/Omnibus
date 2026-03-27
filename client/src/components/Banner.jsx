import '../stylesheets/App.css'

export default function Banner(){
    return(
        <div className="banner-container">
            <div className="banner-wrapper">
                <div className="bracket bracket-tl" />
                <div className="bracket bracket-tr" />
                <div className="banner-inner">
                    <h1>OMNIBUS</h1>
                </div>
                <div className="bracket bracket-bl" />
                <div className="bracket bracket-br" />
            </div>
        </div>
        
    )
}