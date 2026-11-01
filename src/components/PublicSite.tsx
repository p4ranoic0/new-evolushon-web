import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandGoogle,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandWhatsapp,
  IconCalendarCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconMapPin,
  IconMenu2,
  IconPencil,
  IconStar,
  IconStarFilled,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import {
  asset,
  BOOKING_UI,
  PUBLIC_UI,
  UI,
  CATS,
  effectivePrice,
  fmt,
  LANGS,
  money,
  offerOn,
  pathFor,
  tr,
  uiFor,
  waUrl,
} from "../store";
import type { Category, Lang, Page, Photo, Service, SiteData } from "../store";
import { Doodle } from "./Doodle";
import { Seo } from "./SEO";
import { Booking } from "./Booking";
import { Modal } from "./Modal";
const mobileMotion = window.matchMedia(
  "(max-width: 759px), (prefers-reduced-motion: reduce)",
);
function subscribeMotion(f: () => void) {
  mobileMotion.addEventListener("change", f);
  return () => mobileMotion.removeEventListener("change", f);
}
const covers = {
  surf: "src/assets/galeria-sesion-16.jpg",
  surfskate: "src/assets/class-surfskate-3.jpg",
  trip: "src/assets/surftrip-chicama.jpg",
};
function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={n + " / 5"}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= Math.round(n) ? (
          <IconStarFilled key={i} size={18} />
        ) : (
          <IconStar key={i} size={18} />
        ),
      )}
    </span>
  );
}
export function PublicSite({
  data,
  lang,
  page,
  service,
}: {
  data: SiteData;
  lang: Lang;
  page: Page;
  service?: Service;
}) {
  const ui = uiFor(data, lang),
    bt = BOOKING_UI[lang];
  const location = useLocation();
  const [menu, setMenu] = useState(false),
    [scrolled, setScrolled] = useState(false),
    [album, setAlbum] = useState("all");
  const [filter, setFilter] = useState<Category | "all">(
    (new URLSearchParams(location.search).get("category") as Category) || "all",
  );
  const [booking, setBooking] = useState<{
      s: Service;
      opt: "single" | number;
    } | null>(null),
    [lb, setLb] = useState<{ list: Photo[]; i: number } | null>(null);
  const still = useSyncExternalStore(
      subscribeMotion,
      () => mobileMotion.matches,
    ),
    root = useRef<HTMLDivElement>(null);
  const book = useCallback(
    (s: Service, opt: "single" | number = "single") => setBooking({ s, opt }),
    [],
  );
  const closeBooking = useCallback(() => setBooking(null), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  const closeLb = useCallback(() => setLb(null), [setLb]);
  useEffect(() => {
    window.scrollTo(0, 0);
    const scroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    const nodes = root.current?.querySelectorAll("[data-reveal]");
    if (!nodes || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [page, filter, data]);
  useEffect(() => {
    if (!lb) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight")
        setLb((v) => v && { ...v, i: (v.i + 1) % v.list.length });
      if (e.key === "ArrowLeft")
        setLb(
          (v) => v && { ...v, i: (v.i - 1 + v.list.length) % v.list.length },
        );
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [lb]);
  const services = data.services.filter((s) => s.active),
    photos = data.gallery.filter((g) => !g.hidden),
    featured = photos.filter((g) => g.featured);
  const shown = photos.filter((g) => album === "all" || g.album === album),
    reviews = data.reviews.filter((r) => !r.hidden),
    rs = data.settings.reviews;
  const wa = waUrl(data.settings, ui.waGeneric),
    minPrice = (cat: Category) => {
      const list = services
        .filter((s) => s.cat === cat && s.price !== null)
        .sort((a, b) => (a.price || 0) - (b.price || 0));
      return list[0] ? money(list[0].currency, list[0].price) : ui.consult;
    };
  const langs = (
    <div className="languages">
      {LANGS.map((l) => (
        <Link
          key={l}
          className={l === lang ? "active" : ""}
          lang={l}
          hrefLang={l}
          to={pathFor(l, page, service)}
          onClick={closeMenu}
          aria-label={
            { es: "Español", en: "English", fr: "Français", de: "Deutsch" }[l]
          }
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
  const nav = (
    <>
      {(["home", "services", "gallery", "contact"] as const).map((p) => (
        <Link
          key={p}
          to={pathFor(lang, p)}
          onClick={closeMenu}
          aria-current={page === p ? "page" : undefined}
        >
          {ui[p]}
        </Link>
      ))}
    </>
  );
  return (
    <div ref={root} className="public-site">
      <Seo data={data} lang={lang} page={page} service={service} />
      <a className="skip-link" href="#main">
        {PUBLIC_UI.skip[lang]}
      </a>
      <header className={"site-header " + (scrolled ? "solid" : "")}>
        <div className="header-inner wrap">
          <Link className="brand" to={pathFor(lang)}>
            <img src={asset("src/assets/logo.jpg")} alt="" />
            <span>Evolushon</span>
          </Link>
          <nav className="desktop-nav">{nav}</nav>
          <div className="desktop-languages">{langs}</div>
          <a
            className="btn gold header-book"
            aria-label={ui.book}
            href={wa}
            target="_blank"
            rel="noreferrer"
          >
            <IconBrandWhatsapp size={20} />
            <span>{ui.book}</span>
          </a>
          <button
            className="round menu-toggle"
            aria-label={PUBLIC_UI.menu[lang]}
            aria-expanded={menu}
            onClick={() => setMenu(true)}
          >
            <IconMenu2 />
          </button>
        </div>
      </header>
      {menu && (
        <Modal
          onClose={closeMenu}
          label={PUBLIC_UI.menu[lang]}
          className="menu-modal"
        >
          <div className="menu-top">
            <span className="brand">Evolushon</span>
            <button className="round" onClick={closeMenu} aria-label={ui.close}>
              <IconX />
            </button>
          </div>
          <nav>{nav}</nav>
          {langs}
        </Modal>
      )}
      <main id="main">
        {page === "home" && (
          <>
            <section className="hero">
              <img
                className="hero-poster"
                src={asset("src/assets/banner-principal.jpg")}
                alt=""
                fetchPriority="high"
              />
              {!still && (
                <video
                  src={asset("src/assets/Video-drone.mp4")}
                  poster={asset("src/assets/banner-principal.jpg")}
                  preload="metadata"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                />
              )}
              <div className="hero-shade" />
              <div className="wrap hero-content">
                <div data-reveal>
                  <p className="serif">{ui.heroTitle}</p>
                  <div className="hero-kicker">
                    <h1>{ui.kicker}</h1>
                    <span>ES · EN · FR · DE</span>
                  </div>
                </div>
              </div>
            </section>
            <div className="marquee" aria-hidden="true">
              <div>
                {Array.from({ length: 4 }, (_, n) =>
                  [
                    ui.surf,
                    ui.surfskate,
                    ui.trip,
                    "Lima",
                    "ES · EN · FR · DE",
                  ].map((word, i) => (
                    <span key={n + "-" + i}>
                      {word}
                      <IconStarFilled size={16} />
                    </span>
                  )),
                )}
              </div>
            </div>
            <section className="wrap intro">
              <Doodle name="sun" className="intro-sun" />
              <Doodle name="waves" className="intro-waves" />
              <div className="intro-copy" data-reveal>
                <h2>{ui.introTitle}</h2>
                <p>{ui.intro}</p>
                <Link className="btn ink" to={pathFor(lang, "services")}>
                  {ui.seeServices}
                  <IconArrowRight size={18} />
                </Link>
              </div>
              <div className="intro-images" data-reveal>
                <img
                  loading="lazy"
                  decoding="async"
                  src={asset("src/assets/galeria-sesion-18.jpg")}
                  alt={ui.surf}
                />
                <img
                  loading="lazy"
                  decoding="async"
                  src={asset("src/assets/class-surfskate-1.jpg")}
                  alt={ui.surfskate}
                />
                <span className="serif">{ui.tag}</span>
              </div>
            </section>
            <section className="offer-section section dark">
              <div className="wrap">
                <Doodle name="gull" className="section-doodle" />
                <div className="section-heading" data-reveal>
                  <h2>{ui.offer}</h2>
                  <p>{ui.servicesSub}</p>
                </div>
                <div className="category-panels">
                  {CATS.map((c) => (
                    <Link
                      to={pathFor(lang, "services") + "?category=" + c}
                      key={c}
                      className="category-panel"
                    >
                      <img
                        loading="lazy"
                        decoding="async"
                        src={asset(covers[c])}
                        alt=""
                      />
                      <span className="panel-arrow">
                        <IconArrowUpRight />
                      </span>
                      <div>
                        <h3>{ui[c]}</h3>
                        <span className="eyebrow">
                          {ui.from} {minPrice(c)}
                        </span>
                        <p>
                          {services
                            .filter((s) => s.cat === c)
                            .map((s) => tr(s.name, lang))
                            .join(" · ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
            <section className="section featured-section">
              <div className="wrap section-heading" data-reveal>
                <h2>{ui.featured}</h2>
                <Doodle name="palm" />
                <Link className="btn outline" to={pathFor(lang, "gallery")}>
                  {ui.seeGallery}
                  <IconArrowRight size={18} />
                </Link>
              </div>
              <div className="featured-strip">
                {featured.map((g, i) => (
                  <button
                    key={g.id}
                    onClick={() => setLb({ list: featured, i })}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={asset(g.src)}
                      srcSet={g.variants?.map((v)=>asset(v.webp)+" "+v.w+"w").join(", ")}
                      sizes="(max-width: 700px) 100vw, 50vw"
                      alt={tr(g.alt, lang)}
                      style={{ objectPosition: g.focus }}
                    />
                  </button>
                ))}
              </div>
            </section>
            {reviews.length > 0 && (
              <section className="section reviews">
                <div className="wrap">
                  <Doodle name="star" className="section-doodle" />
                  <div className="section-heading" data-reveal>
                    <div>
                      <h2>{bt.reviewsTitle}</h2>
                      {!!rs.rating && (
                        <div className="rating">
                          <strong>{rs.rating}</strong>
                          <div>
                            <Stars n={rs.rating} />
                            <small>
                              {rs.count ? fmt(bt.basedOn, { n: rs.count }) : ""}
                            </small>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="actions">
                      <a
                        className="btn outline"
                        href={
                          rs.placeUrl ||
                          "https://www.google.com/maps/search/Evolushon+Surf+Experience"
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <IconMapPin size={18} />
                        {bt.seeAll}
                      </a>
                      <a
                        className="btn ink"
                        href={
                          rs.writeUrl ||
                          rs.placeUrl ||
                          "https://www.google.com/maps/search/Evolushon+Surf+Experience"
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <IconPencil size={18} />
                        {bt.write}
                      </a>
                    </div>
                  </div>
                  <div className="reviews-strip">
                    {reviews.map((r) => (
                      <article key={r.id}>
                        <div className="flex justify-between">
                          <Stars n={r.rating} />
                          <IconBrandGoogle size={20} />
                        </div>
                        <p className="serif">“{tr(r.text, lang)}”</p>
                        <div className="review-author">
                          <span>{r.author[0] || "?"}</span>
                          <div>
                            <b>{r.author}</b>
                            <small>
                              {r.date
                                ? new Date(
                                    r.date +
                                      (r.date.length === 7
                                        ? "-01T12:00:00"
                                        : "T12:00:00"),
                                  ).toLocaleDateString(lang, {
                                    month: "long",
                                    year: "numeric",
                                  })
                                : ""}
                            </small>
                          </div>
                          {r.sample && (
                            <small className="badge">
                              {PUBLIC_UI.sample[lang]}
                            </small>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}
            <section className="home-contact dark">
              <img
                loading="lazy"
                decoding="async"
                src={asset("src/assets/banner4.jpg")}
                alt=""
              />
              <div className="wrap" data-reveal>
                <h2>{ui.contactTitle}</h2>
                <a
                  className="btn gold large"
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconBrandWhatsapp />
                  {ui.whatsappCta}
                </a>
              </div>
            </section>
          </>
        )}
        {page === "services" && (
          <>
            <section className="page-heading dark">
              <div className="wrap">
                <Doodle name="sun" className="section-doodle" />
                <h1 className="split-title">
                  {service ? tr(service.name, lang) : ui.services}
                </h1>
                {!service && <Doodle name="skate" className="services-skate" />}
                <div className="section-heading">
                  <p className="serif">
                    {service ? ui.servicesTitle : ui.servicesSub}
                  </p>
                  {!service && (
                    <div className="chips light">
                      {(["all", ...CATS] as const).map((c) => (
                        <button
                          key={c}
                          className={c === filter ? "active" : ""}
                          onClick={() => setFilter(c)}
                        >
                          {ui[c]}{" "}
                          <span>
                            {
                              services.filter((s) => c === "all" || s.cat === c)
                                .length
                            }
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {service && (
                    <Link
                      className="btn outline light"
                      to={pathFor(lang, "services")}
                    >
                      {ui.seeServices}
                      <IconArrowRight size={18} />
                    </Link>
                  )}
                </div>
              </div>
            </section>
            <section className="wrap service-list">
              {(service
                ? [service]
                : services.filter((s) => filter === "all" || s.cat === filter)
              ).map((s, i) => (
                <ServiceArticle
                  key={s.id}
                  s={s}
                  data={data}
                  lang={lang}
                  index={i}
                  detail={!!service}
                  onBook={book}
                />
              ))}
            </section>
          </>
        )}
        {page === "gallery" && (
          <section className="gallery-page dark">
            <div className="wrap">
              <Doodle name="gull" className="section-doodle" />
              <h1 className="split-title">{ui.galleryTitle}</h1>
              <div className="section-heading">
                <p className="serif">{ui.gallerySub}</p>
                <div className="chips light">
                  {[
                    {
                      id: "all",
                      name: { es: ui.all, en: ui.all, fr: ui.all, de: ui.all },
                    },
                    ...data.albums,
                  ].map((a) => (
                    <button
                      key={a.id}
                      className={album === a.id ? "active" : ""}
                      onClick={() => setAlbum(a.id)}
                    >
                      {tr(a.name, lang)}{" "}
                      <span>
                        {
                          photos.filter(
                            (g) => a.id === "all" || g.album === a.id,
                          ).length
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bento">
                {shown.map((g, i) => (
                  <button key={g.id} onClick={() => setLb({ list: shown, i })}>
                    <img
                      loading="lazy"
                      decoding="async"
                      src={asset(g.src)}
                      srcSet={g.variants?.map((v)=>asset(v.webp)+" "+v.w+"w").join(", ")}
                      sizes="(max-width: 700px) 100vw, 50vw"
                      alt={tr(g.alt, lang)}
                      style={{ objectPosition: g.focus }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
        {page === "contact" && (
          <section className="contact-page dark">
            <div className="contact-copy">
              <Doodle name="wave" className="section-doodle" />
              <div>
                <h1 className="split-title">{ui.contact}</h1>
                <p className="serif">{ui.contactSub}</p>
                <a
                  className="btn gold large"
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconBrandWhatsapp />
                  {ui.whatsappCta}
                </a>
              </div>
              <div className="contact-info">
                <div>
                  <h3>{ui.where}</h3>
                  <p>{ui.whereBody}</p>
                </div>
                <div>
                  <h3>{ui.langs}</h3>
                  <p>{ui.langsBody}</p>
                </div>
                <div>
                  <h3>{ui.follow}</h3>
                  <a
                    href={data.settings.instagram}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <IconBrandInstagram size={18} />
                    Instagram
                  </a>
                  <a
                    href={data.settings.tiktok}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <IconBrandTiktok size={18} />
                    TikTok
                  </a>
                </div>
              </div>
            </div>
            <img
              loading="lazy"
              decoding="async"
              src={asset("src/assets/galeria-sesion-21.jpeg")}
              alt={ui.kicker}
            />
          </section>
        )}
      </main>
      <footer className="site-footer dark">
        <div className="wrap">
          <div className="footer-top">
            <p className="serif">{PUBLIC_UI.footLine[lang]}</p>
            <Doodle name="star" />
            <Doodle name="shades" />
          </div>
          <div className="footer-grid">
            <div>
              <h3>{PUBLIC_UI.menu[lang]}</h3>
              {nav}
            </div>
            <div>
              <h3>{ui.services}</h3>
              {CATS.map((c) => (
                <Link key={c} to={pathFor(lang, "services") + "?category=" + c}>
                  {ui[c]}{" "}
                  <small>
                    {ui.from} {minPrice(c)}
                  </small>
                </Link>
              ))}
            </div>
            <div>
              <h3>{ui.where}</h3>
              <p>{ui.whereBody}</p>
              <p className="muted">{ui.langsBody}</p>
            </div>
            <div>
              <h3>{ui.follow}</h3>
              <a
                href={data.settings.instagram}
                target="_blank"
                rel="noreferrer"
              >
                Instagram <IconArrowUpRight size={15} />
              </a>
              <a href={data.settings.tiktok} target="_blank" rel="noreferrer">
                TikTok <IconArrowUpRight size={15} />
              </a>
              <a href={wa} target="_blank" rel="noreferrer">
                WhatsApp <IconArrowUpRight size={15} />
              </a>
            </div>
          </div>
          <div className="footer-lockup">
            <img
              src={asset("src/assets/logo.jpg")}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div className="footer-wordmark">Evolushon</div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Evolushon Surf Experience · Lima,
              Perú
            </span>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
      </footer>
      {page !== "services" && !booking && !menu && !lb && (
        <div className="mobile-book">
          <Link className="btn gold" to={pathFor(lang, "services")}>
            <IconCalendarCheck size={18} />
            {ui.seeServices}
          </Link>
          <a
            className="round"
            href={wa}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
          >
            <IconBrandWhatsapp />
          </a>
        </div>
      )}
      {page === "services" && !booking && !menu && !lb && (
        <a
          className="whatsapp-fab round"
          href={wa}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
        >
          <IconBrandWhatsapp size={28} />
        </a>
      )}
      {booking && (
        <Booking
          key={booking.s.id}
          data={data}
          lang={lang}
          service={booking.s}
          option={booking.opt}
          onClose={closeBooking}
        />
      )}
      {lb && (
        <Lightbox
          list={lb.list}
          index={lb.i}
          lang={lang}
          onClose={closeLb}
          onStep={(d) =>
            setLb(
              (v) =>
                v && { ...v, i: (v.i + d + v.list.length) % v.list.length },
            )
          }
        />
      )}
    </div>
  );
}
function ServiceArticle({
  s,
  data,
  lang,
  index,
  detail,
  onBook,
}: {
  s: Service;
  data: SiteData;
  lang: Lang;
  index: number;
  detail: boolean;
  onBook: (s: Service, opt?: "single" | number) => void;
}) {
  const ui = uiFor(data, lang),
    [open, setOpen] = useState(detail),
    trip = s.cat === "trip",
    price = effectivePrice(s);
  const lists = (["includes", "excludes", "bring"] as const).filter((k) =>
    tr(s[k], lang).some((v) => v.trim()),
  );
  return (
    <article
      className={"service-article " + (index % 2 ? "reverse" : "")}
      data-reveal
    >
      <div className="service-photo">
        <img
          loading="lazy"
          decoding="async"
          src={asset(s.cover)}
          alt={tr(s.name, lang)}
          style={{ objectPosition: s.coverFocus }}
        />
        <span className="badge">{ui[s.cat]}</span>
        {offerOn(s) && (
          <span className="offer-badge badge">
            {tr(s.offer.label, lang) || PUBLIC_UI.offer[lang]}
          </span>
        )}
      </div>
      <div className="service-copy">
        <Doodle
          name={
            (s.cat === "trip"
              ? ["palm", "tent", "mountains", "gull"]
              : s.cat === "surfskate"
                ? ["skate", "wheel", "swirl"]
                : ["wave", "fin", "waves", "shell"])[
              index % (s.cat === "surfskate" ? 3 : 4)
            ]
          }
        />
        <h2>
          {detail ? (
            tr(s.name, lang)
          ) : (
            <Link to={pathFor(lang, "services", s)}>{tr(s.name, lang)}</Link>
          )}
        </h2>
        <p>{tr(s.desc, lang)}</p>
        {trip && (
          <div className="trip-meta">
            <span>
              <IconMapPin size={17} />
              {tr(s.distance, lang)}
            </span>
            <span>
              <IconClock size={17} />
              {tr(s.duration, lang)}
            </span>
            <span>
              <IconUsers size={17} />
              {s.minPeople} min.
            </span>
          </div>
        )}
        <div className="service-pricing">
          <div>
            <small className="eyebrow">
              {trip ? ui.perPerson : ui.perClass}
            </small>
            <strong className="price">
              {money(s.currency, price) || ui.consult}
            </strong>
            {offerOn(s) && <del>{money(s.currency, s.price)}</del>}
          </div>
          {s.packages.length > 0 && (
            <div className="packages">
              {s.packages.map((p) => (
                <button key={p.n} onClick={() => onBook(s, p.n)}>
                  <small>
                    {p.n} {ui.classes}
                  </small>
                  <b>{money(s.currency, p.price)}</b>
                </button>
              ))}
            </div>
          )}
        </div>
        {open && (trip || lists.length > 0) && (
          <div className="service-details">
            {trip && (
              <div className="flex gap-6">
                <div>
                  <small>{ui.depart}</small>
                  <b>{s.depart}</b>
                </div>
                <div>
                  <small>{ui.ret}</small>
                  <b>{s.ret}</b>
                </div>
              </div>
            )}
            {lists.map((k) => (
              <div key={k}>
                <b>{ui[k]}</b>
                <div>
                  {tr(s[k], lang)
                    .filter((v) => v.trim())
                    .map((v) => (
                      <span key={v}>{v}</span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="actions">
          {price !== null && (
            <button className="btn gold" onClick={() => onBook(s)}>
              <IconCalendarCheck size={18} />
              {BOOKING_UI[lang].reserve}
            </button>
          )}
          <a
            className="btn outline"
            href={waUrl(data.settings, ui.waMsg + tr(s.name, lang))}
            target="_blank"
            rel="noreferrer"
          >
            <IconBrandWhatsapp size={18} />
            {price === null ? ui.consult : "WhatsApp"}
          </a>
          {(trip || lists.length > 0) && (
            <button
              className="detail-toggle"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
            >
              {open ? ui.hide : ui.details}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
function Lightbox({
  list,
  index,
  lang,
  onClose,
  onStep,
}: {
  list: Photo[];
  index: number;
  lang: Lang;
  onClose: () => void;
  onStep: (d: number) => void;
}) {
  const touch = useRef(0);
  return (
    <Modal
      label={tr(list[index].alt, lang)}
      onClose={onClose}
      className="lightbox"
    >
      <button
        className="round modal-close"
        onClick={onClose}
        aria-label={UI[lang].close}
      >
        <IconX />
      </button>
      <div className="lightbox-count">
        {String(index + 1).padStart(2, "0")} /{" "}
        {String(list.length).padStart(2, "0")}
      </div>
      <img
        src={asset(list[index].src)}
        srcSet={list[index].variants?.map((v)=>asset(v.webp)+" "+v.w+"w").join(", ")}
        sizes="90vw"
        alt={tr(list[index].alt, lang)}
        onTouchStart={(e) => {
          touch.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1);
        }}
      />
      <div className="lightbox-controls">
        <button
          className="round"
          aria-label={BOOKING_UI[lang].back}
          onClick={() => onStep(-1)}
        >
          <IconChevronLeft />
        </button>
        <p>{tr(list[index].alt, lang)}</p>
        <button
          className="round"
          aria-label={BOOKING_UI[lang].next}
          onClick={() => onStep(1)}
        >
          <IconChevronRight />
        </button>
      </div>
    </Modal>
  );
}
