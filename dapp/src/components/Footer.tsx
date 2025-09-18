function Footer() {
    return (

        <footer className="footer py-4  ">
            <div className="container-fluid">
                <div className="row align-items-center justify-content-lg-between">
                    <div className="col-lg-6 mb-lg-0 mb-4">
                        <div className="copyright text-center text-sm text-muted text-lg-start">
                            <a href="#" className="font-weight-bold" target="_blank">Deivid Santos</a>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <ul className="nav nav-footer justify-content-center justify-content-lg-end">
                            
                            <li className="nav-item">
                                <a href="https://github.com/deividroger" className="nav-link text-muted" target="_blank">Gihub</a>
                            </li>
                            <li className="nav-item">
                                <a href="https://www.linkedin.com/in/deivid-r-santos/" className="nav-link pe-0 text-muted" target="_blank">Linkedin</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;