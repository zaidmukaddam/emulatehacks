import type { Scenario } from "../types";

export const exposedEnv: Scenario = {
  slug: "exposed-env-file",
  exhibit: "EXH-028",
  title: "The Exposed Env File",
  tagline:
    "A small startup pushed a build with the wrong directory listed as public. You arrive after the bots have already noticed.",
  category: "modern-cloud",
  difficulty: "beginner",
  era: "2020s",
  year: "2024",
  estMinutes: 8,
  fictional: true,
  cwd: "/srv/fakecorp",
  user: "operator",
  host: "edge-01",
  role: "On-call engineer for the fictional startup Fakecorp. The CTO paged you eleven minutes ago.",
  objective:
    "Find what was exposed, confirm it was scraped, and explain how to prevent it next time.",
  briefing:
    "At 03:14 UTC the deploy bot shipped commit 8f1c2a as production. Nothing alerted. By 03:22 the cache hit rate on /.env was already non-zero. You inherited the laptop, not the deployment. Start by looking around.",
  env: {
    USER: "operator",
    SHELL: "/bin/sh",
    PWD: "/srv/fakecorp",
    NODE_ENV: "production",
    DEPLOY_ID: "8f1c2a",
  },
  ps: [
    "  PID TTY          TIME CMD",
    "  101 ?        00:00:01 nginx",
    "  118 ?        00:00:03 node server.js",
    "  204 pts/0    00:00:00 sh",
    "  311 pts/0    00:00:00 ps",
  ],
  history: ["whoami", "ls", "cat README.md"],
  files: {
    "/srv/fakecorp/README.md": {
      content:
        "Fakecorp, incident reconstruction\n\nA deploy went out with the wrong files listed under /public.\nStart with `ls`. Look at what is being served.\n",
    },
    "/srv/fakecorp/app/server.js": {
      content:
        "import express from 'express'\nconst app = express()\n// NOTE: this line is the bug. /public was meant to be /static.\napp.use(express.static('public'))\napp.listen(8080)\n",
    },
    "/srv/fakecorp/app/package.json": {
      content:
        '{\n  "name": "fakecorp-edge",\n  "version": "0.4.1",\n  "private": true\n}\n',
    },
    "/srv/fakecorp/public/index.html": {
      content:
        "<!doctype html>\n<title>Fakecorp</title>\n<h1>We ship dependable software.</h1>\n",
    },
    "/srv/fakecorp/public/favicon.ico": { content: "<binary>" },
    "/srv/fakecorp/public/.env": {
      content:
        "API_URL=https://api.fakecorp.local\nPUBLIC_ANALYTICS_ID=demo_123\nDATABASE_URL=postgres://app:[REDACTED-IN-SIMULATION]@db.fakecorp.local:5432/app\nSTRIPE_KEY=sk_live_[REDACTED-IN-SIMULATION]\nSESSION_SECRET=[REDACTED-IN-SIMULATION]\n",
    },
    "/srv/fakecorp/logs/access.log": {
      content: [
        '203.0.113.18 - - [12/Mar/2024:03:22:11 +0000] "GET /.env HTTP/1.1" 200 412 "-" "Mozilla/5.0"',
        '198.51.100.42 - - [12/Mar/2024:03:22:14 +0000] "GET /.env HTTP/1.1" 200 412 "-" "curl/8.4.0"',
        '198.51.100.42 - - [12/Mar/2024:03:22:15 +0000] "GET /.env.bak HTTP/1.1" 404 162 "-" "curl/8.4.0"',
        '203.0.113.99 - - [12/Mar/2024:03:22:18 +0000] "GET /.git/config HTTP/1.1" 404 162 "-" "masscan/1.3"',
        '203.0.113.18 - - [12/Mar/2024:03:24:02 +0000] "GET /.env HTTP/1.1" 200 412 "-" "python-requests/2.31"',
        '192.0.2.7   - - [12/Mar/2024:03:31:55 +0000] "GET /.env HTTP/1.1" 200 412 "-" "Go-http-client/1.1"',
      ].join("\n"),
    },
  },
  steps: [
    {
      id: "look-around",
      goal: "Look around the deploy directory.",
      hint: "Try `ls` to see what is here.",
      matches: [{ kind: "exact", command: "ls" }],
      narration:
        "Three folders. The one named public is being served to the world.",
    },
    {
      id: "list-public",
      goal: "List what is being served as public.",
      hint: "List the contents of the public folder: `ls public`.",
      matches: [
        {
          kind: "any",
          commands: ["ls public", "ls public/", "ls ./public", "ls -a public"],
        },
      ],
      narration: "There it is. `.env` should never have been in public/.",
    },
    {
      id: "read-env",
      goal: "Read the leaked env file.",
      hint: "`cat public/.env` will show what was exposed.",
      matches: [
        {
          kind: "any",
          commands: ["cat public/.env", "cat ./public/.env"],
        },
      ],
      narration:
        "Database URL, Stripe key, session secret. Treat all of these as burned.",
    },
    {
      id: "find-bug",
      goal: "Read the server file and find the line that did this.",
      hint: "`cat app/server.js`, look for the static directory it serves.",
      matches: [
        {
          kind: "any",
          commands: ["cat app/server.js", "cat ./app/server.js"],
        },
      ],
      narration:
        "The static root was meant to be `static/`. A one-character change in the deploy script ships secrets to anyone who asks.",
    },
    {
      id: "confirm-scraped",
      goal: "Confirm someone actually fetched it.",
      hint: "Search the access log for /.env: `grep -nF '.env' logs/access.log`.",
      matches: [
        {
          kind: "exact",
          command: "grep -nF '.env' logs/access.log",
        },
      ],
      narration:
        "Five hits across four IPs in nine minutes. Assume scraped. Rotate every secret in that file before you do anything else.",
    },
  ],
  debrief: {
    summary:
      "A deploy mis-served the /public directory, which contained a .env intended only for the build. Within minutes, opportunistic scanners had pulled the file.",
    lesson:
      "Treat `.env` as build-time only. Never let it sit inside the directory your web server is configured to serve. Add a CI check that fails the build if any secret-shaped file lands in your public output. Rotate any secret that has touched a public surface, even briefly.",
    simulated: [
      "All hosts, IPs, keys, and log entries are fictional.",
      "No outbound network is performed by this terminal.",
      "Commands are scripted; the filesystem you see is in memory.",
    ],
  },
};
