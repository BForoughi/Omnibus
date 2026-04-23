function InfoModal ({ title, items, onClose }){
    return(
        <div className='modal-backdrop' onClick={onClose}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <hr />
                <div className='creators-grid'>
                    {items?.map((item, i) => (
                        <div key={i} className='creator-item'>
                            <div>
                                <p className='creator-name'>{item.name}</p>
                                <p className='creator-role'>{item.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default InfoModal;