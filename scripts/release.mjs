#!/usr/bin/env node
/**
 * Release helper: npm run release -- 2026.08.27.1
 *
 * Keeps VERSION, the git tag, and the shipped console banner in lockstep,
 * because HACS installs the asset attached to the release for the tag and
 * drift between them breaks installs. Steps, refusing on any problem:
 *
 *   1. Validate the version is CalVer YYYY.MM.DD.V.
 *   2. Refuse a dirty working tree (releases come from committed state).
 *   3. Write VERSION, rebuild dist so the committed file matches.
 *   4. Commit, tag v<version>, push branch and tag.
 *
 * The Release workflow then builds from the tag and attaches
 * dist/music-flow-card.js to the GitHub Release, creating the release if
 * it does not already exist.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const CALVER = /^\d{4}\.\d{2}\.\d{2}\.\d+$/;

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", ...opts });
}

function fail(message) {
  console.error(`release: ${message}`);
  process.exit(1);
}

const version = process.argv[2];
if (!version) {
  fail("usage: npm run release -- <YYYY.MM.DD.V>, e.g. 2026.08.27.1");
}
if (!CALVER.test(version)) {
  fail(
    `"${version}" is not CalVer YYYY.MM.DD.V (zero-padded month and day, e.g. 2026.08.27.1)`,
  );
}

const dirty = run("git", ["status", "--porcelain"]).trim();
if (dirty) {
  fail(`working tree is not clean, commit or stash first:\n${dirty}`);
}

const current = readFileSync("VERSION", "utf8").trim();
if (current === version) {
  fail(`VERSION already is ${version}; pick the next number`);
}

const tag = `v${version}`;
const existing = run("git", ["tag", "--list", tag]).trim();
if (existing) {
  fail(`tag ${tag} already exists locally; delete it first if this is intentional`);
}

writeFileSync("VERSION", `${version}\n`);
console.log(`VERSION ${current} -> ${version}`);

console.log("Building dist so the committed file matches the tag...");
run("npm", ["run", "build"], { stdio: "inherit" });

run("git", ["add", "VERSION", "dist/music-flow-card.js"]);
run("git", ["commit", "-m", `Release ${version}`], { stdio: "inherit" });
run("git", ["tag", tag]);

const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]).trim();
console.log(`Pushing ${branch} and ${tag}...`);
run("git", ["push", "origin", branch], { stdio: "inherit" });
run("git", ["push", "origin", tag], { stdio: "inherit" });

console.log(
  `Done. The Release workflow attaches dist/music-flow-card.js to the ${tag} release.`,
);
