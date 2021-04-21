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
					<a class="navbar-brand" href="#">
						<img src="https://www.flaticon.com/svg/vstatic/svg/1825/1825632.svg?token=exp=1619023282~hmac=0c2393242a6c2e9d1a70c372a3e49896" width="30" height="30" style={{ paddingTop: '8px' }}
							class="d-inline-block align-top" alt="" />
						<span className="navbar-brand center mb-0 h1" style={{ color: "#172C5B" }}><b>WealthGenie</b></span>
					</a>
					<div className="collapse navbar-collapse" id="navbarNavAltMarkup">
						<div className="navbar-nav">
							{this.state.navDivs}
						</div>
					</div>
					<form class="form-inline">
						<button class="btn btn-success my-2 my-sm-0" type="submit">Login</button>
					</form>
				</nav>
			</div>
		);
	};
};