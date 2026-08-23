import { PortfolioData } from '../src/types';

export const initialData: PortfolioData = {
  profile: {
    name: "Hammad Hassan",
    username: "hammadhassan",
    title: "Full Stack & Software Engineer",
    bio: "Full Stack Engineer specializing in modern web ecosystems, Python/Django microservices, React/TypeScript frontends, and distributed database architecture.",
    detailedBio: "I am a passionate software engineer with 4+ years of hands-on experience designing and delivering robust, scalable web applications and high-performance APIs. I focus on clean code, intuitive developer experiences, and resilient system architectures. My primary stack spans React, TypeScript, Python, Django, Node.js, Supabase, and PostgreSQL.",
    location: "Lahore, Pakistan • Remote Worldwide",
    status: "Available for contract & full-time engineering roles",
    statusEmoji: "🟢",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    email: "hammadhassan7409@gmail.com",
    github: "https://github.com/hammadhassan",
    linkedin: "https://linkedin.com/in/hammadhassan",
    website: "https://hammadhassan.dev",
    twitter: "https://x.com/hammadhassan",
    resumeUrl: "#",
    company: "Freelance & Open Source Contributor",
    followersCount: 418,
    followingCount: 162,
    starsCount: 894,
    totalContributionsYear: 1842,
    yearsOfExperience: 4,
    currentFocus: "Building real-time distributed platforms & AI-integrated SaaS applications"
  },
  projects: [
    {
      id: "proj-1",
      name: "nexus-cloud-orchestrator",
      displayName: "Nexus Cloud Orchestrator",
      description: "Enterprise multi-cloud workload monitor & automated deployment pipeline engine built with React, Node.js, and Docker.",
      longDescription: "Nexus Cloud Orchestrator is a mission-critical platform designed to streamline infrastructure provisioning and live microservice telemetry. It provides real-time container metrics, automated rolling deployments, incident diagnostics, and seamless integration with Kubernetes clusters and AWS infrastructure.",
      primaryLanguage: "TypeScript",
      primaryLanguageColor: "#3178c6",
      technologies: ["React", "TypeScript", "Node.js", "Express", "Tailwind CSS", "Docker", "WebSockets"],
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80"
      ],
      status: "Live",
      isPinned: true,
      order: 1,
      stars: 342,
      forks: 58,
      liveUrl: "https://nexus-orchestrator.example.com",
      githubUrl: "https://github.com/hammadhassan/nexus-cloud-orchestrator",
      highlights: [
        "Real-time WebSocket telemetry processing 10k+ events/sec",
        "Interactive topology visualizer with dynamic node health status",
        "Role-based access control with audited command execution",
        "Automated CI/CD webhook dispatch engine"
      ],
      architecture: [
        "Vite + React frontend with state-driven dynamic canvas graphs",
        "Node.js cluster backend with Redis Pub/Sub",
        "Docker container telemetry polling agent",
        "PostgreSQL for persistence and immutable audit logs"
      ],
      updatedAt: "2 days ago",
      createdAt: "2024-03-15"
    },
    {
      id: "proj-2",
      name: "finledger-django-api",
      displayName: "FinLedger Core Financial Engine",
      description: "Double-entry bookkeeping and payment reconciliations API built with Python, Django REST Framework, and PostgreSQL.",
      longDescription: "FinLedger provides double-entry transactional accounting, multi-currency ledger support, and automated Stripe/bank statement reconciliation. Built for high reliability and zero-drift balance consistency with database row-level locking.",
      primaryLanguage: "Python",
      primaryLanguageColor: "#3572A5",
      technologies: ["Python", "Django", "Django REST Framework", "PostgreSQL", "Celery", "Redis", "Docker"],
      imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80"
      ],
      status: "Live",
      isPinned: true,
      order: 2,
      stars: 218,
      forks: 34,
      liveUrl: "https://finledger.example.com",
      githubUrl: "https://github.com/hammadhassan/finledger-django-api",
      highlights: [
        "Strict double-entry ledger architecture with zero floating-point rounding errors",
        "Celery async queue for processing 500k+ reconciliation transactions overnight",
        "JWT + OAuth2 scoped authentication for third-party fintech integrations",
        "Automated PDF & CSV audit ledger report generation"
      ],
      architecture: [
        "Django REST Framework with custom serializers and atomic database transactions",
        "PostgreSQL partitioning by transaction date & currency",
        "Redis cache layer for balance snapshots",
        "Celery + Redis worker pool for background syncs"
      ],
      updatedAt: "1 week ago",
      createdAt: "2024-01-10"
    },
    {
      id: "proj-3",
      name: "supabase-pulse-collab",
      displayName: "Pulse Realtime Collaborative Workspace",
      description: "Next-gen workspace app with multiplayer document editing, nested comment trees, and live team presence powered by Supabase & React.",
      longDescription: "Pulse is a collaboration suite designed for remote engineering teams. Featuring real-time presence indicators, instant synchronization of rich markdown documents, threaded discussions, and granular workspace permission settings.",
      primaryLanguage: "TypeScript",
      primaryLanguageColor: "#3178c6",
      technologies: ["React", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS", "Zustand"],
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80"
      ],
      status: "Live",
      isPinned: true,
      order: 3,
      stars: 189,
      forks: 27,
      liveUrl: "https://pulse-collab.example.com",
      githubUrl: "https://github.com/hammadhassan/supabase-pulse-collab",
      highlights: [
        "Sub-50ms conflict-free live collaborative state with Supabase Realtime",
        "Row Level Security (RLS) policies enforcing multi-tenant team boundaries",
        "Interactive rich markdown editor with code block syntax highlighting",
        "Instant search across workspace documents with PostgreSQL pg_trgm"
      ],
      architecture: [
        "React + Tailwind client with optimistic mutations",
        "Supabase Auth & Realtime WebSocket broadcast channels",
        "PostgreSQL with custom RLS functions & trigram indexes",
        "Storage buckets for encrypted asset uploads"
      ],
      updatedAt: "3 days ago",
      createdAt: "2024-05-20"
    },
    {
      id: "proj-4",
      name: "ai-code-companion",
      displayName: "AI Developer Copilot & Review Assistant",
      description: "Intelligent code reviewer and pull-request summarizer that spots security vulnerabilities, performance regressions, and architectural anti-patterns.",
      longDescription: "An AI-powered developer tool that integrates with Git repositories to automatically review pull requests, detect edge-case logic bugs, analyze time complexity, and recommend idiomatic refactoring solutions.",
      primaryLanguage: "Python",
      primaryLanguageColor: "#3572A5",
      technologies: ["Python", "FastAPI", "React", "Gemini API", "AST Parsers", "Docker"],
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80"
      ],
      status: "Live",
      isPinned: true,
      order: 4,
      stars: 276,
      forks: 41,
      liveUrl: "https://ai-companion.example.com",
      githubUrl: "https://github.com/hammadhassan/ai-code-companion",
      highlights: [
        "Abstract Syntax Tree (AST) code extraction with intelligent context chunking",
        "Automated security and CWE vulnerability scanning",
        "GitHub Action integration for automated PR checks",
        "Diff-aware contextual chat for discussing codebase architecture"
      ],
      architecture: [
        "FastAPI asynchronous backend with streaming response support",
        "Gemini 2.5 Flash API with custom prompt engineering & validation",
        "Tree-sitter AST parser for multi-language tokenization",
        "React frontend with syntax-highlighted diff viewers"
      ],
      updatedAt: "5 days ago",
      createdAt: "2024-06-12"
    },
    {
      id: "proj-5",
      name: "devmetrics-cli-suite",
      displayName: "DevMetrics CLI & Team Insights",
      description: "Lightweight developer analytics CLI and visual dashboard tracking commit cadence, code churn, and PR velocity.",
      longDescription: "A developer analytics tool designed to provide engineers with meaningful telemetry on their coding flow without invasive surveillance. Analyzes git log streams, test pass rates, and cycle times.",
      primaryLanguage: "Go",
      primaryLanguageColor: "#00ADD8",
      technologies: ["Go", "Node.js", "React", "SQLite", "Tailwind CSS"],
      imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80"
      ],
      status: "Live",
      isPinned: false,
      order: 5,
      stars: 114,
      forks: 18,
      liveUrl: "https://devmetrics.example.com",
      githubUrl: "https://github.com/hammadhassan/devmetrics-cli-suite",
      highlights: [
        "Blazing fast local Git log parsing in under 120ms for 100k commits",
        "Zero-telemetry privacy-first offline analytics model",
        "Interactive Terminal UI (TUI) and lightweight web dashboard",
        "Exportable performance reports in SVG and Markdown format"
      ],
      architecture: [
        "Compiled Go binary for cross-platform local execution",
        "Embedded SQLite database for persistent metrics",
        "Local web server mounting React reporting dashboard"
      ],
      updatedAt: "2 weeks ago",
      createdAt: "2024-02-28"
    },
    {
      id: "proj-6",
      name: "django-ecommerce-microservices",
      displayName: "Aura Commerce Platform",
      description: "Headless e-commerce infrastructure with Django API backend, Stripe checkout, Redis inventory locks, and React storefront.",
      longDescription: "Full-featured modern e-commerce platform architected with headless design. Includes inventory concurrency protection, dynamic cart calculation, order management lifecycle, and full payment fulfillment pipelines.",
      primaryLanguage: "JavaScript",
      primaryLanguageColor: "#f1e05a",
      technologies: ["React", "JavaScript", "Python", "Django", "Redis", "Stripe API", "PostgreSQL"],
      imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80"
      ],
      status: "Live",
      isPinned: false,
      order: 6,
      stars: 165,
      forks: 23,
      liveUrl: "https://aura-commerce.example.com",
      githubUrl: "https://github.com/hammadhassan/django-ecommerce-microservices",
      highlights: [
        "High-concurrency inventory reservation using Redis distributed locks",
        "Stripe Webhook idempotency protection against duplicate charges",
        "Server-side order invoice PDF generation",
        "Elasticsearch product filtering with faceted search"
      ],
      architecture: [
        "Django REST Framework backend with Celery workers",
        "React + Vite responsive client with instant cart state sync",
        "PostgreSQL + Redis caching architecture"
      ],
      updatedAt: "3 weeks ago",
      createdAt: "2023-11-04"
    }
  ],
  skills: [
    { id: "sk-1", name: "React", category: "Frontend", level: "Expert", years: "4+ years", badgeColor: "#61dafb", order: 1 },
    { id: "sk-2", name: "TypeScript", category: "Languages", level: "Expert", years: "3+ years", badgeColor: "#3178c6", order: 2 },
    { id: "sk-3", name: "JavaScript (ES6+)", category: "Languages", level: "Expert", years: "4+ years", badgeColor: "#f7df1e", order: 3 },
    { id: "sk-4", name: "Python", category: "Languages", level: "Expert", years: "4+ years", badgeColor: "#3776ab", order: 4 },
    { id: "sk-5", name: "Django & DRF", category: "Backend", level: "Expert", years: "3+ years", badgeColor: "#092e20", order: 5 },
    { id: "sk-6", name: "Node.js & Express", category: "Backend", level: "Expert", years: "4+ years", badgeColor: "#339933", order: 6 },
    { id: "sk-7", name: "Supabase", category: "Database & Cloud", level: "Expert", years: "2+ years", badgeColor: "#3ecf8e", order: 7 },
    { id: "sk-8", name: "PostgreSQL", category: "Database & Cloud", level: "Expert", years: "4+ years", badgeColor: "#4169e1", order: 8 },
    { id: "sk-9", name: "Tailwind CSS", category: "Frontend", level: "Expert", years: "4+ years", badgeColor: "#06b6d4", order: 9 },
    { id: "sk-10", name: "RESTful APIs & GraphQL", category: "Backend", level: "Expert", years: "4+ years", badgeColor: "#e535ab", order: 10 },
    { id: "sk-11", name: "Docker & Containers", category: "DevOps & Tools", level: "Advanced", years: "3+ years", badgeColor: "#2496ed", order: 11 },
    { id: "sk-12", name: "Redis & Caching", category: "Database & Cloud", level: "Advanced", years: "3+ years", badgeColor: "#dc382d", order: 12 },
    { id: "sk-13", name: "Git & GitHub Actions", category: "DevOps & Tools", level: "Expert", years: "4+ years", badgeColor: "#f05032", order: 13 },
    { id: "sk-14", name: "FastAPI", category: "Backend", level: "Advanced", years: "2+ years", badgeColor: "#009688", order: 14 },
    { id: "sk-15", name: "Next.js", category: "Frontend", level: "Advanced", years: "2+ years", badgeColor: "#ffffff", order: 15 },
    { id: "sk-16", name: "Linux & Shell Scripting", category: "DevOps & Tools", level: "Expert", years: "4+ years", badgeColor: "#fcc624", order: 16 }
  ],
  experiences: [
    {
      id: "exp-1",
      role: "Senior Full Stack Engineer",
      company: "Distributed Tech Solutions",
      period: "2023 — Present",
      location: "Remote",
      type: "Full-Time",
      description: "Leading the development of core web applications, cloud orchestrations, and API microservices. Mentoring developers and architecting high-throughput data pipelines.",
      achievements: [
        "Reduced backend latency by 42% through optimized PostgreSQL queries and Redis caching layers.",
        "Architected scalable microservices handling 2M+ monthly API requests.",
        "Migrated legacy monolithic systems to modular TypeScript & Django REST services."
      ],
      technologies: ["React", "TypeScript", "Python", "Django", "PostgreSQL", "Docker", "AWS"]
    },
    {
      id: "exp-2",
      role: "Full Stack Developer",
      company: "Vanguard Software Labs",
      period: "2021 — 2023",
      location: "Lahore, Pakistan",
      type: "Full-Time",
      description: "Built responsive frontend applications in React and backend services in Django and Node.js. Integrated payment gateways, webhooks, and third-party SaaS APIs.",
      achievements: [
        "Built and launched 8+ production web applications on time and with 99.9% uptime.",
        "Implemented real-time collaboration features using WebSockets and Supabase.",
        "Designed comprehensive CI/CD pipelines using GitHub Actions."
      ],
      technologies: ["React", "JavaScript", "Python", "Django", "Node.js", "Supabase", "Tailwind CSS"]
    },
    {
      id: "exp-3",
      role: "Open Source Contributor & Freelance Engineer",
      company: "Independent",
      period: "2020 — 2021",
      location: "Global",
      type: "Contract",
      description: "Developed custom web applications, automation scripts, and developer tools for global clients and open-source communities.",
      achievements: [
        "Contributed to popular Python and JavaScript developer tooling repositories.",
        "Maintained a 100% 5-star client satisfaction rating across freelance engagements."
      ],
      technologies: ["React", "Python", "JavaScript", "SQL", "Git", "REST APIs"]
    }
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Arctic Code Vault Contributor",
      description: "Contributed code to the 2020 GitHub Arctic Code Vault preservation program.",
      icon: "❄️",
      category: "GitHub",
      unlockedDate: "2020",
      badgeColor: "#58a6ff",
      order: 1,
    },
    {
      id: "ach-2",
      title: "Pull Shark",
      description: "Merged 100+ pull requests across production repositories and open-source projects.",
      icon: "🦈",
      category: "Milestone",
      unlockedDate: "2023",
      badgeColor: "#39d353",
      order: 2,
    },
    {
      id: "ach-3",
      title: "Quickdraw",
      description: "Closed issues and PR reviews in record time within 5 minutes of opening.",
      icon: "⚡",
      category: "Velocity",
      unlockedDate: "2024",
      badgeColor: "#e3b341",
      order: 3,
    },
    {
      id: "ach-4",
      title: "Starstruck",
      description: "Created repositories and tools with 800+ cumulative GitHub stars.",
      icon: "🌟",
      category: "Community",
      unlockedDate: "2024",
      badgeColor: "#f78166",
      order: 4,
    },
    {
      id: "ach-5",
      title: "Pair Extraordinaire",
      description: "Co-authored commits across distributed remote microservices and packages.",
      icon: "👯",
      category: "Collaboration",
      unlockedDate: "2024",
      badgeColor: "#bc8cff",
      order: 5,
    },
    {
      id: "ach-6",
      title: "Galaxy Brain",
      description: "Answered technical RFC discussions and architectural questions.",
      icon: "🧠",
      category: "Architecture",
      unlockedDate: "2024",
      badgeColor: "#79c0ff",
      order: 6,
    }
  ],
  messages: [
    {
      id: "msg-1",
      name: "Sarah Jenkins",
      email: "sarah.j@techventures.io",
      subject: "Lead Full Stack Role - Remote Opportunity",
      message: "Hi Hammad, I came across your GitHub repositories (especially Nexus Cloud Orchestrator) and was really impressed with your architecture and React/Django expertise. We are looking for a Senior Full Stack Engineer to lead our core product team. Would you be open to a quick 15-minute chat this week?",
      createdAt: "2026-08-20T14:32:00Z",
      read: false,
      starred: true
    },
    {
      id: "msg-2",
      name: "Marcus Vance",
      email: "m.vance@innovatestudio.co",
      subject: "Fintech SaaS MVP Collaboration",
      message: "Hey Hammad! Love your FinLedger project. We are building a modern invoicing and double-entry ledger platform for SMBs and need someone with your deep Django + PostgreSQL background. Let me know your current freelance availability!",
      createdAt: "2026-08-18T09:15:00Z",
      read: true,
      starred: false
    }
  ]
};
