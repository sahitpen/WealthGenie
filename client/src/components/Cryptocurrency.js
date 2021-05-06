import React from 'react';
import '../style/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PageNavbar from './PageNavbar';
import KeywordButton from './KeywordButton';
import DashboardMovieRow from './DashboardMovieRow';

export default class Cryptocurrency extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ticker: "",
      startDate: "",
      endDate: "",
      percentGrowth: "",
      startingPrice: "",
      endingPrice: "",
      lowPrice: "",
      highPrice: "",
      lowPriceDate: "",
      highPriceDate: "",
      lowVolume: "",
      lowVolumeDate: "",
      highVolume: "",
      highVolumeDate: "",
      avgVolume: "",
      changePercent: "",
      changeDate: "",
      changeOpen: "",
      changeClose: ""
    };

    this.submitSearch = this.submitSearch.bind(this);
  };

  // // React function that is called when the page load.
  // componentDidMount() {
  //   // Send an HTTP request to the server.
  //   fetch("http://localhost:8081/stock",
  //     {
  //       method: 'GET' // The type of HTTP request.
  //     }).then(res => {
  //       // Convert the response data to a JSON.
  //       return res.json();
  //     }, err => {
  //       // Print the error if there is one.
  //       console.log(err);
  //     }).then(keywordsList => {
  //       if (!keywordsList) return;

  //       // Map each keyword in this.state.keywords to an HTML element:
  //       // A button which triggers the showMovies function for each keyword.
  //       const keywordsDivs = keywordsList.map((keywordObj, i) =>
  //         <KeywordButton
  //           id={"button-" + keywordObj.kwd_name}
  //           onClick={() => this.showMovies(keywordObj.kwd_name)}
  //           keyword={keywordObj.kwd_name}
  //         />
  //       );

  //       // Set the state of the keywords list to the value returned by the HTTP response from the server.
  //       this.setState({
  //         keywords: keywordsDivs
  //       });
  //     }, err => {
  //       // Print the error if there is one.
  //       console.log(err);
  //     });
  // };

  submitSearch(e) {
    //const ticker = document.getElementById('tickerInput').value;
    const startDate = document.getElementById('startDateInput').value;
    const endDate = document.getElementById('endDateInput').value;
    e.preventDefault()
    console.log("button hit");

    //fetch crypto data

    /*(fetch("http://localhost:8081/stock/" + ticker + "/" + startDate + "/" + endDate,
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err);
      }).then(stockData => {
        console.log(stockData);
        this.setState({
          ticker: ticker,
          startDate: startDate,
          endDate: endDate,
          percentGrowth: stockData.growthResult[0][2],
          startingPrice: stockData.growthResult[0][0],
          endingPrice: stockData.growthResult[0][1],
          lowPrice: stockData.priceResult[0][0],
          lowPriceDate: stockData.priceResult[0][1],
          highPrice: stockData.priceResult[0][2],
          highPriceDate: stockData.priceResult[0][3],
          lowVolume: stockData.volumeResult[0][0],
          lowVolumeDate: stockData.volumeResult[0][1],
          highVolume: stockData.volumeResult[0][2],
          highVolumeDate: stockData.volumeResult[0][3],
          avgVolume: stockData.volumeResult[0][4],
          changeDate: stockData.changeResult[0][0],
          changeOpen: stockData.changeResult[0][1],
          changeClose: stockData.changeResult[0][2],
          changePercent: stockData.changeResult[0][3]
        });
      }, err => {
        console.log(err);
      });*/
  };

  render() {
    return (
      <div className="Dashboard">

        <PageNavbar active="dashboard" />

        <br />

        <div className="container d-flex justify-content-center" >
          <h3> Historical Data for <span style={{ color: '#73DA8C' }}>Bitcoin</span>
          </h3>
        </div>

        <br />

        <div className="container d-flex justify-content-center" >
          <form class="form-inline my-2 my-lg-0">
            <div class="input-group mb-3">
              <input type="text" id="startDateInput" class="form-control" placeholder="Start Date" aria-label="StartDate" />
              <input type="text" id="endDateInput" class="form-control" placeholder="End Date" aria-label="EndDate" />
              <button class="form-control btn btn-outline-success my-2 my-sm-0" onClick={this.submitSearch}>Search</button>
            </div>
          </form>
        </div>

        <br />

        <div className="container">
          <div class="card-columns">
            <div class="card text-white bg-success mb-3">
              <div class="card-header">Growth of Bitcoin</div>
              <div class="card-body">
                <h5 class="card-title"><b>{this.state.percentGrowth} %</b></h5>
                <p class="card-text">between {this.state.startDate} and {this.state.endDate}. The price went from ${this.state.startingPrice} to ${this.state.endingPrice}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Highest Price of Bitcoin</h5>
                <p class="card-text">${this.state.highPrice} was the highest price, reached on {this.state.highPriceDate}.</p>
              </div>
            </div>
            <div class="card bg-light mb-3" >
              <div class="card-header">Most Change in One Day</div>
              <div class="card-body">
                <h5 class="card-title">{this.state.changeDate}</h5>
                <p class="card-text">Increased {this.state.changePercent}% from 12:00am to 11:59pm. The price jumped from ${this.state.changeOpen} to ${this.state.changeClose}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Lowest Price of Bitcoin </h5>
                <p class="card-text">${this.state.lowPrice} was the lowest price, reached on {this.state.lowPriceDate}.</p>
              </div>
            </div>
            <div class="card text-white bg-dark mb-3">
              <div class="card-header">Average Trading Volume</div>
              <div class="card-body">
                <h5 class="card-title">{this.state.avgVolume}</h5>
                <p class="card-text">On average, {this.state.ticker} was traded {this.state.avgVolume} times per day between {this.state.startDate} and {this.state.endDate}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                Trading Volume
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">High of <b>{this.state.highVolume}</b> on {this.state.highVolumeDate}</li>
                <li class="list-group-item">Low of <b>{this.state.lowVolume}</b> on {this.state.lowVolumeDate}</li>
              </ul>
            </div>
          </div>
        </div>
      </div >
    );
  };
};
