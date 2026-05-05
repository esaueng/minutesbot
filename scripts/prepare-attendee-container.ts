import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";

const repositoryUrl = "https://github.com/attendee-labs/attendee.git";
const checkoutDir = resolve(".attendee/upstream");

function run(command: string, args: string[], cwd = process.cwd()): Promise<void> {
  return new Promise((resolveCommand, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolveCommand();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

async function main(): Promise<void> {
  await mkdir(dirname(checkoutDir), { recursive: true });

  if (existsSync(resolve(checkoutDir, ".git"))) {
    await run("git", ["fetch", "origin"], checkoutDir);
    await run("git", ["checkout", "main"], checkoutDir);
    await run("git", ["pull", "--ff-only", "origin", "main"], checkoutDir);
  } else {
    await run("git", ["clone", "--depth", "1", repositoryUrl, checkoutDir]);
  }

  console.log("");
  console.log("Attendee source is ready at .attendee/upstream.");
  console.log("Next:");
  console.log("- Configure deploy/attendee-container/wrangler.jsonc for your Cloudflare account and domain.");
  console.log("- Set Attendee secrets on that Worker with wrangler secret put.");
  console.log("- Run pnpm attendee:deploy.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
