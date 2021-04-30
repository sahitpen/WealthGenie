const config = require('./db-config.js');
const mysql = require('mysql');
const oracle = require('oracledb');

var connection = null;

async function init() {
  try {
    config.connectionLimit = 10;
    connection = await oracle.getConnection(config);
  } catch (err) {
    console.error("error - " + err.message);
  }
}

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */

/* ---- Q1a (Dashboard) ---- */
// Equivalent to: function getTop20Keywords(req, res) {}

async function getTop20Keywords(req, res) {
  await init()
  const query = "SELECT name FROM Stock"
  try {
    const result = await connection.execute(query);
    res.json(result.rows);
  } catch (err) {
    console.log(err);
  }
};

/* ---- Crypto Search ---- */ 
async function getCryptoData(req, res) {
  await init()
  var ticker = req.params.ticker; 
  var startDate = req.params.startDate; 
  var endDate = req.params.endDate; 

  /*
   *queries to be implemented 
   */
  const growthQuery = ``;
  const priceQuery = ``;
  const volumeQuery = ``;
  const changeQuery = ``;
  try {
    const growthResult = await connection.execute(growthQuery);
    console.log(growthResult.rows);
    const priceResult = await connection.execute(priceQuery);
    console.log(priceResult.rows);
    const volumeResult = await connection.execute(volumeQuery);
    console.log(volumeResult.rows);
    const changeResult = await connection.execute(changeQuery);
    console.log(changeResult.rows);
    res.json({
      "growthResult": growthResult.rows,
      "priceResult": priceResult.rows,
      "volumeResult": volumeResult.rows,
      "changeResult": changeResult.rows
    });
  } catch (err) {
    console.log(err);
  }
}

/* ---- Stock Search ---- */

async function getStockData(req, res) {
  await init()
  var ticker = req.params.ticker;
  var startDate = req.params.startDate;
  var endDate = req.params.endDate;
  console.log(ticker);
  console.log(startDate);
  console.log(endDate);
  const growthQuery = `
    WITH TickerQuotes AS (
        SELECT ASSET_TICKER, DATE_CALENDAR, CLOSE 
        FROM StockQuote
        WHERE ASSET_TICKER = '${ticker}'
    ), EarliestQuotes AS (
        SELECT * FROM TickerQuotes 
        WHERE DATE_CALENDAR = (CASE 
            WHEN (SELECT MIN(DATE_CALENDAR) FROM TickerQuotes) <= TO_DATE('${startDate}') THEN TO_DATE('${startDate}')
            ELSE (SELECT MIN(DATE_CALENDAR) FROM TickerQuotes)
        END)
    ), LatestQuotes AS (
        SELECT * FROM TickerQuotes 
        WHERE DATE_CALENDAR = (CASE 
            WHEN (SELECT MAX(DATE_CALENDAR) FROM TickerQuotes) >= TO_DATE('${endDate}') THEN TO_DATE('${endDate}')
            ELSE (SELECT MAX(DATE_CALENDAR) FROM TickerQuotes)
        END)
    )
    SELECT eq.close as startingPrice, lq.close AS endingPrice, ROUND(((lq.close - eq.close) / eq.close * 100), 2) as percent_growth 
    FROM LatestQuotes lq 
    JOIN EarliestQuotes eq ON lq.asset_ticker = eq.asset_ticker
  `
  const priceQuery = `
    WITH TickerQuotes AS (
        SELECT ASSET_TICKER, DATE_CALENDAR, HIGH, LOW  
        FROM StockQuote
        WHERE ASSET_TICKER = '${ticker}' AND  DATE_CALENDAR >= TO_DATE('${startDate}') AND DATE_CALENDAR <= TO_DATE('${endDate}')
    ), HighQuotes AS (
        SELECT ASSET_TICKER, DATE_CALENDAR, HIGH FROM TickerQuotes 
        ORDER BY HIGH DESC FETCH FIRST 1 ROWS ONLY
    ), LowQuotes AS (
        SELECT ASSET_TICKER, DATE_CALENDAR, LOW FROM TickerQuotes 
        ORDER BY LOW FETCH FIRST 1 ROWS ONLY
    ) 
    SELECT l.low as LOW, l.DATE_CALENDAR AS lowDate, h.high as HIGH, h.DATE_CALENDAR AS highDate 
    FROM HighQuotes h 
    JOIN LowQuotes l ON h.ASSET_TICKER = l.ASSET_TICKER
  `
  const volumeQuery = `
    WITH TickerQuotes AS (
        SELECT ASSET_TICKER, DATE_CALENDAR, VOLUME
        FROM StockQuote
        WHERE ASSET_TICKER = '${ticker}' AND  DATE_CALENDAR >= TO_DATE('${startDate}') AND DATE_CALENDAR <= TO_DATE('${endDate}')
    ), HighVolume AS (
        SELECT ASSET_TICKER, DATE_CALENDAR as highVolumeDate, VOLUME FROM TickerQuotes 
        ORDER BY VOLUME DESC FETCH FIRST 1 ROWS ONLY
    ), LowVolume AS (
        SELECT ASSET_TICKER, DATE_CALENDAR as lowVolumeDate, VOLUME FROM TickerQuotes 
        ORDER BY VOLUME FETCH FIRST 1 ROWS ONLY
    ), AverageVolume AS (
        SELECT ASSET_TICKER, ROUND(AVG(VOLUME), 2) as avgVolume FROM TickerQuotes 
        GROUP BY ASSET_TICKER
    )
    SELECT l.volume as LOW, lowVolumeDate, h.volume as HIGH, highVolumeDate, a.avgVolume
    FROM HighVolume h 
    JOIN LowVolume l ON h.ASSET_TICKER = l.ASSET_TICKER
    JOIN AverageVolume a ON a.ASSET_TICKER = l.ASSET_TICKER
  `
  const changeQuery = `
    SELECT DATE_CALENDAR, OPEN, CLOSE, ROUND(((CLOSE-OPEN)/OPEN * 100), 2) AS PERCENTCHANGE 
    FROM STOCKQUOTE
    WHERE ASSET_TICKER = '${ticker}' AND  DATE_CALENDAR >= TO_DATE('${startDate}') AND DATE_CALENDAR <= TO_DATE('${endDate}')
    ORDER BY ABS(PERCENTCHANGE) DESC FETCH FIRST 1 ROWS ONLY
  `
  try {
    const growthResult = await connection.execute(growthQuery);
    console.log(growthResult.rows);
    const priceResult = await connection.execute(priceQuery);
    console.log(priceResult.rows);
    const volumeResult = await connection.execute(volumeQuery);
    console.log(volumeResult.rows);
    const changeResult = await connection.execute(changeQuery);
    console.log(changeResult.rows);
    res.json({
      "growthResult": growthResult.rows,
      "priceResult": priceResult.rows,
      "volumeResult": volumeResult.rows,
      "changeResult": changeResult.rows
    });
  } catch (err) {
    console.log(err);
  }
};

/* ---- Portfolio ---- */

async function getAssetTickers(req, res) {
  //given a partial/full ticker, this route returns a list of tickers that start with the given query ticker
  await init()
  var ticker = req.params.ticker;
  console.log(ticker);
  const assetQuery = `
    WITH quote AS (
      (SELECT * FROM stock)
      UNION
      (SELECT ticker, name, 'Cryptocurrency' "INDUSTRY" FROM cryptocurrency)
    )
    SELECT *
    FROM quote
    WHERE ticker LIKE '${ticker}%'
  `;
  console.log(assetQuery);
  try {
    const assetsResult = await connection.execute(assetQuery);
    console.log(assetsResult.rows);
    res.json({
      "assets": assetsResult.rows
    });
  } catch (err) {
    console.log(err);
  }
};

async function getPortfolio(req, res) {
  await init()
  var id = req.params.id;
  const query = `
    WITH LatestQuotes AS (
      SELECT asset_ticker, Close
      FROM StockQuote 
      WHERE Date_Calendar=(SELECT max(Date_Calendar) FROM StockQuote)
    )
    SELECT name, stock_ticker, stock_count, close, stock_count * close AS value
    FROM Portfolio p JOIN Client u ON p.client_uid = u.client_uid 
    JOIN Portfolio_Has_Stock phs ON p.name = phs.portfolio_name
    JOIN LatestQuotes lq ON lq.asset_ticker = phs.stock_ticker;
  `
  try {
    const assetsResult = await connection.execute(query);
    res.json({
      "assets": assetsResult.rows
    });
  } catch (err) {
    console.log(err);
  }
}

// not working yet, have to change
async function addAssetToPortfolio(req, res) {
  await init()
  var name = req.params.name;
  var id = req.params.name;
  var ticker = req.params.name;
  var count = req.params.name;
  const query = `
    INSERT INTO Portfolio_Has_Stock (portfolio_name, client_uid, stock_ticker, stock_count)
    VALUES ('${name}', '${id}', '${ticker}', ${count});
  `
  try {
    const assetsResult = await connection.execute(query);
  } catch (err) {
    console.log(err);
  }
}




/* ---- Q1b (Dashboard) ---- */
const getTopMoviesWithKeyword = (req, res) => {
  var keyword = req.params.keyword;

  const query = `
  SELECT title, rating, num_ratings   
  FROM movie m JOIN movie_keyword mk
  ON m.movie_id = mk.movie_id 
  WHERE mk.kwd_name = '${keyword}'
  ORDER BY rating DESC, num_ratings DESC
  LIMIT 10;
  `
  connection.query(query, (err, rows, fields) => {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
};


/* ---- Q2 (Recommendations) ---- */
const getRecs = (req, res) => {
  var movieName = req.params.movieName;

  const query = `
  WITH relevantCast AS (
    SELECT m.movie_id, title, cast_id, num_ratings, rating FROM (Select * FROM movie WHERE title = '${movieName}') m 
    JOIN cast_in c ON m.movie_id = c.movie_id 
  ),
  grouped AS (
    SELECT ci.movie_id, COUNT(*) AS num_cast FROM relevantCast rc
    JOIN cast_in ci ON rc.cast_id = ci.cast_id
    GROUP BY ci.movie_id
  )
  SELECT title, m.movie_id, rating, num_ratings 
  FROM grouped g
  JOIN movie m 
  ON g.movie_id = m.movie_id
  ORDER BY num_cast DESC, rating DESC, num_ratings DESC
  LIMIT 1, 10;
  `

  connection.query(query, (err, rows, fields) => {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
};


/* ---- Q3a (Best Movies) ---- */
const getDecades = (req, res) => {
  const query = `
    SELECT DISTINCT (FLOOR(release_year/10)*10) AS decade
    FROM movie
    ORDER BY (FLOOR(release_year/10)*10);
  `;

  connection.query(query, (err, rows, fields) => {
    if (err) console.log(err);
    else res.json(rows);
  });
};


/* ---- (Best Movies) ---- */
const getGenres = (req, res) => {
  const query = `
    SELECT name
    FROM genre
    WHERE name <> 'genres'
    ORDER BY name ASC;
  `;

  connection.query(query, (err, rows, fields) => {
    if (err) console.log(err);
    else res.json(rows);
  });
};


/* ---- Q3b (Best Movies) ---- */
const bestMoviesPerDecadeGenre = (req, res) => {
  var decade = req.params.decade;
  var genre = req.params.genre;
  const query = `
  WITH decMovies AS (
    SELECT m.movie_id, title, rating
    FROM movie m
    JOIN movie_genre mg
    ON m.movie_id = mg.movie_id 
    WHERE genre_name = '${genre}' AND (FLOOR(release_year/10)*10) = ${decade}
  ),
  genreAvg AS (
    SELECT genre_name, AVG(rating) as avgRating
    FROM (SELECT * FROM movie WHERE (FLOOR(release_year/10)*10) = ${decade}) m
    JOIN movie_genre mg 
    ON m.movie_id = mg.movie_id 
    GROUP BY genre_name 
  ),
  decMoviesWithAvg AS (
    SELECT mg.movie_id, dm.title, dm.rating, ga.genre_name, avgRating, 
      CASE 
        WHEN dm.rating > avgRating THEN 1
        ELSE 0
      END AS count 
    FROM decMovies dm 
    JOIN movie_genre mg ON dm.movie_id = mg.movie_id 
    JOIN genreAVG ga ON mg.genre_name = ga.genre_name
  ),
  finalFilter AS (
    SELECT movie_id FROM decMoviesWithAvg 
    GROUP BY movie_id 
    HAVING COUNT(*) = SUM(count)
  )
  SELECT m.movie_id, m.title, m.rating 
  FROM finalFilter f JOIN movie m ON f.movie_id = m.movie_id
  ORDER BY m.title 
  LIMIT 100;
  `;

  connection.query(query, (err, rows, fields) => {
    if (err) console.log(err);
    else res.json(rows);
  });
};

module.exports = {
  getTop20Keywords: getTop20Keywords,
  getTopMoviesWithKeyword: getTopMoviesWithKeyword,
  getRecs: getRecs,
  getDecades: getDecades,
  getGenres: getGenres,
  bestMoviesPerDecadeGenre: bestMoviesPerDecadeGenre,
  getStockData: getStockData,
  getCryptoData: getCryptoData,
  getAssetTickers: getAssetTickers,
  getPortfolio: getPortfolio,
  addAssetToPortfolio: addAssetToPortfolio
};