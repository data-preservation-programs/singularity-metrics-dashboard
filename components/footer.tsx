export default function SiteFooter() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer id="site-footer">
      <div className="content">
        <div className="grid-bottom-noBottom-noGutter">
          <div className="col-2_sm-5">
            <button className="site-footer-logo" onClick={scrollToTop}>
              <img src="/images/logo-footer.svg" alt="singularity logo" />
            </button>
          </div>
          <div
            className="col-4_sm-12 legal-wrapper"
            data-push-left="off-1_md-0"
          >
            <div className="legal">
              <a
                href="https://protocol.ai/legal/#terms-of-service"
                className="button footer-button"
              >
                Terms of Use
              </a>
              <a
                href="https://protocol.ai/legal/#privacy-policy"
                className="button footer-button"
              >
                Privacy Policy
              </a>
              <a
                href="https://ipfs.tech/legal"
                className="button footer-button"
              >
                DMCA Policy
              </a>
            </div>
          </div>
          <div className="col-4_sm-5_mi-7" data-push-left="off-1_md-2_mi-0">
            <div className="authors">
              <div className="text"><span className="green">Singularity</span> is a project developed by the <a href="https://dataprograms.org/" target="_blank">Data Programs Working Group</a> with Protocol Labs</div>
              <div className="logos">
                <a href="https://dataprograms.org/" className="button">
                  <img src="/images/data-programs-logo.svg" alt="data programs logo" />
                </a>
                <a href="https://protocol.ai/" className="button">
                  <img src="/images/protocol-labs-logo.svg" alt="protocol labs logo" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
