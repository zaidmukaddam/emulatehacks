/**
 * Walk every scenario through ScenarioShell using a derived canonical command
 * for each step, and confirm the engine advances cleanly to completion.
 *
 *   bun scripts/test-scenarios.ts
 *
 * For `exact` and `any` matchers, the command is taken straight from the
 * step. For `regex` matchers we extract the longest backtick-wrapped fragment
 * from the step's hint, by convention, hints always contain the canonical
 * shell invocation in backticks.
 */

import { scenarios } from "../lib/scenarios";
import { ScenarioShell } from "../lib/engine/runtime";
import type { Step, StepMatch } from "../lib/types";

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const AMBER = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";

type Failure = {
  slug: string;
  exhibit: string;
  step: string;
  command: string;
  reason: string;
};

// Verbs the engine actually dispatches, used to score backtick fragments
// when a hint contains both a command and a bare path inside backticks.
const COMMAND_VERBS = new Set([
  "cat",
  "grep",
  "ls",
  "find",
  "head",
  "tail",
  "less",
  "more",
  "cd",
  "pwd",
  "whoami",
  "ps",
  "env",
  "printenv",
  "history",
  "echo",
  "hint",
  "goal",
  "objective",
  "help",
  "clear",
  "id",
  "uname",
  "hostname",
  "wc",
  // Simulated CTF / lab tools (scenario.commands)
  "curl",
  "wget",
  "nmap",
  "nc",
  "ncat",
  "dig",
  "host",
  "openssl",
  "oleid",
  "strings",
  "file",
  "jq",
  "python",
  "python3",
  "perl",
  "ruby",
  "node",
  "john",
  "hashcat",
  "hydra",
  "sqlmap",
  "nikto",
  "gobuster",
  "ffuf",
  "kubectl",
  "docker",
  "aws",
  "az",
  "gcloud",
  "terraform",
  "ansible-playbook",
  "git",
  "gh",
  "npm",
  "pnpm",
  "yarn",
  "bun",
  "pip",
  "pip3",
  "msfconsole",
  "msfvenom",
  "smbclient",
  "rpcclient",
  "ldapsearch",
  "evil-winrm",
  "powershell",
  "pwsh",
  "cmd",
  "wmic",
  "wevtutil",
  "net",
  "reg",
  "schtasks",
  "sc",
  "tcpdump",
  "tshark",
  "wireshark",
  "ssh",
  "scp",
  "rsync",
  "ftp",
  "telnet",
  "ping",
  "traceroute",
  "tracepath",
  "whois",
  "masscan",
  "rustscan",
  "unshadow",
  "zip",
  "unzip",
  "tar",
  "xxd",
  "hexdump",
  "base64",
  "gpg",
  "ssh-keygen",
  "java",
  "jar",
  "mvn",
]);

function deriveCommand(step: Step): string {
  // Prefer concrete commands from exact/any matchers when present.
  for (const m of step.matches) {
    if (m.kind === "exact") return m.command;
    if (m.kind === "any" && m.commands.length > 0) return m.commands[0];
  }
  // Otherwise pull a backtick fragment from the hint. Prefer fragments that
  // begin with a known shell verb; if there's a tie, prefer the longest.
  const ticks = [...step.hint.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
  if (ticks.length === 0) {
    throw new Error(
      `No canonical command available for step "${step.id}" (no exact/any matcher and no \`...\` in hint)`,
    );
  }
  ticks.sort((a, b) => {
    const av = COMMAND_VERBS.has(a.split(/\s+/)[0]) ? 1 : 0;
    const bv = COMMAND_VERBS.has(b.split(/\s+/)[0]) ? 1 : 0;
    if (av !== bv) return bv - av;
    return b.length - a.length;
  });
  return ticks[0];
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

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

const failures: Failure[] = [];
let scenariosCompleted = 0;
let totalSteps = 0;
let stepsPassed = 0;

for (const scenario of scenarios) {
  console.log(
    `\n${BOLD}${scenario.exhibit}${RESET} ${scenario.title} ${DIM}(${scenario.slug})${RESET}`,
  );

  let stepIndex = 0;
  let completed = false;

  const shell = new ScenarioShell(scenario, {
    onStepComplete: (i) => {
      stepIndex = i + 1;
    },
    onScenarioComplete: () => {
      completed = true;
    },
  });
  // Sink every byte the shell wants to write. We're testing matchers, not
  // visual output.
  shell.attach(() => {});

  for (let i = 0; i < scenario.steps.length; i++) {
    const step = scenario.steps[i];
    totalSteps++;
    const label = `  step ${pad(`${i + 1}/${scenario.steps.length}`, 5)} ${pad(step.id, 26)}`;

    let command: string;
    try {
      command = deriveCommand(step);
    } catch (err) {
      failures.push({
        slug: scenario.slug,
        exhibit: scenario.exhibit,
        step: step.id,
        command: "<none>",
        reason: (err as Error).message,
      });
      console.log(`${label} ${RED}x${RESET} ${(err as Error).message}`);
      break;
    }

    // Sanity: the derived command must actually satisfy this step's matchers.
    if (!matches(command, step.matches)) {
      failures.push({
        slug: scenario.slug,
        exhibit: scenario.exhibit,
        step: step.id,
        command,
        reason: "derived command does not satisfy any matcher",
      });
      console.log(
        `${label} ${RED}x${RESET} ${DIM}«${command}»${RESET} did not satisfy matchers`,
      );
      break;
    }

    const beforeIndex = stepIndex;
    shell.handleInput(command + "\r");
    if (stepIndex === beforeIndex) {
      // Either the matcher passed isolated check but the shell rejected the
      // command, or there's a runtime error swallowed in dispatch.
      failures.push({
        slug: scenario.slug,
        exhibit: scenario.exhibit,
        step: step.id,
        command,
        reason: "shell did not advance step after dispatching command",
      });
      console.log(
        `${label} ${RED}x${RESET} ${DIM}«${command}»${RESET} ${RED}did not advance${RESET}`,
      );
      break;
    }

    stepsPassed++;
    console.log(
      `${label} ${GREEN}✓${RESET} ${CYAN}${command}${RESET}`,
    );
  }

  if (completed) {
    scenariosCompleted++;
    console.log(`  ${AMBER}* complete${RESET}`);
  } else {
    console.log(`  ${RED}x scenario did not reach completion${RESET}`);
  }
}

const ok = failures.length === 0 && scenariosCompleted === scenarios.length;
const ruler = "─".repeat(64);
console.log(`\n${ruler}`);
console.log(
  `Scenarios: ${scenariosCompleted}/${scenarios.length} complete | ` +
    `Steps: ${stepsPassed}/${totalSteps} passed`,
);

if (failures.length > 0) {
  console.log(`\n${BOLD}${RED}Failures (${failures.length})${RESET}`);
  for (const f of failures) {
    console.log(
      `  ${RED}x${RESET} ${BOLD}${f.exhibit}${RESET} ${f.slug} -> ${f.step}` +
        `\n      cmd:    ${CYAN}${f.command}${RESET}` +
        `\n      reason: ${f.reason}`,
    );
  }
}

console.log("");
process.exit(ok ? 0 : 1);
