import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const PACKAGE_JSON = "package.json";
const CHUNK_SIZE = Number(process.env.CHUNK_SIZE ?? 3);
const repoRoot = process.cwd();
const sandboxRoot = mkdtempSync(path.join(tmpdir(), "prune-build-deps-"));

const originalPackageText = readFileSync(path.join(repoRoot, PACKAGE_JSON), "utf8");
const originalPackage = JSON.parse(originalPackageText);

const prioritizedCandidates = [
  ...Object.keys(originalPackage.devDependencies ?? {}),
  "@astrojs/check",
  "@types/jsdom",
  "@types/react",
  "@types/react-dom",
  "@radix-ui/react-slot",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "tailwindcss-animate",
  "shiki",
];

const allPackages = [
  ...Object.keys(originalPackage.dependencies ?? {}),
  ...Object.keys(originalPackage.devDependencies ?? {}),
];

const candidates = [...new Set([...prioritizedCandidates, ...allPackages])].filter(Boolean);

let bestPackage = JSON.parse(originalPackageText);
const removed = [];

function toPackageText(packageJson) {
  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: process.env,
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function copyRepoToSandbox() {
  const ignored = new Set([".git", ".astro", ".vercel", "dist", "node_modules"]);

  cpSync(repoRoot, sandboxRoot, {
    recursive: true,
    filter(src) {
      const relative = path.relative(repoRoot, src);
      if (!relative) return true;
      const parts = relative.split(path.sep);
      return !parts.some((part) => ignored.has(part));
    },
  });
}

function resetSandbox(packageJson) {
  for (const name of ["node_modules", "dist", ".astro", ".vercel", "bun.lock"]) {
    rmSync(path.join(sandboxRoot, name), { recursive: true, force: true });
  }

  writeFileSync(path.join(sandboxRoot, PACKAGE_JSON), toPackageText(packageJson));
}

function buildWorks(packageJson) {
  resetSandbox(packageJson);

  const install = run("bun", ["install"], sandboxRoot);
  if (!install.ok) {
    return { ok: false, phase: "install", install };
  }

  const build = run("bun", ["run", "build"], sandboxRoot);
  if (!build.ok) {
    return { ok: false, phase: "build", build };
  }

  return { ok: true };
}

function attemptRemoval(names) {
  const nextPackage = JSON.parse(toPackageText(bestPackage));

  for (const name of names) {
    delete nextPackage.dependencies?.[name];
    delete nextPackage.devDependencies?.[name];
  }

  const result = buildWorks(nextPackage);
  if (!result.ok) {
    return { ok: false, ...result, names };
  }

  bestPackage = nextPackage;
  removed.push(...names);
  return { ok: true, names };
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

copyRepoToSandbox();

const baseline = buildWorks(bestPackage);
if (!baseline.ok) {
  console.error(`Baseline ${baseline.phase} failed in sandbox.`);
  process.exit(1);
}

console.log(`Sandbox: ${sandboxRoot}`);
console.log(`Testing ${candidates.length} packages in chunks of ${CHUNK_SIZE}...`);

try {
  for (const group of chunk(candidates, CHUNK_SIZE)) {
    console.log(`\nTrying chunk: ${group.join(", ")}`);
    const groupResult = attemptRemoval(group);

    if (groupResult.ok) {
      console.log(`  removed: ${group.join(", ")}`);
      continue;
    }

    console.log(`  chunk failed during ${groupResult.phase}; testing individually...`);

    for (const name of group) {
      const singleResult = attemptRemoval([name]);
      console.log(`    ${singleResult.ok ? "removed" : "kept"}: ${name}`);
    }
  }

  writeFileSync(path.join(repoRoot, PACKAGE_JSON), toPackageText(bestPackage));
} finally {
  rmSync(sandboxRoot, { recursive: true, force: true });
}

console.log("\nDone.");
console.log(`Removed ${removed.length} packages:`);
for (const name of removed) {
  console.log(`- ${name}`);
}
