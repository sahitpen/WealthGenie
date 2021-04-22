import React from 'react';
import '../style/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PageNavbar from './PageNavbar';
import KeywordButton from './KeywordButton';
import DashboardMovieRow from './DashboardMovieRow';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    // The state maintained by this React Component. This component maintains the list of keywords,
    // and a list of movies for a specified keyword.
    this.state = {
      keywords: [],
      movies: []
    };

    this.showMovies = this.showMovies.bind(this);
  };

  // React function that is called when the page load.
  componentDidMount() {
    // Send an HTTP request to the server.
    fetch("http://localhost:8081/keywords",
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        // Convert the response data to a JSON.
        return res.json();
      }, err => {
        // Print the error if there is one.
        console.log(err);
      }).then(keywordsList => {
        if (!keywordsList) return;

        // Map each keyword in this.state.keywords to an HTML element:
        // A button which triggers the showMovies function for each keyword.
        const keywordsDivs = keywordsList.map((keywordObj, i) =>
          <KeywordButton
            id={"button-" + keywordObj.kwd_name}
            onClick={() => this.showMovies(keywordObj.kwd_name)}
            keyword={keywordObj.kwd_name}
          />
        );

        // Set the state of the keywords list to the value returned by the HTTP response from the server.
        this.setState({
          keywords: keywordsDivs
        });
      }, err => {
        // Print the error if there is one.
        console.log(err);
      });
  };

  /* ---- Q1b (Dashboard) ---- */
  /* Set this.state.movies to a list of <DashboardMovieRow />'s. */
  showMovies(keyword) {
    // Send an HTTP request to the server.
    fetch("http://localhost:8081/keywords/" + keyword,
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        // Convert the response data to a JSON.
        return res.json();
      }, err => {
        // Print the error if there is one.
        console.log(err);
      }).then(movieList => {
        if (!movieList) return;

        // Map each keyword in this.state.keywords to an HTML element:
        // A button which triggers the showMovies function for each keyword.
        const movieRows = movieList.map((movieObj, i) =>
          <DashboardMovieRow
            title={movieObj.title}
            rating={movieObj.rating}
            votes={movieObj.num_ratings}
          />
        );

        // Set the state of the keywords list to the value returned by the HTTP response from the server.
        this.setState({
          movies: movieRows
        });
      }, err => {
        // Print the error if there is one.
        console.log(err);
      });

  };

  render() {
    return (
      <div className="Dashboard">

        <PageNavbar active="dashboard" />

        <br />

        <div className="container d-flex justify-content-center" >
          <h3> Search for <span style={{ color: '#73DA8C' }}>S&P 500</span>  Companies
          </h3>
        </div>

        <br />

        <div className="container d-flex justify-content-center" >
          <form class="form-inline my-2 my-lg-0">
            <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="Ticker/Name" aria-label="Ticker" />
              <input type="text" class="form-control" placeholder="Start Date" aria-label="StartDate" />
              <input type="text" class="form-control" placeholder="End Date" aria-label="EndDate" />
              <button class="form-control btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
            </div>
          </form>
        </div>

        <br />

        <div className="container">
          <div class="card-columns">
            <div class="card text-white bg-success mb-3">
              <div class="card-header">Growth of AAPL</div>
              <div class="card-body">
                <h5 class="card-title"><b>34%</b></h5>
                <p class="card-text">between January 27, 2013 and May 4, 2019. The price went from $20.32 to $323.54</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Highest Price of AAPL </h5>
                <p class="card-text">$673.22 was the highest price, reached on September 1st, 2020.</p>
              </div>
            </div>
            <div class="card bg-light mb-3" >
              <div class="card-header">Most Volatile Day</div>
              <div class="card-body">
                <h5 class="card-title">June 7th, 2018</h5>
                <p class="card-text">On this day, AAPL increased 7% in one trading day. The price jumped from $234 to $472.32</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Lowest Price of AAPL </h5>
                <p class="card-text">$673.22 was the highest price, reached on September 1st, 2020.</p>
              </div>
            </div>
            <div class="card text-white bg-dark mb-3">
              <div class="card-header">Average Trading Volume</div>
              <div class="card-body">
                <h5 class="card-title">323 million</h5>
                <p class="card-text">On average, AAPL was traded 323 million times per trading day between January 27, 2013 and May 4, 2019</p>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                Trading Volume
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">High of <b>768 M</b> on 1/2/2020</li>
                <li class="list-group-item">Low of <b>23 M</b> on 5/2/1972</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="container movies-container ">
          <h3>
            Companies&nbsp;
            <small class="text-muted">with similar returns</small>
          </h3>
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Company</th>
                <th scope="col">Growth</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>TSLA</td>
                <td>23 %</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>KO</td>
                <td>21 %</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td>SPY</td>
                <td>20.5 %</td>
              </tr>
            </tbody>
          </table>
        </div>

        <br />

        <div className="container movies-container">
          <h3>
            Other&nbsp;
            <small class="text-muted">popular companies</small>
          </h3>
          <div class="btn-group" role="group" aria-label="Basic outlined example">
            <button type="button" class="btn btn-outline-secondary">Apple</button>
            <button type="button" class="btn btn-outline-secondary">Facebook</button>
            <button type="button" class="btn btn-outline-secondary">Microsoft</button>
            <button type="button" class="btn btn-outline-secondary">Amazon</button>
            <button type="button" class="btn btn-outline-secondary">Tesla</button>
            <button type="button" class="btn btn-outline-secondary">Netflix</button>
            <button type="button" class="btn btn-outline-secondary">Alphabet</button>
          </div>
        </div>

        <br />

        <div className="container movies-container">
          <div className="jumbotron">
            <div className="h5">Keywords</div>
            <div className="keywords-container">
              {this.state.keywords}
            </div>
          </div>

          <br />
          <div className="jumbotron">
            <div className="movies-container">
              <div className="movies-header">
                <div className="header-lg"><strong>Title</strong></div>
                <div className="header"><strong>Rating</strong></div>
                <div className="header"><strong>Vote Count</strong></div>
              </div>
              <div className="results-container" id="results">
                {this.state.movies}
              </div>
            </div>
          </div>
        </div>
      </div >
    );
  };
};
