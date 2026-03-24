const THEMES = {
  coral:  { primary: "#FD8D6E", secondary: "#2E2E2E", text: "#FFFFFF", textDark: "#2E2E2E" },
  blue:   { primary: "#5A8DEE", secondary: "#2E2E2E", text: "#FFFFFF", textDark: "#2E2E2E" },
  dark:   { primary: "#2E2E2E", secondary: "#FD8D6E", text: "#FFFFFF", textDark: "#FFFFFF" },
  yellow: { primary: "#FFD95A", secondary: "#2E2E2E", text: "#2E2E2E", textDark: "#2E2E2E" },
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildTemplateHTML(templateId, post, colorTheme, width, height) {
  const theme  = THEMES[colorTheme] || THEMES.coral
  const h      = escapeHtml
  const imgSrc = post.imageUrl || ""

  const imageTag = imgSrc
    ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;display:block;" />`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#2E2E2E,#5A8DEE);"></div>`

  const baseCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width:${width}px; height:${height}px;
      overflow:hidden;
      font-family:'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  `

  const templates = {

    "big-quote": `
      <div style="position:relative;width:${width}px;height:${height}px;
        background:${theme.primary};overflow:hidden;
        display:flex;align-items:center;justify-content:center;">

        <div style="position:absolute;font-size:520px;font-weight:800;
          color:rgba(255,255,255,0.08);font-family:'Inter',sans-serif;
          top:-80px;left:-20px;line-height:1;user-select:none;">&ldquo;</div>

        <span style="position:absolute;top:55px;left:60px;
          font-family:'Space Mono',monospace;font-size:20px;
          color:rgba(255,255,255,0.55);">CodeLess</span>

        <div style="display:flex;flex-direction:column;
          align-items:flex-start;gap:36px;
          padding:0 80px;max-width:960px;position:relative;">
          <div style="font-size:62px;font-weight:700;color:${theme.text};
            line-height:1.1;word-wrap:break-word;">
            ${h(post.headline)}
          </div>
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:40px;height:3px;background:rgba(255,255,255,0.4);"></div>
            <span style="font-family:'Space Mono',monospace;font-size:18px;
              color:rgba(255,255,255,0.6);">CodeLess Student</span>
          </div>
          <div style="display:inline-flex;background:rgba(255,255,255,0.15);
            border-radius:30px;padding:12px 30px;">
            <span style="font-size:18px;font-weight:600;color:${theme.text};">
              ${h(post.cta)}
            </span>
          </div>
        </div>

        <div style="position:absolute;bottom:55px;left:80px;display:flex;gap:16px;">
          ${post.hashtags.slice(0, 3).map(tag =>
            `<span style="font-size:17px;color:rgba(255,255,255,0.35);">#${h(tag)}</span>`
          ).join("")}
        </div>
      </div>
    `,

    "stat-card": `
      <div style="position:relative;width:${width}px;height:${height}px;
        background:#2E2E2E;overflow:hidden;
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;">

        <div style="position:absolute;width:800px;height:800px;
          border-radius:50%;border:1px solid rgba(255,255,255,0.04);
          top:50%;left:50%;transform:translate(-50%,-50%);"></div>
        <div style="position:absolute;width:600px;height:600px;
          border-radius:50%;border:1px solid rgba(255,255,255,0.04);
          top:50%;left:50%;transform:translate(-50%,-50%);"></div>

        <span style="position:absolute;top:55px;
          font-family:'Space Mono',monospace;font-size:20px;
          color:rgba(255,255,255,0.4);left:50%;
          transform:translateX(-50%);">CodeLess</span>

        <div style="font-size:220px;font-weight:800;color:${theme.primary};
          line-height:0.9;font-family:'Inter',sans-serif;
          text-align:center;word-break:break-all;max-width:960px;">
          ${h(post.headline.split(" ")[0])}
        </div>

        <div style="font-size:36px;font-weight:500;
          color:rgba(255,255,255,0.7);text-align:center;
          margin-top:30px;max-width:700px;line-height:1.3;">
          ${h(post.caption.substring(0, 60))}
        </div>

        <div style="position:absolute;bottom:70px;
          display:inline-flex;background:${theme.primary};
          border-radius:30px;padding:14px 36px;">
          <span style="font-size:20px;font-weight:700;color:${theme.textDark};">
            ${h(post.cta)}
          </span>
        </div>
      </div>
    `,

    "before-after": `
      <div style="display:flex;flex-direction:column;
        width:${width}px;height:${height}px;overflow:hidden;">

        <div style="display:flex;flex-direction:column;
          width:100%;height:${Math.floor(height / 2)}px;
          background:#1a1a1a;padding:55px 70px;
          justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:10px;height:10px;border-radius:50%;
              background:rgba(255,255,255,0.25);"></div>
            <span style="font-family:'Space Mono',monospace;font-size:16px;
              color:rgba(255,255,255,0.35);text-transform:uppercase;
              letter-spacing:0.12em;">Before CodeLess</span>
          </div>
          <div style="font-size:48px;font-weight:700;
            color:rgba(255,255,255,0.45);line-height:1.1;max-width:800px;">
            &ldquo;I don&rsquo;t have a tech background. I can&rsquo;t do this.&rdquo;
          </div>
        </div>

        <div style="width:100%;height:6px;background:${theme.primary};flex-shrink:0;"></div>

        <div style="display:flex;flex-direction:column;
          width:100%;flex:1;
          background:${theme.primary};padding:50px 70px;
          justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:10px;height:10px;border-radius:50%;
              background:rgba(255,255,255,0.7);"></div>
            <span style="font-family:'Space Mono',monospace;font-size:16px;
              color:rgba(255,255,255,0.7);text-transform:uppercase;
              letter-spacing:0.12em;">After CodeLess</span>
          </div>
          <div style="font-size:52px;font-weight:800;
            color:white;line-height:1.0;max-width:800px;">
            ${h(post.headline)}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;">
            <span style="font-size:20px;font-weight:600;color:rgba(255,255,255,0.8);">
              ${h(post.cta)}
            </span>
            <span style="font-family:'Space Mono',monospace;font-size:16px;
              color:rgba(255,255,255,0.5);">CodeLess</span>
          </div>
        </div>
      </div>
    `,

    "checklist": `
      <div style="position:relative;width:${width}px;height:${height}px;
        background:#F9F9F9;overflow:hidden;
        display:flex;flex-direction:column;
        padding:80px 90px;justify-content:space-between;">

        <div style="position:absolute;bottom:-60px;right:-60px;
          width:280px;height:280px;border-radius:50%;
          background:${theme.primary};opacity:0.12;"></div>

        <div style="display:flex;flex-direction:column;gap:8px;">
          <span style="font-family:'Space Mono',monospace;font-size:16px;
            color:${theme.primary};text-transform:uppercase;letter-spacing:0.1em;">CodeLess</span>
          <div style="font-size:52px;font-weight:800;
            color:#2E2E2E;line-height:1.0;max-width:800px;">
            ${h(post.headline)}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:28px;">
          <div style="display:flex;align-items:center;gap:24px;">
            <div style="width:48px;height:48px;border-radius:50%;
              background:#2E2E2E;display:flex;align-items:center;
              justify-content:center;flex-shrink:0;">
              <span style="font-size:26px;color:white;font-weight:700;">&#x2715;</span>
            </div>
            <span style="font-size:34px;font-weight:600;color:#2E2E2E;">A computer science degree</span>
          </div>
          <div style="display:flex;align-items:center;gap:24px;">
            <div style="width:48px;height:48px;border-radius:50%;
              background:#2E2E2E;display:flex;align-items:center;
              justify-content:center;flex-shrink:0;">
              <span style="font-size:26px;color:white;font-weight:700;">&#x2715;</span>
            </div>
            <span style="font-size:34px;font-weight:600;color:#2E2E2E;">Any coding knowledge</span>
          </div>
          <div style="width:100%;height:1px;background:#2E2E2E;opacity:0.1;"></div>
          <div style="display:flex;align-items:center;gap:24px;">
            <div style="width:48px;height:48px;border-radius:50%;
              background:${theme.primary};display:flex;align-items:center;
              justify-content:center;flex-shrink:0;">
              <span style="font-size:26px;color:white;font-weight:700;">&#x2713;</span>
            </div>
            <span style="font-size:34px;font-weight:700;color:#2E2E2E;">Just this. That&rsquo;s it.</span>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:inline-flex;background:${theme.primary};
            border-radius:30px;padding:14px 32px;">
            <span style="font-size:20px;font-weight:700;color:white;">${h(post.cta)}</span>
          </div>
          <div style="display:flex;gap:10px;">
            ${post.hashtags.slice(0, 2).map(tag =>
              `<span style="font-size:15px;color:rgba(46,46,46,0.35);">#${h(tag)}</span>`
            ).join("")}
          </div>
        </div>
      </div>
    `,

    "typography-poster": `
      <div style="position:relative;width:${width}px;height:${height}px;
        background:#F9F9F9;overflow:hidden;
        display:flex;flex-direction:column;
        justify-content:center;padding:60px 70px;gap:0;">

        <div style="position:absolute;top:0;left:0;right:0;height:12px;
          background:${theme.primary};"></div>

        <span style="position:absolute;top:30px;right:65px;
          font-family:'Space Mono',monospace;font-size:16px;
          color:rgba(46,46,46,0.35);">CodeLess</span>

        ${post.headline.split(" ").map((word, i) => `
          <div style="font-size:${i === 0 ? 148 : i === 1 ? 120 : 96}px;
            font-weight:800;line-height:0.92;
            color:${i % 2 === 0 ? "#2E2E2E" : theme.primary};
            font-family:'Inter',sans-serif;word-break:break-all;">
            ${h(word)}
          </div>
        `).join("")}

        <div style="position:absolute;bottom:60px;left:70px;right:70px;
          display:flex;justify-content:space-between;align-items:center;
          border-top:2px solid rgba(46,46,46,0.1);padding-top:24px;">
          <span style="font-size:20px;font-weight:600;color:#2E2E2E;">
            ${h(post.cta)}
          </span>
          <div style="display:flex;gap:12px;">
            ${post.hashtags.slice(0, 2).map(tag =>
              `<span style="font-size:15px;color:rgba(46,46,46,0.35);">#${h(tag)}</span>`
            ).join("")}
          </div>
        </div>
      </div>
    `,

    "minimal-card": `
      <div style="position:relative;width:${width}px;height:${height}px;
        background:white;overflow:hidden;
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        padding:100px 120px;">

        <div style="position:absolute;top:60px;
          display:flex;flex-direction:column;align-items:center;gap:10px;">
          <span style="font-family:'Space Mono',monospace;font-size:18px;
            color:#2E2E2E;letter-spacing:0.05em;">CodeLess</span>
          <div style="width:30px;height:2px;background:${theme.primary};"></div>
        </div>

        <div style="display:flex;flex-direction:column;
          align-items:center;gap:40px;text-align:center;">
          <div style="font-size:72px;font-weight:800;color:#2E2E2E;
            line-height:1.05;max-width:840px;word-wrap:break-word;">
            ${h(post.headline)}
          </div>
          <div style="width:100px;height:5px;border-radius:3px;
            background:${theme.primary};"></div>
          <div style="font-size:28px;font-weight:400;
            color:rgba(46,46,46,0.55);line-height:1.5;max-width:700px;">
            ${h(post.caption.substring(0, 100))}
          </div>
        </div>

        <div style="position:absolute;bottom:65px;
          display:flex;flex-direction:column;align-items:center;gap:18px;">
          <div style="display:inline-flex;background:${theme.primary};
            border-radius:30px;padding:14px 40px;">
            <span style="font-size:20px;font-weight:700;color:white;">
              ${h(post.cta)}
            </span>
          </div>
          <div style="display:flex;gap:14px;">
            ${post.hashtags.slice(0, 3).map(tag =>
              `<span style="font-size:15px;color:rgba(46,46,46,0.3);">#${h(tag)}</span>`
            ).join("")}
          </div>
        </div>
      </div>
    `,

    "gradient-overlay": `
      <div style="position:relative;width:${width}px;height:${height}px;overflow:hidden;">

        <div style="position:absolute;inset:0;">${imageTag}</div>

        <div style="position:absolute;inset:0;
          background:linear-gradient(to top,
            rgba(20,20,20,0.95) 0%,
            rgba(20,20,20,0.50) 45%,
            transparent 100%);">
        </div>

        <div style="position:absolute;top:0;left:0;right:0;
          display:flex;justify-content:space-between;align-items:center;
          padding:50px 60px;">
          <span style="font-family:'Space Mono',monospace;font-size:22px;
            color:white;font-weight:400;">CodeLess</span>
          <div style="width:44px;height:44px;border-radius:50%;
            background:${theme.primary};"></div>
        </div>

        <div style="position:absolute;bottom:0;left:0;right:0;
          padding:0 60px 70px;display:flex;flex-direction:column;gap:20px;">

          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            ${post.hashtags.slice(0, 3).map(tag =>
              `<span style="font-size:18px;color:rgba(255,255,255,0.6);">#${h(tag)}</span>`
            ).join("")}
          </div>

          <div style="font-size:72px;font-weight:800;color:white;
            line-height:1.05;max-width:960px;word-wrap:break-word;">
            ${h(post.headline)}
          </div>

          <div style="display:inline-flex;align-self:flex-start;
            background:${theme.primary};border-radius:30px;padding:14px 36px;">
            <span style="font-size:20px;font-weight:700;color:${theme.textDark};">
              ${h(post.cta)}
            </span>
          </div>

        </div>
      </div>
    `,

    "bold-statement": `
      <div style="position:relative;width:${width}px;height:${height}px;
        background:${theme.primary};overflow:hidden;
        display:flex;align-items:center;justify-content:center;">

        <div style="position:absolute;width:700px;height:700px;
          border-radius:50%;border:2px solid rgba(255,255,255,0.08);
          top:-200px;right:-150px;pointer-events:none;"></div>

        <span style="position:absolute;top:55px;left:60px;
          font-family:'Space Mono',monospace;font-size:22px;
          color:rgba(255,255,255,0.55);">CodeLess</span>

        <div style="display:flex;flex-direction:column;
          align-items:center;gap:32px;text-align:center;padding:0 80px;">

          <span style="font-size:18px;color:rgba(255,255,255,0.55);
            letter-spacing:0.15em;text-transform:uppercase;">
            Learn to lead, not to code.
          </span>

          <div style="font-size:86px;font-weight:800;color:${theme.text};
            line-height:1.0;max-width:900px;word-wrap:break-word;">
            ${h(post.headline)}
          </div>

          <div style="width:80px;height:2px;background:rgba(255,255,255,0.25);"></div>

          <span style="font-size:26px;font-weight:500;color:rgba(255,255,255,0.8);">
            ${h(post.cta)}
          </span>

        </div>

        <div style="position:absolute;bottom:55px;
          display:flex;gap:20px;justify-content:center;left:0;right:0;">
          ${post.hashtags.slice(0, 2).map(tag =>
            `<span style="font-size:18px;color:rgba(255,255,255,0.4);">#${h(tag)}</span>`
          ).join("")}
        </div>

      </div>
    `,

    "split-layout": `
      <div style="display:flex;width:${width}px;height:${height}px;overflow:hidden;">

        <div style="display:flex;flex-direction:column;
          width:${Math.floor(width / 2)}px;min-width:${Math.floor(width / 2)}px;
          height:${height}px;background:${theme.secondary};padding:60px;
          justify-content:space-between;">

          <span style="font-family:'Space Mono',monospace;font-size:18px;
            color:${theme.primary};">CodeLess</span>

          <div style="display:flex;flex-direction:column;gap:24px;">
            <div style="font-size:58px;font-weight:700;color:white;
              line-height:1.1;word-wrap:break-word;">
              ${h(post.headline)}
            </div>
            <span style="font-size:22px;font-weight:600;color:${theme.primary};">
              ${h(post.cta)}
            </span>
          </div>

          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            ${post.hashtags.slice(0, 2).map(tag =>
              `<span style="font-size:15px;color:rgba(255,255,255,0.35);">#${h(tag)}</span>`
            ).join("")}
          </div>

        </div>

        <div style="width:4px;min-width:4px;height:${height}px;
          background:${theme.primary};"></div>

        <div style="flex:1;height:${height}px;overflow:hidden;">${imageTag}</div>

      </div>
    `,

    "geometric-bold": `
      <div style="position:relative;width:${width}px;height:${height}px;
        background:${theme.primary};overflow:hidden;">

        <div style="position:absolute;width:580px;height:580px;
          background:rgba(255,255,255,0.10);border-radius:40px;
          top:-180px;right:-120px;transform:rotate(20deg);"></div>

        <span style="position:absolute;top:55px;left:60px;
          font-family:'Space Mono',monospace;font-size:22px;
          color:rgba(255,255,255,0.65);">CodeLess</span>

        <div style="position:absolute;top:${Math.round(height * 0.22)}px;left:60px;
          font-size:74px;font-weight:800;color:white;
          line-height:1.0;max-width:560px;word-wrap:break-word;">
          ${h(post.headline)}
        </div>

        ${imgSrc ? `
          <div style="position:absolute;right:60px;top:${Math.round(height * 0.20)}px;
            width:290px;height:290px;border-radius:50%;
            overflow:hidden;border:4px solid white;">
            ${imageTag}
          </div>
        ` : ""}

        <div style="position:absolute;bottom:0;left:0;right:0;
          height:${Math.round(height * 0.28)}px;background:#2E2E2E;
          display:flex;align-items:center;padding:0 60px;
          justify-content:space-between;">
          <span style="font-size:19px;color:rgba(255,255,255,0.6);
            max-width:65%;line-height:1.4;">
            ${h(post.caption.substring(0, 90))}...
          </span>
          <span style="font-size:20px;font-weight:700;color:${theme.primary};
            white-space:nowrap;margin-left:20px;">
            ${h(post.cta)}
          </span>
        </div>

      </div>
    `,
  }

  const body = templates[templateId] || templates["gradient-overlay"]

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=${width}">
  <style>${baseCSS}</style>
</head>
<body>${body}</body>
</html>`
}

module.exports = { buildTemplateHTML }
