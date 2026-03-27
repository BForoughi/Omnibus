// -------Requiring node modules-------
import 'dotenv/config'
import express from 'express'
import cors from 'cors'

// ----------server controller---------
const PORT = process.env.PORT || 4000
const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Example route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));