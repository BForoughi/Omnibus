// -------Requiring node modules-------
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// ----------server controller---------
const PORT = process.env.PORT || 4000
const app = express();

const KEY = process.env.API_KEY

// -------------- Server setup ------------
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Example route
// app.get('/api/hello', (req, res) => {
//   res.json({ message: 'Hello from Express!' });
// });

// -------- API Routers --------
// Search route
app.get('/api/search', async (req, res) => {
  const { query } = req.query; // receiving the "value" aka query from frontend in handleSearch function

  try{
    const response = await fetch(
      `https://comicvine.gamespot.com/api/search/?api_key=${KEY}&format=json&query=${query.toLowerCase()}&resources=character,issue,volume,publishers@limit=5`
    );
    const data = await response.json();
    res.json(data);
  }catch (err){
    console.error("Search failed:", err);
    res.status(500).json({
      success: false,
      message: "Search failed"
    });
  }
})
