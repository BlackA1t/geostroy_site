import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Станочный парк — ООО «Геострой»",
  description:
    "Станочный парк ООО «Геострой»: современное оборудование для фрезерной, токарной и токарно-фрезерной обработки деталей."
};

export default function MachinesPage() {
  return (
    <main>
      <section className="section machine-park machine-page" id="machines">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Станочный парк</div>
            <h2 className="section-title">Наши возможности</h2>
            <p className="section-subtitle">
              Современное оборудование для фрезерной, токарной и токарно-фрезерной обработки деталей
            </p>
          </div>

          <div className="machine-park-layout">
            <div className="machine-park-grid">
              <div className="machine-card reveal">
                <div className="machine-card-image">
                  <img src="/assets/img/machines/hision-v1800.png" alt="HISION V1800" />
                </div>
                <div className="machine-card-content">
                  <div className="machine-card-number">01</div>
                  <h3>HISION V1800</h3>
                  <p>Вертикально-фрезерный обрабатывающий центр</p>
                </div>
              </div>

              <div className="machine-card reveal">
                <div className="machine-card-image">
                  <img src="/assets/img/machines/oturn-fmc-850l.png" alt="OTURN FMC-850L" />
                </div>
                <div className="machine-card-content">
                  <div className="machine-card-number">02</div>
                  <h3>OTURN FMC-850L</h3>
                  <p>Вертикально-фрезерный обрабатывающий центр</p>
                </div>
              </div>

              <div className="machine-card reveal">
                <div className="machine-card-image">
                  <img src="/assets/img/machines/hision-htc1500.png" alt="HISION HTC1500" />
                </div>
                <div className="machine-card-content">
                  <div className="machine-card-number">03</div>
                  <h3>HISION HTC1500</h3>
                  <p>Токарный обрабатывающий центр</p>
                </div>
              </div>

              <div className="machine-card reveal">
                <div className="machine-card-image">
                  <img src="/assets/img/machines/tenoly-e106m.png" alt="TENOLY E106M" />
                </div>
                <div className="machine-card-content">
                  <div className="machine-card-number">04</div>
                  <h3>TENOLY E106M</h3>
                  <p>Токарно-фрезерный обрабатывающий центр</p>
                </div>
              </div>
            </div>

            <div className="machine-capabilities reveal">
              <div className="section-label">Возможности оборудования</div>

              <h3>Какие работы выполняются на станочном парке</h3>

              <p>
                Станочный парк ООО «Геострой» позволяет выполнять широкий комплекс работ по механической обработке
                металлических изделий: фрезерование, токарную обработку, сверление, растачивание, нарезание резьбы,
                обработку плоскостей, пазов, отверстий, наружных и внутренних поверхностей. Оборудование подходит как
                для изготовления единичных деталей по чертежам, так и для мелкосерийного и серийного производства.
              </p>

              <p>
                Вертикально-фрезерные обрабатывающие центры применяются для обработки корпусных деталей, плит,
                кронштейнов, пресс-форм, технологической оснастки и изделий сложной геометрии. Токарные и
                токарно-фрезерные центры позволяют изготавливать детали типа валов, втулок, фланцев, дисков, резьбовых
                элементов и других тел вращения. Благодаря сочетанию разных типов оборудования предприятие может
                выполнять полный цикл обработки детали с высокой точностью и стабильным качеством.
              </p>

              <div className="machine-capabilities-list">
                <div className="machine-capability-item">Фрезерная обработка</div>
                <div className="machine-capability-item">Токарная обработка</div>
                <div className="machine-capability-item">Сверление и растачивание</div>
                <div className="machine-capability-item">Нарезание резьбы</div>
                <div className="machine-capability-item">Обработка сложной геометрии</div>
                <div className="machine-capability-item">Единичное и серийное производство</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
