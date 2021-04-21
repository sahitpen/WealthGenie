const config = require('./db-config.js');
const mysql = require('mysql');

config.connectionLimit = 10;
const connection = mysql.createPool(config);

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */


/* ---- Q1a (Dashboard) ---- */
// Equivalent to: function getTop20Keywords(req, res) {}
const getTop20Keywords = (req, res) => {
  const query = `
    SELECT kwd_name 
    FROM movie_keyword
    GROUP BY kwd_name 
    ORDER BY COUNT(*) DESC
    LIMIT 20;
  `
  connection.query(query, (err, rows, fields) => {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
};


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
  bestMoviesPerDecadeGenre: bestMoviesPerDecadeGenre
};