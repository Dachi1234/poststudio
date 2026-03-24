import Link from "next/link"
import { CODELESS_BRAND } from "@/lib/brand"

export default function Home() {
  const colorSwatches = [
    { name: "Coral",       hex: CODELESS_BRAND.colors.coral },
    { name: "Blue",        hex: CODELESS_BRAND.colors.blue },
    { name: "Off-White",   hex: CODELESS_BRAND.colors.offWhite },
    { name: "Dark Gray",   hex: CODELESS_BRAND.colors.darkGray },
    { name: "Soft Yellow", hex: CODELESS_BRAND.colors.softYellow },
    { name: "Mint Green",  hex: CODELESS_BRAND.colors.mintGreen },
  ]

  return (
    <main className="min-h-screen bg-[#2E2E2E] flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 text-center max-w-2xl">
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-[family-name:var(--font-inter)] font-semibold text-[56px] leading-tight text-white">
            PostStudio
          </h1>
          <p className="font-[family-name:var(--font-inter)] font-normal text-[20px] text-white/60">
            AI-powered social posts, on-brand every time.
          </p>
          <span className="font-[family-name:var(--font-space-mono)] text-[12px] bg-[#FD8D6E] text-[#2E2E2E] px-3 py-1 rounded-full">
            by CodeLess
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          {colorSwatches.map((swatch) => (
            <div key={swatch.hex} className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 rounded-full border border-white/10"
                style={{ backgroundColor: swatch.hex }}
              />
              <span className="font-[family-name:var(--font-space-mono)] text-[10px] text-white/40">
                {swatch.hex}
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/create"
          className="bg-[#FD8D6E] text-[#2E2E2E] font-[family-name:var(--font-inter)] font-semibold text-base px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Start Creating →
        </Link>
      </div>
    </main>
  )
}
