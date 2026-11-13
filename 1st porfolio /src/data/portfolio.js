export const personalInfo = {
  name: "Prabhjot Singh",
  handle: "@Prabhhx07",
  title: "Full-Stack Developer",
  subtitle: "Computer Science Student · Full-Stack Developer",
  tagline:
    "Full-Stack Developer & CS Student · Crafting high-performance web systems",
  bio: "I build useful software and keep learning in public. I focus on full-stack web apps, DSA practice, and product-style interfaces that feel thoughtful, fast, and practical.",
  email: "prabhjots2005@gmail.com",
  // Tip: download this image into /public/assets and point to it locally so it never fails to load
  avatar: "https://avatars.githubusercontent.com/u/184679136?v=4",
  status: "Open to internships and collaborations",
  resumeUrl: "/assets/Prabhjot_Singh_Resume.pdf",
  socials: {
    github: "https://github.com/Prabhhx07",
    linkedin: "https://www.linkedin.com/in/prabhhx07/",
    twitter: "https://x.com/Prabhh_7",
    instagram: "https://www.instagram.com/prabhh_.7/",
  },
};

export const aboutSummary =
  "I'm a second-year B.E. Computer Science (AI/ML) student who turns ideas into working software. I like owning a feature from the database all the way to the interface, and I care about the details that make a product feel fast and trustworthy.";

export const strengths = [
  {
    title: "End-to-end ownership",
    text: "React front ends, FastAPI and Node back ends, PostgreSQL and CI/CD, shipped as working products.",
  },
  {
    title: "Production mindset",
    text: "JWT auth, role-based access, rate limiting, Redis caching and audit logging in a multi-tenant SaaS.",
  },
  {
    title: "Applied AI",
    text: "RAG with pgvector semantic search, plus an MLOps pipeline with model versioning and A/B routing.",
  },
  {
    title: "Learns in public",
    text: "Regular DSA practice and side projects, now going deeper into AI/ML and cybersecurity.",
  },
];

export const lookingFor =
  "Software engineering internships where I can ship real features, learn from experienced engineers, and grow in AI/ML and security.";

export const interests = [
  { icon: "", label: "Working out" },
  { icon: "", label: "Reading philosophy" },
  { icon: "", label: "Reading about Startups & product design" },
  { icon: "", label: "Cinematography & video editing" },
];

export const skills = {
  Frontend: [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "TailwindCSS",
    "Bootstrap",
  ],
  Backend: [
    "Node.js",
    "Express.js",
    "Python",
    "PostgreSQL",
    "C",
    "C++",
    "FastAPI",
    "Redis",
    "Docker",
  ],
  "AI / ML": ["scikit-learn", "RAG", "pgvector", "TF-IDF"],
  Tools: ["Git", "GitHub", "GitHub Actions", "Jest"],
};

export const projects = [
  {
    title: "RAG-Powered Document Q&A",
    category: "AI & RAG",
    description:
      "A full-stack Retrieval-Augmented Generation app: upload a PDF, ask questions in natural language, and get answers grounded strictly in the document. Built with pgvector for semantic search, JWT auth, per-user rate limiting, and multi-turn conversational memory.",
    tags: ["FastAPI", "React", "PostgreSQL", "pgvector"],
    liveUrl: "https://rag-powered-doc.vercel.app",
    featured: true,
    icon: "📄",
  },
  {
    title: "Project-D",
    category: "Full-Stack SaaS",
    description:
      "A full-stack multi-tenant SaaS platform for document processing and collaboration. Self-built JWT auth, role-based access control, BullMQ background processing, WebSocket real-time notifications, Redis caching, rate limiting, audit logging, and CI/CD pipeline.",
    tags: ["React", "Node.js", "PostgreSQL", "Redis"],
    liveUrl: "https://project-d-omega.vercel.app",
    featured: true,
    icon: "🏗️",
  },
  {
    title: "MLOps Pipeline — Spam Classifier",
    category: "MLOps",
    description:
      "An end-to-end MLOps pipeline around a TF-IDF + Logistic Regression spam classifier: a served FastAPI inference API, Docker containerization, and CI/CD via GitHub Actions. Includes model versioning, A/B traffic routing, structured JSON logging, and a live monitoring dashboard.",
    tags: ["Python", "scikit-learn", "FastAPI", "Docker", "GitHub Actions"],
    repoUrl: "https://github.com/Prabhhx07/ML-ops_pipeline",
    featured: false,
    icon: "🤖",
  },
];

export const quickFacts = [
  { label: "Focus", value: "Full-stack apps" },
  { label: "Learning", value: "AI/ML & Cybersecurity" },
  { label: "Creative", value: "Cinematography & color grading" },
];
