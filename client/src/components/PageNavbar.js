import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class PageNavbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			navDivs: []
		};
	};

	componentDidMount() {
		const pageList = ['stock', 'cryptocurrency', 'portfolio'];

		let navbarDivs = pageList.map((page, i) => {
			if (this.props.active === page) {
				return <a className="nav-item nav-link active" key={i} href={"/" + page}>{page.charAt(0).toUpperCase() + page.substring(1, page.length)}</a>
			} else {
				return <a className="nav-item nav-link" key={i} href={"/" + page}>{page.charAt(0).toUpperCase() + page.substring(1, page.length)}</a>
			}
		});

		this.setState({
			navDivs: navbarDivs
		});
	};

	render() {
		return (
			<div className="PageNavbar">
				<nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: "#f1f2f6" }}>
					<a className="navbar-brand" href="#">
						<span className="navbar-brand center mb-0 h1" style={{ color: "#172C5B" }}><b>WealthGenie</b></span>
					</a>
					<div className="collapse navbar-collapse" id="navbarNavAltMarkup">
						<div className="navbar-nav">
							{this.state.navDivs}
						</div>
					</div>
					<form className="form-inline">
						<button className="btn btn-success my-2 my-sm-0" type="submit">Login</button>
					</form>
				</nav>
			</div>
		);
	};
};