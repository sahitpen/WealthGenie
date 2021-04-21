import React from 'react';
import {
	BrowserRouter as Router,
	Route,
	Switch
} from 'react-router-dom';
import Dashboard from './Dashboard';
import Recommendations from './Recommendations';
import BestMovies from './BestMovies';

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
							render={() => <Recommendations />}
						/>
						<Route
							path="/portfolio"
							render={() => <BestMovies />}
						/>
					</Switch>
				</Router>
			</div>
		);
	};
};