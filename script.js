const root = document.documentElement;
const savedTheme = localStorage.getItem("portfolio-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
  root.dataset.theme = "dark";
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

async function loadIncludes() {
  const includeSlots = Array.from(document.querySelectorAll("[data-include]"));

  await Promise.all(
    includeSlots.map(async (slot) => {
      const path = slot.dataset.include;
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`Gagal memuat ${path}`);
      }

      const template = document.createElement("template");
      template.innerHTML = (await response.text()).trim();
      slot.replaceWith(template.content.cloneNode(true));
    })
  );
}

function showIncludeError(error) {
  const shell = document.querySelector(".page-shell");

  if (!shell) return;

  shell.innerHTML = `
    <main class="include-error">
      <h1>Konten belum bisa dimuat.</h1>
      <p>
        Jalankan website lewat local server agar file komponen bisa dibaca.
        Contoh: <code>python3 -m http.server 4173</code>
      </p>
      <p>${error.message}</p>
    </main>
  `;
}

function initPortfolio() {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll("[data-category]");
  const form = document.querySelector("[data-contact-form]");
  const statusText = document.querySelector("[data-form-status]");
  const year = document.querySelector("[data-year]");

  function updateThemeIcon() {
    if (!themeToggle) return;
    const iconName = root.dataset.theme === "dark" ? "moon" : "sun";
    themeToggle.innerHTML = `<i data-lucide="${iconName}"></i>`;
    refreshIcons();
  }

  function setHeaderState() {
    header?.classList.toggle("is-scrolled", window.scrollY > 16);
  }

  function closeNav() {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-label", "Buka menu");

    if (navToggle) {
      navToggle.innerHTML = '<i data-lucide="menu"></i>';
      refreshIcons();
    }
  }

  if (year) {
    year.textContent = new Date().getFullYear();
  }
  updateThemeIcon();
  setHeaderState();

  window.addEventListener("scroll", setHeaderState, { passive: true });

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    localStorage.setItem("portfolio-theme", nextTheme);
    updateThemeIcon();
  });

  navToggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-label", isOpen ? "Tutup menu" : "Buka menu");
    navToggle.innerHTML = `<i data-lucide="${isOpen ? "x" : "menu"}"></i>`;
    refreshIcons();
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      projectCards.forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        document.querySelectorAll(".site-nav a").forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-42% 0px -48% 0px" }
  );

  document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        const value = Number(target.dataset.count);
        const suffix = value === 98 ? "%" : "+";
        let frame = 0;
        const totalFrames = 44;

        function tick() {
          frame += 1;
          const progress = Math.min(frame / totalFrames, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          target.textContent = `${Math.round(value * eased)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        }

        tick();
        statObserver.unobserve(target);
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll("[data-count]").forEach((counter) => statObserver.observe(counter));

  document.querySelector(".hero")?.addEventListener("pointermove", (event) => {
    const hero = event.currentTarget;
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    hero.style.setProperty("--spot-x", `${x}%`);
    hero.style.setProperty("--spot-y", `${y}%`);
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");
    const subject = encodeURIComponent(`Project inquiry dari ${name}`);
    const body = encodeURIComponent(`${message}\n\nDari: ${name}\nEmail: ${email}`);

    statusText.textContent = "Membuka aplikasi email...";
    window.location.href = `mailto:hello@namaanda.dev?subject=${subject}&body=${body}`;

    window.setTimeout(() => {
      statusText.textContent = "Pesan sudah disiapkan di aplikasi email.";
      form.reset();
    }, 700);
  });

  refreshIcons();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadIncludes();
    initPortfolio();
  } catch (error) {
    showIncludeError(error);
  }
});
