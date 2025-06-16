const express = require('express');
const cors = require('cors');
require('dotenv').config();

const queryRouter = require('./routes/queryRouter');
const roundRobinRouter = require('./routes/roundRobinRouter');


const app = express();

// Log every incoming request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

app.use('/query', queryRouter);
app.use('/roundrobin', roundRobinRouter);


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
