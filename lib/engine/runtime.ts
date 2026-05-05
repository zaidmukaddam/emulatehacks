import type { Scenario, Step, StepMatch, VFiles } from "../types";
import { ANSI, c } from "./ansi";
import { getFile, isDirectory, listDir, normalizePath, walk } from "./fs";

type Write = (data: string) => void;

export type RuntimeEvents = {
  onStepComplete?: (stepIndex: number, step: Step) => void;
  onScenarioComplete?: () => void;
};

const NL = "\r\n";

/** Commands the museum shell implements — used for tab completion. */
const MUSEUM_COMMANDS: string[] = [
  "cat",
  "cd",
  "clear",
  "echo",
  "env",
  "find",
  "goal",
  "grep",
  "head",
  "help",
  "history",
  "hint",
  "hostname",
  "id",
  "less",
  "more",
  "objective",
  "printenv",
  "ps",
  "pwd",
  "tail",
  "uname",
  "wc",
  "whoami",
].sort();

function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return "";
  let a = strs[0];
  for (let i = 1; i < strs.length; i++) {
    const b = strs[i];
    let j = 0;
    for (; j < a.length && j < b.length && a[j] === b[j]; j++);
    a = a.slice(0, j);
    if (a === "") return "";
  }
  return a;
}

function sortedUnique(strs: string[]): string[] {
  return [...new Set(strs)].sort((x, y) => x.localeCompare(y));
}

/** Glob with only `*` and `?` metacharacters (final path segment). */
function globToRegex(glob: string): RegExp {
  let p = "^";
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === "*") p += ".*";
    else if (ch === "?") p += ".";
    else p += escapeRegex(ch);
  }
  p += "$";
  return new RegExp(p);
}

export class ScenarioShell {
  private scenario: Scenario;
  private files: VFiles;
  private cwd: string;
  private write: Write = () => {};
  private buffer = "";
  private cursor = 0;
  private history: string[];
  private historyPos = -1;
  private stepIndex = 0;
  private completed = false;
  private events: RuntimeEvents;
  private hintsUsed = 0;

  constructor(scenario: Scenario, events: RuntimeEvents = {}) {
    this.scenario = scenario;
    this.files = scenario.files;
    this.cwd = scenario.cwd;
    this.history = [...(scenario.history ?? [])];
    this.events = events;
  }

  /**
   * Bind the shell to a (possibly new) terminal instance. Reprints the boot
   * banner, the current goal, and the prompt, plus any in-progress input,
   * so re-attaching after a remount restores a coherent visual state without
   * losing scenario progress.
   */
  attach(write: Write): void {
    this.write = write;
    this.printBoot();
    this.printPrompt();
    if (this.buffer) {
      this.out(this.buffer);
      // Move cursor back if the user was editing in the middle of the line.
      const trailing = this.buffer.length - this.cursor;
      if (trailing > 0) this.out(ANSI.cursorLeft.repeat(trailing));
    }
  }

  get progress(): { stepIndex: number; total: number; completed: boolean; hintsUsed: number } {
    return {
      stepIndex: this.stepIndex,
      total: this.scenario.steps.length,
      completed: this.completed,
      hintsUsed: this.hintsUsed,
    };
  }

  // --- Output helpers ---

  private out(s: string): void {
    this.write(s);
  }

  private println(s = ""): void {
    this.out(s + NL);
  }

  private prompt(): string {
    const { user, host } = this.scenario;
    const path = this.cwd === `/home/${user}` ? "~" : this.cwd;
    return `${ANSI.brightGreen}${user}@${host}${ANSI.reset}:${ANSI.brightCyan}${path}${ANSI.reset}$ `;
  }

  private printPrompt(): void {
    this.out(this.prompt());
  }

  private printBoot(): void {
    const s = this.scenario;
    this.println(c.dim(`emulatehacks | ${s.exhibit} | museum shell`));
    this.println(
      c.dim(
        `real bash-style invocations (cat, grep, head, find, …); evidence files are synthetic; no network or privileged ops`,
      ),
    );
    this.println();
    this.println(`${c.amber("briefing")}, ${s.title}`);
    this.println(`  ${s.briefing}`);
    this.println();
    this.println(`${c.amber("objective")}  ${s.objective}`);
    this.println();
    this.printGoal();
    this.println();
  }

  private printGoal(): void {
    const step = this.scenario.steps[this.stepIndex];
    if (!step) return;
    this.println(
      `${c.cyan(`step ${this.stepIndex + 1}/${this.scenario.steps.length}`)} ${step.goal}`,
    );
    this.println(
      c.dim("  tab completes commands and files (try *.html, ../ ) · `hint` · `help`"),
    );
  }

  // --- Input ---

  handleInput(data: string): void {
    for (let i = 0; i < data.length; i++) {
      const ch = data[i];
      // Escape sequences
      if (ch === "\x1b" && data[i + 1] === "[") {
        const code = data[i + 2];
        if (code === "A") {
          this.recallHistory(-1);
          i += 2;
          continue;
        }
        if (code === "B") {
          this.recallHistory(1);
          i += 2;
          continue;
        }
        if (code === "C") {
          if (this.cursor < this.buffer.length) {
            this.cursor++;
            this.out(ANSI.cursorRight);
          }
          i += 2;
          continue;
        }
        if (code === "D") {
          if (this.cursor > 0) {
            this.cursor--;
            this.out(ANSI.cursorLeft);
          }
          i += 2;
          continue;
        }
        // Skip any unknown escape
        i += 2;
        continue;
      }
      if (ch === "\r" || ch === "\n") {
        this.out(NL);
        this.commit();
        continue;
      }
      if (ch === "\x7f" || ch === "\b") {
        this.backspace();
        continue;
      }
      if (ch === "\x03") {
        // Ctrl+C
        this.out(c.dim("^C") + NL);
        this.buffer = "";
        this.cursor = 0;
        this.printPrompt();
        continue;
      }
      if (ch === "\x0c") {
        // Ctrl+L
        this.out(ANSI.clearScreen);
        this.printPrompt();
        this.out(this.buffer);
        continue;
      }
      if (ch === "\t") {
        this.tabComplete();
        continue;
      }
      if (ch >= " " && ch <= "~") {
        this.insert(ch);
      }
    }
  }

  private insert(ch: string): void {
    if (this.cursor === this.buffer.length) {
      this.buffer += ch;
      this.cursor++;
      this.out(ch);
    } else {
      const after = this.buffer.slice(this.cursor);
      this.buffer = this.buffer.slice(0, this.cursor) + ch + after;
      this.cursor++;
      this.out(ch + after + ANSI.cursorLeft.repeat(after.length));
    }
  }

  private backspace(): void {
    if (this.cursor === 0) return;
    const before = this.buffer.slice(0, this.cursor - 1);
    const after = this.buffer.slice(this.cursor);
    this.buffer = before + after;
    this.cursor--;
    this.out("\b" + after + " " + "\b".repeat(after.length + 1));
  }

  private recallHistory(delta: number): void {
    if (this.history.length === 0) return;
    if (this.historyPos === -1) {
      this.historyPos = this.history.length;
    }
    const next = Math.max(0, Math.min(this.history.length, this.historyPos + delta));
    this.historyPos = next;
    const newBuf = next === this.history.length ? "" : this.history[next];
    // Erase current line
    this.out("\r" + ANSI.clearLine + this.prompt() + newBuf);
    this.buffer = newBuf;
    this.cursor = newBuf.length;
  }

  private redrawInputLine(): void {
    this.out("\r" + ANSI.clearLine + this.prompt() + this.buffer);
    const trailing = this.buffer.length - this.cursor;
    if (trailing > 0) this.out(ANSI.cursorLeft.repeat(trailing));
  }

  /** Directory + basename for the path fragment being tab-completed. */
  private parsePartialPath(partial: string): {
    dirAbs: string;
    pathPrefix: string;
    base: string;
  } {
    const lastSlash = partial.lastIndexOf("/");
    if (lastSlash === -1) {
      return { dirAbs: this.cwd, pathPrefix: "", base: partial };
    }
    const pathPrefix = partial.slice(0, lastSlash + 1);
    const dirOnly = partial.slice(0, lastSlash);
    const base = partial.slice(lastSlash + 1);
    let dirAbs: string;
    if (partial.startsWith("/") && dirOnly === "") {
      dirAbs = "/";
    } else {
      dirAbs = normalizePath(dirOnly, this.cwd);
    }
    return { dirAbs, pathPrefix, base };
  }

  /** Replacement word candidates (e.g. `quarantine/0001.eml`) for this partial. */
  private pathCompletionCandidates(partial: string): string[] {
    const { dirAbs, pathPrefix, base } = this.parsePartialPath(partial);

    if (base.includes("*") || base.includes("?")) {
      return this.globCompletionInDir(dirAbs, pathPrefix, base);
    }

    const entries = listDir(this.files, dirAbs, { all: true });
    if (!entries) return [];

    const extras: string[] = [];
    if (pathPrefix === "") {
      if (!base || ".".startsWith(base)) extras.push(".");
      if ((!base || "..".startsWith(base)) && dirAbs !== "/") extras.push("..");
    }

    const named = entries.filter((e) => e.startsWith(base));
    const raw = [...extras, ...named];
    return sortedUnique(raw.map((e) => pathPrefix + e));
  }

  private globCompletionInDir(
    dirAbs: string,
    pathPrefix: string,
    globBase: string,
  ): string[] {
    const entries = listDir(this.files, dirAbs, { all: true });
    if (!entries) return [];
    const re = globToRegex(globBase);
    return sortedUnique(
      entries.filter((e) => re.test(e)).map((e) => pathPrefix + e),
    );
  }

  private tabComplete(): void {
    const line = this.buffer;
    const c = this.cursor;
    let wordStart = c;
    while (wordStart > 0 && !/\s/.test(line[wordStart - 1])) wordStart--;
    let wordEnd = c;
    while (wordEnd < line.length && !/\s/.test(line[wordEnd])) wordEnd++;
    const partial = line.slice(wordStart, wordEnd);
    const before = line.slice(0, wordStart);
    const prevTokens = before.trim() ? before.trim().split(/\s+/).filter(Boolean) : [];

    let candidates: string[];
    if (prevTokens.length === 0) {
      if (partial === "") {
        candidates = [...MUSEUM_COMMANDS];
      } else {
        const cmdCands = MUSEUM_COMMANDS.filter((cmd) => cmd.startsWith(partial));
        const pathCands = this.pathCompletionCandidates(partial);
        candidates = sortedUnique([...cmdCands, ...pathCands]);
      }
    } else {
      candidates = this.pathCompletionCandidates(partial);
    }

    if (candidates.length === 0) {
      this.out("\x07");
      return;
    }

    if (candidates.length === 1) {
      let repl = candidates[0];
      const isPath =
        prevTokens.length > 0 ||
        !MUSEUM_COMMANDS.includes(repl) ||
        partial.includes("/") ||
        partial.startsWith(".");
      if (isPath) {
        const abs = normalizePath(repl, this.cwd);
        if (isDirectory(this.files, abs)) repl += "/";
      }
      this.buffer = line.slice(0, wordStart) + repl + line.slice(wordEnd);
      this.cursor = wordStart + repl.length;
      this.redrawInputLine();
      return;
    }

    const lcp = longestCommonPrefix(candidates);
    if (lcp.length > partial.length) {
      this.buffer = line.slice(0, wordStart) + lcp + line.slice(wordEnd);
      this.cursor = wordStart + lcp.length;
      this.redrawInputLine();
      return;
    }

    const display =
      prevTokens.length === 0 && candidates.every((x) => MUSEUM_COMMANDS.includes(x))
        ? [...candidates].sort()
        : [...candidates]
            .sort()
            .map((p) => {
              if (MUSEUM_COMMANDS.includes(p) && prevTokens.length === 0) return p;
              const abs = normalizePath(p, this.cwd);
              return isDirectory(this.files, abs) ? `${p}/` : p;
            });
    this.println();
    this.println(display.join("  "));
    this.redrawInputLine();
  }

  // --- Commit + dispatch ---

  private commit(): void {
    const raw = this.buffer.trim();
    this.buffer = "";
    this.cursor = 0;
    this.historyPos = -1;
    if (raw.length === 0) {
      this.printPrompt();
      return;
    }
    this.history.push(raw);
    this.dispatch(raw);
    this.checkStep(raw);
    if (!this.completed) this.printPrompt();
  }

  private dispatch(raw: string): void {
    const parts = tokenize(raw);
    const cmd = parts[0];
    const args = parts.slice(1);
    switch (cmd) {
      case "help":
        return this.cmdHelp();
      case "clear":
        this.out(ANSI.clearScreen);
        return;
      case "hint":
        return this.cmdHint();
      case "goal":
      case "objective":
        return this.printGoal();
      case "ls":
        return this.cmdLs(args);
      case "cat":
        return this.cmdCat(args);
      case "head":
        return this.cmdHead(args);
      case "tail":
        return this.cmdTail(args);
      case "less":
      case "more":
        return this.cmdCat(args);
      case "wc":
        return this.cmdWc(args);
      case "cd":
        return this.cmdCd(args);
      case "pwd":
        return this.println(this.cwd);
      case "whoami":
        return this.println(this.scenario.user);
      case "id":
        return this.println(`uid=1000(${this.scenario.user}) gid=1000(${this.scenario.user})`);
      case "uname":
        return this.println("Linux " + this.scenario.host + " 5.15.0 #1 SMP x86_64 GNU/Linux");
      case "hostname":
        return this.println(this.scenario.host);
      case "history":
        return this.cmdHistory();
      case "ps":
        return this.cmdPs();
      case "env":
      case "printenv":
        return this.cmdEnv();
      case "echo":
        return this.println(args.join(" "));
      case "grep":
        return this.cmdGrep(args);
      case "find":
        return this.cmdFind(args);
      case "exit":
      case "logout":
        return this.println(c.dim("(exit is disabled in the museum, close the page when done)"));
      case "ssh":
      case "scp":
      case "curl":
      case "wget":
      case "nc":
      case "ncat":
      case "ping":
      case "nmap":
        return this.println(c.dim("network access is disabled in this reconstruction"));
      case "sudo":
      case "su":
      case "rm":
      case "mv":
      case "chmod":
      case "chown":
      case "kill":
        return this.println(c.dim(`${cmd}: not permitted in this simulation`));
      default:
        return this.println(c.dim(`${cmd}: command not available in this simulation`));
    }
  }

  // --- Commands ---

  private cmdHelp(): void {
    const lines = [
      `${c.amber("available")}  ls, cat, head, tail, wc, cd, pwd, whoami, grep, find, history, ps, env, echo, hint, goal, clear`,
      `${c.amber("grep")}       literal IOC strings by default; pass ${c.bold("-E")} for extended regex; ${c.bold("-n")} line numbers, ${c.bold("-i")} ignore case, ${c.bold("-v")} invert`,
      `${c.amber("museum")}    tab completes commands + paths (incl. *.globs, . ..) · ${c.bold("hint")} / ${c.bold("goal")}`,
      c.dim("destructive and network commands are disabled by design"),
    ];
    for (const l of lines) this.println(l);
  }

  private cmdHint(): void {
    const step = this.scenario.steps[this.stepIndex];
    if (!step) return;
    this.hintsUsed++;
    this.println(`${c.amber("hint")}  ${step.hint}`);
  }

  private cmdLs(args: string[]): void {
    const flags = args.filter((a) => a.startsWith("-"));
    const targets = args.filter((a) => !a.startsWith("-"));
    const showAll = flags.some((f) => f.includes("a"));
    const long = flags.some((f) => f.includes("l"));
    const paths = targets.length > 0 ? targets : [this.cwd];
    paths.forEach((t, i) => {
      const abs = normalizePath(t, this.cwd);
      const file = getFile(this.files, abs);
      if (file) {
        if (long) this.println(this.longLine(abs.split("/").pop() || abs, file.perms, file.owner));
        else this.println(abs.split("/").pop() || abs);
        return;
      }
      const list = listDir(this.files, abs, { all: showAll });
      if (!list) {
        this.println(`ls: cannot access '${t}': No such file or directory`);
        return;
      }
      if (paths.length > 1) this.println(`${t}:`);
      if (long) {
        for (const name of list) {
          const child = getFile(this.files, normalizePath(`${abs}/${name}`, this.cwd));
          this.println(this.longLine(name, child?.perms, child?.owner, !child));
        }
      } else {
        if (list.length > 0) this.println(this.colorize(list).join("  "));
      }
      if (i < paths.length - 1) this.println();
    });
  }

  private longLine(name: string, perms?: string, owner?: string, isDir = false): string {
    const p = perms ?? (isDir ? "drwxr-xr-x" : "-rw-r--r--");
    const o = owner ?? this.scenario.user;
    const colored = isDir ? c.cyan(name) : name;
    return `${p}  ${o}  ${colored}`;
  }

  private colorize(names: string[]): string[] {
    return names.map((n) => {
      const abs = normalizePath(`${this.cwd}/${n}`, this.cwd);
      if (isDirectory(this.files, abs)) return c.cyan(n);
      if (n.startsWith(".")) return c.dim(n);
      return n;
    });
  }

  private cmdCat(args: string[]): void {
    if (args.length === 0) return;
    for (const a of args) {
      const abs = normalizePath(a, this.cwd);
      const file = getFile(this.files, abs);
      if (!file) {
        if (isDirectory(this.files, abs)) {
          this.println(`cat: ${a}: Is a directory`);
        } else {
          this.println(`cat: ${a}: No such file or directory`);
        }
        continue;
      }
      const content = file.content.endsWith("\n") ? file.content : file.content + "\n";
      this.out(content.replace(/\n/g, NL));
    }
  }

  private cmdHead(args: string[]): void {
    const { n, paths } = parseHeadTailLineCount(args, 10);
    if (paths.length === 0) {
      this.println("head: missing file operand");
      return;
    }
    const multi = paths.length > 1;
    for (const p of paths) {
      const abs = normalizePath(p, this.cwd);
      const file = getFile(this.files, abs);
      if (!file) {
        this.println(`head: ${p}: No such file or directory`);
        continue;
      }
      if (multi) this.println(`==> ${p} <==`);
      const lines = file.content.split("\n");
      const slice = lines.slice(0, Math.max(0, n));
      for (const line of slice) {
        this.println(line);
      }
    }
  }

  private cmdTail(args: string[]): void {
    const { n, paths } = parseHeadTailLineCount(args, 10);
    if (paths.length === 0) {
      this.println("tail: missing file operand");
      return;
    }
    const multi = paths.length > 1;
    for (const p of paths) {
      const abs = normalizePath(p, this.cwd);
      const file = getFile(this.files, abs);
      if (!file) {
        this.println(`tail: ${p}: No such file or directory`);
        continue;
      }
      if (multi) this.println(`==> ${p} <==`);
      const lines = file.content.split("\n");
      const slice = n === 0 ? [] : lines.slice(Math.max(0, lines.length - n));
      for (const line of slice) {
        this.println(line);
      }
    }
  }

  private cmdWc(args: string[]): void {
    let linesOnly = false;
    const paths: string[] = [];
    for (const a of args) {
      if (a === "-l") linesOnly = true;
      else paths.push(a);
    }
    if (!linesOnly || paths.length === 0) {
      this.println("wc: use wc -l FILE [FILE...] in this simulation");
      return;
    }
    let total = 0;
    for (const p of paths) {
      const abs = normalizePath(p, this.cwd);
      const file = getFile(this.files, abs);
      if (!file) {
        this.println(`wc: ${p}: No such file or directory`);
        continue;
      }
      const c = countLines(file.content);
      this.println(` ${c} ${p}`);
      total += c;
    }
    if (paths.length > 1) {
      this.println(` ${total} total`);
    }
  }

  private cmdCd(args: string[]): void {
    const target = args[0] ?? `/home/${this.scenario.user}`;
    const abs = normalizePath(target, this.cwd);
    if (getFile(this.files, abs)) {
      this.println(`cd: not a directory: ${target}`);
      return;
    }
    if (!isDirectory(this.files, abs) && abs !== "/") {
      this.println(`cd: no such file or directory: ${target}`);
      return;
    }
    this.cwd = abs;
  }

  private cmdHistory(): void {
    this.history.forEach((h, i) => {
      this.println(`${String(i + 1).padStart(4, " ")}  ${h}`);
    });
  }

  private cmdPs(): void {
    for (const line of this.scenario.ps ?? []) this.println(line);
  }

  private cmdEnv(): void {
    const env = this.scenario.env ?? {};
    for (const [k, v] of Object.entries(env)) this.println(`${k}=${v}`);
  }

  private cmdGrep(args: string[]): void {
    let ignoreCase = false;
    let lineNumber = false;
    let invert = false;
    let useExtended = false;

    const positional: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === "--") {
        for (let j = i + 1; j < args.length; j++) positional.push(args[j]);
        break;
      }
      if (a.startsWith("-") && a.length > 1) {
        const body = a.slice(1);
        for (const ch of body) {
          if (ch === "i") ignoreCase = true;
          else if (ch === "n") lineNumber = true;
          else if (ch === "v") invert = true;
          else if (ch === "E") {
            useExtended = true;
          } else if (ch === "F") {
            useExtended = false;
          } else if (ch === "e") {
            /* GNU -e PATTERN — museum uses first positional as pattern */
          } else if (ch === "A" || ch === "B" || ch === "C") {
            if (args[i + 1] && /^\d+$/.test(args[i + 1])) i++;
          }
        }
        continue;
      }
      positional.push(a);
    }

    if (positional.length < 2) {
      this.println("usage: grep [OPTIONS] PATTERN FILE...");
      return;
    }

    const rawPattern = stripQuotes(positional[0]);
    let re: RegExp;
    try {
      if (useExtended) {
        re = new RegExp(rawPattern, ignoreCase ? "i" : "");
      } else {
        re = new RegExp(escapeRegex(rawPattern), ignoreCase ? "i" : "");
      }
    } catch {
      this.println("grep: Invalid regular expression");
      return;
    }

    const targets = expandGlobs(this.files, this.cwd, positional.slice(1));
    const showFilename = targets.length > 1;

    for (const fileRel of targets) {
      const abs = normalizePath(fileRel, this.cwd);
      const file = getFile(this.files, abs);
      if (!file) {
        this.println(`grep: ${fileRel}: No such file or directory`);
        continue;
      }
      const lines = file.content.split("\n");
      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        const matched = re.test(line);
        re.lastIndex = 0;
        const keep = invert ? !matched : matched;
        if (!keep) continue;

        let body: string;
        if (matched && !invert) {
          const hl = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
          body = line.replace(hl, (m) => `${ANSI.amber}${m}${ANSI.reset}`);
        } else {
          body = line;
        }

        const ln = idx + 1;
        if (showFilename && lineNumber) {
          this.println(`${c.cyan(fileRel)}:${ln}:${body}`);
        } else if (showFilename) {
          this.println(`${c.cyan(fileRel)}:${body}`);
        } else if (lineNumber) {
          this.println(`${ln}:${body}`);
        } else {
          this.println(body);
        }
      }
    }
  }

  private cmdFind(args: string[]): void {
    let root = this.cwd;
    let nameFilter: RegExp | null = null;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.startsWith("-")) {
        if (a === "-name" && args[i + 1]) {
          const pat = stripQuotes(args[i + 1]);
          nameFilter = new RegExp(
            "^" + pat.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$",
          );
          i++;
        } else if (a === "-type") {
          i++;
        }
      } else if (i === 0) {
        root = normalizePath(a, this.cwd);
      }
    }
    const matches = walk(this.files, root).filter((p) => {
      if (!nameFilter) return true;
      const name = p.split("/").pop() ?? "";
      return nameFilter.test(name);
    });
    for (const m of matches) this.println(m);
  }

  // --- Step matching ---

  private checkStep(raw: string): void {
    if (this.completed) return;
    const step = this.scenario.steps[this.stepIndex];
    if (!step) return;
    if (matches(raw, step.matches)) {
      this.println();
      this.println(`${c.green("ok")} ${c.dim(step.narration ?? "step complete")}`);
      this.stepIndex++;
      this.events.onStepComplete?.(this.stepIndex - 1, step);
      if (this.stepIndex >= this.scenario.steps.length) {
        this.completed = true;
        this.printCompletion();
        this.events.onScenarioComplete?.();
        return;
      }
      this.println();
      this.printGoal();
      this.println();
    }
  }

  private printCompletion(): void {
    this.println();
    this.println(c.amber("══ debrief ══"));
    this.println(this.scenario.debrief.summary);
    this.println();
    this.println(c.amber("lesson"));
    this.println(this.scenario.debrief.lesson);
    this.println();
    this.println(c.dim("close this terminal or scroll up to read the room above. on the page below, a debrief card has appeared."));
    this.println();
  }
}

function matches(raw: string, ms: StepMatch[]): boolean {
  const norm = raw.replace(/\s+/g, " ").trim();
  for (const m of ms) {
    if (m.kind === "exact" && norm === m.command) return true;
    if (m.kind === "any" && m.commands.includes(norm)) return true;
    if (m.kind === "regex" && new RegExp(m.pattern).test(norm)) return true;
  }
  return false;
}

function tokenize(input: string): string[] {
  // Minimal: split on whitespace, respect "..." and '...'
  const out: string[] = [];
  let cur = "";
  let q: '"' | "'" | null = null;
  for (const ch of input) {
    if (q) {
      if (ch === q) {
        q = null;
        continue;
      }
      cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      q = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur) {
        out.push(cur);
        cur = "";
      }
      continue;
    }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseHeadTailLineCount(
  args: string[],
  defaultN: number,
): { n: number; paths: string[] } {
  let n = defaultN;
  const paths: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-n" && args[i + 1] !== undefined && /^\d+$/.test(args[i + 1])) {
      n = parseInt(args[i + 1], 10);
      i++;
      continue;
    }
    if (/^-\d+$/.test(a)) {
      n = parseInt(a.slice(1), 10);
      continue;
    }
    paths.push(a);
  }
  return { n, paths };
}

/** Mirrors `wc -l` newline count for museum file contents. */
function countLines(content: string): number {
  const nl = content.match(/\n/g);
  return nl ? nl.length : 0;
}

/**
 * Minimal shell-style glob expansion. Only handles `*` and only inside the
 * final path segment (e.g. `runs/*.log`, `workflows/*.yml`). Anything without
 * a `*` is returned as-is. Anything that doesn't match returns the original
 * pattern so the caller surfaces a familiar `No such file or directory` error.
 */
function expandGlobs(files: VFiles, cwd: string, patterns: string[]): string[] {
  const out: string[] = [];
  for (const p of patterns) {
    if (!p.includes("*")) {
      out.push(p);
      continue;
    }
    const lastSlash = p.lastIndexOf("/");
    const dir = lastSlash >= 0 ? p.slice(0, lastSlash) : ".";
    const base = lastSlash >= 0 ? p.slice(lastSlash + 1) : p;
    if (base.includes("*") === false) {
      out.push(p);
      continue;
    }
    const re = new RegExp(
      "^" + base.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$",
    );
    const dirAbs = normalizePath(dir, cwd);
    const matches: string[] = [];
    for (const path of Object.keys(files)) {
      const inDir = path.startsWith(dirAbs === "/" ? "/" : dirAbs + "/")
        ? path.slice((dirAbs === "/" ? 1 : dirAbs.length + 1))
        : null;
      if (inDir == null) continue;
      if (inDir.includes("/")) continue;
      if (re.test(inDir)) {
        matches.push(dir === "." ? inDir : `${dir}/${inDir}`);
      }
    }
    if (matches.length === 0) {
      // No matches, keep literal so the user sees a "no such file" message.
      out.push(p);
    } else {
      out.push(...matches.sort());
    }
  }
  return out;
}
