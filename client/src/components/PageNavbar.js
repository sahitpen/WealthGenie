import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from "react-bootstrap/Modal";

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

	login() {
		var error = false;

		if (this.state.loginEmail == "" || this.state.loginPass) {
			alert("You must enter an email and password")
		}

		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!re.test(String(this.state.loginEmail).toLowerCase())) {
			alert("The email entered is invalid");
			error = true;
		}

		if (!error) {
			//login 
		}

	}

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
					<div className="navbarButtons">
						<button className="btn btn-secondary my-2 my-sm-0" type="submit" onClick={this.openSignUpModal}>Sign Up</button>
						<button className="btn btn-primary my-2 my-sm-0" onClick={this.openLoginModal}>Login</button>
					</div>
				</nav>

				<Modal show={this.state.isSignUpOpen} onHide={this.closeSignUpModal}>
					<Modal.Header closeButton>
						<Modal.Title>Create Account</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form>
							<div className="form-group">
								<label>Email: </label>
								<input type="email" className="form-control" placeholder="Enter email" onChange={(e)=>this.updateInput('signUpEmail', e.target.value)} />
							</div>
							<div className="form-group">
								<label>Password: </label>
								<input type="password" className="form-control" placeholder="Enter password"  onChange={(e)=>this.updateInput('signUpPass', e.target.value)} />
							</div>
							<div className="form-group">
								<label>Re-enter Password: </label>
								<input type="password" className="form-control" placeholder="Enter password"  onChange={(e)=>this.updateInput('signUpPass2', e.target.value)} />
							</div>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<button type="submit" className="btn btn-primary">Sign Up</button>
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
								<input type="email" className="form-control" placeholder="Enter email"  onChange={(e)=>this.updateInput('loginEmail', e.target.value)}/>
							</div>
							<div className="form-group">
								<label>Password: </label>
								<input type="password" className="form-control" placeholder="Enter password"  onChange={(e)=>this.updateInput('signUpEmail', e.target.value)}/>
							</div>
						</form>
					</Modal.Body>
					<Modal.Footer>
						<button className="btn btn-primary" onClick={this.login}>Login</button>
					</Modal.Footer>
				</Modal>
			</div>
			
		);
	};
};