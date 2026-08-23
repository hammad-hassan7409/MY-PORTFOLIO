export interface Profile {
  name: string;
  username: string;
  title: string;
  bio: string;
  detailedBio: string;
  location: string;
  status: string;
  statusEmoji: string;
  avatarUrl: string;
  email: string;
  github: string;
  linkedin: string;
  website: string;
  twitter?: string;
  resumeUrl?: string;
  company: string;
  followersCount: number;
  followingCount: number;
  starsCount: number;
  totalContributionsYear: number;
  yearsOfExperience: number;
  currentFocus: string;
}

export interface Project {
  id: string;
  name: string; // repo name slug like "nexus-ai-orchestrator"
  displayName: string;
  description: string;
  longDescription: string;
  primaryLanguage: string;
  primaryLanguageColor: string;
  technologies: string[];
  imageUrl: string;
  gallery: string[];
  status: 'Live' | 'In Progress' | 'Beta' | 'Archived';
  isPinned: boolean;
  isFeatured?: boolean;
  order: number;
  stars: number;
  forks: number;
  liveUrl: string;
  githubUrl: string;
  highlights: string[];
  architecture?: string[];
  updatedAt: string;
  createdAt: string;
}

export type SkillCategory = 'Frontend' | 'Backend' | 'Database & Cloud' | 'DevOps & Tools' | 'Languages';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: 'Expert' | 'Advanced' | 'Proficient';
  years: string;
  badgeColor: string;
  icon?: string;
  order: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji (e.g. ❄️, 🦈, ⚡, 🌟) or custom icon identifier
  category?: string; // e.g. "GitHub", "Milestone", "Open Source", "Architecture"
  unlockedDate?: string; // e.g. "2024", "Gold Tier"
  badgeColor?: string;
  order?: number;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  type: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  starred?: boolean;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export type ActivityType =
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "skill_updated"
  | "achievement_unlocked"
  | "experience_updated"
  | "profile_updated"
  | "contact_received"
  | "code_commit"
  | "pull_request"
  | "code_review"
  | "deploy";

export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  repo?: string;
  prNumber?: number;
  commitHash?: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  metadata?: Record<string, any>;
}

export interface ContributionData {
  total: number;
  currentStreak: number;
  longestStreak: number;
  commitsCount: number;
  pullRequestsCount: number;
  reviewsCount: number;
  year: number;
  days: ContributionDay[];
  activities: ActivityLog[];
  lastActiveDate?: string;
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
  achievements: Achievement[];
  experiences: Experience[];
  messages: Message[];
  activities?: ActivityLog[];
}
