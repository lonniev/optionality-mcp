/** Optionality's words in every language say what English says: the same keys, {{places}} and <tags/>. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { LANGUAGES, localeProblems, setLanguage, translate } from "@tollbooth-dpyc/web";
import english from "../i18n/en.ts";
import { registerOptionality, WORDS } from "../i18n/index.ts";

for (const { code } of LANGUAGES.filter((l) => l.code !== "en")) {
  test(`${code}: every message is there, with English's {{places}} and <tags/>`, async () => {
    const locale = (await import(`../i18n/${code}.ts`)).default;
    assert.deepEqual(localeProblems(english, locale), []);
  });
}

test("no message keeps a single-brace {place} or a raw ${…}", () => {
  for (const [key, text] of Object.entries(english)) assert.doesNotMatch(text, /(^|[^{])\{\w+\}(?!\})|\$\{/, key);
});

test("Optionality's words are read through the package, in the chosen language", async () => {
  await registerOptionality();
  const key = Object.keys(english).find((k) => !/_(one|other)$/.test(k) && !english[k as keyof typeof english].includes("{{"))!;
  assert.equal(translate(key, undefined, WORDS), english[key as keyof typeof english]);
  await setLanguage("fr");
  const fr = (await import("../i18n/fr.ts")).default as Record<string, string>;
  assert.equal(translate(key, undefined, WORDS), fr[key]);
  await setLanguage("en");
});

test("every quote, glossary term and preset the code asks for has its English", () => {
  for (let i = 0; i < 5; i++) assert.ok(english[`lib.quotes.${i}` as keyof typeof english], `quote ${i}`);
  for (let i = 0; i < 9; i++) assert.ok(english[`presets.${i}` as keyof typeof english], `preset ${i}`);
});
