import '../src/stylesheets/App.css'
import { useState, useEffect } from 'react'
import Discover from "./pages/Discover"
import Library from "./pages/Library"
import Register from "./pages/Register"
import { Routes, BrowserRouter, Route } from "react-router-dom"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Discover />} />
        <Route path="/LibraryPage" element={<Library />} />
        <Route path="/RegisterPage" element={<Register />} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
