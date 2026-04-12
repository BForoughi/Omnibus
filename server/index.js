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
    // querying the comic vine api to allow the user to search
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

    // ordering the return data - this is so important searches like publishers don't get lost
    const order = { publisher: 0, character: 1, volume: 2, issue: 3 };

    // sorting the merged array by priority and then limiting the search results to 5
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
  // they're split because of comic vines inconsictent categorisation
  const featuredVolumeIds = [88566, 39997];
  const featuredIssueIds = [1074455, 265714];

  // comic vine api really doesn't like you trying to filter the results to fit what you want to again having to hardcode some ids use for series reccomendations
  const recommendedSeriesIds = [
    39340,  // Invincible whole series
    148290,  // 2016 Nightwing
    18033, // The Boys
    9624, // Frank Miller Daredevil
    112965, // 2018 punisher
    3782, // Captain Atom
    122626, // Legion of Super-Heroes
    5989, // Transmetropolitan
    50564, // Walking dead
    110413 // 100 Bullets
];

  // when I first returned the most recent comics, comic vine api returned a lot of hentai(manga pornography) - being that hentai is highly inappropriate I explained to claude  
  // the situation and asked what I should do to fix it - claude recommended i use a blacklist of publishers that return inappropriate content
  // claude provided a list - https://claude.ai/new

  // inappropriate or old publishers - i logged all returned publishers and then googled them
  const blockedPublisherIds = [7768, 4727, 5, 8, 4, 22, 32, 4983, 57, 89, 37, 45, 2043, 2781, 178, 1977, 7768, 4727, 11688, 11685];

  try{
    // fire all API requests at the same time
    const [featuredVolumesRes, featuredIssuesRes, popularRes, recentRes, seriesRes] = await Promise.all([
      // featured volumes - fetches volumes by their IDs
      fetch(`https://comicvine.gamespot.com/api/volumes/?api_key=${KEY}&format=json&filter=id:${featuredVolumeIds.join('|')}`),
      // featured issues - fetches collected issues by their IDs
      fetch(`https://comicvine.gamespot.com/api/issues/?api_key=${KEY}&format=json&filter=id:${featuredIssueIds.join('|')}`),
      // popular volumes - most added to user lists
      fetch(`https://comicvine.gamespot.com/api/issues/?api_key=${KEY}&format=json&sort=count_of_user_lists:desc&limit=50`),
      // recent issues - cover date
      fetch(`https://comicvine.gamespot.com/api/issues/?api_key=${KEY}&format=json&sort=cover_date:desc&limit=100`),
      // recommended series - long running volumes 
      fetch(`https://comicvine.gamespot.com/api/volumes/?api_key=${KEY}&format=json&filter=id:${recommendedSeriesIds.join('|')}`)
    ]);

    // parse all responses as JSON at the same time
    const [featuredVolumesData, featuredIssuesData, popularData, recentData, seriesData] = await Promise.all([
      featuredVolumesRes.json(),
      featuredIssuesRes.json(),
      popularRes.json(),
      recentRes.json(),
      seriesRes.json()
    ]);

    // merge featured volumes and issues into one array
    const featured = [...(featuredVolumesData.results || []), ...(featuredIssuesData.results || [])];

    // filter results to remove unsafe publishers
    const filterSafe = (results) =>
        results
            .filter(item => !blockedPublisherIds.includes(item.publisher?.id))
            .filter(item => item.name)
            .slice(0, 10);
    
    // for recent issues - filters by cover date and publisher
    const filterRecentIssues = (results) =>
        results
            .filter(item => !blockedPublisherIds.includes(item.volume?.publisher?.id))
            .filter(item => item.name)
            .slice(0, 10);

    res.json({
      featured,
      popular: filterSafe(popularData.results || []),
      recent: filterRecentIssues(recentData.results || []),
      series: seriesData.results || []
    });
    

    // used to find blacklist - google the publisher results
    // console.log('All publishers in results:', 
    // recentData.results
    //     .map(r => ({ id: r.publisher?.id, name: r.publisher?.name }))
    //     .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // unique only
    // );

  } catch(err){
    console.error('Discover failed:', err);
    res.status(500).json({ error: 'Failed to fetch discover data' });
  }
})
