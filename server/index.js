const bodyParser = require('body-parser');
const express = require('express');
var routes = require("./routes.js");
const cors = require('cors');

const app = express();

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* ---------------------------------------------------------------- */
/* ------------------- Route handler registration ----------------- */
/* ---------------------------------------------------------------- */

/* ---- (Dashboard) ---- */
// The route localhost:8081/keywords is registered to the function
// routes.getTop20Keywords, specified in routes.js.

/* ---- (Sign Up) ---- */
app.get('/signup/:email/:password', routes.signUp)

/* ---- (Login) ---- */
app.get('/login/:email/:password', routes.login)

/* ---- (Bitcoin Search) ---- */
app.get('/crypto/:ticker/:startDate/:endDate', routes.getCryptoData);
app.get('/crypto/:ticker/:industry/:startDate/:endDate', routes.getCryptoComparisonData);


/* ---- (Stock Search) ---- */
app.get('/stock/:ticker/:startDate/:endDate', routes.getStockData);

/* ---- (Industry Search) ---- */
app.get('/industry', routes.getIndustryNames);
app.get('/industry/:industry/:startDate/:endDate', routes.getIndustryData);

/* ---- (Portfolio Search) ---- */
app.get('/portfolio/:ticker', routes.getAssetTickers);

/* ---- (Get Portfolio) ---- */
app.get('/getPortfolio/:id', routes.getPortfolio);

/* ---- (Add to Portfolio) ---- */
app.get('/addPortfolio/:id/:ticker/:count', routes.addAssetToPortfolio);

/* ---- (Remove from Portfolio) ---- */
app.get('/removePortfolio/:id/:ticker', routes.removeAssetFromPortfolio);

/* ---- (Update Portfolio Quantity) ---- */
app.get('/updatePortfolio/:id/:ticker/:count', routes.updateAssetQuantity);

/* ---- (Update Portfolio Quantity) ---- */
app.get('/getPortfolioPercentGrowth/:id/individual', routes.getPortfolioPercentGrowthIndividual);


app.listen(8081, () => {
	console.log(`Server listening on PORT 8081`);
});