import React from 'react';
import {
	BrowserRouter as Router,
	Route,
	Switch
} from 'react-router-dom';
import Dashboard from './Dashboard';
import Cryptocurrency from './Cryptocurrency';
import Portfolio from './Portfolio';

export default class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			id: '',
			loggedIn: false,
		};
	};

	changeLoginInfo(id, loggedIn) {
		this.setState({
			id: id,
			loggedIn: loggedIn
		})
	}

	render() {
		return (
			<div className="App">
				<Router>
					<Switch>
						<Route
							exact
							path="/"
							render={() => <Dashboard loggedIn={this.state.loggedIn} user_id={this.state.id} changeLoginInfo={this.changeLoginInfo.bind(this)}/>}
						/>
						<Route
							exact
							path="/stock"
							render={() => <Dashboard loggedIn={this.state.loggedIn} user_id={this.state.id} changeLoginInfo={this.changeLoginInfo.bind(this)} />}
						/>
						<Route
							path="/cryptocurrency"
							render={() => <Cryptocurrency loggedIn={this.state.loggedIn} user_id={this.state.id} changeLoginInfo={this.changeLoginInfo.bind(this)} />}
						/>
						<Route
							path="/portfolio"
							render={() => <Portfolio loggedIn={true} user_id={"allapk@seas.upenn.edu"} changeLoginInfo={this.changeLoginInfo.bind(this)} />}
						/>
					</Switch>
				</Router>
			</div>
		);
	};
};