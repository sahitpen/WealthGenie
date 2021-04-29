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
            <small className="text-muted">to Portfolio: </small>
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
        <br />
        <br />
        <br />
        <br />
      </div >
    );
  };
};
