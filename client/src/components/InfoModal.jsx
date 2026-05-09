import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

function InfoModal ({ title, items, onClose }){
    const navigate = useNavigate();
    
    return createPortal(
        <div className='info-modal-backdrop' onClick={onClose}>
            <div className='info-modal-content' onClick={(e) => e.stopPropagation()}>
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
        </div>,
        document.body // renders directly on body, outside any flex containers
    )
};

export default InfoModal;