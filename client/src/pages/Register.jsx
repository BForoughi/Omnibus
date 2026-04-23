import AppNavbar from "../components/Navbar"
import { useState } from "react";

function Register(){
    const [activeTab, setActiveTab] = useState('register'); // 'login' or 'register'

    return(
        <div className="d-flex">
            <AppNavbar/>
            <div className="register-container d-flex justify-content-center align-items-center">
                <div className="register-container_inner">
                    <div className="register-title_container d-flex justify-content-center align-items-center mb-5">
                        <h1 
                            className={`reg-titles ${activeTab === 'login' ? 'reg-title--active' : 'reg-title--inactive'}`}
                            onClick={() => setActiveTab('login')}
                        >
                            Login
                        </h1>
                        <div className='auth-divider' />
                        <h1 
                            className={`reg-titles ${activeTab === 'register' ? 'reg-title--active' : 'reg-title--inactive'}`}
                            onClick={() => setActiveTab('register')}
                        >
                            Register
                        </h1>
                    </div>

                    <div className="register-inputs_container">
                        <input className="register-input" type="text" placeholder="Username"/>
                        <input className="register-input" type="password" placeholder="Password"/>
                    </div>
                </div>
            </div>
        
        </div>
    )
}

export default Register