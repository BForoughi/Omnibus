// this was taken from claude.ai - where i asked if there way a industry standard 
// for a loading screen when waiting for data to load

function ComicCardSkeleton() {
    return (
        <div className='comic-card skeleton'>
            <div className='skeleton-img' />
            <div className='skeleton-text' />
            <div className='skeleton-text skeleton-text--short' />
        </div>
    );
}

export default ComicCardSkeleton