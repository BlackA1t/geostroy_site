import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ООО «Геострой» — ЧПУ металлообработка в Сарове",
  description:
    "Фрезерная, токарная и токарно-фрезерная обработка металлических изделий на станках с ЧПУ. Изготовление деталей по чертежам в Сарове."
};

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>
            Высокоточная обработка
            <span>металлических изделий</span>
          </h1>
          <p className="hero-desc">
            ООО «Геострой» — обработка металлов на современных фрезерных и токарных станках с ЧПУ.
          </p>
          <div className="hero-buttons">
            <Link href="/contacts" className="btn btn-primary">
              Оставить заявку
            </Link>
            <Link href="/services" className="btn btn-outline">
              Наши услуги
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">5+</div>
              <div className="hero-stat-label">Лет опыта</div>
            </div>
            <div>
              <div className="hero-stat-num">1 - 800</div>
              <div className="hero-stat-label">Размеры изделия, мм</div>
            </div>
            <div>
              <div className="hero-stat-num">до 0.005</div>
              <div className="hero-stat-label">Точность, мм</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section about" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-image reveal">
              <img src="/assets/img/prod1.png" alt="Производство" />
            </div>
            <div className="about-content reveal">
              <div className="section-label">О компании</div>
              <h3>Надёжный партнёр в области металлообработки</h3>
              <p>
                ООО «Геострой» — ведущее предприятие в области обработки металлических изделий. С 2020 года мы
                предоставляем услуги высокоточной механической обработки для предприятий различных отраслей
                промышленности.
              </p>
              <p>
                Наше производство оснащено современными фрезерными и токарными станками с числовым программным
                управлением, что позволяет достигать исключительной точности и качества обработки. Мы работаем со всеми
                основными видами металлов и сплавов.
              </p>
              <div className="about-features">
                <div className="about-feature">
                  <div className="about-feature-icon">⚙️</div>
                  <span>Станки с ЧПУ</span>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon">📐</div>
                  <span>Точность до 0.005 мм</span>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon">🏭</div>
                  <span>Собственное производство</span>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon">✅</div>
                  <span>Контроль качества</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section advantages">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Преимущества</div>
            <h2 className="section-title">Почему выбирают нас</h2>
            <p className="section-subtitle">
              Мы гарантируем высокое качество, точные сроки и конкурентные цены
            </p>
          </div>
          <div className="advantages-grid">
            <div className="advantage-card reveal">
              <div className="advantage-num">5+</div>
              <h4>Лет на рынке</h4>
              <p>Богатый опыт в области металлообработки</p>
            </div>
            <div className="advantage-card reveal">
              <div className="advantage-num">50+</div>
              <h4>Единиц оборудования</h4>
              <p>Современные станки с ЧПУ от ведущих мировых производителей</p>
            </div>
            <div className="advantage-card reveal">
              <div className="advantage-num">0.005</div>
              <h4>Точность, мм</h4>
              <p>Исключительная точность обработки на всех этапах производства</p>
            </div>
            <div className="advantage-card reveal">
              <div className="advantage-num">100%</div>
              <h4>Гарантия качества</h4>
              <p>Полный контроль качества и гарантия на все виды работ</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section process" id="process">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Как мы работаем</div>
            <h2 className="section-title">Этапы сотрудничества</h2>
            <p className="section-subtitle">
              Прозрачный и отлаженный процесс работы от заявки до готового изделия
            </p>
          </div>
          <div className="process-timeline">
            <div className="process-step reveal">
              <div className="process-step-num">01</div>
              <h4>Заявка</h4>
              <p>
                Вы отправляете чертежи и техническое задание. Мы анализируем и рассчитываем стоимость.
              </p>
            </div>
            <div className="process-step reveal">
              <div className="process-step-num">02</div>
              <h4>Проектирование</h4>
              <p>
                Разрабатываем управляющие программы и подготавливаем технологический процесс.
              </p>
            </div>
            <div className="process-step reveal">
              <div className="process-step-num">03</div>
              <h4>Производство</h4>
              <p>
                Выполняем обработку на станках с ЧПУ с контролем на каждом этапе.
              </p>
            </div>
            <div className="process-step reveal">
              <div className="process-step-num">04</div>
              <h4>Доставка</h4>
              <p>
                Проводим финальный контроль качества и доставляем готовые изделия в срок.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section clients" id="clients">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Наши заказчики</div>
            <h2 className="section-title">Нам доверяют</h2>
            <p className="section-subtitle">
              Сотрудничаем с промышленными предприятиями, организациями ОПК и частным бизнесом
            </p>
          </div>

          <div className="clients-layout">
            <div className="clients-logos">
              <div className="client-logo-card reveal">
                <img src="/assets/img/clients/electromashina.png" alt="НПО Электромашина" />
              </div>

              <div className="client-logo-card reveal">
                <img src="/assets/img/clients/amt-solutions.png" alt="AMT Solutions" />
              </div>

              <div className="client-logo-card reveal">
                <img src="/assets/img/clients/interunis-it.png" alt="Интерюнис-ИТ" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
