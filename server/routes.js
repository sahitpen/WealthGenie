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
  var startDate = req.params.startDate;
  var endDate = req.params.endDate;

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
        SELECT ASSET_TICKER, CALENDAR_DATE, HIGH, LOW  
        FROM CRYPTOQUOTE
        WHERE ASSET_TICKER = 'BTC' AND  CALENDAR_DATE >= TO_DATE('${startDate}', 'YYYY-MM-DD') AND CALENDAR_DATE <= TO_DATE('${endDate}', 'YYYY-MM-DD')
    ), HighQuotes AS (
        SELECT ASSET_TICKER, CALENDAR_DATE, HIGH FROM TickerQuotes
        ORDER BY HIGH DESC FETCH FIRST 1 ROWS ONLY
    ), LowQuotes AS (
        SELECT ASSET_TICKER, CALENDAR_DATE, LOW FROM TickerQuotes 
        ORDER BY LOW FETCH FIRST 1 ROWS ONLY
    ) 
    SELECT l.low as LOW, l.CALENDAR_DATE AS lowDate, h.high as HIGH, h.CALENDAR_DATE AS highDate 
    FROM HighQuotes h 
    JOIN LowQuotes l ON h.ASSET_TICKER = l.ASSET_TICKER
  `;

  const volumeQuery = `
    WITH TickerQuotes AS (
        SELECT ASSET_TICKER, CALENDAR_DATE, VOLUME
        FROM CRYPTOQUOTE
        WHERE ASSET_TICKER = 'BTC' AND  CALENDAR_DATE >= TO_DATE('${startDate}', 'YYYY-MM-DD') AND CALENDAR_DATE <= TO_DATE('${endDate}', 'YYYY-MM-DD')
    ), HighVolume AS (
        SELECT ASSET_TICKER, CALENDAR_DATE as highVolumeDate, VOLUME FROM TickerQuotes 
        ORDER BY VOLUME DESC FETCH FIRST 1 ROWS ONLY
    ), LowVolume AS (
        SELECT ASSET_TICKER, CALENDAR_DATE as lowVolumeDate, VOLUME FROM TickerQuotes 
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
    SELECT CALENDAR_DATE, OPEN, CLOSE, ROUND(((CLOSE-OPEN)/OPEN * 100), 2) AS PERCENTCHANGE 
    FROM CRYPTOQUOTE
    WHERE ASSET_TICKER = 'BTC' AND  CALENDAR_DATE >= TO_DATE('${startDate}', 'YYYY-MM-DD') AND CALENDAR_DATE <= TO_DATE('${endDate}', 'YYYY-MM-DD')
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
      "changeResult": changeResult.rows,
    });
  } catch (err) {
    console.log(err);
  }
}

async function getCryptoComparisonData(req, res) {
  await init()
  var industry = req.params.industry;
  var startDate = req.params.startDate;
  var endDate = req.params.endDate;

  const comparisonQuery = `
    WITH TickerQuotes AS (
        SELECT *
        FROM StockQuote sq
        JOIN (SELECT * FROM Stock WHERE INDUSTRY = '${industry}') s ON sq.ASSET_TICKER = s.TICKER
    ), firstQuotes AS (
        SELECT sq1.date_calendar, sq1.asset_ticker, sq1.close
        FROM TickerQuotes sq1
        WHERE sq1.date_calendar = (
            SELECT MIN(sq2.date_calendar)
            FROM TickerQuotes sq2
            WHERE sq2.asset_ticker=sq1.asset_ticker
            AND sq2.date_calendar >= TO_DATE('${startDate}', 'YYYY-MM-DD')
        )
    ), lastQuotes AS (
        SELECT sq1.date_calendar, sq1.asset_ticker, sq1.close
        FROM TickerQuotes sq1
        WHERE sq1.date_calendar = (
            SELECT MAX(sq2.date_calendar)
            FROM TickerQuotes sq2
            WHERE sq2.asset_ticker=sq1.asset_ticker
            AND sq2.date_calendar <= TO_DATE('${endDate}', 'YYYY-MM-DD')
        )
    ), bitcoin AS (
        SELECT timestamp, asset_ticker, close
        FROM CRYPTOQUOTE
        WHERE asset_ticker='BTC'
        AND timestamp >= ((TO_DATE('${startDate}', 'YYYY-MM-DD') - TO_DATE('1970-01-01', 'YYYY-MM-DD'))*24*60*60)
        AND timestamp <= ((TO_DATE('${endDate}', 'YYYY-MM-DD') - TO_DATE('1970-01-01', 'YYYY-MM-DD'))*24*60*60)
    )
    SELECT fq.asset_ticker, 100*((lq.close - fq.close)/fq.close) as stock_return, 100*((lq.close - fq.close)/fq.close - (btc2.close-btc1.close)/btc1.close) as difference
    FROM firstQuotes fq
    JOIN lastQuotes lq ON fq.asset_ticker = lq.asset_ticker
    CROSS JOIN (
        SELECT b1.timestamp, b1.close 
        FROM bitcoin b1
        INNER JOIN (SELECT MIN(b3.timestamp) as timestamp FROM bitcoin b3) b2 ON b1.timestamp=b2.timestamp
    ) btc1
    CROSS JOIN (
        SELECT b3.timestamp, b3.close 
        FROM bitcoin b3
        INNER JOIN (SELECT MAX(b5.timestamp) as timestamp FROM bitcoin b5) b4 ON b3.timestamp=b4.timestamp
    ) btc2
    ORDER BY ABS(difference)
    `
  try {
    const comparisonResult = await connection.execute(comparisonQuery);
    console.log(comparisonResult);
    res.json({
      "comparisonResult": comparisonResult.rows,
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
            FROM (SELECT * FROM StockQuote WHERE date_calendar >= TO_DATE('${startDate}', 'YYYY-MM-DD')) sq2
            WHERE sq2.asset_ticker=sq1.asset_ticker
        )
    ), lastQuotes AS (
        SELECT sq1.date_calendar, sq1.asset_ticker, sq1.close
        FROM StockQuote sq1
        WHERE sq1.date_calendar = (
            SELECT MAX(sq2.date_calendar)
            FROM (SELECT * FROM StockQuote WHERE date_calendar <= TO_DATE('${endDate}', 'YYYY-MM-DD')) sq2
            WHERE sq2.asset_ticker=sq1.asset_ticker
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
    FROM comparisons c JOIN (SELECT * FROM Stock WHERE TICKER <> '${ticker}') s ON c.ASSET_TICKER = s.TICKER
    ORDER BY DIFFERENCE
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
  getCryptoComparisonData: getCryptoComparisonData
};