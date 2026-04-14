import '../src/stylesheets/App.css';
import Discover from "./pages/Discover";
import Library from "./pages/Library";
import Register from "./pages/Register";
import { Routes, BrowserRouter, Route } from "react-router-dom";
import SearchResultsPage from './pages/SearchResults';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Discover />} />
        <Route path="/LibraryPage" element={<Library />} />
        <Route path="/RegisterPage" element={<Register />} />
        <Route path="/SearchPage" element={<SearchResultsPage />} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
