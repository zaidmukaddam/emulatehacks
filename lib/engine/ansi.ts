export const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  amber: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  brightGreen: "\x1b[92m",
  brightAmber: "\x1b[93m",
  brightCyan: "\x1b[96m",
  gray: "\x1b[90m",
  clearLine: "\x1b[2K\r",
  /** Erase display + saved scrollback (xterm-style 2J/3J), then cursor home. */
  clearScreen: "\x1b[2J\x1b[3J\x1b[H",
  cursorLeft: "\x1b[D",
  cursorRight: "\x1b[C",
} as const;

export const c = {
  amber: (s: string) => `${ANSI.amber}${s}${ANSI.reset}`,
  green: (s: string) => `${ANSI.green}${s}${ANSI.reset}`,
  cyan: (s: string) => `${ANSI.cyan}${s}${ANSI.reset}`,
  dim: (s: string) => `${ANSI.dim}${s}${ANSI.reset}`,
  bold: (s: string) => `${ANSI.bold}${s}${ANSI.reset}`,
  red: (s: string) => `${ANSI.red}${s}${ANSI.reset}`,
  gray: (s: string) => `${ANSI.gray}${s}${ANSI.reset}`,
};
