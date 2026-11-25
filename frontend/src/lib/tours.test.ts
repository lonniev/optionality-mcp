import assert from "node:assert/strict";
import { test } from "node:test";
import { lintTours } from "@tollbooth-dpyc/web";
import { tours } from "./tours.ts";
import { registerOptionality } from "../i18n/index.ts";

await registerOptionality();

test("every tab that asks for a tour has one, in the network's voice", () => {
  const TOURS = tours();
  for (const page of ["signin", "wallet", "account", "pit", "scenario", "journal", "leaderboard"]) assert.ok(TOURS[page], page);
  assert.deepEqual(lintTours(TOURS), []);
});

test("every step's words are Optionality's, never a bare key", () => {
  for (const tour of Object.values(tours())) {
    for (const s of tour.steps) {
      assert.doesNotMatch(s.title, /^tour\./, tour.page);
      assert.doesNotMatch(s.says, /^tour\./, tour.page);
    }
  }
});
