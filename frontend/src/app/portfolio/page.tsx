import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Портфолио — ООО «Геострой»",
  description:
    "Примеры выполненных работ ООО «Геострой»: металлические детали, изделия сложной формы, фрезерная и токарная обработка на станках с ЧПУ."
};

export default function PortfolioPage() {
  return (
    <main>
      <section className="section portfolio-page" id="gallery">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Портфолио</div>
            <h2 className="section-title">Наши работы</h2>
            <p className="section-subtitle">Примеры выполненных заказов и готовых изделий</p>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item reveal">
              <img src="/assets/img/shtuka1.png" alt="Изделие1" />
            </div>

            <div className="gallery-item reveal">
              <img src="/assets/img/shtuka4.png" alt="Изделие2" />
            </div>

            <div className="gallery-item reveal">
              <img src="/assets/img/shtuka5.png" alt="Изделие3" />
            </div>

            <div className="gallery-item reveal">
              <img src="/assets/img/shtuka2.png" alt="Изделие4" />
            </div>

            <div className="gallery-item reveal">
              <img src="/assets/img/shtuka3.png" alt="Изделие5" />
            </div>

            <div className="gallery-item reveal">
              <img src="/assets/img/shtuka6.png" alt="Изделие6" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
