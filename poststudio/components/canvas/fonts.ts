export const GOOGLE_FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat",
  "Oswald", "Raleway", "Poppins", "Playfair Display", "Merriweather",
  "Bebas Neue", "DM Sans", "Space Grotesk", "Plus Jakarta Sans",
  "Nunito", "Josefin Sans", "Barlow", "Work Sans",
  "Libre Baskerville", "Source Serif 4", "Cormorant Garamond",
  "Syne", "Archivo", "Fraunces",
]

const loaded = new Set<string>()

export function loadFont(name: string) {
  if (typeof document === "undefined") return
  if (loaded.has(name)) return
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:wght@300;400;500;600;700;800&display=swap`
  document.head.appendChild(link)
  loaded.add(name)
}

export function preloadAllFonts() {
  GOOGLE_FONTS.forEach(loadFont)
}

export const BRAND_COLORS = [
  "#FD8D6E", "#5A8DEE", "#2E2E2E", "#FFFFFF", "#FFD95A",
  "#4ECB71", "#F5F5F0", "#FF4D4D", "#000000", "#9B59B6",
  "#1ABC9C", "#E67E22", "#2C3E50", "#BDC3C7", "#8E44AD",
]
