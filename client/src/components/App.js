import React from 'react';
import {
	BrowserRouter as Router,
	Route,
	Switch
} from 'react-router-dom';
import Dashboard from './Dashboard';
import Recommendations from './Recommendations';
import BestMovies from './BestMovies';
import Cryptocurrency from './Cryptocurrency';
import Portfolio from './Portfolio';

export default class App extends React.Component {

	render() {
		return (
			<div className="App">
				<Router>
					<Switch>
						<Route
							exact
							path="/"
							render={() => <Dashboard />}
						/>
						<Route
							exact
							path="/stock"
							render={() => <Dashboard />}
						/>
						<Route
							path="/cryptocurrency"
							render={() => <Cryptocurrency />}
						/>
						<Route
							path="/portfolio"
							render={() => <Portfolio />}
						/>
					</Switch>
				</Router>
			</div>
		);
	};
};