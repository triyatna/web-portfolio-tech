# Tri Yatna — Modern Web Portfolio Tech

A fast, modern, programmer‑themed portfolio built with **Vite + React + Tailwind**.  
Content is powered by a simple `data/data.json` file so you can customize it without touching the code.

> Repo: https://github.com/triyatna/web-portfolio-tech — please ⭐ star, **fork**, and share if this helps you!

---

## 🔎 Demo

- **Live:** https://triyatna.is-a.dev
- **GitHub Pages:** works for both user/org sites and project sites (e.g. `/portfolio/`).

> Note: demo URL may change — see your fork’s GitHub Pages URL after you deploy.

---

## ✨ Features

- ⚡ **Vite** dev/build, module‑based sections
- 🧩 **data.json‑driven** (personal info, SEO, projects, socials, etc.)
- 🌓 **Dark/Light** theme + subtle motion, accessible focus styles
- 🧪 **TypeScript**, ESLint, Prettier, type check script
- 🔍 Strong **SEO** tags (Open Graph/Twitter), dynamic meta
- 🛠️ Optional GitHub Projects list via **GitHub API**
- 📄 Auto generate **sitemap.xml**, **feed.xml**, **robots.txt** (build step)
- 🧰 Smart 404 helper for GitHub Pages base path
- 📦 Build assets under `assets/` (images in `assets/images/`)

---

## 🚀 Quick Start (User)

```bash
# 1) Clone
git clone https://github.com/triyatna/web-portfolio-tech.git
cd web-portfolio-tech

# 2) Install
npm ci   # or: npm i

# 3) Run dev
npm run dev  # http://localhost:5173

# 4) Build (local)
npm run build

# 5) Preview build
npm run preview
```

### Configure your content

Edit **`public/data/data.json`**. Minimal keys you likely want to change:

- `personal`: `name`, `tagline`, `avatarUrl`, `logo_path`, `socials`, optional `cvUrl`
- `seo`: `siteUrl`, `title`, `description`, `favicons`, etc.
- `projects`: enable/disable GitHub list, filters
- `portfolio`, `about`, `resume`, `techStack`, `contact`

Place images under `public/` (they’ll be emitted to `dist/assets/images/...`).  
Example: `public/assets/images/avatar.png` → refer using `/assets/images/avatar.png` in `data.json`.

> **Tip:** Avoid absolute `http:` links for app assets; prefer root‑relative (e.g. `/assets/images/...`).

---

## 📤 Deploy to GitHub Pages

This repo supports **GitHub Actions** out of the box. Typical steps:

1. **Enable Pages** for your repo: Settings → Pages → Source: _GitHub Actions_.
2. Commit & push to **main**.
3. The included workflow (see `.github/workflows/pages.yml`) builds and deploys.

### Base path (project pages)

If your site is served at `https://<user>.github.io/<repo>/`, the workflow computes `BASE_PATH=/<repo>/` automatically.  
For local/manual builds, either:

```bash
# Option A: env (if vite.config reads process.env.BASE_PATH)
BASE_PATH="/<repo>/" npm run build

# Option B: vite CLI flag
npm run build -- --base "/<repo>/"
```

---

## 🧑‍💻 Contributing

Thanks for your interest! Contributions are welcome.

1. **Fork** the repo and **create a feature branch**:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Install deps and run dev:
   ```bash
   npm ci
   npm run dev
   ```
3. Make changes, add tests if applicable.
4. **Format & lint** before committing:
   ```bash
   npm run format
   npm run lint
   npm run typecheck
   ```
5. Commit with a clear message and open a **Pull Request** to `main`.

> For bugs/ideas, please open a **GitHub Issue** with steps to reproduce or a concise proposal.

---

## 🗂️ Project Structure

```
src/
  modules/              # components, hooks, sections
  styles/               # base style
  main.tsx              # app entry
public/
  data/                 # data.json (content/SEO/settings)
  assets/images/        # favicons, og-image, avatar, etc.
  404.html
dist/                   # build output (CI deploys this)
```

---

## 🔧 Scripts

- `npm run dev` – start dev server
- `npm run build` – build + generate `sitemap.xml`, `feed.xml`, `robots.txt`
- `npm run preview` – preview built site
- `npm run lint` – ESLint
- `npm run format` – Prettier
- `npm run typecheck` – TypeScript check

> The build may also include optional steps (e.g. JS obfuscator) depending on your `package.json`.

---

## 🔐 Notes & Limits

- GitHub API is **rate‑limited**. If Projects list fails, try again later or add a token fetcher.
- Do **not** put secrets in `data.json` (the site is static, all data is public).
- Ensure images exist at referenced paths to avoid 404s in production.

---

## ❤️ Support

If this project helped you:

- ⭐ **Star** the repo
- 🍴 **Fork** and customize it for your portfolio
- 🧵 Share feedback via Issues/PRs

---

## 📜 License

[MIT License](LICENSE) · © Tri Yatna
