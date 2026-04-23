// -------Requiring node modules-------
import "dotenv/config";
import express from "express";
import cors from "cors";

// ----------server controller---------
const PORT = process.env.PORT || 4000;
const app = express();

const KEY = process.env.API_KEY;

// -------------- Server setup ------------
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// -------- API Routers --------

// when I first returned the most recent comics, comic vine api returned a lot of hentai(manga pornography) - being that hentai is highly inappropriate I explained to claude
// the situation and asked what I should do to fix it - claude recommended i use a blacklist of publishers that return inappropriate content
// claude provided a list - https://claude.ai/new

// inappropriate or old publishers - i logged all returned publishers and then googled them
const blockedPublisherIds = [
  7768, 4727, 5, 8, 4, 22, 32, 4983, 57, 89, 37, 45, 2043, 2781, 178, 1977,
  7768, 4727, 11688, 11685, 3602,
];

// filter results to remove unsafe publishers
const filterSafe = (results) =>
  results
    .filter((item) => !blockedPublisherIds.includes(item.publisher?.id))
    .filter((item) => item.name)
    .slice(0, 20);


// Cache - I wanted to find ways of speeding up my website and claude suggested cache data
let discoverCache = null;
let cacheTime = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Search route
app.get("/api/search", async (req, res) => {
  const { query, type } = req.query; // receiving the "value" aka query from frontend in handleSearch function

  try {
    // querying the comic vine api to allow the user to search
    const [searchRes, publisherRes] = await Promise.all([
      fetch(
        `https://comicvine.gamespot.com/api/search/?api_key=${KEY}&format=json&query=${query.toLowerCase()}&resources=character,issue,volume&limit=50`,
      ),
      fetch(
        `https://comicvine.gamespot.com/api/publishers/?api_key=${KEY}&format=json&filter=name:${query}&limit=2`,
      ),
    ]);
    const searchData = await searchRes.json();
    const publisherData = await publisherRes.json();

    const publishers = (publisherData.results || []).map((p) => ({
      ...p,
      resource_type: "publisher",
    }));

    // navbar dropdown order - ordering the return data - this is so important searches like publishers don't get lost
    const navOrder = { publisher: 0, character: 1, issue: 2, volume: 3 };
    // search results page order - comics first
    const searchOrder = { publisher: 0, issue: 1, volume: 2, character: 3 };
    const order = type === "full" ? searchOrder : navOrder;

    const filteredPublishers = publishers.filter(
      (p) => !blockedPublisherIds.includes(p.id),
    );

    // sorting the merged array by priority and then limiting the search results to 5
    const combined = [
      ...(searchData.results || []),
      ...filteredPublishers,
    ].sort(
      (a, b) => (order[a.resource_type] ?? 99) - (order[b.resource_type] ?? 99),
    );
    res.json({ results: filterSafe(combined) });
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
});

// Displaying comics on the discover page router
app.get("/api/discover", async (req, res) => {
  // this is for the featured section - my personal favourites - id's are taken from comic vine
  const featuredIssueIds = [1074455, 265714, 506175, 517815, 269827];

  // comic vine api really doesn't like you trying to filter the results to fit what you want to again having to hardcode some ids use for series reccomendations
  const recommendedSeriesIds = [
    39340, // Invincible whole series
    148290, // 2016 Nightwing
    18033, // The Boys
    9624, // Frank Miller Daredevil
    112965, // 2018 punisher
    3782, // Captain Atom
    122626, // Legion of Super-Heroes
    5989, // Transmetropolitan
    50564, // Walking dead
    110413, // 100 Bullets
  ];

  // return cached data if still fresh
  if (discoverCache && Date.now() - cacheTime < CACHE_DURATION) {
    return res.json(discoverCache); // this gets skipped on the first request as its empty
  }

  try {
    // fire all API requests at the same time
    const [featuredIssuesRes, popularRes, recentRes, seriesRes] =
      await Promise.all([
        // featured issues - fetches collected issues by their IDs
        fetch(
          `https://comicvine.gamespot.com/api/issues/?api_key=${KEY}&format=json&filter=id:${featuredIssueIds.join("|")}`,
        ),
        // popular issues - most added to user lists
        fetch(
          `https://comicvine.gamespot.com/api/issues/?api_key=${KEY}&format=json&sort=count_of_user_lists:desc&limit=50`,
        ),
        // recent issues - cover date
        fetch(
          `https://comicvine.gamespot.com/api/issues/?api_key=${KEY}&format=json&sort=cover_date:desc&limit=50`,
        ),
        // recommended series - long running volumes
        fetch(
          `https://comicvine.gamespot.com/api/volumes/?api_key=${KEY}&format=json&filter=id:${recommendedSeriesIds.join("|")}`,
        ),
      ]);

    // parse all responses as JSON at the same time
    const [featuredIssuesData, popularData, recentData, seriesData] =
      await Promise.all([
        featuredIssuesRes.json(),
        popularRes.json(),
        recentRes.json(),
        seriesRes.json(),
      ]);


    // for recent issues - filters by cover date and publisher
    const filterRecentIssues = (results) =>
      results
        .filter(
          (item) => !blockedPublisherIds.includes(item.volume?.publisher?.id),
        )
        .filter((item) => item.name)
        .slice(0, 20);


    // tag featured issues with resource_type after parsing
    const featured = (featuredIssuesData.results || []).map((i) => ({
      ...i,
      resource_type: "issue",
    }));

    const recent = filterRecentIssues(recentData.results || []).map(i => ({
      ...i,
      resource_type: 'issue'
    }));

    const popular = filterSafe(popularData.results || []).map(i => ({
      ...i,
      resource_type: 'issue'
    }));

    const series = (seriesData.results || []).map(v => ({
      ...v,
      resource_type: 'volume'
    }));


    const responseData = { featured, popular, recent, series }; 
    discoverCache = responseData;  // saveing the data return to cache
    cacheTime = Date.now(); //saves the current timestamp
    res.json(responseData); // then returns data
    
    // res.json({
    //   featured,
    //   popular,
    //   recent,
    //   series
    // });

    // used to find blacklist - google the publisher results
    // console.log('All publishers in results:',
    // recentData.results
    //     .map(r => ({ id: r.publisher?.id, name: r.publisher?.name }))
    //     .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // unique only
    // );
  } catch (err) {
    console.error("Discover failed:", err);
    res.status(500).json({ error: "Failed to fetch discover data" });
  }
});

// displaying resource type information
app.get("/api/info/:id", async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  try {
    const endpoints = {
      issue: `https://comicvine.gamespot.com/api/issue/4000-${id}/?api_key=${KEY}&format=json&field_list=id,name,image,description,deck,cover_date,issue_number,volume,person_credits,character_credits`,
      volume: `https://comicvine.gamespot.com/api/volume/4050-${id}/?api_key=${KEY}&format=json&field_list=id,name,image,description,deck,count_of_issues,person_credits,character_credits`,
      character: `https://comicvine.gamespot.com/api/character/4005-${id}/?api_key=${KEY}&format=json&field_list=id,name,image,description,deck,person_credits,character_credits`,
      publisher: `https://comicvine.gamespot.com/api/publisher/4010-${id}/?api_key=${KEY}&format=json&field_list=id,name,image,description,deck,person_credits,character_credits`,
      person: `https://comicvine.gamespot.com/api/person/4040-${id}/?api_key=${KEY}&format=json`
    };

    const url = endpoints[type];

    if (!url) return res.status(400).json({ error: "Invalid type" });

    const response = await fetch(url);
    const data = await response.json();

    res.json(data.results);
  } catch (err) {
    console.error("fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch resource" });
  }
});
