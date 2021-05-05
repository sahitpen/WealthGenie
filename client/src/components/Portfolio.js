import React from 'react';
import '../style/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PageNavbar from './PageNavbar';

export default class Portfolio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: "allapk",
      assetSearchTicker: "",
      assetsToPotentiallyAdd: [],
      portfolioAssets: [],
    };

    this.submitAssetSearch = this.submitAssetSearch.bind(this);
    this.addStockToTicker = this.addStockWithTicker.bind(this);
  };

  componentDidMount() {
    this.getPortfolioAssets();
  }

  getPortfolioAssets() {
    fetch("http://localhost:8081/getPortfolio/" + this.state.id,
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err)
      }).then(assetsData => {
        console.log(assetsData)
        this.setState({
          portfolioAssets: assetsData.assets,
        });
      }, err => {
        console.log(err);
      });
  }

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
    fetch("http://localhost:8081/addPortfolio/" + this.state.id + "/" + ticker + "/" + 1,
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err);
      }).then(assetsData => {
        console.log(assetsData)
        this.getPortfolioAssets();
      }, err => {
        console.log(err);
      });
  }

  removeStockWithTicker(ticker) {
    fetch("http://localhost:8081/removePortfolio/" + this.state.id + "/" + ticker,
    {
      method: 'GET' // The type of HTTP request.
    }).then(res => {
      return res.json()
    }, err => {
      console.log(err);
    }).then(assetsData => {
      console.log(assetsData)
      this.getPortfolioAssets();
    }, err => {
      console.log(err);
    });
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

        <div className="container movies-container">
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">Ticker</th>
                <th scope="col">Price</th>
                <th scope="col">Quantity</th>
                <th scope="col">Value</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.portfolioAssets.map((assetData,i) =>(
                  <tr key={i}>
                    <th scope="row">{assetData[0]}</th>
                    <td>{assetData[2]}</td>
                    <td>{assetData[1]}</td>
                    <td>{assetData[3]}</td>
                    <td><button className="btn btn-danger my-2 my-sm-0" onClick={()=>this.removeStockWithTicker(assetData[0])} >Remove</button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        
        <br />
        <br />

        <div className="container d-flex justify-content-center" >
        <h3>
            Add Asset&nbsp;
            <small className="text-muted">to Portfolio:&nbsp;</small>
          </h3> 
          <form className="form-inline my-2 my-lg-0">
            <div className="input-group mb-3">
              <input type="text" id="tickerInput" className="form-control" placeholder="Ticker" aria-label="Ticker" onChange={this.submitAssetSearch}/>
            </div>
          </form>
        </div>

        <br />

        <div className="container movies-container">
          <table className="table table-hover">
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
                    <td><button className="btn btn-success my-2 my-sm-0" onClick={()=>this.addStockWithTicker(assetData[0])} >Add</button></td>
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
