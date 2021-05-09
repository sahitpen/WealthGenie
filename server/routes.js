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

/* ---- Industry Search ---- */

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

/* ---- Industry Dropdown Names ---- */

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
    WITH LatestCryptoQuotes AS (
      SELECT asset_ticker, Close
      FROM CryptoQuote 
      WHERE Calendar_Date=(SELECT MAX(Calendar_Date) FROM CryptoQuote)
    ), LatestStockQuotes AS (
      SELECT asset_ticker, Close
      FROM StockQuote 
      WHERE Date_Calendar=(SELECT MAX(Date_Calendar) FROM StockQuote)
    )
    SELECT stock_ticker AS ticker, stock_count AS count, close, stock_count * close AS value
    FROM Client u JOIN Portfolio_Has_Stock phs ON u.client_uid = phs.client_uid
    JOIN LatestStockQuotes lsq ON lsq.asset_ticker = phs.stock_ticker
    WHERE u.client_uid='${id}'
    UNION
    SELECT crypto_ticker AS ticker, crypto_count AS count, close, crypto_count * close AS value
    FROM Client u JOIN Portfolio_Has_Crypto phc ON u.client_uid = phc.client_uid
    JOIN LatestCryptoQuotes lcq ON lcq.asset_ticker = phc.crypto_ticker
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
  var query = `
    INSERT INTO Portfolio_Has_Stock (client_uid, stock_ticker, stock_count) 
    VALUES ('${id}', '${ticker}', ${count})
  `
  //currently, we only have 1 crypto ticker (BTC), so check that to see what type of insertion we should do
  if (ticker.toUpperCase() === 'BTC') {
    query = `
    INSERT INTO Portfolio_Has_Crypto (client_uid, crypto_ticker, crypto_count)
    VALUES ('${id}', '${ticker}', ${count})
    `
  }

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

  var query = `
    DELETE FROM Portfolio_Has_Stock 
    WHERE client_uid='${id}' AND stock_ticker='${ticker}'
  `
  //currently, we only have 1 crypto ticker (BTC), so check that to see what type of insertion we should do
  if (ticker.toUpperCase() === 'BTC') {
    query = `
      DELETE FROM Portfolio_Has_Crypto
      WHERE client_uid='${id}' AND crypto_ticker='${ticker}'
    `
  }
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

  var query = `
    UPDATE Portfolio_Has_STOCK SET stock_count=${count}
    WHERE client_uid='${id}' AND stock_ticker='${ticker}'
  `
  //currently, we only have 1 crypto ticker (BTC), so check that to see what type of insertion we should do
  if (ticker.toUpperCase() === 'BTC') {
    query = `
    UPDATE Portfolio_Has_Crypto SET crypto_count=${count}
    WHERE client_uid='${id}' AND crypto_ticker='${ticker}'
    `
  }

  try {
    const result = await connection.execute(query);
    res.json({
      "assets": result.rows
    });
  } catch (err) {
    console.log(err);
  }
}

async function getPortfolioPercentGrowthIndividual(req, res) {
  await init()
  var id = req.params.id;

  var query = `
    WITH LatestStockQuotes AS (
      SELECT asset_ticker, Close
      FROM StockQuote sq
      WHERE Date_Calendar=(SELECT max(Date_Calendar) FROM StockQuote sq2 WHERE sq.asset_ticker = sq2.asset_ticker)
    ), EarliestStockQuotes AS (
        SELECT asset_ticker, Close
        FROM StockQuote sq
        WHERE Date_Calendar=(SELECT min(Date_Calendar) FROM StockQuote sq2 WHERE sq.asset_ticker = sq2.asset_ticker)
    ), LatestCryptoQuotes AS (
        SELECT asset_ticker, Close
        FROM CryptoQuote cq
        WHERE Calendar_Date=(SELECT max(Calendar_Date) FROM CryptoQuote cq2 WHERE cq.asset_ticker = cq2.asset_ticker)
    ), EarliestCryptoQuotes AS (
        SELECT asset_ticker, Close
        FROM CryptoQuote cq
        WHERE Calendar_Date=(SELECT min(Calendar_Date) FROM CryptoQuote cq2 WHERE cq.asset_ticker = cq2.asset_ticker)
    )
    SELECT stock_ticker AS Ticker, lsq.close AS last_close, esq.close as first_close, ((lsq.close - esq.close) / esq.close * 100) as percent_growth
    FROM Portfolio_Has_Stock phs
    JOIN LatestStockQuotes lsq ON lsq.asset_ticker = phs.stock_ticker
    JOIN EarliestStockQuotes esq ON esq.asset_ticker = phs.stock_ticker
    WHERE client_uid = '${id}'
    UNION ALL
    SELECT crypto_ticker AS Ticker, lcq.close AS last_close, ecq.close as first_close, ((lcq.close - ecq.close) / ecq.close * 100) as percent_growth
    FROM Portfolio_Has_Crypto phc
    JOIN LatestCryptoQuotes lcq ON lcq.asset_ticker = phc.crypto_ticker
    JOIN EarliestCryptoQuotes ecq ON ecq.asset_ticker = phc.crypto_ticker
    WHERE client_uid = '${id}'
  `
  console.log(query)
  try {
    const result = await connection.execute(query);
    res.json({
      "assets": result.rows
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getStockData: getStockData,
  getIndustryData: getIndustryData,
  getIndustryNames: getIndustryNames,
  getCryptoData: getCryptoData,
  getAssetTickers: getAssetTickers,
  getPortfolio: getPortfolio,
  addAssetToPortfolio: addAssetToPortfolio,
  removeAssetFromPortfolio: removeAssetFromPortfolio,
  updateAssetQuantity: updateAssetQuantity,
  getPortfolioPercentGrowthIndividual: getPortfolioPercentGrowthIndividual
};