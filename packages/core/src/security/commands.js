const dangerousTokens = [
    "rm",
    "del",
    "erase",
    "format",
    "shutdown",
    "reboot",
    "mkfs",
    "diskpart",
    "reg",
    "powershell",
    "cmd",
];
const chainingTokens = ["&&", "||", ";", "|", ">", "<", "`"];
const defaultAllowlist = [
    "pnpm dev",
    "npm run dev",
    "yarn dev",
    "pnpm --filter demo-login-app dev",
    "npm run start",
    "pnpm start",
];
export function getCommandAllowlist(envValue = process.env.SPECHECK_COMMAND_ALLOWLIST) {
    if (!envValue)
        return defaultAllowlist;
    return envValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}
export function validateStartCommand(command, allowlist = getCommandAllowlist()) {
    const normalizedCommand = command.trim().replace(/\s+/g, " ");
    if (!normalizedCommand) {
        return { ok: false, reason: "Start command is required." };
    }
    const lower = normalizedCommand.toLowerCase();
    if (chainingTokens.some((token) => normalizedCommand.includes(token))) {
        return { ok: false, reason: "Shell chaining and redirection are not allowed." };
    }
    const firstToken = lower.split(" ")[0] ?? "";
    if (dangerousTokens.includes(firstToken)) {
        return { ok: false, reason: `Dangerous command '${firstToken}' is blocked.` };
    }
    if (!allowlist.map((item) => item.toLowerCase()).includes(lower)) {
        return { ok: false, reason: "Start command is not in the allowlist." };
    }
    return { ok: true, normalizedCommand };
}
