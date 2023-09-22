import { BigNumbersProps } from '@utils/interfaces';
  
function BigNumbers({ overviewData }: BigNumbersProps) {
  return (
    <section className="big-numbers">
      <div className="grid-noBottom">
        <div className="col-12">
          <h2>Overview</h2>
        </div>
      </div>
      <div className="grid">
        {overviewData.map((data, index) => (
          <div className="col-3_lg-6_mi-12 card-wrapper" key={index}>
            <div className="card">
              <div className="content">
                <h3>{data.value}</h3>
                <h4>{data.label}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BigNumbers;
