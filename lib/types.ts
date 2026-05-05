export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Category =
  | "modern-cloud"
  | "classic-history"
  | "incident-response"
  | "ctf-puzzle";

export type Era = "1980s" | "1990s" | "2000s" | "2010s" | "2020s";

export type VFile = {
  content: string;
  owner?: string;
  perms?: string;
};

/** Absolute path to file. Directories are inferred from path prefixes. */
export type VFiles = Record<string, VFile>;

export type StepMatch =
  | { kind: "exact"; command: string }
  | { kind: "any"; commands: string[] }
  | { kind: "regex"; pattern: string };

export type Step = {
  id: string;
  goal: string;
  hint: string;
  matches: StepMatch[];
  /** Optional inline narration printed when this step completes. */
  narration?: string;
};

export type Scenario = {
  slug: string;
  exhibit: string;
  title: string;
  tagline: string;
  category: Category;
  difficulty: Difficulty;
  era: Era;
  year: string;
  estMinutes: number;
  /** True if the scenario is a fictional reconstruction; false for historically grounded. */
  fictional: boolean;
  cwd: string;
  user: string;
  host: string;
  briefing: string;
  role: string;
  objective: string;
  files: VFiles;
  env?: Record<string, string>;
  ps?: string[];
  history?: string[];
  steps: Step[];
  debrief: {
    summary: string;
    lesson: string;
    simulated: string[];
  };
};
