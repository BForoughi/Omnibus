import AppNavbar from "../components/Navbar"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register(){
    const [activeTab, setActiveTab] = useState('register'); // 'login' or 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // sending the username and password to login route
    const handleLogin = async () => {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            // redirect to discover or home page after login
        } else {
            setError(data.message) // e.g. "Invalid username or password"
        }
    };

    const handleRegister = async () => {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            navigate('/')
        } else {
            setError(data.message) // e.g. "Username already taken"
        }
    };


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
                        <input className="register-input" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                        <input className="register-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>

                        {/* shows error message if login/register fails */}
                        {error && <p className="text-danger">{error}</p>}

                        <div className="d-flex justify-content-center">
                            {/* button changes based on active tab */}
                            {activeTab === 'login' 
                                ? <button className="register-btn" onClick={handleLogin}>Login</button>
                                : <button className="register-btn" onClick={handleRegister}>Register</button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        
        </div>
    )
}

export default Register