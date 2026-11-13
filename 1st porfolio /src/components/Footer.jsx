import { personalInfo } from "../data/portfolio.js";

const LINKS = [
  ["GitHub", "github"],
  ["LinkedIn", "linkedin"],
  ["Twitter", "twitter"],
  ["Instagram", "instagram"],
];

export default function Footer() {
  const { socials } = personalInfo;

  return (
    <footer className="site-footer">
      <div className="footer-links">
        {LINKS.map(([label, key]) => (
          <a
            key={key}
            href={socials[key]}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        ))}
      </div>
      <p>
        © {new Date().getFullYear()} {personalInfo.name}. Made with ❤️ in India.
      </p>
    </footer>
  );
}
