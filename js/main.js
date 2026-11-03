(function () {
  "use strict";

  var root = document.documentElement;
  var themeToggle = document.querySelector("[data-theme-toggle]");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function getStoredTheme() {
    try {
      return localStorage.getItem("theme");
    } catch (error) {
      return null;
    }
  }

  function storeTheme(value) {
    try {
      localStorage.setItem("theme", value);
    } catch (error) {}
  }

  function syncThemeUI() {
    var isDark = root.classList.contains("dark");
    if (themeToggle) {
      var label = isDark ? "Activar tema claro" : "Activar tema oscuro";
      themeToggle.setAttribute("aria-label", label);
      themeToggle.setAttribute("title", label);
    }
    if (themeMeta) {
      themeMeta.setAttribute("content", isDark ? "#0B0F14" : "#F7F5F0");
    }
  }

  function applyTheme(isDark, persist) {
    root.classList.toggle("dark", isDark);
    if (persist !== false) storeTheme(isDark ? "dark" : "light");
    syncThemeUI();
  }

  syncThemeUI();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(!root.classList.contains("dark"), true);
    });
  }

  if (typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", function (event) {
      if (!getStoredTheme()) applyTheme(event.matches, false);
    });
  }

  var menuToggle = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("mobile-menu");
  var menuOpenIcon = menuToggle ? menuToggle.querySelector('[data-menu-icon="open"]') : null;
  var menuCloseIcon = menuToggle ? menuToggle.querySelector('[data-menu-icon="close"]') : null;
  var header = menuToggle ? menuToggle.closest("header") : null;
  var mobileLinks = menu ? Array.prototype.slice.call(menu.querySelectorAll("a")) : [];
  var previousFocus = null;

  function setMenu(open, restoreFocus) {
    if (!menu || !menuToggle) return;

    menu.classList.toggle("hidden", !open);
    menuToggle.setAttribute("aria-expanded", String(open));

    var srLabel = menuToggle.querySelector(".sr-only");
    if (srLabel) srLabel.textContent = open ? "Cerrar menú" : "Abrir menú";

    if (menuOpenIcon) menuOpenIcon.classList.toggle("hidden", open);
    if (menuCloseIcon) menuCloseIcon.classList.toggle("hidden", !open);

    if (open) {
      previousFocus = document.activeElement;
      if (mobileLinks[0]) mobileLinks[0].focus();
    } else if (restoreFocus !== false && previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true", true);
    });
  }

  mobileLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false, false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Escape" &&
      menuToggle &&
      menuToggle.getAttribute("aria-expanded") === "true"
    ) {
      setMenu(false, true);
      menuToggle.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (!header || !menu || menu.classList.contains("hidden")) return;
    if (!header.contains(event.target) && !menu.contains(event.target)) {
      setMenu(false, false);
    }
  });

  window.addEventListener("resize", function () {
    if (
      window.innerWidth >= 1024 &&
      menuToggle &&
      menuToggle.getAttribute("aria-expanded") === "true"
    ) {
      setMenu(false, false);
    }
  });

  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var navSections = navLinks
    .map(function (link) {
      return document.getElementById(link.getAttribute("data-nav"));
    })
    .filter(Boolean);
  var hero = document.getElementById("inicio");

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute("data-nav") === id) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && navSections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (entry.target === hero) {
            setActiveNav(null);
          } else {
            setActiveNav(entry.target.id);
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    if (hero) navObserver.observe(hero);
    navSections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  var copyButton = document.querySelector("[data-copy-email]");
  var copyStatus = document.querySelector("[data-copy-status]");
  var copyButtonMarkup = copyButton ? copyButton.innerHTML : "";
  var copyResetTimer = null;

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    textarea.remove();
    return copied;
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var email = copyButton.getAttribute("data-copy-email");

      function showResult(copied) {
        if (copyStatus) {
          copyStatus.textContent = copied
            ? "Email copiado al portapapeles"
            : "No se pudo copiar. Usá el enlace de email.";
          window.clearTimeout(copyStatus.copyTimer);
          copyStatus.copyTimer = window.setTimeout(function () {
            copyStatus.textContent = "";
          }, 4000);
        }

        if (copied) {
          window.clearTimeout(copyResetTimer);
          copyButton.textContent = "Copiado";
          copyResetTimer = window.setTimeout(function () {
            copyButton.innerHTML = copyButtonMarkup;
          }, 2000);
        }
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(email)
          .then(function () {
            showResult(true);
          })
          .catch(function () {
            showResult(fallbackCopy(email));
          });
      } else {
        showResult(fallbackCopy(email));
      }
    });
  }

  var yearNodes = document.querySelectorAll("[data-year]");
  var currentYear = String(new Date().getFullYear());
  yearNodes.forEach(function (node) {
    node.textContent = currentYear;
  });
})();
