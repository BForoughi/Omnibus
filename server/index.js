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

// Displaying comics on the discover page router
app.get('/api/discover', async (req, res) => {
  // this is for the featured section - my personal favourites - id's are taken from comic vine
  const featuredIds = [88566, 1074455, 265714, 39997];

  const [featuredRes, popularRes, recentRes, seriesRes] = await Promise.all([
    // featured
    fetch(`https://comicvine.gamespot.com/api/volumes/?api_key=${KEY}&format=json&filter=id:${featuredIds.join(',')}`),
    // popular issues - most reviews
    fetch(`https://comicvine.gamespot.com/api/issues/?api_key=${KEY}&format=json&sort=number_of_user_reviews:desc&limit=10`),
    // recent issues - newly added
    fetch(`https://comicvine.gamespot.com/api/issues/?api_key=${KEY}&format=json&sort=date_added:desc&limit=10`),
    // popular series - volumes with most reviews
    fetch(`https://comicvine.gamespot.com/api/volumes/?api_key=${KEY}&format=json&sort=number_of_user_reviews:desc&limit=10`)
  ]);

  const [featuredData, popularData, recentData, seriesData] = await Promise.all([
    featuredRes.json(),
    popularRes.json(),
    recentRes.json(),
    seriesRes.json()
  ]);

  res.json({
    featured: featuredData.results || [],
    popular: popularData.results || [],
    recent: recentData.results || [],
    series: seriesData.results || []
  });
})
