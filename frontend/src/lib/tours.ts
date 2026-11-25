/** The tours: the package's shared ones, and Optionality's own tabs. */

import { accountTour, signInTour, walletTour, type Tour, type TourStep } from "@tollbooth-dpyc/web";
import { tr, type MessageKey, type Translate } from "../i18n/index.ts";

/** Every tour, in the language `t` speaks: build them again when the language changes. */
export function tours(t: Translate = tr): Record<string, Tour> {
  const step = (target: string, key: string, side?: TourStep["side"]): TourStep => ({
    target,
    title: t(`tour.${key}.title` as MessageKey),
    says: t(`tour.${key}.says` as MessageKey),
    ...(side ? { side } : {}),
  });
  return {
    signin: signInTour(),
    wallet: walletTour(),
    account: accountTour("account", [step("account.tutorial", "account.tutorial", "top")]),
    pit: { page: "pit", steps: [
      step("pit.historicity", "pit.historicity"),
      step("pit.persona", "pit.persona"),
      step("pit.risk", "pit.risk"),
      step("pit.sector", "pit.sector"),
      step("pit.toll", "pit.toll", "top"),
      step("pit.topUp", "pit.topUp", "top"),
      step("pit.deal", "pit.deal", "top"),
    ] },
    scenario: { page: "scenario", steps: [
      step("pit.facts", "scenario.facts"),
      step("pit.question", "scenario.question"),
      step("pit.pitch", "scenario.pitch", "top"),
      step("pit.clue", "scenario.clue", "top"),
    ] },
    journal: { page: "journal", steps: [
      step("journal.table", "journal.table", "top"),
      step("journal.sort", "journal.sort"),
    ] },
    leaderboard: { page: "leaderboard", steps: [
      step("lb.sort", "leaderboard.sort"),
      step("lb.table", "leaderboard.table", "top"),
    ] },
  };
}
