import { build, context } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: {
    background: "src/background.ts",
    content: "src/content.ts",
    popup: "src/popup.ts",
  },
  outdir: "dist",
  bundle: true,
  format: "esm",
  target: "chrome120",
  sourcemap: false,
  logLevel: "info",
};

async function copyStatic() {
  await mkdir("dist", { recursive: true });
  await cp("public", "dist", { recursive: true });
}

await rm("dist", { recursive: true, force: true });
await copyStatic();

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log("watching... (static files in public/ are copied only at start)");
} else {
  await build(options);
}
