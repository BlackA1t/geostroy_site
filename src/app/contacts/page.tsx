import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Контакты — ООО «Геострой»",
  description:
    "Контакты ООО «Геострой»: адрес, телефон, email и форма заявки на изготовление металлических изделий по чертежам."
};

type ContactsPageProps = {
  searchParams?: Promise<{
    serviceType?: string;
  }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialServiceType = resolvedSearchParams?.serviceType ?? "";

  return (
    <main>
      <section className="section contact-page" id="contact">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-label">Контакты</div>
            <h2 className="section-title">Свяжитесь с нами</h2>
            <p className="section-subtitle">Оставьте заявку и мы рассчитаем стоимость вашего заказа</p>
          </div>

          <div className="contact-grid">
            <div className="contact-info reveal">
              <h3>ООО «Геострой»</h3>
              <p>
                Мы всегда готовы обсудить ваш проект и предложить оптимальное решение. Свяжитесь с нами любым удобным
                способом.
              </p>

              <div className="contact-item">
                <div className="contact-item-icon">📍</div>
                <div className="contact-item-content">
                  <h5>Адрес</h5>
                  <p>607188, Россия, Нижегородская обл., г. Саров, ул. Димитрова, д.10, стр.1</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-item-icon">📞</div>
                <div className="contact-item-content">
                  <h5>Телефон/Факс</h5>
                  <p>
                    <a href="tel:88313047023">8 (831) 304-70-23</a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-item-icon">✉️</div>
                <div className="contact-item-content">
                  <h5>Email</h5>
                  <p>
                    <a href="mailto:ooogeostroy@internet.ru">ooogeostroy@internet.ru</a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-item-icon">🕐</div>
                <div className="contact-item-content">
                  <h5>Режим работы</h5>
                  <p>Пн–Пт: 8:00–20:00, Сб: 9:00–16:00</p>
                </div>
              </div>
            </div>

            <ContactForm initialServiceType={initialServiceType} />
          </div>
        </div>
      </section>

      <section className="section contact-map-section">
        <div className="container">
          <div className="contact-map-card reveal">
            <div className="contact-map-header">
              <div>
                <div className="section-label">Карта</div>
                <h3>Как нас найти</h3>
                <p>г. Саров, ул. Димитрова, д.10, стр.1</p>
              </div>
            </div>

            <div className="contact-map-frame">
              <iframe
                src="https://yandex.com/map-widget/v1/?ll=43.313349%2C54.924345&z=17&pt=43.313349%2C54.924345%2Cpm2rdm"
                width="100%"
                height="460"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
