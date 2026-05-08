import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Услуги — ООО «Геострой»",
  description:
    "Полный спектр услуг по обработке металлических изделий на станках с ЧПУ. Фрезерная, токарная и токарно-фрезерная обработка в Сарове."
};

export default function ServicesPage() {
  return (
    <main>
      <section className="section services-page" id="services">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Наши услуги</div>
            <h2 className="section-title">Виды обработки</h2>
            <p className="section-subtitle">Полный спектр услуг по обработке металлических изделий любой сложности</p>
          </div>
          <div className="services-grid">
            <div className="service-card reveal">
              <div className="service-icon">🔧</div>
              <h3>Фрезерная обработка с ЧПУ</h3>
              <p>
                Высокоточная обработка деталей на современных фрезерных станках с числовым программным управлением.
                Сложные геометрические формы и высокая повторяемость.
              </p>
            </div>
            <div className="service-card reveal">
              <div className="service-icon">⚙️</div>
              <h3>Изготовление деталей</h3>
              <p>
                Производство деталей по чертежам заказчика — от единичных экземпляров до крупных серий. Работаем со
                сталью, алюминием, латунью, титаном и другими сплавами.
              </p>
            </div>
            <div className="service-card reveal">
              <div className="service-icon">📐</div>
              <h3>3D-фрезеровка</h3>
              <p>
                Трёхмерная обработка сложных поверхностей и форм. Изготовление пресс-форм, штампов, матриц и других
                сложных изделий.
              </p>
            </div>
            <div className="service-card reveal">
              <div className="service-icon">🔩</div>
              <h3>Нарезка резьбы</h3>
              <p>Нарезание метрической, дюймовой и специальной резьбы. Высокая точность и качество поверхности.</p>
            </div>
            <div className="service-card reveal">
              <div className="service-icon">📏</div>
              <h3>Контроль качества</h3>
              <p>
                Многоуровневый контроль качества на всех этапах производства. Использование координатно-измерительных
                машин и высокоточного инструмента.
              </p>
            </div>
            <div className="service-card reveal">
              <div className="service-icon">🛠️</div>
              <h3>Серийное производство</h3>
              <p>
                Организация серийного выпуска деталей с оптимальными сроками и стоимостью. Гибкая система скидок при
                больших объёмах заказа.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
