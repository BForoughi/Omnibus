// -------Requiring node modules-------
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import * as users from './models/userModel.js'
import { LibraryItem } from './models/libraryModel.js'
import { Review } from './models/reviewModel.js'

// .env variables
// -------MongoDB-------
const mongoPassword = process.env.MONGODB_PASSWORD
const mongoUsername = process.env.MONGODB_USERNAME
const mongoAppName = process.env.MONGODB_MYAPPNAME

const connectionString = `mongodb+srv://${mongoUsername}:${mongoPassword}@timecap.jjo4ept.mongodb.net/${mongoAppName}?retryWrites=true&w=majority`
mongoose.connect(connectionString)

// using jwt tokens for the first time, said to claude i want to learn how to use them for this project and for it to teach me using
// a previous uni project from last semester to explain the differences between jwt tokens and session cookies

// middleware function that checks whether the user is allowed in or not - same concept as storing and checking user session id
const authenticateToken = (req, res, next) => { // has the same structure as session checker
  // when the frontend sends a request it attaches the token inside the request headers
  const authHeader = req.headers['authorization'] // this line grabs the header
  // when the header arrives its a full string with a label and token, we just need the token
  const token = authHeader && authHeader.split(' ')[1] // this says split the string at the space and take the second index - there us a space in the '' - authHeader && means if its true/excists
  if(!token) return res.status(401).json({ message: 'Unauthorised' });
  
  // this part takes the token and uses the secret in .env to decode and verify the token
  // if the callback is err something is wrong, if its user then its fine and has returned the decoded data
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalid or expired' });

    // if everything checks out the decoded token data which contains the user id gets attached to req.user
    req.user = user
    next() // says all good carry one
  })

}

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
  7768, 4727, 11688, 11685, 3602, 2303
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
  discoverCache = null;
  cacheTime = null;
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
          `https://comicvine.gamespot.com/api/issues/?api_key=${KEY}&format=json&sort=cover_date:desc&limit=50&field_list=id,name,image,cover_date,issue_number,volume,publisher`
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
    const blockedVolumeIds = [92701, 137543];

    const filterRecentIssues = (results) =>
      results
        .filter((item) => !blockedVolumeIds.includes(item.volume?.id))
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


// ----------- MONGODB and any USER DATA ---------------

// -------- REGISTER ------------
app.post('/api/register', async (req, res) =>{
  const {username, password} = req.body;

  try{
    const user = await users.addUser(username, password);
    if(!user){
      return res.status(401).json({ success: false, message: "Username already taken" })
    };

    // sign a token with their new user id
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token, // send token to frontend to store
      user: { username: user.username }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------- LOGIN ------------
app.post('/api/login', async(req, res) => {
  const {username, password} = req.body;

  try{
    const user = await users.checkUser(username, password);
    if(!user){
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: { username: user.username }
    });
  }catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  };
});

// -------- AUTH CHECK ------------
// authenticateToken is an arugment so it run the middleware function from above the routes - if it returns true an id has already been added
app.get('/api/auth/check', authenticateToken, (req, res) => {
  res.status(200).json({ loggedIn: true, userId: req.user.userId });
});

// -------- LOGOUT ------------
// the front end destroys the token 
app.post('/api/logout', (req, res) => {
  res.status(200).json({ success: true })
});

// --------- SAVING COMICS ----------
app.post('/api/library', authenticateToken, async (req, res) => {
  const { comicId, comicName, issueNumber, type, coverImage, publisher } = req.body;

  if(!comicId || !comicName) return res.status(400).json({ message: "No comic ID or name" });

  try{
    const saveComic = await LibraryItem.create({
      userId: req.user.userId,
      comicId,
      title: comicName,
      type,
      coverImage,
      issueNumber,
      publisher
    });

    res.status(201).json({
      success: true,
      comic: saveComic
    });
  } catch(err){
    // handle duplicate - user already saved this comic
    if(err.code === 11000) return res.status(400).json({ message: "Already in library" })
    console.error("Library save error:", err)
    res.status(500).json({ message: "Server error" });
  }
});

// ------REMOVE A COMIC---------
app.delete('/api/library/:id', authenticateToken, async (req, res) => {
  const { id } = req.params; // from the url (parameter)
  if(!id) return res.status(400).json({ message: "No comic ID" });

  try{  
    const deleteComic = await LibraryItem.findOneAndDelete({
      _id: id,
      userId: req.user.userId
    });

    if(!deleteComic) return res.status(404).json({ message: "Comic not found in library" })
  
    res.status(200).json({
      success: true,
    });
  } catch(err){
    console.error("Library remove error:", err)
    res.status(500).json({ message: "Server error" });
  }
});

// --------FETCHING COMICS---------
app.get('/api/library', authenticateToken, async (req, res) => {
  try{
    const comics = await LibraryItem.find({userId: req.user.userId})
  
    // sending clean data - not raw mongo data
    const clean = comics.map((a) => {
      return{
        _id: a._id,
        userId: a.userId,
        comicId: a.comicId,
        title: a.title,
        type: a.type,
        coverImage: a.coverImage,
        issueNumber: a.issueNumber,
        read: a.read,
        publisher: a.publisher,
        createdAt: a.createdAt
      }
    })
    res.json({success: true, comics: clean})
  }catch(err){
    console.error("error fetching albums", err)
    res.status(500).json({success: false, message: "Server Error"})
  }
});

// --------READ COMIC TOGGLE----------
app.patch('/api/library/:id/read', authenticateToken, async (req, res) => {
  const { id } = req.params

  try {
    const comic = await LibraryItem.findOne({ _id: id, userId: req.user.userId })
    if(!comic) return res.status(404).json({ message: "Comic not found" })

    // flip the read value - if true make false, if false make true
    comic.read = !comic.read
    await comic.save()

    res.status(200).json({ success: true, read: comic.read })
  }catch(err) {
    console.error("Read toggle error:", err)
    res.status(500).json({ message: "Server error" })
  }
});

// ---------REVIEWS---------
app.get('/api/reviews/:comicId', async (req, res) => {
  const { comicId } = req.params

  try{
    const reviews = await Review.find({comicId})
    
    const clean = reviews.map((a) => {
      return{
        _id: a._id,
        comicId: a.comicId,
        comicType: a.comicType,
        userId: a.userId,
        username: a.username,
        title: a.title,
        body: a.body,
        parentId: a.parentId
      }
    })
    res.json({success: true, reviews: clean})
  }catch(err){
    console.error("error fetching reviews", err)
    res.status(500).json({success: false, message: "Server Error"})
  }
});

// -------SAVING REVIEWS-------
app.post('/api/reviews', authenticateToken, async (req, res) => {
  const { comicId, comicType, title, body, parentId } = req.body;

  if(!comicId) return res.status(400).json({ message: "No comic was found" });

  try{
    const saveReview = await Review.create({
      userId: req.user.userId,
      username: req.user.username,
      comicId,
      comicType,
      title,
      body,
      parentId: parentId || null //null ensures it defaults to null if not provided
    });

    res.status(201).json({
      success: true,
      review: saveReview
    });
  }catch(err){
    console.error("Review save error:", err)
    res.status(500).json({ message: "Server error" });
  }
});

// ---------DELETING REVIEWS---------
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if(!id) return res.status(400).json({ message: "No review ID" });

  try{
    const deleteReview = await Review.findByIdAndDelete({
      _id: id,
      userId: req.user.userId
    });

    if(!deleteReview) return res.status(404).json({ message: "Review not found" });

    res.status(200).json({
      success: true,
      message: "Review was deleted..."
    });
  }catch(err){
    console.error("Review remove error:", err)
    res.status(500).json({ message: "Server error" });
  }
});