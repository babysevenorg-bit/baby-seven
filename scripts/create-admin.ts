/**
 * scripts/create-admin.ts
 *
 * Interactive script that creates an admin user with a real bcrypt-hashed
 * password. Run from your own machine (NOT in the cloud build):
 *
 *   bun run scripts/create-admin.ts
 *
 * The script will:
 *   1. Prompt for a username (lowercase, alphanumeric + dash).
 *   2. Prompt for a password (12+ chars, hidden input, with confirmation).
 *   3. Hash the password with bcrypt (12 rounds).
 *   4. Insert a new AdminUser row into the database.
 *
 * This is the ONLY way to create the first admin (you can't create one
 * through the UI — that would be a security hole). Once you have one
 * owner account, you can add more admins via the admin panel.
 *
 * Re-running the script with an existing username updates that user's
 * password (useful if you forget it).
 */
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/admin-auth";

async function promptHidden(label: string): Promise<string> {
  // Bun doesn't have a built-in hidden TTY prompt, so we use a tiny
  // raw-mode shim. Falls back to plain input if stdin isn't a TTY.
  const { stdin, stdout } = process as unknown as {
    stdin: { isTTY?: boolean; setRawMode?: (m: number) => void; on: (e: string, cb: (d: Buffer) => void) => void; removeListener?: (e: string, cb: (d: Buffer) => void) => void };
    stdout: { write: (s: string) => void };
  };

  return await new Promise<string>((resolve) => {
    stdout.write(label);
    let buf = "";
    const onData = (chunk: Buffer) => {
      for (const ch of chunk) {
        // Enter (10), CR (13)
        if (ch === 10 || ch === 13) {
          stdout.write("\n");
          stdin.setRawMode?.(0);
          stdin.removeListener?.("data", onData);
          resolve(buf);
          return;
        }
        // Ctrl-C (3), Ctrl-D (4)
        if (ch === 3 || ch === 4) {
          stdout.write("\n");
          process.exit(1);
        }
        // Backspace (127)
        if (ch === 127) {
          if (buf.length > 0) {
            buf = buf.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }
        buf += String.fromCharCode(ch);
        stdout.write("*");
      }
    };
    stdin.setRawMode?.(1);
    stdin.on("data", onData);
  });
}

async function promptVisible(label: string): Promise<string> {
  return await new Promise<string>((resolve) => {
    process.stdout.write(label);
    let buf = "";
    process.stdin.on("data", function onData(chunk: Buffer) {
      buf += chunk.toString();
      if (buf.includes("\n")) {
        process.stdin.removeListener?.("data", onData);
        resolve(buf.trim());
      }
    });
  });
}

async function main() {
  console.log("\n🔐 Baby Seven Admin Setup\n");

  // --- Username -----------------------------------------------------------
  const rawUsername = (await promptVisible("Username (lowercase, a-z 0-9 -): ")).trim();
  if (!/^[a-z0-9-]{3,30}$/.test(rawUsername)) {
    console.error(
      "Invalid username. Use 3-30 lowercase letters, digits, or dashes.",
    );
    process.exit(1);
  }

  // --- Password -----------------------------------------------------------
  const password = await promptHidden("Password (12+ chars, hidden): ");
  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }
  const confirm = await promptHidden("Confirm password: ");
  if (password !== confirm) {
    console.error("Passwords do not match.");
    process.exit(1);
  }

  // --- Role ---------------------------------------------------------------
  const roleAnswer = (await promptVisible(
    "Role [owner/admin] (default: owner): ",
  )).trim().toLowerCase() || "owner";
  if (roleAnswer !== "owner" && roleAnswer !== "admin") {
    console.error(`Invalid role '${roleAnswer}'. Use 'owner' or 'admin'.`);
    process.exit(1);
  }

  // --- Hash + upsert ------------------------------------------------------
  console.log("\nHashing password (bcrypt, 12 rounds)…");
  const passwordHash = await hashPassword(password);

  const existing = await db.adminUser.findUnique({
    where: { username: rawUsername },
  });
  if (existing) {
    await db.adminUser.update({
      where: { username: rawUsername },
      data: { passwordHash, role: roleAnswer, failedAttempts: 0, lockedUntil: null },
    });
    console.log(`\n✅ Updated admin '${rawUsername}' (${roleAnswer}).`);
  } else {
    await db.adminUser.create({
      data: { username: rawUsername, passwordHash, role: roleAnswer },
    });
    console.log(`\n✅ Created admin '${rawUsername}' (${roleAnswer}).`);
  }

  console.log(
    "\nYou can now log in at the admin Studio (footer → 'Studio Access') with:",
  );
  console.log(`  username: ${rawUsername}`);
  console.log("  password: (the one you just set)\n");

  console.log("🚨 Next: revoke the GitHub PAT you used, and rotate the password");
  console.log("   periodically (every 90 days is a good rhythm).");
}

main()
  .catch((e) => {
    console.error("Create-admin failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
