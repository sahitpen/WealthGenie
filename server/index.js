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
app.get('/stock', routes.getTop20Keywords);

app.get('/crypto/:ticker/:startDate/:endDate', routes.getCryptoData);


/* ---- Q1b (Dashboard) ---- */
app.get('/keywords/:keyword', routes.getTopMoviesWithKeyword);

/* ---- (Stock Search) ---- */
app.get('/stock/:ticker/:startDate/:endDate', routes.getStockData);

/* ---- (Portfolio Search) ---- */
app.get('/portfolio/:ticker', routes.getAssetTickers);

/* ---- Q2 (Recommendations) ---- */
app.get('/recommendations/:movieName', routes.getRecs);


/* ---- (Best Movies) ---- */
app.get('/decades', routes.getDecades);
app.get('/genres', routes.getGenres);


/* ---- Q3b (Best Movies) ---- */
app.get('/bestmovies/:decade/:genre', routes.bestMoviesPerDecadeGenre);


app.listen(8081, () => {
	console.log(`Server listening on PORT 8081`);
});