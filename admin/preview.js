(function initCmsPreview() {
  if (typeof window === "undefined" || !window.CMS) {
    return;
  }

  const h = window.h;
  const createClass = window.createClass;

  if (!h || !createClass) {
    return;
  }

  function getObject(entry) {
    const data = entry && entry.get && entry.get("data");
    if (data && typeof data.toJS === "function") {
      return data.toJS();
    }
    return {};
  }

  function pickLocalized(value, lang) {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      if (typeof value[lang] === "string" && value[lang].trim().length > 0) {
        return value[lang];
      }
      if (typeof value.en === "string") {
        return value.en;
      }
      if (typeof value.ar === "string") {
        return value.ar;
      }
    }

    return "";
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function titleNode(text) {
    return h("h2", { className: "section-title" }, text || "");
  }

  const SiteContentPreview = createClass({
    getInitialState() {
      return { lang: "en", openServices: {} };
    },

    toggleLang() {
      this.setState(({ lang }) => ({ lang: lang === "en" ? "ar" : "en" }));
    },

    toggleService(index) {
      this.setState((prev) => {
        const nextOpenServices = { ...(prev.openServices || {}) };
        nextOpenServices[index] = !nextOpenServices[index];
        return { openServices: nextOpenServices };
      });
    },

    render() {
      const lang = this.state.lang;
      const dir = lang === "ar" ? "rtl" : "ltr";
      const content = getObject(this.props.entry);
      const openServices = this.state.openServices || {};

      const services = asArray(content?.services?.items);
      const benefits = asArray(content?.benefits?.items);
      const testimonials = asArray(content?.testimonials?.items);
      const aboutImageUrl = (content?.about?.imageUrl || "").trim();
      const detailsButtonOpen = pickLocalized(content?.services?.detailsButtonOpen, lang) || (lang === "ar" ? "عرض التفاصيل" : "View details");
      const detailsButtonClose = pickLocalized(content?.services?.detailsButtonClose, lang) || (lang === "ar" ? "إخفاء التفاصيل" : "Hide details");
      const durationLabel = pickLocalized(content?.services?.durationLabel, lang);
      const priceLabel = pickLocalized(content?.services?.priceLabel, lang);

      return h(
        "div",
        {
          className: "preview-root",
          dir,
          lang
        },
        [
          h("div", { className: "preview-toolbar", key: "toolbar" }, [
            h(
              "button",
              {
                className: "preview-toggle-btn",
                onClick: this.toggleLang,
                type: "button"
              },
              lang === "en" ? "Preview: English" : "Preview: Arabic"
            )
          ]),
          h("div", { className: "preview-body", key: "body" }, [
            h("header", { className: "header", key: "header" }, [
              h("div", { className: "container header__inner" }, [
                h("div", { className: "logo" }, pickLocalized(content?.branding?.logo, lang)),
                h(
                  "div",
                  { className: "lang-toggle", role: "button", "aria-disabled": "true" },
                  pickLocalized(content?.branding?.languageToggle, lang)
                )
              ])
            ]),
            h("main", { key: "main" }, [
              h("section", { className: "hero", key: "hero" }, [
                h("div", { className: "container hero__inner" }, [
                  h("div", { className: "hero__content" }, [
                    h("h1", { className: "hero__title" }, pickLocalized(content?.hero?.title, lang)),
                    h("p", { className: "hero__subtitle" }, pickLocalized(content?.hero?.subtitle, lang)),
                    h("span", { className: "btn btn--primary" }, pickLocalized(content?.hero?.cta, lang))
                  ])
                ])
              ]),
              h("section", { className: "about", key: "about" }, [
                h("div", { className: "container" }, [
                  titleNode(pickLocalized(content?.about?.title, lang)),
                  h("div", { className: "about__grid" }, [
                    h("div", { className: "about__text" }, [
                      h("p", null, pickLocalized(content?.about?.text1, lang)),
                      h("p", null, pickLocalized(content?.about?.text2, lang))
                    ]),
                    h("div", { className: "about__image" }, [
                      aboutImageUrl
                        ? h("img", {
                            src: aboutImageUrl,
                            alt: pickLocalized(content?.about?.imageAlt, lang),
                            loading: "lazy"
                          })
                        : h(
                            "p",
                            { className: "preview-media-note" },
                            lang === "en"
                              ? "Upload About image in CMS to preview it here."
                              : "Upload About image in CMS to preview it here."
                          )
                    ])
                  ])
                ])
              ]),
              h("section", { className: "services", key: "services" }, [
                h("div", { className: "container" }, [
                  titleNode(pickLocalized(content?.services?.title, lang)),
                  h(
                    "div",
                    { className: "services__grid" },
                    services.map((item, index) => {
                      const isOpen = Boolean(openServices[index]);
                      const detailsId = `preview-service-details-${index}`;

                      return h(
                        "div",
                        {
                          className: isOpen ? "service-card is-open" : "service-card",
                          key: `service-${index}`
                        },
                        [
                          h("h3", { className: "service-card__title" }, pickLocalized(item?.title, lang)),
                          h("p", { className: "service-card__desc" }, pickLocalized(item?.desc, lang)),
                          h(
                            "button",
                            {
                              className: "service-card__toggle",
                              type: "button",
                              onClick: () => this.toggleService(index),
                              "aria-expanded": isOpen ? "true" : "false",
                              "aria-controls": detailsId
                            },
                            isOpen ? detailsButtonClose : detailsButtonOpen
                          ),
                          h(
                            "div",
                            {
                              className: "service-card__details",
                              id: detailsId,
                              "aria-hidden": isOpen ? "false" : "true"
                            },
                            [
                              h("p", { className: "service-card__full" }, pickLocalized(item?.details, lang)),
                              h("dl", { className: "service-card__meta" }, [
                                h("div", { className: "service-card__meta-item" }, [
                                  h("dt", null, durationLabel),
                                  h("dd", null, pickLocalized(item?.duration, lang))
                                ]),
                                h("div", { className: "service-card__meta-item" }, [
                                  h("dt", null, priceLabel),
                                  h("dd", null, pickLocalized(item?.price, lang))
                                ])
                              ])
                            ]
                          )
                        ]
                      );
                    })
                  )
                ])
              ]),
              h("section", { className: "benefits", key: "benefits" }, [
                h("div", { className: "container" }, [
                  titleNode(pickLocalized(content?.benefits?.title, lang)),
                  h(
                    "ul",
                    { className: "benefits__list" },
                    benefits.map((item, index) =>
                      h("li", { className: "benefits__item", key: `benefit-${index}` }, pickLocalized(item, lang))
                    )
                  )
                ])
              ]),
              h("section", { className: "testimonials", key: "testimonials" }, [
                h("div", { className: "container" }, [
                  titleNode(pickLocalized(content?.testimonials?.title, lang)),
                  h(
                    "div",
                    { className: "testimonials__grid" },
                    testimonials.map((item, index) =>
                      h("div", { className: "testimonial", key: `testimonial-${index}` }, [
                        h("p", { className: "testimonial__text" }, pickLocalized(item?.text, lang)),
                        h("cite", { className: "testimonial__author" }, pickLocalized(item?.author, lang))
                      ])
                    )
                  )
                ])
              ]),
              h("section", { className: "contact", key: "contact" }, [
                h("div", { className: "container" }, [
                  titleNode(pickLocalized(content?.contact?.title, lang)),
                  h("div", { className: "contact__content" }, [
                    h("p", { className: "contact__text" }, pickLocalized(content?.contact?.text, lang)),
                    h("div", { className: "contact__buttons" }, [
                      h("span", { className: "btn btn--primary" }, pickLocalized(content?.contact?.whatsapp, lang)),
                      h("span", { className: "btn btn--secondary" }, pickLocalized(content?.contact?.call, lang))
                    ]),
                    h("div", { className: "contact__info" }, [
                      h("span", null, pickLocalized(content?.contact?.hours, lang)),
                      h("span", null, pickLocalized(content?.contact?.location, lang))
                    ])
                  ])
                ])
              ])
            ]),
            h("footer", { className: "footer", key: "footer" }, [
              h("div", { className: "container footer__inner" }, [
                h("p", { className: "footer__copy" }, pickLocalized(content?.footer?.copyright, lang)),
                h("p", { className: "footer__design" }, pickLocalized(content?.footer?.disclaimer, lang))
              ])
            ])
          ])
        ]
      );
    }
  });

  window.CMS.registerPreviewStyle("/page.css");
  window.CMS.registerPreviewStyle("/admin/preview.css");
  window.CMS.registerPreviewTemplate("site", SiteContentPreview);
  window.CMS.registerPreviewTemplate("site_content", SiteContentPreview);
})();
