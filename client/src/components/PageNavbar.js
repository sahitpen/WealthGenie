import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from "react-bootstrap/Modal";

export default class PageNavbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			navDivs: [],
			isOpen: false
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

	openModal = () => this.setState({ isOpen: true });
  closeModal = () => this.setState({ isOpen: false });

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
					<button className="btn btn-success my-2 my-sm-0" type="submit" onClick={this.openModal}>Login</button>
				</nav>

				<Modal show={this.state.isOpen} onHide={this.closeModal}>
					<Modal.Header>
						<Modal.Title>Hi</Modal.Title>
					</Modal.Header>
					<Modal.Body>The body</Modal.Body>
					<Modal.Footer>
						<button onClick={this.closeModal}>Cancel</button>
						<button>Save</button>
					</Modal.Footer>
				</Modal>
			</div>
			
		);
	};
};