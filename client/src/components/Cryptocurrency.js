import React from 'react';
import '../style/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PageNavbar from './PageNavbar';
import moment from 'moment';


export default class Cryptocurrency extends React.Component {


  constructor(props) {
    super(props);

    this.state = {
      Cticker: "BTC",
      CstartDate: "2/8/2013",
      CendDate: "2/7/2018",
      CpercentGrowth: "0",
      CstartingPrice: "0",
      CendingPrice: "0",
      ClowPrice: "0",
      ChighPrice: "0",
      ClowPriceDate: "2/8/2013",
      ChighPriceDate: "2/8/2013",
      ClowVolume: "0",
      ClowVolumeDate: "2/8/2013",
      ChighVolume: "0",
      ChighVolumeDate: "2/8/2013",
      CavgVolume: "0",
      CchangePercent: "0",
      CchangeDate: "2/8/2013",
      CchangeOpen: "0",
      CchangeClose: "0",
      CComparisonRows: null,
      industryOptions: null,
    };

    this.submitSearch = this.submitSearch.bind(this);
    this.submitAssetSearch = this.submitAssetSearch.bind(this);
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
    const startDate = document.getElementById('startDateInput').value;
    const endDate = document.getElementById('endDateInput').value;
    const formattedDates = this.convertDates(startDate, endDate)

    e.preventDefault()

    if (!this.validateDates(startDate, endDate)) {
      console.log("invalid date");
      return;
    }
    fetch("http://localhost:8081/crypto/" + "BTC" + "/" + formattedDates[0] + "/" + formattedDates[1],
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err);
      }).then(cryptoData => {
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
        });
      }, err => {
        console.log("oops")
        console.log(err);
      });
  };

  submitAssetSearch(e) {
    const industry = document.getElementById("industryInput").value;
    const startDate = this.state.CstartDate;
    const endDate = this.state.CendDate;
    const formattedDates = this.convertDates(startDate, endDate)

    e.preventDefault()

    if (!this.validateDates(startDate, endDate)) {
      console.log("invalid date");
      return;
    }

    fetch("http://localhost:8081/crypto/" + "BTC" + "/" + industry + "/" + formattedDates[0] + "/" + formattedDates[1],
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err);
      }).then(cryptoData => {
        console.log(cryptoData);
        var comparisonRows = []
        for (var i = 0; i < cryptoData.comparisonResult.length; i++) {
          const ticker = cryptoData.comparisonResult[i][0];
          const growth = cryptoData.comparisonResult[i][1].toFixed(2);
          const difference = cryptoData.comparisonResult[i][2].toFixed(2);
          comparisonRows.push(
            <tr>
              <td>{ticker}</td>
              <td>{growth} %</td>
              <td>{difference} %</td>
            </tr>
          )
        }
        this.setState({
          CComparisonRows: comparisonRows
        });
      }, err => {
        console.log(err);
      });
  }

  render() {
    return (
      <div className="Dashboard">

        <PageNavbar active="dashboard" />
        <br />

        {/* Title Section */}
        <div className="container d-flex justify-content-center" >
          <h3> Historical Data for <span style={{ color: '#73DA8C' }}>Bitcoin</span>
          </h3>
        </div>
        <br />

        {/* Search Section */}
        <div className="container d-flex justify-content-center" >
          <form class="form-inline my-2 my-lg-0">
            <div class="input-group mb-3">
              <input type="text" id="startDateInput" class="form-control" placeholder="Start (M/D/YYYY)" aria-label="StartDate" />
              <input type="text" id="endDateInput" class="form-control" placeholder="End (M/D/YYYY)" aria-label="EndDate" />
              <button class="form-control btn btn-outline-success my-2 my-sm-0" onClick={this.submitSearch}>Search</button>
            </div>
          </form>
        </div>
        <br />


        {/* Bitcoin Data Section */}
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
                <p class="card-text">On average, {this.state.CavgVolume} {this.state.Cticker} was traded per day between {this.state.CstartDate} and {this.state.CendDate}</p>
              </div>
            </div>
            <div class="card">
              <div class="card-header">
                Trading Volume
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">High of <b>{this.state.ChighVolume}</b> BTC on {this.state.ChighVolumeDate}</li>
                <li class="list-group-item">Low of <b>{this.state.ClowVolume}</b> BTC on {this.state.ClowVolumeDate}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stock Market Comparison Section */}
        <div className="container movies container">
          <h3>
            Stock Market&nbsp;
          <small class="text-muted">Comparison</small>
          </h3>
          <form class="form-inline my-2 my-lg-0">
            <div class="input-group mb-3">
              <select id="industryInput" class="form-select form-select-border-color">
                {this.state.industryOptions}
              </select>
              <button class="form-control btn btn-outline-success my-2 my-sm-0" onClick={this.submitAssetSearch}>Search</button>
            </div>
          </form>
        </div>
        <div className="container" style={{ height: '700px', overflow: 'scroll' }}>
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">Ticker</th>
                <th scope="col">Growth</th>
                <th scope="col">Difference</th>
              </tr>
            </thead>
            <tbody>
              {this.state.CComparisonRows}
            </tbody>
          </table>
        </div>
        <br />
        <br />
      </div >
    );
  };
};
