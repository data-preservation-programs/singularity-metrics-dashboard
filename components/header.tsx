import Image from "next/image";

export default function Header() {
  return <>
    <header className="site-header">
      <div className="grid-noBottom main-content">
        <div className="col-6">
          <a href="https://singularity.storage/" className="logo">
            <Image alt="Logo" src="/images/logo.svg" width="206" height="41" />
          </a>
        </div>

        <div className="col-6">
          <div className="navbar desktop">
            <nav className="navigation">
              <div className="nav-item">
                <a href="https://singularity.storage/?section=how-it-works" className="button nav-link">About</a>
              </div>
              <div className="nav-item">
                <a href="https://data-programs.gitbook.io/singularity" className="button nav-link">Docs</a>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  </>
}
