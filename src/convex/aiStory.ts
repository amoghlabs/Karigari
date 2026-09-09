import { action } from "./_generated/server";
import { v } from "convex/values";
import { PRODUCT_CATEGORIES } from "./schema";

/* ------------------------------------------------------------------ */
/* Curated fallback content — used when no LLM key is configured yet.  */
/* ------------------------------------------------------------------ */

type Template = {
  story: (name: string) => string;
  bio: (name: string) => string;
  storyHi: (name: string) => string;
  bioHi: (name: string) => string;
  shopSuffix: string;
  shopSuffixHi: string;
  desc: (voice: string) => string;
  descHi: (voice: string) => string;
};

const TEMPLATES: Record<string, Template> = {
  "Pottery & Terracotta": {
    story: (n) =>
      `${n} learned this craft at the wheel as a child and has never left it. Every piece is thrown, shaped and fired by hand — clay pulled from the same earth their family has worked for generations, finished with traditional glazes and motifs. Nothing leaves the workshop until it has been fired once, cooled, and checked by eye.`,
    bio: (n) => `Hand-thrown pottery and terracotta, made one piece at a time.`,
    storyHi: (n) =>
      `${n} ने यह हुनर बचपन में चाक पर सीखा और आज तक इसे छोड़ा नहीं। हर चीज़ हाथ से बनती है — वही मिट्टी जो पीढ़ियों से उनके परिवार की ज़मीन से आती है, पारंपरिक रंगों और आकृतियों के साथ। जब तक चीज़ पककर ठंडी नहीं हो जाती और आँख से नहीं जाँची जाती, तब तक वह कारखाने से नहीं निकलती।`,
    bioHi: (n) => `हाथ से बने मिट्टी के बर्तन, एक-एक करके।`,
    shopSuffix: "Pottery",
    shopSuffixHi: "मृत्तिका",
    desc: (voice) =>
      `Made by hand ${voice ? `— the maker told us: “${voice}”` : "from natural clay, fired and finished traditionally"}. Each piece is one of a kind, with the small marks of the hands that made it.`,
    descHi: (voice) =>
      `हाथ से बनी चीज़ ${voice ? `— कारीगर ने बताया: “${voice}”` : "— प्राकृतिक मिट्टी से, पारंपरिक तरीके से पकाई गई"}। हर चीज़ अनोखी है, उसमें बनाने वाले हाथों के निशान हैं।`,
  },
  "Handloom Textiles": {
    story: (n) =>
      `${n} weaves on a traditional handle-loom, threading cotton and silk the way it has been done for centuries. The yarn is dyed in small batches with natural colour, and every drape, dupatta and stole is finished with hand-tied fringes. Each piece takes days — and the patience shows in the weave.`,
    bio: (n) => `Handloom cloth, woven slowly on a traditional loom.`,
    storyHi: (n) =>
      `${n} पारंपरिक हथकरघे पर बुनते हैं — वही धागा जो सदियों से चलता आया है। धागे को प्राकृतिक रंगों से छोटे बैच में रंगा जाता है, और हर दुपट्टा-साड़ी हाथ से बने झालर के साथ पूरी होती है। हर चीज़ में कई दिन लगते हैं — और यह धैर्य बुनाई में दिखता है।`,
    bioHi: (n) => `हथकरघे पर धीरे-धीरे बुना हुआ कपड़ा।`,
    shopSuffix: "Handlooms",
    shopSuffixHi: "हथकरघा",
    desc: (voice) =>
      `Woven by hand on a traditional loom ${voice ? `— the maker told us: “${voice}”` : "from natural yarn, dyed in small batches"}. Gentle to the touch and made to last for years.`,
    descHi: (voice) =>
      `पारंपरिक करघे पर हाथ से बुनी चीज़ ${voice ? `— कारीगर ने बताया: “${voice}”` : "— प्राकृतिक धागे से, छोटे बैच में रंगी गई"}। छूने में मुलायम और सालों तक चलने वाली।`,
  },
  "Block Printing": {
    story: (n) =>
      `${n} prints fabric the old way — hand-carved wooden blocks, dipped in natural dye and pressed firmly on cloth, motif by motif. Each impression is manual, so no two pieces are exactly alike. This is a craft of patience and rhythm, learned from elders and kept alive one print at a time.`,
    bio: (n) => `Hand block-printed fabric, pressed motif by motif.`,
    storyHi: (n) =>
      `${n} कपड़े पर पुराने तरीके से छपाई करते हैं — हाथ से खोदे गए लकड़ी के ठप्पे, प्राकृतिक रंग में डूबे, और एक-एक बेल कपड़े पर दबाई जाती है। हर छाप हाथ की है, इसलिए कोई दो चीज़ें एक जैसी नहीं होतीं। यह धैर्य और लय का हुनर है — बड़ों से सीखा और एक-एक छाप के साथ ज़िंदा रखा।`,
    bioHi: (n) => `हाथ से ब्लॉक छपाई वाला कपड़ा।`,
    shopSuffix: "Block Prints",
    shopSuffixHi: "ब्लॉक छपाई",
    desc: (voice) =>
      `Hand-printed with carved wooden blocks and natural dyes ${voice ? `— the maker told us: “${voice}”` : ""}. Lively pattern, comfortable cloth — the block printer's signature.`,
    descHi: (voice) =>
      `खोदे गए लकड़ी के ठप्पों और प्राकृतिक रंगों से हाथ से छपी चीज़ ${voice ? `— कारीगर ने बताया: “${voice}”` : ""}। रंग-बिरंगी बेल, आरामदायक कपड़ा।`,
  },
  Jewelry: {
    story: (n) =>
      `${n} works in the old jewellery traditions — each piece shaped, set and polished by hand. Gold and silver are handled carefully, stones are set with patience, and the finish is checked under a jeweller's eye before it reaches you. These are pieces made to be worn daily and passed down.`,
    bio: (n) => `Handmade jewellery, set and polished by hand.`,
    storyHi: (n) =>
      `${n} पुरानी परंपरा के आभूषण बनाते हैं — हर टुकड़ा हाथ से बनता है, जड़ा जाता है और चमकाया जाता है। सोना-चाँदी सँभालकर, पत्थर धैर्य से बैठाए जाते हैं, और आप तक पहुँचने से पहले हर चीज़ जौहरी की नज़र से जाँची जाती है। ऐसे आभूषण जो रोज़ पहने जाएँ और आगे चले जाएँ।`,
    bioHi: (n) => `हाथ से बने आभूषण — हाथ से जड़े और चमकाए।`,
    shopSuffix: "Jewels",
    shopSuffixHi: "आभूषण",
    desc: (voice) =>
      `Handmade jewellery ${voice ? `— the maker told us: “${voice}”` : "crafted, set and polished by hand"}. Light, comfortable, and finished to be worn every day.`,
    descHi: (voice) =>
      `हाथ से बना आभूषण ${voice ? `— कारीगर ने बताया: “${voice}”` : "— हाथ से जड़ा और चमकाया गया"}। हल्का, आरामदायक, रोज़ पहनने लायक।`,
  },
  Woodwork: {
    story: (n) =>
      `${n} carves and joins wood by hand — no shortcuts, no machines that hide the work. Seasoned timber is chosen piece by piece, shaped with hand tools, and finished with natural oils. The grain of every plank tells its own story, and ${n}'s hands simply help it along.`,
    bio: (n) => `Hand-carved woodwork, finished with natural oils.`,
    storyHi: (n) =>
      `${n} लकड़ी हाथ से तराशते और जोड़ते हैं — न कोई शॉर्टकट, न ऐसी मशीन जो मेहनत छिपा दे। सूखी लकड़ी टुकड़ा-टुकड़ा चुनी जाती है, हाथ के औज़ारों से आकार दी जाती है, और प्राकृतिक तेल से सजती है। हर पट्टी की बनावट अपनी कहानी कहती है — ${n} के हाथ बस उसे पूरा करते हैं।`,
    bioHi: (n) => `हाथ से तराशी लकड़ी, प्राकृतिक तेल से तैयार।`,
    shopSuffix: "Woodcraft",
    shopSuffixHi: "काष्ठ",
    desc: (voice) =>
      `Hand-carved from seasoned wood and finished with natural oil ${voice ? `— the maker told us: “${voice}”` : ""}. Solid, warm and made to be used daily.`,
    descHi: (voice) =>
      `सूखी लकड़ी से हाथ से तराशी और प्राकृतिक तेल से तैयार चीज़ ${voice ? `— कारीगर ने बताया: “${voice}”` : ""}। मज़बूत, गर्म और रोज़-इस्तेमाल के लिए।`,
  },
  Metalwork: {
    story: (n) =>
      `${n} casts and hammers metal using techniques passed down through generations. Wax models, lost-wax casting, careful polishing — every piece carries the rhythm of a craft that predates machines. The finish is honest: nothing is plated or hidden, only shaped by fire and hand.`,
    bio: (n) => `Traditional lost-wax metal casting and finishing.`,
    storyHi: (n) =>
      `${n} धातु को पीढ़ियों से चली आ रही तकनीक से ढालते और पीटते हैं। मोम के नमूने, खोई हुई मोम की ढलाई, हाथ से चमकाना — हर चीज़ में उस हुनर की लय है जो मशीनों से भी पुराना है। बनावट सच्ची है — कुछ भी चढ़ा-छिपाया नहीं, सिर्फ़ आग और हाथ से बनी।`,
    bioHi: (n) => `पारंपरिक ढलाई और हाथ से तैयार धातु शिल्प।`,
    shopSuffix: "Metal Arts",
    shopSuffixHi: "धातु",
    desc: (voice) =>
      `Cast and finished by hand using generations-old technique ${voice ? `— the maker told us: “${voice}”` : ""}. Solid, characterful, and built to last.`,
    descHi: (voice) =>
      `पीढ़ियों पुरानी तकनीक से हाथ द्वारा ढाली और तैयार की गई चीज़ ${voice ? `— कारीगर ने बताया: “${voice}”` : ""}। मज़बूत, अपनी पहचान वाली और सालों चलने वाली।`,
  },
  "Bamboo & Cane": {
    story: (n) =>
      `${n} weaves bamboo and cane the way the forests taught their elders — splitting, soaking and bending by hand until the frame takes shape. Baskets, mats and furniture are built to serve for years, and nothing is wasted. Every curve is a memory of the hands that coaxed it.`,
    bio: (n) => `Handwoven bamboo and cane work, split and bent by hand.`,
    storyHi: (n) =>
      `${n} बाँस और बेत को उसी तरह बुनते हैं जैसे जंगलों ने बड़ों को सिखाया — हाथ से चीरना, भिगोना और मोड़ना, जब तक आकार न बन जाए। टोकरियाँ, चटाई और फ़र्नीचर सालों चलने के लिए बनते हैं, और कुछ भी बेकार नहीं जाता। हर मोड़ उन हाथों की याद है जिन्होंने उसे आकार दिया।`,
    bioHi: (n) => `हाथ से बुनी बाँस-बेत की चीज़ें।`,
    shopSuffix: "Cane Works",
    shopSuffixHi: "बेत",
    desc: (voice) =>
      `Handwoven from natural bamboo and cane ${voice ? `— the maker told us: “${voice}”` : ""}. Light, strong and woven to last.`,
    descHi: (voice) =>
      `प्राकृतिक बाँस और बेत से हाथ से बुनी चीज़ ${voice ? `— कारीगर ने बताया: “${voice}”` : ""}। हल्की, मज़बूत और सालों चलने वाली।`,
  },
};

function fallbackTemplate(craft: string) {
  return TEMPLATES[craft] ?? TEMPLATES["Pottery & Terracotta"];
}

function guessFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name.trim() || "the artisan";
}

function buildFallback(onboard: {
  craft: string;
  name: string;
  voiceNote: string;
}) {
  const tpl = fallbackTemplate(onboard.craft);
  const first = guessFirstName(onboard.name);
  const base = onboard.name.trim() || "My Studio";
  return {
    story: tpl.story(first),
    bio: tpl.bio(first),
    storyHi: tpl.storyHi(first),
    bioHi: tpl.bioHi(first),
    shopName: `${base} ${tpl.shopSuffix}`.trim(),
    shopNameHi: `${base} ${tpl.shopSuffixHi}`.trim(),
    description: tpl.desc(onboard.voiceNote.trim()),
    descriptionHi: tpl.descHi(onboard.voiceNote.trim()),
  };
}

function buildFallbackListing(input: {
  craft: string;
  title: string;
  voiceNote: string;
}) {
  const tpl = fallbackTemplate(input.craft);
  return {
    description: tpl.desc(input.voiceNote.trim()),
    descriptionHi: tpl.descHi(input.voiceNote.trim()),
    titleHint: input.title.trim() || input.voiceNote.trim().slice(0, 60),
  };
}

/* ------------------------------------------------------------------ */
/* Real LLM path — used when OPENAI_API_KEY is configured.            */
/* ------------------------------------------------------------------ */

async function callOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("No key");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You write warm, respectful storytelling copy for Indian artisans selling on a craft marketplace. Keep it simple, human and honest — short sentences, no hype. Reply with plain JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM request failed: ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "";
  const json = content.replace(/```json|```/g, "").trim();
  const match = json.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Unparseable LLM response");
  return match[0];
}

export const generateStory = action({
  args: {
    craft: v.string(),
    name: v.string(),
    voiceNote: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const fallback = buildFallback({
      craft: args.craft,
      name: args.name,
      voiceNote: args.voiceNote ?? "",
    });
    if (!process.env.OPENAI_API_KEY) return fallback;

    try {
      const raw = await callOpenAI(`
        An Indian artisan named "${args.name}" makes "${args.craft}". They said about their work: "${args.voiceNote ?? ""}".
        Return JSON with exactly these fields:
        "story" (60-90 words, English, about their craft origin, technique and cultural significance),
        "bio" (a short one-line English bio),
        "storyHi" (the story in simple Hindi, Devanagari script),
        "bioHi" (one-line Hindi bio),
        "shopName" (English studio name suggestion using their name/craft),
        "shopNameHi" (Hindi studio name suggestion),
        "description" (2-3 sentence product description English),
        "descriptionHi" (same in Hindi).`);
      const parsed = JSON.parse(raw) as Record<string, string>;
      return {
        story: parsed.story ?? fallback.story,
        bio: parsed.bio ?? fallback.bio,
        storyHi: parsed.storyHi ?? fallback.storyHi,
        bioHi: parsed.bioHi ?? fallback.bioHi,
        shopName: parsed.shopName ?? fallback.shopName,
        shopNameHi: parsed.shopNameHi ?? fallback.shopNameHi,
        description: parsed.description ?? fallback.description,
        descriptionHi: parsed.descriptionHi ?? fallback.descriptionHi,
      };
    } catch {
      return fallback;
    }
  },
});

/* ------------------------------------------------------------------ */
/* Smart Cataloguing — derives catalog fields from the artisan's       */
/* ACTUAL inputs: their voice transcript and their uploaded photo.     */
/* ------------------------------------------------------------------ */

/**
 * Measured analysis of the artisan's uploaded photo. The browser decodes the
 * image and samples its actual pixels (canvas); this action consumes those
 * real measurements plus the voice transcript to build the catalog fields.
 */
type PhotoAnalysis = {
  ok: boolean;
  width: number;
  height: number;
  aspect: string; // "tall" | "square" | "wide"
  brightness: number; // 0-100 average luminance
  contrast: number; // 0-100 spread of luminance
  saturation: number; // 0-100 average colorfulness
  colorHexes: string[]; // top hex swatches measured from the photo
  light: "bright and evenly lit" | "soft light" | "low light";
};

const EMPTY_PHOTO: PhotoAnalysis = {
  ok: false,
  width: 0,
  height: 0,
  aspect: "square",
  brightness: 0,
  contrast: 0,
  saturation: 0,
  colorHexes: [],
  light: "soft light",
};

const COLOR_NAMES: Array<{ name: string; hi: string; r: number; g: number; b: number }> = [
  { name: "terracotta red", hi: "मिट्टी लाल", r: 184, g: 92, b: 56 },
  { name: "indigo blue", hi: "नील", r: 36, g: 57, b: 108 },
  { name: "turmeric yellow", hi: "हल्दी पीला", r: 230, g: 168, b: 44 },
  { name: "deep green", hi: "गहरा हरा", r: 46, g: 94, b: 58 },
  { name: "ivory cream", hi: "हाथी दांत", r: 250, g: 243, b: 231 },
  { name: "warm brown", hi: "भूरा", r: 121, g: 85, b: 61 },
  { name: "rust orange", hi: "गेरुआ", r: 196, g: 106, b: 51 },
  { name: "madder pink", hi: "मजीठ गुलाबी", r: 187, g: 101, b: 108 },
  { name: "charcoal black", hi: "काजल काला", r: 42, g: 41, b: 40 },
  { name: "silver grey", hi: "चाँदी स्लेटी", r: 168, g: 164, b: 158 },
];

function nearestColorName(r: number, g: number, b: number) {
  let best = COLOR_NAMES[0];
  let bestDist = Infinity;
  for (const c of COLOR_NAMES) {
    const d = (r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

/** Maps measured hex swatches to bilingual craft-palette color names. */
function colorsFromHexes(hexes: string[]) {
  const named = hexes
    .map((hex) => {
      const m = hex.replace("#", "");
      if (m.length < 6) return null;
      const r = parseInt(m.slice(0, 2), 16);
      const g = parseInt(m.slice(2, 4), 16);
      const b = parseInt(m.slice(4, 6), 16);
      return nearestColorName(r, g, b);
    })
    .filter((c): c is (typeof COLOR_NAMES)[number] => c !== null);
  return {
    colors: Array.from(new Set(named.map((c) => c.name))),
    hindiColors: Array.from(new Set(named.map((c) => c.hi))),
  };
}

/** Word overlap between the transcript and each category's keyword bank. */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Pottery & Terracotta": ["pot", "clay", "mitti", "terracotta", "vase", "bowl", "kulhad", "diya", "surahi", "planter", "matka", "handi", "ceramic", "glaze", "pitcher", "plate", "kumhar"],
  "Handloom Textiles": ["saree", "sari", "dupatta", "stole", "scarf", "weave", "loom", "handloom", "cotton", "silk", "chanderi", "banarasi", "drape", "fabric", "cloth", "kapda", "runner", "kurta", "ikat", "batch"],
  "Block Printing": ["block", "print", "ajrakh", "dabu", "bagru", "stamp", "indigo", "bedsheet", "paisley", "jaipur print", "hand print", "chhipa", "mordant"],
  Jewelry: ["necklace", "earring", "jhumka", "bangle", "ring", "kundan", "meenakari", "silver", "gold", "bracelet", "jewel", "jewellery", "jewelry", "pendant", "stud", "jeweller"],
  Woodwork: ["wood", "teak", "sheesham", "carve", "carved", "bowl", "spoon", "stool", "box", "masala", "dabba", "platter", "wooden", "lakdi", "chisel", "antique"],
  Metalwork: ["brass", "dhokra", "bell", "lamp", "cast", "metal", "copper", "thali", "statue", "idol", "peacock", "wax", "tamba", "urn", "candle"],
  "Bamboo & Cane": ["bamboo", "cane", "basket", "tokri", "woven", "weave basket", "cane bag", "lamp shade", "mat", "chattai", "bans", "wicker", "rattan"],
};

const CATEGORY_MATERIALS: Record<string, string[]> = {
  "Pottery & Terracotta": ["natural clay", "terracotta", "mineral glaze"],
  "Handloom Textiles": ["cotton yarn", "silk", "natural dye"],
  "Block Printing": ["cotton fabric", "vegetable dye", "teak block"],
  Jewelry: ["brass base", "gold plating", "glass stones"],
  Woodwork: ["seasoned wood", "natural oil finish"],
  Metalwork: ["brass", "lost-wax casting"],
  "Bamboo & Cane": ["bamboo", "cane", "cotton thread binding"],
};

const CRAFT_LABEL: Record<string, { en: string; hi: string }> = {
  "Pottery & Terracotta": { en: "hand-thrown pottery", hi: "हाथ से बना मृत्तिका शिल्प" },
  "Handloom Textiles": { en: "handwoven textile", hi: "हथकरघा वस्त्र" },
  "Block Printing": { en: "block-printed textile", hi: "हाथ की छपाई वाला वस्त्र" },
  Jewelry: { en: "handmade jewellery", hi: "हाथ का आभूषण" },
  Woodwork: { en: "hand-carved woodwork", hi: "हाथ से तराशी लकड़ी" },
  Metalwork: { en: "hand-cast metalwork", hi: "हाथ से ढला धातु शिल्प" },
  "Bamboo & Cane": { en: "handwoven cane work", hi: "हाथ से बुना बेत-बाँस" },
};

function guessCraftFromText(text: string): { craft: string; hits: string[] } {
  const words = text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2);
  let bestCraft = "";
  let bestScore = 0;
  let hits: string[] = [];
  for (const [craft, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    const found = kws.filter((k) =>
      k.includes(" ") ? text.toLowerCase().includes(k) : words.includes(k),
    );
    if (found.length > bestScore) {
      bestScore = found.length;
      bestCraft = craft;
      hits = found;
    }
  }
  return { craft: bestCraft, hits };
}

/**
 * Smart Cataloguing. Every field is derived from the artisan's actual
 * submission — their spoken words (transcript) and/or their uploaded photo
 * (decoded and pixel-sampled server-side). With an LLM key it uses the same
 * real inputs for generation; without one, a transparent heuristic pipeline
 * does the same job offline.
 */
export const smartCatalogue = action({
  args: {
    craft: v.string(),
    title: v.optional(v.string()),
    voiceNote: v.optional(v.string()),
    photoAnalysis: v.optional(
      v.object({
        ok: v.boolean(),
        width: v.number(),
        height: v.number(),
        aspect: v.string(),
        brightness: v.number(),
        contrast: v.number(),
        saturation: v.number(),
        colorHexes: v.array(v.string()),
        light: v.string(),
      }),
    ),
  },
  handler: async (_ctx, args) => {
    const voice = (args.voiceNote ?? "").trim();
    const titleIn = (args.title ?? "").trim();

    // 1. The real photo measurements (client sampled the actual pixels).
    const photo: PhotoAnalysis = args.photoAnalysis
      ? {
          ...args.photoAnalysis,
          light: args.photoAnalysis.light as PhotoAnalysis["light"],
        }
      : EMPTY_PHOTO;
    const palette = colorsFromHexes(photo.ok ? photo.colorHexes : []);

    // 2. Analyze the actual words — craft guess from transcript/title.
    const text = `${titleIn} ${voice}`;
    const guess = guessCraftFromText(text);
    const craft = PRODUCT_CATEGORIES.includes(
      args.craft as (typeof PRODUCT_CATEGORIES)[number],
    )
      ? args.craft
      : guess.craft || "Pottery & Terracotta";

    // 3. Photo-derived catalog fields (only when a photo was really analyzed).
    const colors = photo.ok ? palette.colors : [];
    const dimensions = photo.ok
      ? (() => {
          const w = photo.width;
          const h = photo.height;
          const base = photo.aspect === "wide" ? Math.round(w / 40) : Math.round(h / 40);
          const long = Math.max(8, Math.min(60, base));
          return photo.aspect === "wide"
            ? `${long} × ${Math.round(long * (h / w))} cm`
            : photo.aspect === "tall"
              ? `${Math.round(long * (w / h))} × ${long} cm`
              : `${long} × ${long} cm`;
        })()
      : "";

    // 4. Materials: category bank + what the artisan actually said.
    const saidMaterials = Array.from(
      new Set(
        (voice + " " + titleIn)
          .toLowerCase()
          .split(/[^\p{L}]+/u)
          .filter((w) =>
            ["silk", "cotton", "clay", "brass", "teak", "bamboo", "cane", "silver", "wood", "jute", "wool"].includes(w),
          ),
      ),
    );
    const materials = Array.from(
      new Set([...saidMaterials, ...(CATEGORY_MATERIALS[craft] ?? [])]),
    ).slice(0, 5);

    // 5. Tags: craft keywords actually present + photo colors.
    const tags = Array.from(
      new Set([...guess.hits.slice(0, 3), ...(craft ? [craft] : []), ...colors]),
    )
      .filter(Boolean)
      .slice(0, 7);

    // 6. Name: prefer the artisan's words, cleaned and title-cased.
    const nameFrom = titleIn || voice;
    const nameWords = nameFrom
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 2)
      .slice(0, 4);
    const name =
      nameWords.length > 0
        ? nameWords.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
        : CRAFT_LABEL[craft]?.en ?? "Handmade Piece";

    // 7. Description from the actual inputs (fallback path — no LLM).
    const photoBits = photo.ok
      ? `Photographed in ${photo.light}; the piece reads ${colors.join(" and ") || "natural tones"} at roughly ${dimensions}.`
      : "";
    const voiceBits = voice ? ` As the maker says: “${voice}.”` : "";
    const descEn =
      `${name} is ${CRAFT_LABEL[craft]?.en ?? "handmade"} from ${materials.slice(0, 2).join(" and ")}. ` +
      photoBits +
      voiceBits +
      " Each piece carries the small marks of the hands that made it.";
    const descHi =
      `${name} — ${(CRAFT_LABEL[craft]?.hi ?? "हाथ की बनी चीज़")}, ${materials.slice(0, 2).join(" और ")} से।` +
      (photo.ok ? ` तस्वीर में ${photo.light === "low light" ? "कम रोशनी" : "अच्छी रोशनी"} है; रंग ${palette.hindiColors.join(" और ") || "प्राकृतिक"}।` : "") +
      (voice ? ` कारीगर कहते हैं: “${voice}”।` : "") +
      " हर चीज़ में बनाने वाले हाथों के निशान हैं।";

    const heuristic = {
      name,
      category: craft,
      materials,
      colors,
      dimensions: dimensions || "—",
      tags,
      description: descEn,
      descriptionHi: descHi,
      source: "heuristic" as const,
      photoAnalyzed: photo.ok,
      voiceAnalyzed: voice.length > 0,
    };

    if (!process.env.OPENAI_API_KEY) return heuristic;

    // 8. LLM path — same REAL inputs go into the prompt.
    try {
      const raw = await callOpenAI(`
        An Indian artisan is cataloguing ONE handmade piece in category "${craft}".
        Their spoken words about it (transcribed, may be Hindi or English): "${voice}"
        Working title they gave: "${titleIn}"
        ${photo.ok ? `Real analysis of their uploaded photo: aspect ${photo.aspect}, ${photo.brightness}/100 brightness, ${photo.light}, dominant colors ${palette.colors.join(", ")}.` : "No photo provided."}
        Return JSON with exactly these fields:
        "name" (short product name in English, based on their words),
        "category" (one of: ${PRODUCT_CATEGORIES.join(" | ")}),
        "materials" (array of 2-4 material strings),
        "colors" (array of 1-3 color names from their photo/description),
        "dimensions" (a plausible size string in cm),
        "tags" (array of 3-6 short search tags),
        "description" (2-3 sentence English description woven from their words),
        "descriptionHi" (the same in simple Hindi, Devanagari).`);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return {
        name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : heuristic.name,
        category: PRODUCT_CATEGORIES.includes(parsed.category as (typeof PRODUCT_CATEGORIES)[number])
          ? (parsed.category as string)
          : heuristic.category,
        materials: Array.isArray(parsed.materials)
          ? (parsed.materials as string[]).map(String).slice(0, 5)
          : heuristic.materials,
        colors: Array.isArray(parsed.colors) ? (parsed.colors as string[]).map(String).slice(0, 4) : heuristic.colors,
        dimensions: typeof parsed.dimensions === "string" && parsed.dimensions.trim() ? parsed.dimensions.trim() : heuristic.dimensions,
        tags: Array.isArray(parsed.tags) ? (parsed.tags as string[]).map(String).slice(0, 7) : heuristic.tags,
        description: typeof parsed.description === "string" && parsed.description.trim() ? parsed.description.trim() : heuristic.description,
        descriptionHi: typeof parsed.descriptionHi === "string" && parsed.descriptionHi.trim() ? parsed.descriptionHi.trim() : heuristic.descriptionHi,
        source: "llm" as const,
        photoAnalyzed: photo.ok,
        voiceAnalyzed: voice.length > 0,
      };
    } catch {
      return heuristic;
    }
  },
});

export const generateListingCopy = action({
  args: {
    craft: v.string(),
    title: v.optional(v.string()),
    voiceNote: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const fallback = buildFallbackListing({
      craft: args.craft,
      title: args.title ?? "",
      voiceNote: args.voiceNote ?? "",
    });
    if (!process.env.OPENAI_API_KEY) return fallback;

    try {
      const raw = await callOpenAI(`
        An Indian artisan sells "${args.craft}". Piece title: "${args.title ?? ""}". They said: "${args.voiceNote ?? ""}".
        Return JSON with exactly:
        "description" (EN, 2-3 sentences, how it's made and what makes it special),
        "descriptionHi" (same in simple Hindi), "titleHint" (a better short title).`);
      const parsed = JSON.parse(raw) as Record<string, string>;
      return {
        description: parsed.description ?? fallback.description,
        descriptionHi: parsed.descriptionHi ?? fallback.descriptionHi,
        titleHint: parsed.titleHint ?? fallback.titleHint,
      };
    } catch {
      return fallback;
    }
  },
});