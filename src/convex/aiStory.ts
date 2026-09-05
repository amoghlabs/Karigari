import { action } from "./_generated/server";
import { v } from "convex/values";

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