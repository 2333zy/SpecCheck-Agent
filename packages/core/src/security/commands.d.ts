export type CommandValidationResult = {
    ok: true;
    normalizedCommand: string;
} | {
    ok: false;
    reason: string;
};
export declare function getCommandAllowlist(envValue?: string | undefined): string[];
export declare function validateStartCommand(command: string, allowlist?: string[]): CommandValidationResult;
