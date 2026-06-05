import fs from "fs";
import path from "path";
import MapSection from "@/components/MapSection";
import { seedStates } from "@/lib/seed";

export const dynamic = "force-dynamic";

async function ensureSeeded() {
  try {
    await seedStates();
  } catch (e) {
    console.error("Auto-seed skipped:", e);
  }
}

export default async function HomePage() {
  await ensureSeeded();

  const svgPath = path.join(process.cwd(), "components", "us-map-inner.svg");
  const svgContent = fs.readFileSync(svgPath, "utf8");

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <MapSection svgContent={svgContent} />
      </div>
    </main>
  );
}
