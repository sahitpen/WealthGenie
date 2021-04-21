import React from 'react';
import PageNavbar from './PageNavbar';
import BestMoviesRow from './BestMoviesRow';
import '../style/BestMovies.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class BestMovies extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedDecade: "",
			selectedGenre: "",
			decades: [],
			genres: [],
			movies: []
		};

		this.submitDecadeGenre = this.submitDecadeGenre.bind(this);
		this.handleDecadeChange = this.handleDecadeChange.bind(this);
		this.handleGenreChange = this.handleGenreChange.bind(this);
	};

	/* ---- Q3a (Best Movies) ---- */
	componentDidMount() {
		fetch("http://localhost:8081/genres",
			{
				method: 'GET' // The type of HTTP request.
			}).then(res => {
				// Convert the response data to a JSON.
				return res.json();
			}, err => {
				// Print the error if there is one.
				console.log(err);
			}).then(genreList => {
				if (!genreList) return;

				const genres = genreList.map((genreObj, i) =>
					<option className="genresOption" value={genreObj.name}>{genreObj.name}</option>
				);

				this.setState({
					selectedGenre: genreList.values().next().value.name,
					genres: genres
				});
			}, err => {
				// Print the error if there is one.
				console.log(err);
			});
		fetch("http://localhost:8081/decades",
			{
				method: 'GET' // The type of HTTP request.
			}).then(res => {
				// Convert the response data to a JSON.
				return res.json();
			}, err => {
				// Print the error if there is one.
				console.log(err);
			}).then(decadeList => {
				if (!decadeList) return;
				const decades = decadeList.map((decadesObj, i) =>
					<option className="decadesOption" value={decadesObj.decade}>{decadesObj.decade}</option>
				);

				this.setState({
					selectedDecade: decadeList.values().next().value.decade,
					decades: decades
				});
			}, err => {
				// Print the error if there is one.
				console.log(err);
			});
	};

	/* ---- Q3a (Best Movies) ---- */
	handleDecadeChange(e) {
		this.setState({
			selectedDecade: e.target.value
		});
	};

	handleGenreChange(e) {
		this.setState({
			selectedGenre: e.target.value
		});
	};

	/* ---- Q3b (Best Movies) ---- */
	submitDecadeGenre() {
		console.log(this.state.selectedDecade);
		console.log(this.state.selectedGenre);
		fetch("http://localhost:8081/bestmovies/" + this.state.selectedDecade + "/" + this.state.selectedGenre,
			{
				method: 'GET' // The type of HTTP request.
			}).then(res => {
				// Convert the response data to a JSON.
				return res.json();
			}, err => {
				// Print the error if there is one.
				console.log(err);
			}).then(movieList => {
				console.log(movieList);
				if (!movieList) return;

				const movieRows = movieList.map((movieObj, i) =>
					<BestMoviesRow
						title={movieObj.title}
						id={movieObj.movie_id}
						rating={movieObj.rating}
					/>
				);

				this.setState({
					movies: movieRows
				});
			}, err => {
				// Print the error if there is one.
				console.log(err);
			});
	};

	render() {
		return (
			<div className="BestMovies">

				<PageNavbar active="bestgenres" />

				<div className="container bestmovies-container">
					<div className="jumbotron">
						<div className="h5">Best Movies</div>
						<div className="dropdown-container">
							<select value={this.state.selectedDecade} onChange={this.handleDecadeChange} className="dropdown" id="decadesDropdown">
								{this.state.decades}
							</select>
							<select value={this.state.selectedGenre} onChange={this.handleGenreChange} className="dropdown" id="genresDropdown">
								{this.state.genres}
							</select>
							<button className="submit-btn" id="submitBtn" onClick={this.submitDecadeGenre}>Submit</button>
						</div>
					</div>
					<div className="jumbotron">
						<div className="movies-container">
							<div className="movie">
								<div className="header"><strong>Title</strong></div>
								<div className="header"><strong>Movie ID</strong></div>
								<div className="header"><strong>Rating</strong></div>
							</div>
							<div className="movies-container" id="results">
								{this.state.movies}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};
};
