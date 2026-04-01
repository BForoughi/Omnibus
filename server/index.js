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
    const [searchRes, publisherRes] = await Promise.all([
      fetch(`https://comicvine.gamespot.com/api/search/?api_key=${KEY}&format=json&query=${query.toLowerCase()}&resources=character,issue,volume&limit=8`),
      fetch(`https://comicvine.gamespot.com/api/publishers/?api_key=${KEY}&format=json&filter=name:${query}&limit=2`)
    ]);
    const searchData = await searchRes.json();
    const publisherData = await publisherRes.json();

    const publishers = (publisherData.results || []).map(p => ({
      ...p,
      resource_type: 'publisher'
    }));

    // ordering the return data 
    const order = { publisher: 0, character: 1, volume: 2, issue: 3 };

    // sorting the merged array by priority
    const combined = [...(searchData.results || []), ...publishers]
      .sort((a, b) => (order[a.resource_type] ?? 99) - (order[b.resource_type] ?? 99))
      .slice(0, 5);
    res.json({ results: combined });
  }catch (err){
    console.error("Search failed:", err);
    res.status(500).json({
      success: false,
      message: "Search failed"
    });
  }
})
