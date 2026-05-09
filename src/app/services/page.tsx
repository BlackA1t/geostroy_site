import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Услуги — ООО «Геострой»",
  description:
    "Каталог услуг ООО «Геострой»: токарная и фрезерная обработка, изготовление деталей по чертежам, сверление, резьба и мелкосерийное производство."
};

const SERVICES = [
  {
    title: "Токарная обработка",
    description: "Изготовление деталей вращения, обработка валов, втулок, осей и других элементов.",
    fitFor: ["валы и оси", "втулки и кольца", "посадочные поверхности"]
  },
  {
    title: "Фрезерная обработка",
    description: "Обработка плоскостей, пазов, корпусных деталей и сложных поверхностей.",
    fitFor: ["пазы и уступы", "корпусные детали", "плоскости и карманы"]
  },
  {
    title: "Изготовление деталей по чертежам",
    description: "Выполнение работ по технической документации заказчика с возможностью прикрепить файлы к заявке.",
    fitFor: ["чертежи и эскизы", "технические задания", "спецификации"]
  },
  {
    title: "Металлообработка на заказ",
    description: "Индивидуальные работы по обработке металлических заготовок под конкретные производственные задачи.",
    fitFor: ["единичные изделия", "нестандартные детали", "доработка заготовок"]
  },
  {
    title: "Сверление и нарезание резьбы",
    description: "Выполнение отверстий, подготовка посадочных мест, нарезание внутренней и наружной резьбы.",
    fitFor: ["резьбовые отверстия", "посадочные места", "крепежные элементы"]
  },
  {
    title: "Мелкосерийное изготовление",
    description: "Изготовление небольших партий деталей с повторяемыми параметрами.",
    fitFor: ["малые партии", "повторяемые детали", "производственные узлы"]
  }
];

const MATERIALS = [
  "Конструкционная сталь",
  "Нержавеющая сталь",
  "Алюминий",
  "Латунь",
  "Бронза",
  "Пластики и полимерные материалы",
  "Заготовки заказчика"
];

const REQUEST_FILES = [
  "чертёж детали",
  "техническое задание",
  "фотографию образца",
  "архив с документацией",
  "файл модели или спецификацию"
];

function getServiceRequestHref(serviceType: string, isAuthenticated: boolean) {
  const params = new URLSearchParams({
    serviceType
  });

  return isAuthenticated ? `/dashboard/requests/new?${params}` : `/contacts?${params}`;
}

export default async function ServicesPage() {
  const currentUser = await getCurrentUser();
  const isAuthenticated = Boolean(currentUser);

  return (
    <main className="services-page">
      <section className="section services-hero" id="services">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Наши услуги</div>
            <h2 className="section-title">Услуги</h2>
            <p className="section-subtitle">
              Выполняем работы по металлообработке, изготовлению деталей и обработке заготовок по чертежам и
              техническим требованиям заказчика.
            </p>
          </div>
        </div>
      </section>

      <section className="section services-catalog-section">
        <div className="container">
          <div className="services-grid">
            {SERVICES.map((service) => (
              <article className="service-card reveal" key={service.title}>
                <div className="service-card-kicker">Направление работ</div>
                <h2 className="service-card-title">{service.title}</h2>
                <p>{service.description}</p>
                <div className="service-card-list">
                  <span>Подходит для:</span>
                  <ul>
                    {service.fitFor.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="service-card-actions">
                  <Link className="btn btn-primary" href={getServiceRequestHref(service.title, isAuthenticated)}>
                    Оставить заявку
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section materials-section">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Материалы</div>
            <h2 className="section-title">Материалы, с которыми работаем</h2>
            <p className="section-subtitle">
              Если нужного материала нет в списке, его можно указать в заявке — администратор уточнит возможность
              обработки.
            </p>
          </div>
          <div className="materials-grid">
            {MATERIALS.map((material) => (
              <div className="material-card reveal" key={material}>
                {material}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section service-files-section">
        <div className="container">
          <div className="service-files-panel reveal">
            <div>
              <div className="section-label">Файлы к заявке</div>
              <h2>Что можно приложить к заявке</h2>
              <p>Файлы помогают быстрее оценить задачу и подготовить ответ.</p>
            </div>
            <ul className="service-files-list">
              {REQUEST_FILES.map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section services-cta">
        <div className="container">
          <div className="services-cta-panel reveal">
            <div>
              <div className="section-label">Заявка на расчёт</div>
              <h2>Нужна обработка детали или расчёт стоимости?</h2>
              <p>
                Оставьте заявку, прикрепите чертёж или описание задачи, и мы свяжемся с вами для уточнения деталей.
              </p>
            </div>
            <div className="services-cta-actions">
              <Link className="btn btn-primary" href={getServiceRequestHref("Расчёт стоимости", isAuthenticated)}>
                Оставить заявку
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
