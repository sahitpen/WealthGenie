import React from 'react';
import '../style/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PageNavbar from './PageNavbar';

export default class Portfolio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      assetSearchTicker: "",
      assetsToPotentiallyAdd: []
    };

    this.submitAssetSearch = this.submitAssetSearch.bind(this);
    this.addStockToTicker = this.addStockWithTicker.bind(this);
  };

  submitAssetSearch(e) {
    const ticker = document.getElementById('tickerInput').value.toUpperCase();
    const startDate = '';
    const endDate = '';
    e.preventDefault()
    console.log("button hit");
    fetch("http://localhost:8081/portfolio/" + ticker,
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err);
      }).then(assetsData => {
        console.log(assetsData)
        this.setState({
          assetSearchTicker: ticker,
          assetsToPotentiallyAdd: assetsData.assets
        });
      }, err => {
        console.log(err);
      });
  };

  addStockWithTicker(ticker) {
    //TODO: add stock to portfolio
    console.log("add stock with ticker: " + ticker)
  }

  render() {
    return (
      <div className="Dashboard">

        <PageNavbar active="dashboard" />

        <br />

        <div className="container d-flex justify-content-center" >
          <h3> Your <span style={{ color: '#73DA8C' }}>Portfolio</span>
          </h3>
        </div>

        <br />

        

        <div className="container d-flex justify-content-center" >
        <h3>
            Add Asset &nbsp;
            <small class="text-muted">to Portfolio: </small>
          </h3> 
          <form class="form-inline my-2 my-lg-0">
            <div class="input-group mb-3">
              <input type="text" id="tickerInput" class="form-control" placeholder="Ticker" aria-label="Ticker" />
              <button class="form-control btn btn-outline-success my-2 my-sm-0" onClick={this.submitAssetSearch}>Search</button>
            </div>
          </form>
        </div>

        <br />

        <div className="container movies-container">
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">Ticker</th>
                <th scope="col">Name</th>
                <th scope="col">Industry</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.assetsToPotentiallyAdd.map((assetData,i) =>(
                  <tr key={i}>
                    <th scope="row">{assetData[0]}</th>
                    <td>{assetData[1]}</td>
                    <td>{assetData[2]}</td>
                    <td><button class="btn btn-success my-2 my-sm-0" onClick={()=>this.addStockWithTicker(assetData[0])} >Add</button></td>
                  </tr>
                ))
              }
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

        <div className="container movies-container" >
          <h3>
            Industry&nbsp;
            <small class="text-muted">analysis</small>
          </h3>
          <form class="form-inline my-2 my-lg-0">
            <div class="input-group mb-3">
              <select class="form-select form-select-border-color">
                <option selected>Select an industry</option>
                <option value="1">Technology</option>
                <option value="2">Financial</option>
                <option value="3">Retail</option>
              </select>
              <input type="text" id="startDateInput" class="form-control" placeholder="Start Date" aria-label="StartDate" />
              <input type="text" id="endDateInput" class="form-control" placeholder="End Date" aria-label="EndDate" />
              <button class="form-control btn btn-outline-success my-2 my-sm-0" onClick={this.submitAssetSearch}>Search</button>
            </div>
          </form>
        </div>

        <br />


        <div className="container">
          <div class="card-columns">
            <div class="card text-white bg-success mb-3">
              <div class="card-header">Growth of Industry</div>
              <div class="card-body">
                <h5 class="card-title"><b> 5%</b></h5>
                <p class="card-text">between 1/2/2019 and 1/2/2020.</p>
              </div>
            </div>
            <div class="card bg-light mb-3">
              <div class="card-header">Number of Industry Stocks</div>
              <div class="card-body">
                <h5 class="card-title"><b> 24</b></h5>
                <p class="card-text">industry stocks in the S&P 500.</p>
              </div>
            </div>
            <div class="card">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">Top Technology Companies</th>
                    <th scope="col">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>TSLA</td>
                    <td>23 %</td>
                  </tr>
                  <tr>
                    <td>KO</td>
                    <td>21 %</td>
                  </tr>
                  <tr>
                    <td>SPY</td>
                    <td>20.5 %</td>
                  </tr>
                  <tr>
                    <td>TSLA</td>
                    <td>23 %</td>
                  </tr>
                  <tr>
                    <td>TSLA</td>
                    <td>23 %</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="card">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">Worst Technology Companies</th>
                    <th scope="col">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>TSLA</td>
                    <td>23 %</td>
                  </tr>
                  <tr>
                    <td>KO</td>
                    <td>21 %</td>
                  </tr>
                  <tr>
                    <td>SPY</td>
                    <td>20.5 %</td>
                  </tr>
                  <tr>
                    <td>SPY</td>
                    <td>20.5 %</td>
                  </tr>
                  <tr>
                    <td>SPY</td>
                    <td>20.5 %</td>
                  </tr>
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
