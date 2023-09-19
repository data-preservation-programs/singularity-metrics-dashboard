function BigNumbers({ overviewData }) {
  return (
    <>
      <div className="grid">
        <div className="col-12">
          <h2>Overview</h2>
        </div>
      </div>
      <div className="grid">
        {overviewData.map((data, index) => (
          <div className="col-3_md-6_mi-12 card-wrapper" key={index}>
            <div className="card type__horizontal">
              <div className="content">
                <h3>{data.value}</h3>
                <h4>{data.label}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default BigNumbers;
