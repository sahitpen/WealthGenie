import React from 'react';
import '../style/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PageNavbar from './PageNavbar';
import KeywordButton from './KeywordButton';
import DashboardMovieRow from './DashboardMovieRow';
import moment from 'moment';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ticker: "Company",
      startDate: "2/8/2013",
      endDate: "2/7/2018",
      percentGrowth: "0",
      startingPrice: "0",
      endingPrice: "0",
      lowPrice: "0",
      highPrice: "0",
      lowPriceDate: "2/8/2013",
      highPriceDate: "2/8/2013",
      lowVolume: "0",
      lowVolumeDate: "2/8/2013",
      highVolume: "0",
      highVolumeDate: "2/8/2013",
      avgVolume: "0",
      changePercent: "0",
      changeDate: "2/8/2013",
      changeOpen: "0",
      changeClose: "0",
      industry: "Industry",
      industryStartDate: "2/8/2013",
      industryEndDate: "2/7/2018",
      numStocksIndustry: "0",
      industryGrowth: "0",
      topIndustryStocks: [],
      worstIndustryStocks: [],
      industryOptions: [],
      similarCompanies: []
    };

    this.submitInputStockSearch = this.submitInputStockSearch.bind(this);
    this.submitDefaultStockSearch = this.submitDefaultStockSearch.bind(this);
    this.submitIndustrySearch = this.submitIndustrySearch.bind(this);
  };

  componentDidMount() {
    fetch("http://localhost:8081/industry",
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err);
      }).then(industryNames => {
        console.log(industryNames);
        var industryOptions = []
        for (var i = 0; i < industryNames.namesResult.length; i++) {
          const name = industryNames.namesResult[i][0];
          industryOptions.push(<option value={name}>{name}</option>)
        }
        this.setState({
          industryOptions: industryOptions
        })
      }, err => {
        console.log(err);
      });
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

  convertDates(startDate, endDate) {
    const newStartDate = moment(startDate, 'M/D/YYYY').format('YYYY-MM-DD')
    const newEndDate = moment(endDate, 'M/D/YYYY').format('YYYY-MM-DD')
    console.log(newStartDate);
    return [newStartDate, newEndDate]
  }

  submitDefaultStockSearch(e) {
    console.log(e.target.value)
    this.submitStockSearch(e.target.value, "2/8/2013", "2/7/2018");
    window.scrollTo(0, 0);
  }

  submitInputStockSearch(e) {
    e.preventDefault()
    const ticker = document.getElementById('tickerInput').value;
    const startDate = document.getElementById('startDateInput').value || this.state.startDate;
    const endDate = document.getElementById('endDateInput').value || this.state.endDate;
    this.submitStockSearch(ticker, startDate, endDate)
  }

  submitStockSearch(ticker, startDate, endDate) {
    if (!this.validateDates(startDate, endDate)) return;
    const formattedDates = this.convertDates(startDate, endDate)
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

  submitIndustrySearch(e) {
    const industry = document.getElementById("industryInput").value;
    const startDate = document.getElementById('startDateIndustryInput').value || this.state.startDate;
    const endDate = document.getElementById('endDateIndustryInput').value || this.state.endDate;
    if (!this.validateDates(startDate, endDate)) return;
    const formattedDates = this.convertDates(startDate, endDate)
    e.preventDefault()
    fetch("http://localhost:8081/industry/" + industry + "/" + formattedDates[0] + "/" + formattedDates[1],
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err);
      }).then(industryData => {
        console.log(industryData);
        const topIndustryStocks = [];
        const worstIndustryStocks = [];
        for (var i = 0; i < industryData.topStocksResult.length; i++) {
          const ticker = industryData.topStocksResult[i][0];
          const growth = industryData.topStocksResult[i][1].toFixed(2);
          topIndustryStocks.push(
            <tr>
              <td>{ticker}</td>
              <td>{growth} %</td>
            </tr>
          )
        }
        for (var i = 0; i < industryData.worstStocksResult.length; i++) {
          const ticker = industryData.worstStocksResult[i][0];
          const growth = industryData.worstStocksResult[i][1].toFixed(2);
          worstIndustryStocks.push(
            <tr>
              <td>{ticker}</td>
              <td>{growth} %</td>
            </tr>
          )
        }
        this.setState({
          industry: industry,
          industryStartDate: startDate,
          industryEndDate: endDate,
          numStocksIndustry: industryData.growthResult[0][0],
          industryGrowth: industryData.growthResult[0][1].toFixed(2),
          topIndustryStocks: topIndustryStocks,
          worstIndustryStocks: worstIndustryStocks
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
          <h3> Historical Data for <span style={{ color: '#73DA8C' }}>S&P 500</span>  Companies
          </h3>
        </div>

        <br />

        <div className="container d-flex justify-content-center" >
          <form class="form-inline my-2 my-lg-0">
            <div class="input-group mb-3">
              <input type="text" id="tickerInput" class="form-control" placeholder="Ticker" aria-label="Ticker" />
              <input type="text" id="startDateInput" class="form-control" placeholder="Start (M/D/YYYY)" aria-label="StartDate" />
              <input type="text" id="endDateInput" class="form-control" placeholder="End (M/D/YYYY)" aria-label="EndDate" />
              <button class="form-control btn btn-outline-success my-2 my-sm-0" onClick={this.submitInputStockSearch}>Search</button>
            </div>
          </form>
        </div>

        <br />

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

        <div className="container movies-container">
          <h3>
            Companies&nbsp;
            <small class="text-muted">with the closest returns to {this.state.ticker}</small>
          </h3>
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Ticker</th>
                <th scope="col">Name</th>
                <th scope="col">Growth</th>
              </tr>
            </thead>
            <tbody>
              {this.state.similarCompanies}
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
            <button type="button" value="AAPL" onClick={this.submitDefaultStockSearch} class="btn btn-outline-secondary">Apple</button>
            <button type="button" value="AMZN" onClick={this.submitDefaultStockSearch} class="btn btn-outline-secondary">Amazon</button>
            <button type="button" value="FB" onClick={this.submitDefaultStockSearch} class="btn btn-outline-secondary">Facebook</button>
            <button type="button" value="MSFT" onClick={this.submitDefaultStockSearch} class="btn btn-outline-secondary">Microsoft</button>
            <button type="button" value="NFLX" onClick={this.submitDefaultStockSearch} class="btn btn-outline-secondary">Netflix</button>
            <button type="button" value="GOOGL" onClick={this.submitDefaultStockSearch} class="btn btn-outline-secondary">Alphabet</button>
            <button type="button" value="NVDA" onClick={this.submitDefaultStockSearch} class="btn btn-outline-secondary">Nvidia</button>
          </div>
        </div>

        <br />

        <div className="container movies-container" >
          <h3>
            Industry&nbsp;
            <small class="text-muted">analysis</small>
          </h3>
          <form class="form-inline my-2 my-lg-0">
            <div class="input-group mb-3">
              <select id="industryInput" class="form-select form-select-border-color">
                {this.state.industryOptions}
              </select>
              <input type="text" id="startDateIndustryInput" class="form-control" placeholder="Start (M/D/YYYY)" aria-label="StartDate" />
              <input type="text" id="endDateIndustryInput" class="form-control" placeholder="End (M/D/YYYY)" aria-label="EndDate" />
              <button class="form-control btn btn-outline-success my-2 my-sm-0" onClick={this.submitIndustrySearch}>Search</button>
            </div>
          </form>
        </div>

        <br />


        <div className="container">
          <div class="card-columns">
            <div class="card text-white bg-success mb-3">
              <div class="card-header">Growth of Industry</div>
              <div class="card-body">
                <h5 class="card-title"><b>{this.state.industryGrowth} %</b></h5>
                <p class="card-text">between {this.state.industryStartDate} and {this.state.industryEndDate}.</p>
              </div>
            </div>
            <div class="card bg-light mb-3">
              <div class="card-header">Number of {this.state.industry} Stocks</div>
              <div class="card-body">
                <h5 class="card-title"><b>{this.state.numStocksIndustry}</b></h5>
                <p class="card-text">{this.state.industry} stocks in the S&P 500.</p>
              </div>
            </div>
            <div class="card">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">Top Companies in Industry</th>
                    <th scope="col">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.topIndustryStocks}
                </tbody>
              </table>
            </div>
            <div class="card">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">Worst Companies in Industry</th>
                    <th scope="col">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.worstIndustryStocks}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
      </div >
    );
  };
};
