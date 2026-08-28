import {
  useEffect,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  animate,
  stagger,
} from "animejs";

function isVisible(
  element
) {
  if (!element) {
    return false;
  }

  const style =
    window.getComputedStyle(
      element
    );

  return (
    style.display !== "none" &&
    style.visibility !==
      "hidden" &&
    element.getClientRects()
      .length > 0
  );
}

function clearMotionFlags(
  root
) {
  root
    .querySelectorAll(
      "[data-motion-observed], [data-motion-revealed]"
    )
    .forEach(
      (element) => {
        delete element.dataset
          .motionObserved;

        delete element.dataset
          .motionRevealed;
      }
    );
}

function usePublicMotion() {
  const {
    pathname,
  } = useLocation();

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return undefined;
    }

    const root =
      document.querySelector(
        "[data-public-motion-root]"
      );

    if (!root) {
      return undefined;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reducedMotion) {
      clearMotionFlags(root);

      return undefined;
    }

    const observers = [];

    let mutationObserver =
      null;

    /*
     * Se difiere el montaje un frame.
     * Esto evita ejecutar dos veces las
     * animaciones durante el ciclo extra
     * de efectos que React StrictMode
     * realiza en desarrollo.
     */
    const frameId =
      window.requestAnimationFrame(
        () => {
          clearMotionFlags(
            root
          );

          const run = (
            targets,
            options
          ) => {
            const nodes =
              (
                Array.isArray(
                  targets
                )
                  ? targets
                  : [targets]
              ).filter(
                (element) =>
                  isVisible(
                    element
                  )
              );

            if (
              !nodes.length
            ) {
              return;
            }

            animate(
              nodes,
              options
            );
          };

          /* ======================================
             NAVBAR
          ====================================== */

          const navbar =
            root.querySelector(
              "[data-motion-navbar]"
            );

          run(
            navbar,
            {
              opacity: {
                from: 0,
              },
              y: {
                from: -14,
              },
              duration: 520,
            }
          );

          /* ======================================
             HOME HERO
          ====================================== */

          const homeHero =
            root.querySelector(
              "#inicio"
            );

          if (homeHero) {
            const heroCopy =
              homeHero.querySelector(
                "[data-motion-hero-copy]"
              );

            const heroVisual =
              homeHero.querySelector(
                "[data-motion-hero-visual]"
              );

            const heroMetrics =
              homeHero.querySelector(
                "[data-motion-hero-metrics]"
              );

            if (
              heroCopy &&
              isVisible(
                heroCopy
              )
            ) {
              run(
                heroCopy,
                {
                  opacity: {
                    from: 0,
                  },
                  y: {
                    from: 20,
                  },
                  duration: 720,
                }
              );

              run(
                Array.from(
                  heroCopy.children
                ),
                {
                  opacity: {
                    from: 0,
                  },
                  delay:
                    stagger(55),
                  duration: 620,
                }
              );
            }

            run(
              heroVisual,
              {
                opacity: {
                  from: 0,
                },
                y: {
                  from: 22,
                },
                duration: 780,
              }
            );

            if (
              heroMetrics &&
              isVisible(
                heroMetrics
              )
            ) {
              run(
                heroMetrics,
                {
                  opacity: {
                    from: 0,
                  },
                  y: {
                    from: 14,
                  },
                  duration: 650,
                }
              );

              run(
                Array.from(
                  heroMetrics
                    .children
                ),
                {
                  opacity: {
                    from: 0,
                  },
                  delay:
                    stagger(55),
                  duration: 560,
                }
              );
            }
          }

          /* ======================================
             SECTION HEADERS
          ====================================== */

          const revealSection =
            (section) => {
              if (
                section.dataset
                  .motionRevealed ===
                "true"
              ) {
                return;
              }

              section.dataset
                .motionRevealed =
                "true";

              const eyebrow =
                section.querySelector(
                  ".theme-eyebrow"
                );

              const title =
                section.querySelector(
                  "h1.theme-title, h2.theme-title"
                );

              const description =
                section.querySelector(
                  "p.theme-text"
                );

              const headerTargets =
                [
                  eyebrow,
                  title,
                  description,
                ].filter(
                  (element) =>
                    isVisible(
                      element
                    )
                );

              if (
                headerTargets.length
              ) {
                run(
                  headerTargets,
                  {
                    opacity: {
                      from: 0,
                    },
                    y: {
                      from: 16,
                    },
                    delay:
                      stagger(65),
                    duration: 650,
                  }
                );
              } else {
                run(
                  section,
                  {
                    opacity: {
                      from: 0,
                    },
                    duration: 520,
                  }
                );
              }
            };

          const sectionObserver =
            new IntersectionObserver(
              (entries) => {
                entries.forEach(
                  (entry) => {
                    if (
                      !entry
                        .isIntersecting
                    ) {
                      return;
                    }

                    revealSection(
                      entry.target
                    );

                    sectionObserver.unobserve(
                      entry.target
                    );
                  }
                );
              },
              {
                threshold: 0.12,
                rootMargin:
                  "0px 0px -8% 0px",
              }
            );

          observers.push(
            sectionObserver
          );

          /* ======================================
             ARTICLE / CARD REVEAL
          ====================================== */

          const articleObserver =
            new IntersectionObserver(
              (entries) => {
                const entering =
                  entries
                    .filter(
                      (entry) =>
                        entry
                          .isIntersecting
                    )
                    .map(
                      (entry) =>
                        entry.target
                    )
                    .filter(
                      (element) =>
                        element
                          .dataset
                          .motionRevealed !==
                        "true"
                    );

                if (
                  !entering.length
                ) {
                  return;
                }

                entering.forEach(
                  (element) => {
                    element.dataset
                      .motionRevealed =
                      "true";

                    articleObserver.unobserve(
                      element
                    );
                  }
                );

                /*
                 * Solo opacidad en cards.
                 * Así no dejamos un transform
                 * inline que bloquee los hover
                 * de .theme-card-hover.
                 */
                run(
                  entering,
                  {
                    opacity: {
                      from: 0,
                    },
                    delay:
                      stagger(55),
                    duration: 560,
                  }
                );
              },
              {
                threshold: 0.16,
                rootMargin:
                  "0px 0px -6% 0px",
              }
            );

          observers.push(
            articleObserver
          );

          /* ======================================
             FOOTER
          ====================================== */

          const footer =
            root.querySelector(
              "[data-motion-footer]"
            );

          if (footer) {
            const footerObserver =
              new IntersectionObserver(
                (entries) => {
                  entries.forEach(
                    (entry) => {
                      if (
                        !entry
                          .isIntersecting
                      ) {
                        return;
                      }

                      run(
                        footer
                          .firstElementChild ||
                          footer,
                        {
                          opacity: {
                            from: 0,
                          },
                          y: {
                            from: 18,
                          },
                          duration: 650,
                        }
                      );

                      footerObserver.unobserve(
                        footer
                      );
                    }
                  );
                },
                {
                  threshold: 0.08,
                }
              );

            footerObserver.observe(
              footer
            );

            observers.push(
              footerObserver
            );
          }

          /* ======================================
             DYNAMIC CONTENT
          ====================================== */

          const registerMotionTargets =
            () => {
              root
                .querySelectorAll(
                  "main section"
                )
                .forEach(
                  (section) => {
                    if (
                      section.id ===
                      "inicio"
                    ) {
                      return;
                    }

                    if (
                      section.dataset
                        .motionObserved ===
                      "true"
                    ) {
                      return;
                    }

                    section.dataset
                      .motionObserved =
                      "true";

                    sectionObserver.observe(
                      section
                    );
                  }
                );

              root
                .querySelectorAll(
                  "main article"
                )
                .forEach(
                  (article) => {
                    if (
                      article.dataset
                        .motionObserved ===
                      "true"
                    ) {
                      return;
                    }

                    article.dataset
                      .motionObserved =
                      "true";

                    articleObserver.observe(
                      article
                    );
                  }
                );
            };

          registerMotionTargets();

          mutationObserver =
            new MutationObserver(
              () => {
                registerMotionTargets();
              }
            );

          mutationObserver.observe(
            root,
            {
              childList: true,
              subtree: true,
            }
          );
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frameId
      );

      mutationObserver?.disconnect();

      observers.forEach(
        (observer) => {
          observer.disconnect();
        }
      );

      clearMotionFlags(
        root
      );
    };
  }, [pathname]);
}

export default usePublicMotion;
