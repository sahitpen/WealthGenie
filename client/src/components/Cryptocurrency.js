import React from 'react';
import '../style/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PageNavbar from './PageNavbar';
import KeywordButton from './KeywordButton';
import DashboardMovieRow from './DashboardMovieRow';
import moment from 'moment';


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
      changeClose: "",


      Cticker: "",
      CstartDate: "",
      CendDate: "",
      CpercentGrowth: "",
      CstartingPrice: "",
      CendingPrice: "",
      ClowPrice: "",
      ChighPrice: "",
      ClowPriceDate: "",
      ChighPriceDate: "",
      ClowVolume: "",
      ClowVolumeDate: "",
      ChighVolume: "",
      ChighVolumeDate: "",
      CavgVolume: "",
      CchangePercent: "",
      CchangeDate: "",
      CchangeOpen: "",
      CchangeClose: ""
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

  convertDates(startDate, endDate) {
    const newStartDate = moment(startDate, 'M/D/YYYY').format('YYYY-MM-DD')
    const newEndDate = moment(endDate, 'M/D/YYYY').format('YYYY-MM-DD')
    console.log(newStartDate);
    return [newStartDate, newEndDate]
  }

  validateDates(startDate, endDate) {
    if (!moment(startDate, 'M/D/YYYY', true).isValid()) {
      alert("Start date is in the wrong format. Use the M/D/YYYY format.")
      return false;
    }
    if (!moment(endDate, 'M/D/YYYY', true).isValid()) {
      alert("End date is in the wrong format. Use the M/D/YYYY format.")
      return false;
    }
    if (moment(startDate) > moment(endDate)) {
      alert("Start date should be before the end date.")
      return false;
    }
    if (moment(startDate) < moment("2/8/2013")) {
      alert("Please choose a date after 2/8/2013. The dataset starts from this date.")
      return false;
    }
    if (moment(endDate) > moment("2/7/2018")) {
      alert("Please choose a date before 2/7/2018. The dataset ends at this date.")
      return false;
    }
    return true;
  }

  submitSearch(e) {
    //const ticker = document.getElementById('tickerInput').value;
    const startDate = document.getElementById('startDateInput').value;
    const endDate = document.getElementById('endDateInput').value;
    const ticker = document.getElementById('tickerInput').value;

    const formattedDates = this.convertDates(startDate, endDate)

    e.preventDefault()
    console.log("button hit");

    if (!this.validateDates(startDate, endDate)) {
      console.log("invalid date");
      return;
    }
    fetch("http://localhost:8081/crypto/" + "BTC" + "/" + formattedDates[0] + "/" + formattedDates[1],
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {

        console.log("wut");
        return res.json()
      }, err => {

        console.log(err);
      }).then(cryptoData => {
        console.log("we here!");
        console.log(cryptoData);
        this.setState({
          Cticker: "BTC",
          CstartDate: startDate,
          CendDate: endDate,
          CpercentGrowth: cryptoData.growthResult[0][2].toFixed(2),
          CstartingPrice: cryptoData.growthResult[0][0].toFixed(2),
          CendingPrice: cryptoData.growthResult[0][1].toFixed(2),
          ClowPrice: cryptoData.priceResult[0][0].toFixed(2),
          ClowPriceDate: moment(cryptoData.priceResult[0][1]).format("M/D/YYYY"),
          ChighPrice: cryptoData.priceResult[0][2].toFixed(2),
          ChighPriceDate: moment(cryptoData.priceResult[0][3]).format("M/D/YYYY"),
          ClowVolume: cryptoData.volumeResult[0][0],
          ClowVolumeDate: moment(cryptoData.volumeResult[0][1]).format("M/D/YYYY"),
          ChighVolume: cryptoData.volumeResult[0][2],
          ChighVolumeDate: moment(cryptoData.volumeResult[0][3]).format("M/D/YYYY"),
          CavgVolume: cryptoData.volumeResult[0][4].toFixed(2),
          CchangeDate: moment(cryptoData.changeResult[0][0]).format("M/D/YYYY"),
          CchangeOpen: cryptoData.changeResult[0][1].toFixed(2),
          CchangeClose: cryptoData.changeResult[0][2].toFixed(2),
          CchangePercent: cryptoData.changeResult[0][3].toFixed(2),
          CsimilarCompanies: "NA"
        });
      }, err => {
        console.log("oops")
        console.log(err);
      });

    fetch("http://localhost:8081/stock/" + ticker + "/" + formattedDates[0] + "/" + formattedDates[1],
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err);
      }).then(stockData => {
        console.log(stockData);
        if (stockData.growthResult.length == 0) {
          alert("Inputted ticker is invalid or not available in dataset.");
          return;
        }
        var similarCompanies = []
        for (var i = 0; i < stockData.similarCompaniesResult.length; i++) {
          const ticker = stockData.similarCompaniesResult[i][0];
          const name = stockData.similarCompaniesResult[i][1];
          const growth = stockData.similarCompaniesResult[i][2].toFixed(2);
          similarCompanies.push(
            <tr>
              <th scope="row">{i + 1}</th>
              <td>{ticker}</td>
              <td>{name}</td>
              <td>{growth} %</td>
            </tr>
          )
        }
        this.setState({
          ticker: ticker,
          startDate: startDate,
          endDate: endDate,
          percentGrowth: stockData.growthResult[0][2].toFixed(2),
          startingPrice: stockData.growthResult[0][0].toFixed(2),
          endingPrice: stockData.growthResult[0][1].toFixed(2),
          lowPrice: stockData.priceResult[0][0].toFixed(2),
          lowPriceDate: moment(stockData.priceResult[0][1]).format("M/D/YYYY"),
          highPrice: stockData.priceResult[0][2].toFixed(2),
          highPriceDate: moment(stockData.priceResult[0][3]).format("M/D/YYYY"),
          lowVolume: stockData.volumeResult[0][0],
          lowVolumeDate: moment(stockData.volumeResult[0][1]).format("M/D/YYYY"),
          highVolume: stockData.volumeResult[0][2],
          highVolumeDate: moment(stockData.volumeResult[0][3]).format("M/D/YYYY"),
          avgVolume: stockData.volumeResult[0][4].toFixed(2),
          changeDate: moment(stockData.changeResult[0][0]).format("M/D/YYYY"),
          changeOpen: stockData.changeResult[0][1].toFixed(2),
          changeClose: stockData.changeResult[0][2].toFixed(2),
          changePercent: stockData.changeResult[0][3].toFixed(2),
          similarCompanies: similarCompanies
        });
      }, err => {
        console.log(err);
      });
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
              <input type="text" id="tickerInput" class="form-control" placeholder="Ticker" aria-label="Ticker" />
              <input type="text" id="startDateInput" class="form-control" placeholder="Start (M/D/YYYY)" aria-label="StartDate" />
              <input type="text" id="endDateInput" class="form-control" placeholder="End (M/D/YYYY)" aria-label="EndDate" />
              <button class="form-control btn btn-outline-success my-2 my-sm-0" onClick={this.submitSearch}>Search</button>
            </div>
          </form>
        </div>

        <br />

        <div className="container">
          <h3>
            Bitcoin&nbsp;
          </h3>
        </div>

        <div className="container">

          <div class="card-columns">
            <div class="card text-white bg-success mb-3">
              <div class="card-header">Growth of Bitcoin</div>
              <div class="card-body">
                <h5 class="card-title"><b>{this.state.CpercentGrowth} %</b></h5>
                <p class="card-text">between {this.state.CstartDate} and {this.state.CendDate}. The price went from ${this.state.CstartingPrice} to ${this.state.CendingPrice}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Highest Price of Bitcoin</h5>
                <p class="card-text">${this.state.ChighPrice} was the highest price, reached on {this.state.ChighPriceDate}.</p>
              </div>
            </div>
            <div class="card bg-light mb-3" >
              <div class="card-header">Most Change in One Day</div>
              <div class="card-body">
                <h5 class="card-title">{this.state.CchangeDate}</h5>
                <p class="card-text">Increased {this.state.CchangePercent}% from 12:00am to 11:59pm. The price jumped from ${this.state.CchangeOpen} to ${this.state.CchangeClose}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Lowest Price of Bitcoin </h5>
                <p class="card-text">${this.state.ClowPrice} was the lowest price, reached on {this.state.ClowPriceDate}.</p>
              </div>
            </div>
            <div class="card text-white bg-dark mb-3">
              <div class="card-header">Average Trading Volume</div>
              <div class="card-body">
                <h5 class="card-title">{this.state.CavgVolume}</h5>
                <p class="card-text">On average, {this.state.Cticker} was traded {this.state.CavgVolume} times per day between {this.state.CstartDate} and {this.state.CendDate}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                Trading Volume
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">High of <b>{this.state.ChighVolume}</b> on {this.state.ChighVolumeDate}</li>
                <li class="list-group-item">Low of <b>{this.state.ClowVolume}</b> on {this.state.ClowVolumeDate}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="container">
          <h3>
            Compared to&nbsp;
            <small class="text-muted"> {this.state.ticker}</small>
          </h3>
        </div>


        <div className="container">
          <div class="card-columns">
            <div class="card text-white bg-success mb-3">
              <div class="card-header">Growth of {this.state.ticker}</div>
              <div class="card-body">
                <h5 class="card-title"><b>{this.state.percentGrowth} %</b></h5>
                <p class="card-text">between {this.state.startDate} and {this.state.endDate}. The price went from ${this.state.startingPrice} to ${this.state.endingPrice}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Highest Price of {this.state.ticker}</h5>
                <p class="card-text">${this.state.highPrice} was the highest price, reached on {this.state.highPriceDate}.</p>
              </div>
            </div>
            <div class="card bg-light mb-3" >
              <div class="card-header">Most Change in One Day</div>
              <div class="card-body">
                <h5 class="card-title">{this.state.changeDate}</h5>
                <p class="card-text">On this day, {this.state.ticker} gained {this.state.changePercent}% in one trading day. The price jumped from ${this.state.changeOpen} to ${this.state.changeClose}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Lowest Price of {this.state.ticker} </h5>
                <p class="card-text">${this.state.lowPrice} was the lowest price, reached on {this.state.lowPriceDate}.</p>
              </div>
            </div>
            <div class="card text-white bg-dark mb-3">
              <div class="card-header">Average Trading Volume</div>
              <div class="card-body">
                <h5 class="card-title">{this.state.avgVolume}</h5>
                <p class="card-text">On average, {this.state.ticker} was traded {this.state.avgVolume} times per trading day between {this.state.startDate} and {this.state.endDate}</p>
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
