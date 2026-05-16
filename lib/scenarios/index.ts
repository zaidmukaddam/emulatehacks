import type { Scenario } from "../types";
import { threeCxSupplyChain } from "./3cx-supply-chain";
import { aiAssistedAdminZeroDay } from "./ai-assisted-zero-day-admin";
import { applePlatformCveSurge } from "./apple-platform-cve-surge";
import { britishAirwaysCrewPortal } from "./british-airways-crew-portal";
import { cihVirus } from "./cih-virus";
import { citrixBleed } from "./citrix-bleed";
import { ciTokenLeak } from "./ci-token-leak";
import { classicPasswd } from "./classic-passwd";
import { canvasLmsCompromise } from "./canvas-lms-compromise";
import { codeRedWorm } from "./code-red-worm";
import { colonialPipeline } from "./colonial-pipeline";
import { confickerWorm } from "./conficker-worm";
import { copyFailDirtyFrag } from "./copy-fail-dirty-frag";
import { copyFailKernel } from "./copy-fail-kernel";
import { cve202632202SpoofLure } from "./cve-2026-32202-spoof-lure";
import { greenplasmaPrivesc } from "./greenplasma-privesc";
import { miniShaiHulud } from "./mini-shai-hulud";
import { nextAdvisoryWave2026 } from "./next-advisory-wave-2026";
import { panosUseridPortal0300 } from "./panos-cve-2026-0300";
import { windowsKevShellMshtml } from "./windows-kev-shell-mshtml";
import { yellowkeyBitlocker } from "./yellowkey-bitlocker";
import { equifaxStruts } from "./equifax-struts";
import { exposedEnv } from "./exposed-env";
import { f5TmuiRce } from "./f5-tmui-rce";
import { heartbleedTls } from "./heartbleed-tls";
import { http2RapidReset } from "./http2-rapid-reset";
import { iloveyouVirus } from "./iloveyou-virus";
import { log4shellJndi } from "./log4shell-jndi";
import { melissaMacro } from "./melissa-macro";
import { miraiBotnet } from "./mirai-botnet";
import { morrisWorm } from "./morris-worm";
import { moveitTransferClop } from "./moveit-transfer";
import { mydoomWorm } from "./mydoom-worm";
import { npmQixPhish } from "./npm-qix-phish";
import { polyfillCdn } from "./polyfill-cdn";
import { proxylogonExchange } from "./proxylogon-exchange";
import { react2shell } from "./react2shell";
import { regresshion } from "./regresshion";
import { shellshockBash } from "./shellshock-bash";
import { solarwindsSunburst } from "./solarwinds-sunburst";
import { spring4shell } from "./spring4shell";
import { sqlSlammer } from "./sql-slammer";
import { stuxnetSample } from "./stuxnet-plc";
import { suspiciousSsh } from "./suspicious-ssh";
import { terrapinSsh } from "./terrapin-ssh";
import { tjActionsTagMutation } from "./tj-actions-tag-mutation";
import { wannacryRansomware } from "./wannacry-ransomware";
import { xzBackdoor } from "./xz-backdoor";

/**
 * Catalog order: oldest incident to newest (EXH-001 through EXH-047). The archive page
 * renders newest-first via `scenariosNewestFirst`.
 */
export const scenarios: Scenario[] = [
  classicPasswd, // EXH-001 / 1988
  morrisWorm, // EXH-002 / 1988
  cihVirus, // EXH-003 / 1998
  melissaMacro, // EXH-004 / 1999
  iloveyouVirus, // EXH-005 / 2000
  codeRedWorm, // EXH-006 / 2001
  sqlSlammer, // EXH-007 / 2003
  mydoomWorm, // EXH-008 / 2004
  confickerWorm, // EXH-009 / 2008
  stuxnetSample, // EXH-010 / 2010
  heartbleedTls, // EXH-011 / 2014 Apr
  shellshockBash, // EXH-012 / 2014 Sep
  miraiBotnet, // EXH-013 / 2016
  wannacryRansomware, // EXH-014 / 2017
  equifaxStruts, // EXH-015 / 2017
  solarwindsSunburst, // EXH-016 / 2020
  f5TmuiRce, // EXH-017 / 2020
  proxylogonExchange, // EXH-018 / 2021
  colonialPipeline, // EXH-019 / 2021
  log4shellJndi, // EXH-020 / 2021
  spring4shell, // EXH-021 / 2022
  threeCxSupplyChain, // EXH-022 / 2023
  moveitTransferClop, // EXH-023 / 2023
  suspiciousSsh, // EXH-024 / 2023
  citrixBleed, // EXH-025 / 2023
  http2RapidReset, // EXH-026 / 2023
  terrapinSsh, // EXH-027 / 2023
  exposedEnv, // EXH-028 / 2024
  xzBackdoor, // EXH-029 / 2024
  polyfillCdn, // EXH-030 / 2024
  regresshion, // EXH-031 / 2024
  ciTokenLeak, // EXH-032 / 2024
  tjActionsTagMutation, // EXH-033 / 2025
  npmQixPhish, // EXH-034 / 2025
  react2shell, // EXH-035 / 2025
  nextAdvisoryWave2026, // EXH-036 / 2026 Jan
  yellowkeyBitlocker, // EXH-037 / 2026 Feb
  windowsKevShellMshtml, // EXH-038 / 2026 Feb
  greenplasmaPrivesc, // EXH-039 / 2026 Feb
  applePlatformCveSurge, // EXH-040 / 2026 Mar
  canvasLmsCompromise, // EXH-041 / 2026 Mar
  cve202632202SpoofLure, // EXH-042 / 2026 Apr
  copyFailKernel, // EXH-043 / 2026 Apr
  panosUseridPortal0300, // EXH-044 / 2026 May
  copyFailDirtyFrag, // EXH-045 / 2026 May
  miniShaiHulud, // EXH-046 / 2026 May
  aiAssistedAdminZeroDay, // EXH-047 / 2026 May
  britishAirwaysCrewPortal, // EXH-048 / 2026 May
];

export const scenarioMap = new Map(scenarios.map((s) => [s.slug, s]));

export function getScenario(slug: string): Scenario | undefined {
  return scenarioMap.get(slug);
}

/** Newest exhibits first, used by the archive and the homepage. */
export const scenariosNewestFirst: Scenario[] = [...scenarios].reverse();

/** Group an array of scenarios by year, newest year first. */
export function groupByYear(items: Scenario[]) {
  const map = new Map<string, Scenario[]>();
  for (const s of items) {
    const list = map.get(s.year);
    if (list) list.push(s);
    else map.set(s.year, [s]);
  }
  return [...map.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, list]) => ({ year, items: list }));
}
