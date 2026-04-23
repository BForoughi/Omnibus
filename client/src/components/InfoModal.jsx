import { useNavigate } from "react-router-dom";

function InfoModal ({ title, items, onClose }){
    const navigate = useNavigate();
    return(
        <div className='modal-backdrop' onClick={onClose}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <hr />
                <div className='creators-grid'>
                    {items?.map((item, i) => (
                        <div 
                            key={i} 
                            className='creator-item'
                            onMouseDown={() => {
                                navigate(`/info/${item.id}?type=${title === 'Characters' ? 'character' : 'person'}`);
                                onClose();
                            }}
                        >
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