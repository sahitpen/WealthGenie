import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from "react-bootstrap/Modal";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";

export default class PageNavbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			navDivs: [],
			signUpEmail: '',
			signUpPass: '',
			signUpPass2: '',
			loginEmail: '',
			loginPass: ''
		};
		this.signUp = this.signUp.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
	};

	componentDidMount() {
		const pageList = ['stock', 'cryptocurrency', 'portfolio'];

		let navbarDivs = pageList.map((page, i) => {
			if (this.props.active === page) {
				//return <a className="nav-item nav-link active" key={i} href={"/" + page}>{page.charAt(0).toUpperCase() + page.substring(1, page.length)}</a>
				return <Link className="nav-item nav-link active" key={i} to={"/" + page}>{page.charAt(0).toUpperCase() + page.substring(1, page.length)}</Link>
			} else {
				//return <a className="nav-item nav-link" key={i} href={"/" + page}>{page.charAt(0).toUpperCase() + page.substring(1, page.length)}</a>
				return <Link className="nav-item nav-link" key={i} to={"/" + page}>{page.charAt(0).toUpperCase() + page.substring(1, page.length)}</Link>
			}
		});

		this.setState({
			navDivs: navbarDivs
		});
	};

	openLoginModal = () => this.setState({ isLoginOpen: true });
	closeLoginModal = () => this.setState({ isLoginOpen: false });

	openSignUpModal = () => this.setState({ isSignUpOpen: true });
	closeSignUpModal = () => this.setState({ isSignUpOpen: false });

	updateInput(type, value) {
		if (type == "signUpEmail") {
			this.setState({ signUpEmail: value });
		} else if (type == "signUpPass") {
			this.setState({ signUpPass: value });
		} else if (type == "signUpPass2") {
			this.setState({ signUpPass2: value });
		} else if (type == "loginEmail") {
			this.setState({ loginEmail: value });
		} else if (type == "loginPass") {
			this.setState({ loginPass: value });
		}
	}

	signUp() {
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (this.state.signUpEmail == "" || this.state.signUpPass == "") {
			alert("You must enter an email and password")
		} else if (this.state.signUpPass2 == "") {
			alert("You must re-enter your password")
		} else if (!re.test(String(this.state.signUpEmail).toLowerCase())) {
			alert("The email entered is invalid");
		} else if (this.state.signUpPass != this.state.signUpPass2) {
			alert("The passwords do not match");
		} else {
			fetch("http://localhost:8081/signup/" + this.state.signUpEmail + "/" + this.state.signUpPass,
				{
					method: 'GET' // The type of HTTP request.
				}).then(res => {
					return res.json()
				}, err => {
					console.log(err);
				}).then(loginInfo => {
					if (loginInfo.id == null) {
						alert("An account already exists with this email");
					} else {
						alert("Created Account");
						this.closeSignUpModal();
					}
				}, err => {
					console.log(err);
				});
		}
	}

	login() {
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (this.state.loginEmail == "" || this.state.loginPass == "") {
			alert("You must enter an email and password")
		} else if (!re.test(String(this.state.loginEmail).toLowerCase())) {
			alert("The email entered is invalid");
		} else {
			fetch("http://localhost:8081/login/" + this.state.loginEmail + "/" + this.state.loginPass,
				{
					method: 'GET' // The type of HTTP request.
				}).then(res => {
					return res.json()
				}, err => {
					console.log(err);
				}).then(loginInfo => {
					if (loginInfo.id == null) {
						alert("The email or password is incorrect");
					} else {
						this.props.changeLoginInfo(loginInfo.id, true)
						this.closeLoginModal();
					}
				}, err => {
					console.log(err);
				});
		}
	}

	logout() {
		this.props.changeLoginInfo('', false);
	}

	render() {
		const loggedIn = this.props.loggedIn;
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
					{loggedIn
						? <button className="btn btn-success my-2 my-sm-0" onClick={this.logout}>Logout</button>
						: <div className="navbarButtons">
							<button className="btn btn-secondary my-2 my-sm-0" onClick={this.openSignUpModal}>Sign Up</button>
							<button className="btn btn-success my-2 my-sm-0" onClick={this.openLoginModal}>Login</button>
						</div>
					}
				</nav>

				<Modal show={this.state.isSignUpOpen} onHide={this.closeSignUpModal}>
					<Modal.Header closeButton>
						<Modal.Title>Create Account</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form>
							<div className="form-group">
								<label>Email: </label>
								<input type="email" className="form-control" placeholder="Enter email" onChange={(e) => this.updateInput('signUpEmail', e.target.value)} />
							</div>
							<div className="form-group">
								<label>Password: </label>
								<input type="password" className="form-control" placeholder="Enter password" onChange={(e) => this.updateInput('signUpPass', e.target.value)} />
							</div>
							<div className="form-group">
								<label>Re-enter Password: </label>
								<input type="password" className="form-control" placeholder="Enter password" onChange={(e) => this.updateInput('signUpPass2', e.target.value)} />
							</div>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<button type="submit" className="btn btn-success" onClick={this.signUp}>Sign Up</button>
					</Modal.Footer>
				</Modal>

				<Modal show={this.state.isLoginOpen} onHide={this.closeLoginModal}>
					<Modal.Header closeButton>
						<Modal.Title>Login</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form>
							<div className="form-group">
								<label>Email: </label>
								<input type="email" className="form-control" placeholder="Enter email" onChange={(e) => this.updateInput('loginEmail', e.target.value)} />
							</div>
							<div className="form-group">
								<label>Password: </label>
								<input type="password" className="form-control" placeholder="Enter password" onChange={(e) => this.updateInput('loginPass', e.target.value)} />
							</div>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<button className="btn btn-success" onClick={this.login}>Login</button>
					</Modal.Footer>
				</Modal>
			</div>

		);
	};
};