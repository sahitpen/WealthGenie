import React from 'react';
import '../style/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import PageNavbar from './PageNavbar';
import { BsCheck } from "react-icons/bs";
import moment from 'moment';

export default class Portfolio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      prevId: '',
      totalValue: 0,
      percentageGrowth: 0,
      assetSearchTicker: "",
      assetsToPotentiallyAdd: [],
      portfolioAssets: [],
      assetQuantities: [],
      assetsIndividualPercentGrowth: [],
      startDate: '2/8/2013',
      endDate: '2/7/2018'
    };

    this.submitAssetSearch = this.submitAssetSearch.bind(this);
    this.addStockToTicker = this.addStockWithTicker.bind(this);
    this.submitGrowthSearch = this.submitGrowthSearch.bind(this);
  };

  componentDidMount() {
    this.getPortfolioAssets(this.props.user_id);
  }
  componentDidUpdate() {
    if (this.state.prevId != this.props.user_id) {
      this.getPortfolioAssets(this.props.user_id);
      this.setState({ prevId: this.props.user_id });
    }
  }

  getPortfolioAssets(user_id) {
    fetch("http://localhost:8081/getPortfolio/" + user_id,
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err)
      }).then(assetsData => {
        console.log(assetsData)
        var value = 0;
        for (var i = 0; i < assetsData.assets.length; i++) {
          value += parseFloat(assetsData.assets[i][1]) * parseFloat(assetsData.assets[i][2]);
        }
        this.setState({
          portfolioAssets: assetsData.assets,
          totalValue: value
        });
      }, err => {
        console.log(err);
      });

      this.getPortfolioGrowth(this.state.startDate, this.state.endDate);
  }

  getPortfolioGrowth(startDate, endDate) {
    console.log(startDate);
    console.log(endDate);
    if (!this.validateDates(startDate, endDate)) return;
    const formattedDates = this.convertDates(startDate, endDate)
    fetch("http://localhost:8081/getPortfolioPercentGrowth/individual/" + this.props.user_id + "/" + formattedDates[0] + "/" + formattedDates[1],
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err)
      }).then(assetsData => {
        console.log(assetsData)
        this.setState({
          assetsIndividualPercentGrowth: assetsData.assets,
        });
      }, err => {
        console.log(err);
      });

    fetch("http://localhost:8081/getPortfolioPercentGrowth/weighted/" + this.props.user_id + "/" + formattedDates[0] + "/" + formattedDates[1],
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err)
      }).then(assetsData => {
        console.log(assetsData)
        if (assetsData.growth.length > 0) {
          this.setState({
            percentageGrowth: assetsData.growth[0],
          });
        }
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
    console.log("http://localhost:8081/addPortfolio/" + this.props.user_id + "/" + ticker + "/" + 1)
    fetch("http://localhost:8081/addPortfolio/" + this.props.user_id + "/" + ticker + "/" + 1,
      {
        method: 'GET' // The type of HTTP request.
      }).then(res => {
        return res.json()
      }, err => {
        console.log(err);
      }).then(assetsData => {
        this.getPortfolioAssets(this.props.user_id);
      }, err => {
        console.log(err);
      });
  }

  removeStockWithTicker(ticker) {
    fetch("http://localhost:8081/removePortfolio/" + this.props.user_id + "/" + ticker,
    {
      method: 'GET' // The type of HTTP request.
    }).then(res => {
      return res.json()
    }, err => {
      console.log(err);
    }).then(assetsData => {
      this.getPortfolioAssets(this.props.user_id);
    }, err => {
      console.log(err);
    });
  }

  updateStockQuantity(ticker, index) {
    var count = this.state.portfolioAssets[index][1]
    fetch("http://localhost:8081/updatePortfolio/" + this.props.user_id + "/" + ticker + "/" + count,
    {
      method: 'GET' // The type of HTTP request.
    }).then(res => {
      return res.json()
    }, err => {
      console.log(err);
    }).then(assetsData => {
      this.getPortfolioAssets(this.props.user_id);
    }, err => {
      console.log(err);
    });
  }

  handleQuantityChange(i, value) {
    var portfolio = this.state.portfolioAssets;
    portfolio[i][1] = value;
    this.setState({
      portfolioAssets: portfolio
    })
  }

  submitGrowthSearch(e) {
    e.preventDefault()
    this.setState( {
      startDate: document.getElementById('startDateInput').value || '2/8/2013',
      endDate: document.getElementById('endDateInput').value || '2/7/2018'
    })
    this.getPortfolioGrowth(document.getElementById('startDateInput').value || '2/8/2013', document.getElementById('endDateInput').value || '2/7/2018');
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


  render() {
    return (
      <div className="Dashboard">

        <PageNavbar loggedIn={this.props.loggedIn} user_id={this.props.user_id} changeLoginInfo={this.props.changeLoginInfo} active="portfolio" />
        {this.props.loggedIn
          ? <div>
            <br />

            <div className="container d-flex justify-content-center" >
              <h3> Your <span style={{ color: '#73DA8C' }}>Portfolio</span></h3>
            </div>
            <div className="subheader container d-flex justify-content-center" >
              <h5> Total Value: ${parseFloat(this.state.totalValue).toFixed(2)}</h5>
            </div>

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
                        <td>{parseFloat(assetData[2]).toFixed(2)}</td>
                        <td>
                          <div className="quantityDiv">
                            <input className="assetQuantity form-control" type="text" placeholder="" value={assetData[1]} onChange={e=>this.handleQuantityChange(i, e.target.value)}></input>
                            <div className="input-group-append">
                              <button className="btn btn-success" type="button" onClick={()=>this.updateStockQuantity(assetData[0], i)}><BsCheck /></button>
                            </div>
                          </div>
                        </td>
                        <td>{parseFloat(assetData[3]).toFixed(2)}</td>
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
              <h3> Portfolio <span style={{ color: '#73DA8C' }}>Percent Growth</span>
              </h3>
            </div>
            <div className="subheader container d-flex justify-content-center" >
              <h5> Weighted Percent Growth: {parseFloat(this.state.percentageGrowth).toFixed(2)}%</h5>
            </div>
            <div className="container d-flex justify-content-center" >
              <form className="form-inline my-2 my-lg-0">
                <div className="input-group mb-3">
                  <input type="text" id="startDateInput" className="form-control" placeholder="Start (M/D/YYYY)" aria-label="StartDate" />
                  <input type="text" id="endDateInput" className="form-control" placeholder="End (M/D/YYYY)" aria-label="EndDate" />
                  <button className="form-control btn btn-outline-success my-2 my-sm-0" onClick={this.submitGrowthSearch}>Search</button>
                </div>
              </form>
            </div>

            <br />
            <div className="container movies-container">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">Ticker</th>
                    <th scope="col">First Close</th>
                    <th scope="col">Last Close</th>
                    <th scope="col">Growth (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.assetsIndividualPercentGrowth.map((assetData,i) =>(
                      <tr key={i}>
                        <th scope="row">{assetData[0]}</th>
                        <td>{parseFloat(assetData[1]).toFixed(2)}</td>
                        <td>{parseFloat(assetData[2]).toFixed(2)}</td>
                        <td>{parseFloat(assetData[3]).toFixed(2)}</td>
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
          </div>
          : <div className="container">
              <div className="card bg-light loginMessage">
                <h3>Please login in order to create/view your portfolio</h3>
              </div>
            </div>
        }
      </div >
    );
  };
};
