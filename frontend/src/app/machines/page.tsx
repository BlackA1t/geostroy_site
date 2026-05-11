import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Станочный парк — ООО «Геострой»",
  description:
    "Станочный парк ООО «Геострой»: оборудование и производственные возможности для металлообработки, изготовления деталей и обработки заготовок."
};

const MACHINES = [
  {
    name: "HISION V1800",
    description: "Вертикально-фрезерный обрабатывающий центр",
    image: "/assets/img/machines/hision-v1800.png"
  },
  {
    name: "OTURN FMC-850L",
    description: "Вертикально-фрезерный обрабатывающий центр",
    image: "/assets/img/machines/oturn-fmc-850l.png"
  },
  {
    name: "HISION HTC1500",
    description: "Токарный обрабатывающий центр",
    image: "/assets/img/machines/hision-htc1500.png"
  },
  {
    name: "TENOLY E106M",
    description: "Токарно-фрезерный обрабатывающий центр",
    image: "/assets/img/machines/tenoly-e106m.png"
  }
];

const CAPABILITIES = [
  {
    title: "Токарная обработка",
    description: "Обработка деталей вращения, валов, втулок, осей и других элементов."
  },
  {
    title: "Фрезерная обработка",
    description: "Обработка плоскостей, пазов, корпусных деталей и сложных поверхностей."
  },
  {
    title: "Сверление и подготовка отверстий",
    description: "Выполнение отверстий, подготовка посадочных мест, обработка крепёжных элементов."
  },
  {
    title: "Нарезание резьбы",
    description: "Выполнение внутренней и наружной резьбы по требованиям детали."
  },
  {
    title: "Обработка заготовок",
    description: "Подготовка и доработка металлических заготовок под дальнейшее производство."
  },
  {
    title: "Изготовление деталей по документации",
    description: "Выполнение работ по чертежам, техническим заданиям и прикреплённым файлам заказчика."
  }
];

function getServiceRequestHref(serviceType: string, isAuthenticated: boolean) {
  const params = new URLSearchParams({
    serviceType
  });

  return isAuthenticated ? `/dashboard/requests/new?${params}` : `/contacts?${params}`;
}

export default async function MachinesPage() {
  const currentUser = await getCurrentUser();
  const isAuthenticated = Boolean(currentUser);

  return (
    <main className="machines-page">
      <section className="section machines-hero" id="machines">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Станочный парк</div>
            <h1 className="section-title">Наше оборудование</h1>
            <p className="section-subtitle">
              Оборудование компании позволяет выполнять операции по металлообработке, изготовлению деталей и обработке
              заготовок по требованиям заказчика.
            </p>
          </div>

          <div className="machine-park-grid">
            {MACHINES.map((machine, index) => (
              <article className="machine-card reveal" key={machine.name}>
                <div className="machine-card-image">
                  <img src={machine.image} alt={machine.name} />
                </div>
                <div className="machine-card-content">
                  <div className="machine-card-number">{String(index + 1).padStart(2, "0")}</div>
                  <h2>{machine.name}</h2>
                  <p>{machine.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section machine-capabilities-section">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Возможности</div>
            <h2 className="section-title">Производственные возможности</h2>
            <p className="section-subtitle">
              Станочный парк закрывает основные операции механической обработки для единичных и серийных задач.
            </p>
          </div>

          <div className="machines-grid">
            {CAPABILITIES.map((capability) => (
              <article className="machine-capability-card reveal" key={capability.title}>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </article>
            ))}
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
