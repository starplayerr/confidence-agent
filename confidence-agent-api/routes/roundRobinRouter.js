const express = require('express');
const { roundRobinRunner } = require('../utils/roundRobinRunner');
const router = express.Router();

router.post('/', async (req, res) => {
  const { initialPrompt, numRounds, bands, includeDisagreement, direction } = req.body;
  try {
    const history = await roundRobinRunner({ initialPrompt, numRounds, bands, includeDisagreement, direction });
    res.json({ history });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error running round robin");
  }
});

module.exports = router;