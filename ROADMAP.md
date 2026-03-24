# PostStudio — Full Product Roadmap
## From internal CodeLess tool → Multi-tenant AI-powered social media SaaS

---

## WHERE WE ARE TODAY (Completed)

✓ AI copy generation (Claude API)
✓ Image generation (6 models — FLUX, Nano Banana, Recraft, Ideogram)
✓ 10 predefined HTML templates
✓ Puppeteer export (PNG/JPG) via Cloud Run
✓ Basic Fabric.js canvas editor (broken but exists)
✓ Cloud Run backend (Node.js + Express)
✓ Vercel frontend (Next.js)
✓ Brand hardcoded to CodeLess

---

## PHASE 1 — Foundation
### Make it a real product anyone can use
**Estimated: 3-4 weeks**

### 1.1 — User Authentication
- Email/password signup and login via NextAuth.js
- Google OAuth (one-click login)
- JWT sessions stored in database
- Protected routes — redirect to login if not authenticated
- Password reset via email

### 1.2 — Database Setup (Neon PostgreSQL)
Schema:

```sql
users
  id, email, password_hash, name, avatar_url,
  created_at, plan (free/pro/agency)

brand_profiles
  id, user_id, name, tagline,
  primary_color, secondary_color, accent_color,
  font_family, tone_of_voice, description,
  audience, logo_url, website_url,
  created_at, updated_at

generated_posts
  id, user_id, brand_id, platform,
  goal, brief, headline, caption,
  hashtags, cta, image_url, image_model,
  template_id, canvas_state (JSON),
  exported_at, created_at

post_history
  id, user_id, post_id, action,
  created_at
```

### 1.3 — Brand Onboarding Flow
New user signs up → guided 4-step onboarding:

**Step 1 — Enter website URL**
User pastes their website → backend fetches it →
Claude analyzes the page and extracts:
- Brand name
- Primary colors (from CSS)
- Tone of voice (from copy)
- Business description
- Target audience
Auto-fills the brand profile form. User reviews and edits.

**Step 2 — Manual brand details**
- Color picker (primary, secondary, accent)
- Font family selector
- Tone of voice (dropdown + free text)
- Logo upload (stored in Cloud Storage)

**Step 3 — Brand preview**
Shows a live preview of how their brand looks
applied to one of the 10 templates

**Step 4 — Done**
→ Redirect to /create with their brand loaded

### 1.4 — Multi-brand support
- Users can have multiple brand profiles
- Brand switcher in the top navigation
- Each post is associated with a specific brand
- Agency plan: up to 10 brands

---

## PHASE 2 — Canvas Editor Rebuild
### Replace broken Fabric.js with a proper implementation
**Estimated: 3-4 weeks**

### 2.1 — Fabric.js v6 Proper Setup
Fix the core issues from the screenshot:
- Canvas initializes at exact platform dimensions (1080x1080)
- Image loads and fills the canvas correctly (cover/fit/fill modes)
- Correct CSS scaling for preview (transform: scale)
- Proper initialization sequence

### 2.2 — Text Editing Panel (the most important feature)
- Double-click any text to edit inline (IText)
- Font family picker with Google Fonts (50+ fonts)
- Font size slider (8-200px)
- Font weight (Regular/Medium/Bold/ExtraBold)
- Color picker with brand palette swatches + free picker
- Text alignment (left/center/right)
- Line height control
- Letter spacing control
- Italic and underline toggles

### 2.3 — Image Controls Panel
- Fill modes: Cover / Fit / Stretch / Original
- Brightness slider (-100 to +100)
- Contrast slider
- Saturation slider
- Blur slider
- Opacity slider
- Flip horizontal / vertical
- Bring forward / Send backward

### 2.4 — Canvas Tools
- Add Text button
- Add Shape (rect, circle, line)
- Add Image (upload from device)
- Background color picker
- Background image upload
- Grid toggle (show/hide alignment grid)

### 2.5 — Undo/Redo System
- Full history stack (Ctrl+Z / Ctrl+Y)
- Up to 50 history states
- History panel showing list of actions
- Revert to any point in history

### 2.6 — Alignment and Snap
- Snap to canvas center (horizontal and vertical)
- Snap to other objects
- Blue guide lines appear when aligned
- Align selected objects: left, center, right, top, middle, bottom
- Distribute evenly (horizontal/vertical)

### 2.7 — Layer Management
- Layer list panel showing all objects
- Drag to reorder layers
- Lock/unlock individual layers
- Show/hide individual layers
- Rename layers
- Group/ungroup selected objects

### 2.8 — Keyboard Shortcuts
- Ctrl+Z / Ctrl+Y — undo/redo
- Delete / Backspace — delete selected
- Ctrl+C / Ctrl+V — copy/paste
- Ctrl+D — duplicate
- Arrow keys — nudge (1px), Shift+Arrow (10px)
- Ctrl+A — select all
- Escape — deselect
- Ctrl+G — group selected

### 2.9 — Canvas State Save
- Auto-save canvas JSON to database every 30 seconds
- "Saved" indicator in toolbar
- Load saved state when reopening a post
- Full restore of all objects, positions, styles

---

## PHASE 3 — AI Template Generation
### The most differentiated capability
**Estimated: 2-3 weeks**

### 3.1 — Dynamic Template Variations
The 10 existing templates are static HTML.
Make them dynamic — Claude generates variations:

User says: "I want something more minimal"
→ Claude gets the current template's HTML structure
→ Claude generates a modified version with different:
  - Layout proportions
  - Typography scale
  - Color distribution
  - Spacing
→ New template renders instantly
→ User can save it as a custom template

### 3.2 — AI Template Generator (new templates from scratch)
User describes what they want:
"A template with a dark background, large centered number,
and a subtle gradient border"

→ Claude generates the HTML/CSS template code
→ Backend validates and sanitizes the HTML
→ Puppeteer renders a preview
→ User sees it and can accept, regenerate, or edit
→ Saved as a custom template under their account

System prompt for Claude:
```
"You are a design system expert. Generate a self-contained
HTML template for a 1080x1080 Instagram post. Use only
inline CSS. Use flexbox for layout. Use the brand colors
provided. The template must have named placeholder areas
for: HEADLINE, CAPTION, CTA, HASHTAGS, IMAGE, BRAND_NAME.
Return ONLY valid HTML, nothing else."
```

### 3.3 — Template Library
- 10 predefined system templates (what we have)
- User's custom AI-generated templates (saved to DB)
- Community templates (users can publish their templates)
- Template categories: Minimal, Bold, Photo, Typography, Data
- Template search
- Template preview at small scale
- One-click apply to current post

### 3.4 — Template Intelligence
Claude looks at the post content and suggests the best template:
- Short punchy headline → suggests Typography Poster or Bold Statement
- Long caption + photo → suggests Gradient Overlay or Split Layout
- Number/stat in headline → suggests Stat Card automatically
- This happens automatically after copy generation

### 3.5 — Template Personalization
When a template is selected, Claude automatically:
- Adjusts font size so headline fits without overflow
- Picks the best color theme based on the image colors
- Positions elements to avoid covering the subject in the photo
- Suggests alternative layouts if the content doesn't fit

---

## PHASE 4 — Social Media Publishing
### Direct publish from PostStudio
**Estimated: 3-4 weeks**

### 4.1 — LinkedIn Publishing (start here — easiest API)
- OAuth connection to LinkedIn Company Page
- One-click publish: image + caption + hashtags
- Character count validation (LinkedIn limits)
- Post preview exactly as it will appear
- Publish status: queued → published → failed
- View published post link

### 4.2 — Post Scheduling
- Date and time picker
- Timezone support
- Cloud Scheduler (GCP) fires the publish at the right time
- Scheduled posts calendar view
- Edit or cancel scheduled posts
- Best time suggestions based on platform data

### 4.3 — Facebook + Instagram Publishing
- Meta Business API OAuth
- Facebook Page publishing
- Instagram Business Account publishing
- Stories format (separate canvas size 1080x1920)
- Carousel posts (multiple images)
- Hashtag suggestions

### 4.4 — Publishing Queue
- Queue multiple posts
- Drag to reorder
- Bulk schedule (e.g. 3 posts per week automatically spread)
- Queue dashboard showing all upcoming posts

---

## PHASE 5 — Brandbook Generator
### Leverages Puppeteer already in the stack
**Estimated: 2 weeks**

### 5.1 — Auto-generated Brandbook PDF
From the user's brand profile → generate a full brandbook:

Pages:
1. Cover page (brand name + primary color)
2. Brand story (description + audience)
3. Color palette (swatches + hex codes + usage rules)
4. Typography (font specimens at all weights)
5. Logo usage (correct + incorrect usage)
6. Tone of voice (keywords + do/don't examples)
7. Social media templates preview (all 10 templates)
8. Photography style guide

Puppeteer renders each page at A4 size →
sharp combines them into a single PDF →
User downloads a professional brandbook

### 5.2 — Brandbook Customization
- Choose which pages to include
- Custom cover colors
- Add custom pages (text + image)
- Export as PDF or individual PNG pages

---

## PHASE 6 — Analytics + Content Calendar
**Estimated: 3 weeks**

### 6.1 — Post Analytics
After publishing, pull data from Meta/LinkedIn APIs:
- Impressions, reach, engagement rate
- Likes, comments, shares, saves
- Click-through rate
- Best performing posts ranked
- Performance by template type
- Performance by time of day

### 6.2 — Content Calendar
- Monthly calendar view
- All scheduled + published posts visible
- Drag to reschedule
- Color coded by platform (Instagram=pink, LinkedIn=blue, Facebook=navy)
- Empty slot suggestions: "You haven't posted on Wednesday this month"

### 6.3 — AI Content Suggestions
Based on performance data:
- "Your Stat Card template gets 3x more engagement than Gradient Overlay"
- "Posts published Tuesday at 11am get the most reach"
- "Hashtag #TechGeorgia is outperforming #CareerChange for your audience"

---

## PHASE 7 — Monetization
**Estimated: 2 weeks**

### 7.1 — Subscription Tiers

**FREE**
- 1 brand profile
- 5 exports per month
- 10 predefined templates
- No publishing
- No scheduling

**PRO ($19/month)**
- 3 brand profiles
- Unlimited exports
- All 10 templates + AI template generation
- LinkedIn publishing
- Scheduling (up to 30 posts/month)
- Analytics (last 30 days)

**AGENCY ($49/month)**
- 10 brand profiles
- Unlimited everything
- All platforms (LinkedIn + Instagram + Facebook)
- Unlimited scheduling
- Full analytics history
- Brandbook generator
- Priority support

### 7.2 — Stripe Integration
- Stripe Checkout for subscription
- Stripe Customer Portal for billing management
- Webhook for subscription events (created, cancelled, upgraded)
- Usage limits enforced server-side
- Upgrade prompts at limit boundaries

---

## PHASE 8 — Editor Upgrade
### When revenue justifies it
**Estimated: 1 week of integration**

### 8.1 — Migrate to Polotno SDK or IMG.LY
Once you have paying users and revenue:
- Apply for Polotno Grass Roots program (~$90/month if approved)
- Or budget for IMG.LY CE.SDK (~$13K/year = ~$1100/month)
- Migration is mostly replacing the canvas component
- Everything else (templates, export, publishing) stays the same

### 8.2 — Advanced Editor Features (SDK-level)
- Background removal (one click)
- Image upscaling
- Magic resize (one design → all platform sizes)
- Animation and motion
- Video support
- Collaboration (multiple users editing same post)

---

## PHASE 9 — Platform Expansion
### Long term (6+ months out)

- Mobile app (React Native + Konva/Fabric mobile)
- Chrome extension (create posts without opening app)
- Figma plugin (export Figma frames as social posts)
- API access for developers (generate posts programmatically)
- White-label (agencies resell PostStudio under their brand)
- AI video posts (short Reels/TikTok from static templates)

---

## COMPLETE BUILD ORDER

```
NOW (already built):
✓ Core generation flow
✓ 10 templates
✓ Cloud Run backend
✓ Puppeteer export

PHASE 1 — Auth + Database (3-4 weeks)
  → PostStudio becomes a real multi-user product

PHASE 2 — Canvas Editor Rebuild (3-4 weeks)
  → Editor actually works properly

PHASE 3 — AI Template Generation (2-3 weeks)
  → Most differentiated feature vs competitors
  → Users can create unlimited templates
  → Templates adapt to content automatically

PHASE 4 — LinkedIn Publishing (3-4 weeks)
  → Removes the biggest friction (manual upload)
  → Scheduling = huge value add

PHASE 5 — Brandbook Generator (2 weeks)
  → New product surface, leverages existing stack
  → Additional revenue justification for Pro plan

PHASE 6 — Analytics + Calendar (3 weeks)
  → Retention feature — users come back daily

PHASE 7 — Stripe Billing (2 weeks)
  → Product starts generating revenue

PHASE 8 — Editor Upgrade (1 week)
  → Now you have budget for Polotno/IMG.LY

PHASE 9 — Platform Expansion
  → Mobile, API, white-label

TOTAL TIMELINE: ~6 months to Phase 7 (revenue)
```

---

## THE AI TEMPLATE GENERATION DETAIL
### Phase 3.2 expanded — the most differentiated feature

**How it works technically:**

1. User clicks "Generate New Template"
2. They describe what they want in plain language:
   `"Dark background, big centered quote, orange accent, very minimal, feels like a luxury brand"`

3. Backend sends to Claude with this system prompt:
```
"You are an expert HTML/CSS designer specializing in
Instagram post templates (1080x1080px).

Generate a complete, self-contained HTML template.
Rules:
- Only inline CSS, no external stylesheets
- Only flexbox layout, no CSS grid
- Include placeholder spans with these exact IDs:
  #headline, #caption, #cta, #hashtags, #brand-name
- Use these brand colors: [primary], [secondary], [accent]
- Font family: [user's font]
- Must look professional and Instagram-native
- Return ONLY the HTML, no explanation

User request: [their description]"
```

4. Claude returns HTML
5. Backend sanitizes HTML (remove scripts, external URLs)
6. Puppeteer renders it at 1080x1080 for preview
7. User sees the preview instantly
8. Options: Accept → Save to library, Regenerate, Edit in Canvas

**Why this is powerful:**
- Unlimited templates, not just 10
- Every user gets templates tuned to their brand
- Templates adapt to the actual content
- Becomes more valuable as users build their library
- Templates can be shared between users → community library

---

## KEY TECHNICAL DECISIONS

| Concern | Decision | Reason |
|---------|----------|--------|
| Canvas editor | Fabric.js v6 properly built | Free, good enough, we own it |
| Editor upgrade path | Polotno (~$90/mo) or IMG.LY (~$1100/mo) | After revenue only |
| Database | Neon PostgreSQL | Serverless, generous free tier |
| Auth | NextAuth.js | Native Next.js integration |
| File storage | Google Cloud Storage | Same GCP project as Cloud Run |
| Billing | Stripe | Industry standard |
| Publishing | LinkedIn API first, Meta API second | LinkedIn is easier |
| Scheduling | Google Cloud Scheduler | Same GCP project |
| AI templates | Claude generates HTML → Puppeteer previews | Leverages existing stack |
