import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-2 text-sm text-zinc-400">Configure model keys in `.env`; secrets are never stored in the database.</p>
    </Card>
  );
}
