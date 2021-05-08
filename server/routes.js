const config = require('./db-config.js');
const mysql = require('mysql');
const oracle = require('oracledb');
oracle.autoCommit = true;

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

  console.log("start date: " + startDate);
  console.log("end date: " + endDate);

  /*
   *queries to be implemented 
   */
  const growthQuery = `
  WITH TickerQuotes AS (
          SELECT ASSET_TICKER, CALENDAR_DATE, CLOSE 
          FROM CRYPTOQUOTE
          WHERE ASSET_TICKER = 'BTC'
      ), EarliestQuotes AS (
          SELECT * FROM TickerQuotes tq
          WHERE CALENDAR_DATE = (
            SELECT MIN(sq.calendar_date)
            FROM CRYPTOQUOTE sq
            WHERE sq.asset_ticker=tq.asset_ticker
            AND sq.calendar_date >= TO_DATE('${startDate}', 'YYYY-MM-DD')
          )
      ), LatestQuotes AS (
          SELECT * FROM TickerQuotes tq
          WHERE CALENDAR_DATE = (
            SELECT MAX(sq.calendar_date)
            FROM CRYPTOQUOTE sq
            WHERE sq.asset_ticker=tq.asset_ticker
            AND sq.calendar_date <= TO_DATE('${endDate}', 'YYYY-MM-DD')
          )
      )
      SELECT eq.close as startingPrice, lq.close AS endingPrice, ROUND(((lq.close - eq.close) / eq.close * 100), 2) as percent_growth 
      FROM LatestQuotes lq 
      JOIN EarliestQuotes eq ON lq.asset_ticker = eq.asset_ticker
      `;

  const priceQuery = `
  WITH TickerQuotes AS (
        SELECT ASSET_TICKER, DATE_CALENDAR, HIGH, LOW  
        FROM CRYPTOQUOTE
        WHERE ASSET_TICKER = 'BTC' AND  DATE_CALENDAR >= TO_DATE('${startDate}', 'YYYY-MM-DD') AND DATE_CALENDAR <= TO_DATE('${endDate}', 'YYYY-MM-DD')
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
    `;

  const volumeQuery = `
  WITH TickerQuotes AS (
    SELECT ASSET_TICKER, DATE_CALENDAR, VOLUME
    FROM CRYPTOQUOTE
    WHERE ASSET_TICKER = 'BTC' AND  DATE_CALENDAR >= TO_DATE('${startDate}', 'YYYY-MM-DD') AND DATE_CALENDAR <= TO_DATE('${endDate}', 'YYYY-MM-DD')
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
`;


  const changeQuery = `
  SELECT DATE_CALENDAR, OPEN, CLOSE, ROUND(((CLOSE-OPEN)/OPEN * 100), 2) AS PERCENTCHANGE 
  FROM CRYPTOQUOTE
  WHERE ASSET_TICKER = 'BTC' AND  DATE_CALENDAR >= TO_DATE('${startDate}', 'YYYY-MM-DD') AND DATE_CALENDAR <= TO_DATE('${endDate}', 'YYYY-MM-DD')
  ORDER BY ABS(PERCENTCHANGE) DESC FETCH FIRST 1 ROWS ONLY
  `;

  

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
        SELECT * FROM TickerQuotes tq
        WHERE DATE_CALENDAR = (
          SELECT MIN(sq.date_calendar)
          FROM StockQuote sq
          WHERE sq.asset_ticker=tq.asset_ticker
          AND sq.date_calendar >= TO_DATE('${startDate}', 'YYYY-MM-DD')
        )
    ), LatestQuotes AS (
        SELECT * FROM TickerQuotes tq
        WHERE DATE_CALENDAR = (
          SELECT MAX(sq.date_calendar)
          FROM StockQuote sq
          WHERE sq.asset_ticker=tq.asset_ticker
          AND sq.date_calendar <= TO_DATE('${endDate}', 'YYYY-MM-DD')
       ) 
    )
    SELECT eq.close as startingPrice, lq.close AS endingPrice, ROUND(((lq.close - eq.close) / eq.close * 100), 2) as percent_growth 
    FROM LatestQuotes lq 
    JOIN EarliestQuotes eq ON lq.asset_ticker = eq.asset_ticker
  `
  const priceQuery = `
    WITH TickerQuotes AS (
        SELECT ASSET_TICKER, DATE_CALENDAR, HIGH, LOW  
        FROM StockQuote
        WHERE ASSET_TICKER = '${ticker}' AND  DATE_CALENDAR >= TO_DATE('${startDate}', 'YYYY-MM-DD') AND DATE_CALENDAR <= TO_DATE('${endDate}', 'YYYY-MM-DD')
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
        WHERE ASSET_TICKER = '${ticker}' AND  DATE_CALENDAR >= TO_DATE('${startDate}', 'YYYY-MM-DD') AND DATE_CALENDAR <= TO_DATE('${endDate}', 'YYYY-MM-DD')
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
    FROM StockQuote
    WHERE ASSET_TICKER = '${ticker}' AND  DATE_CALENDAR >= TO_DATE('${startDate}', 'YYYY-MM-DD') AND DATE_CALENDAR <= TO_DATE('${endDate}', 'YYYY-MM-DD')
    ORDER BY ABS(PERCENTCHANGE) DESC FETCH FIRST 1 ROWS ONLY
  `
  const similarCompaniesQuery = `
    WITH firstQuotes AS (
        SELECT sq1.date_calendar, sq1.asset_ticker, sq1.close
        FROM StockQuote sq1
        WHERE sq1.date_calendar = (
            SELECT MIN(sq2.date_calendar)
            FROM StockQuote sq2
            WHERE sq2.asset_ticker=sq1.asset_ticker
            AND sq2.date_calendar >= TO_DATE('${startDate}', 'YYYY-MM-DD')
        )
    ), lastQuotes AS (
        SELECT sq1.date_calendar, sq1.asset_ticker, sq1.close
        FROM StockQuote sq1
        WHERE sq1.date_calendar = (
            SELECT MAX(sq2.date_calendar)
            FROM StockQuote sq2
            WHERE sq2.asset_ticker=sq1.asset_ticker
            AND sq2.date_calendar <= TO_DATE('${endDate}', 'YYYY-MM-DD')
        )
    ), returns AS (
        SELECT fq.asset_ticker, 100*((lq.close - fq.close)/fq.close) as percentage_growth
        FROM firstQuotes fq
        JOIN lastQuotes lq ON fq.asset_ticker=lq.asset_ticker
    ), comparisons AS (
        SELECT ASSET_TICKER, PERCENTAGE_GROWTH, 
        ABS((SELECT PERCENTAGE_GROWTH FROM returns WHERE ASSET_TICKER='${ticker}')-PERCENTAGE_GROWTH) as DIFFERENCE 
        FROM returns
    ) SELECT ASSET_TICKER, NAME, PERCENTAGE_GROWTH 
    FROM comparisons c JOIN Stock s ON c.ASSET_TICKER = s.TICKER
    WHERE ASSET_TICKER <> '${ticker}' ORDER BY DIFFERENCE
    FETCH FIRST 10 ROWS ONLY
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
    const similarCompaniesResult = await connection.execute(similarCompaniesQuery);
    console.log(similarCompaniesResult.rows);
    res.json({
      "growthResult": growthResult.rows,
      "priceResult": priceResult.rows,
      "volumeResult": volumeResult.rows,
      "changeResult": changeResult.rows,
      "similarCompaniesResult": similarCompaniesResult.rows
    });
  } catch (err) {
    console.log(err);
  }
};

async function getIndustryData(req, res) {
  await init()
  var industry = req.params.industry;
  var startDate = req.params.startDate;
  var endDate = req.params.endDate;
  console.log(industry);
  console.log(startDate);
  console.log(endDate);
  const growthQuery = `
    WITH TickerQuotes AS (
        SELECT ASSET_TICKER, DATE_CALENDAR, CLOSE 
        FROM StockQuote sq
        JOIN Stock s ON sq.ASSET_TICKER = s.TICKER
        WHERE s.INDUSTRY = '${industry}'
    ), EarliestQuotes AS (
        SELECT * FROM TickerQuotes tq
        WHERE DATE_CALENDAR = (
          SELECT MIN(sq.date_calendar)
          FROM StockQuote sq
          WHERE sq.asset_ticker=tq.asset_ticker
          AND sq.date_calendar >= TO_DATE('${startDate}', 'YYYY-MM-DD')
        )
    ), LatestQuotes AS (
        SELECT * FROM TickerQuotes tq
        WHERE DATE_CALENDAR = (
          SELECT MAX(sq.date_calendar)
          FROM StockQuote sq
          WHERE sq.asset_ticker=tq.asset_ticker
          AND sq.date_calendar <= TO_DATE('${endDate}', 'YYYY-MM-DD')
       ) 
    ), GrowthRates AS (
        SELECT eq.ASSET_TICKER as ticker, eq.close as startingPrice, lq.close AS endingPrice, ROUND(((lq.close - eq.close) / eq.close * 100), 2) as percent_growth 
        FROM LatestQuotes lq 
        JOIN EarliestQuotes eq ON lq.asset_ticker = eq.asset_ticker
    ) SELECT COUNT(TICKER) as numStocks, ROUND(AVG(PERCENT_GROWTH), 2) as industryGrowth FROM GrowthRates
  `
  const topIndustryStocksQuery = `
    WITH TickerQuotes AS (
        SELECT ASSET_TICKER, DATE_CALENDAR, CLOSE 
        FROM StockQuote sq
        JOIN Stock s ON sq.ASSET_TICKER = s.TICKER
        WHERE s.INDUSTRY = '${industry}'
    ), EarliestQuotes AS (
        SELECT * FROM TickerQuotes tq
        WHERE DATE_CALENDAR = (
          SELECT MIN(sq.date_calendar)
          FROM StockQuote sq
          WHERE sq.asset_ticker=tq.asset_ticker
          AND sq.date_calendar >= TO_DATE('${startDate}', 'YYYY-MM-DD')
        )
    ), LatestQuotes AS (
        SELECT * FROM TickerQuotes tq
        WHERE DATE_CALENDAR = (
          SELECT MAX(sq.date_calendar)
          FROM StockQuote sq
          WHERE sq.asset_ticker=tq.asset_ticker
          AND sq.date_calendar <= TO_DATE('${endDate}', 'YYYY-MM-DD')
       ) 
    ), GrowthRates AS (
        SELECT eq.ASSET_TICKER as ticker, eq.close as startingPrice, lq.close AS endingPrice, ROUND(((lq.close - eq.close) / eq.close * 100), 2) as percent_growth 
        FROM LatestQuotes lq 
        JOIN EarliestQuotes eq ON lq.asset_ticker = eq.asset_ticker
    ) SELECT ticker, ROUND(percent_growth, 2) FROM GrowthRates ORDER BY percent_growth DESC FETCH FIRST 5 ROWS ONLY
  `
  const worstIndustryStocksQuery = `
      WITH TickerQuotes AS (
        SELECT ASSET_TICKER, DATE_CALENDAR, CLOSE 
        FROM StockQuote sq
        JOIN Stock s ON sq.ASSET_TICKER = s.TICKER
        WHERE s.INDUSTRY = '${industry}'
    ), EarliestQuotes AS (
        SELECT * FROM TickerQuotes tq
        WHERE DATE_CALENDAR = (
          SELECT MIN(sq.date_calendar)
          FROM StockQuote sq
          WHERE sq.asset_ticker=tq.asset_ticker
          AND sq.date_calendar >= TO_DATE('${startDate}', 'YYYY-MM-DD')
        )
    ), LatestQuotes AS (
        SELECT * FROM TickerQuotes tq
        WHERE DATE_CALENDAR = (
          SELECT MAX(sq.date_calendar)
          FROM StockQuote sq
          WHERE sq.asset_ticker=tq.asset_ticker
          AND sq.date_calendar <= TO_DATE('${endDate}', 'YYYY-MM-DD')
       ) 
    ), GrowthRates AS (
        SELECT eq.ASSET_TICKER as ticker, eq.close as startingPrice, lq.close AS endingPrice, ROUND(((lq.close - eq.close) / eq.close * 100), 2) as percent_growth 
        FROM LatestQuotes lq 
        JOIN EarliestQuotes eq ON lq.asset_ticker = eq.asset_ticker
    ) SELECT ticker, ROUND(percent_growth, 2) FROM GrowthRates ORDER BY percent_growth FETCH FIRST 5 ROWS ONLY
  `
  try {
    const growthResult = await connection.execute(growthQuery);
    console.log(growthResult.rows);
    const topStocksResult = await connection.execute(topIndustryStocksQuery);
    console.log(topStocksResult.rows);
    const worstStocksResult = await connection.execute(worstIndustryStocksQuery);
    console.log(worstStocksResult.rows);
    res.json({
      "growthResult": growthResult.rows,
      "topStocksResult": topStocksResult.rows,
      "worstStocksResult": worstStocksResult.rows
    });
  } catch (err) {
    console.log(err);
  }
};

async function getIndustryNames(req, res) {
  await init()
  const namesQuery = `SELECT DISTINCT industry FROM Stock`;
  try {
    const namesResult = await connection.execute(namesQuery);
    console.log(namesResult.rows);
    res.json({
      "namesResult": namesResult.rows,
    });
  } catch (err) {
    console.log(err);
  }
}

/* ---- Portfolio ---- */

async function getAssetTickers(req, res) {
  //given a partial/full ticker, this route returns a list of tickers that start with the given query ticker
  await init()
  var ticker = req.params.ticker;
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
  try {
    const assetsResult = await connection.execute(assetQuery);
    //console.log(assetsResult.rows);
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
  const assetQuery = `
    WITH LatestQuotes AS (
      SELECT asset_ticker, Close
      FROM StockQuote 
      WHERE Date_Calendar=(SELECT MAX(Date_Calendar) FROM StockQuote)
    )
    SELECT stock_ticker, stock_count, close, stock_count * close AS value
    FROM Client u JOIN Portfolio_Has_Stock phs ON u.client_uid = phs.client_uid
    JOIN LatestQuotes lq ON lq.asset_ticker = phs.stock_ticker
    WHERE u.client_uid='${id}'
  `;
  try {
    const assetsResult = await connection.execute(assetQuery);
    res.json({
      "assets": assetsResult.rows
    });
  } catch (err) {
    console.log(err);
  }
}

async function addAssetToPortfolio(req, res) {
  await init()
  var id = req.params.id;
  var ticker = req.params.ticker;
  var count = req.params.count;
  const query = `
    INSERT INTO Portfolio_Has_Stock (client_uid, stock_ticker, stock_count) 
    VALUES ('${id}', '${ticker}', ${count})
  `
  try {
    const result = await connection.execute(query);
    res.json({
      "assets": result.rows
    });
  } catch (err) {
    console.log(err);
  }
}

async function removeAssetFromPortfolio(req, res) {
  await init()
  var id = req.params.id;
  var ticker = req.params.ticker;

  const query = `
    DELETE FROM Portfolio_Has_Stock 
    WHERE client_uid='${id}' AND stock_ticker='${ticker}'
  `
  try {
    const result = await connection.execute(query);
    res.json({
      "assets": result.rows
    });
  } catch (err) {
    console.log(err);
  }
}

async function updateAssetQuantity(req, res) {
  await init()
  var id = req.params.id;
  var ticker = req.params.ticker;
  var count = req.params.count;

  const query = `
    UPDATE Portfolio_Has_STOCK SET stock_count=${count}
    WHERE client_uid='${id}' AND stock_ticker='${ticker}'
  `
  try {
    const result = await connection.execute(query);
    res.json({
      "assets": result.rows
    });
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
  getIndustryData: getIndustryData,
  getIndustryNames: getIndustryNames,
  getCryptoData: getCryptoData,
  getAssetTickers: getAssetTickers,
  getPortfolio: getPortfolio,
  addAssetToPortfolio: addAssetToPortfolio,
  removeAssetFromPortfolio: removeAssetFromPortfolio,
  updateAssetQuantity: updateAssetQuantity
};