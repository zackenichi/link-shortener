const express = require('express');
const validUrl = require('valid-url');
const shortId = require('shortid');
const config = require('config');
const Url = require('../models/Url');

const router = express.Router();

// @route GET /health
// @desc Get applcation health
router.get('/health', (req, res) => {
  return res.status(200).json({ message: 'Application is healthy' });
});

// @route POST /shorten
// @desc Create short URL
router.get('/shorten', async (req, res) => {
  const { longUrl } = req.body;
  const baseUrl = config.get('baseUrl');

  //   check base url
  if (!validUrl.isUri(baseUrl)) {
    return res.status(400).json({ message: 'Invalid base url' });
  }

  //   check long url
  if (validUrl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({ longUrl });
      if (url) {
        console.log('Already exists...');
        return res.status(201).json({ data: url });
      } else {
        // create url code
        let urlCode = shortId.generate();
        let shortUrl = baseUrl + '/' + urlCode;

        url = new Url({
          longUrl,
          shortUrl,
          urlCode,
          data: new Date(),
        });

        console.log('Saving new record...');
        await url.save();
        return res.status(201).json({ data: url });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error has occured' });
    }
  } else {
    return res.status(400).json({ message: 'Invalid long url' });
  }
});

// @route GET /:code
// @desc  Redirect to long/original URL
router.get('/:code', async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });
    if (url) {
      console.log('Long url found short url. Redirecting ...');
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json({ message: 'No url found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occured' });
  }
});

module.exports = router;
