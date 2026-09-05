import { internalMutation } from "./_generated/server";

type SeedProduct = {
  title: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  materials: string[];
  madeToOrder: boolean;
  stock: number;
};

type SeedMaker = {
  shopName: string;
  bio: string;
  location: string;
  craft: string;
  story: string;
  image?: string;
  coverImage?: string;
  isFeatured?: boolean;
  products: SeedProduct[];
};

const seed: SeedMaker[] = [
  {
    shopName: "Kiln & Ember",
    bio: "Wheel-thrown stoneware fired in a wood kiln in the hills outside Asheville.",
    location: "Asheville, NC",
    craft: "Ceramics",
    story:
      "Every mug, bowl, and vase leaves our studio thrown by hand, trimmed by hand, and glazed with ash from our own kiln. We believe objects for daily ritual should carry the mark of the person who made them — a thumbprint in the glaze, a slightly asymmetric rim. Nothing here is perfect. Everything is made.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=500&fit=crop",
    isFeatured: true,
    products: [
      {
        title: "Ember Speckled Mug",
        description:
          "A 12oz wheel-thrown mug with a satin ash glaze that pools deep amber where the clay breaks. The handle is pulled by hand and fits a full hand — the kind you reach for every morning.",
        category: "Ceramics",
        price: 42,
        imageUrl:
          "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop",
        materials: ["Stoneware clay", "Wood-ash glaze"],
        madeToOrder: true,
        stock: 14,
      },
      {
        title: "Riverstone Serving Bowl",
        description:
          "A generous wide bowl with an unglazed exterior that keeps the raw texture of the river clay. Finished inside with a food-safe satin white. Ideal for pasta night or a counter of fruit.",
        category: "Ceramics",
        price: 88,
        imageUrl:
          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=800&fit=crop",
        materials: ["River clay", "Food-safe glaze"],
        madeToOrder: false,
        stock: 6,
      },
      {
        title: "Ash-Glaze Bud Vase Trio",
        description:
          "Three small vases, three different ash glazes from a single firing. Each one holds a stem or two — meant for the windowsill, the desk, the corner of the bath.",
        category: "Ceramics",
        price: 64,
        imageUrl:
          "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=800&h=800&fit=crop",
        materials: ["Stoneware", "Wood-ash glazes"],
        madeToOrder: true,
        stock: 9,
      },
    ],
  },
  {
    shopName: "Loomstead",
    bio: "Handwoven textiles and naturally dyed goods from a one-woman studio in Vermont.",
    location: "Brattleboro, VT",
    craft: "Textiles",
    story:
      "I weave on a 100-year-old floor loom in a barn that smells like cedar and sheep. Wool and flax come from farms I can drive to, and every dye bath is made from indigo, madder root, or oak galls. Textiles should soften a room the way an old sweater softens over years — that is what I make.",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200&h=500&fit=crop",
    isFeatured: true,
    products: [
      {
        title: "Indigo Wool Throw",
        description:
          "A generously sized lap throw woven from undyed Vermont wool and overdyed in a living indigo vat. Heavy enough for winter reading, breathable enough for cool summer porches.",
        category: "Textiles",
        price: 210,
        imageUrl:
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop",
        materials: ["Vermont wool", "Natural indigo"],
        madeToOrder: true,
        stock: 4,
      },
      {
        title: "Linen Kitchen Towels, Set of 2",
        description:
          "Woven from European flax and finished with hand-hemmed edges. They start crisp and only get softer. The stripe pattern repeats subtly — no two towels identical.",
        category: "Textiles",
        price: 58,
        imageUrl:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=800&fit=crop",
        materials: ["European linen"],
        madeToOrder: false,
        stock: 18,
      },
      {
        title: "Madder-Dyed Table Runner",
        description:
          "A long runner dyed with madder root to a dusty brick red, woven with a subtle undulating twill. Machine washable, made for actual dinners — not just the photograph.",
        category: "Textiles",
        price: 96,
        imageUrl:
          "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&h=800&fit=crop",
        materials: ["Cotton-linen blend", "Madder root dye"],
        madeToOrder: true,
        stock: 7,
      },
    ],
  },
  {
    shopName: "Grainline Wood Co.",
    bio: "Furniture and kitchen goods in walnut and white oak, joinery over shortcuts.",
    location: "Portland, OR",
    craft: "Woodwork",
    story:
      "Two of us in a shared shop, working lumber milled from urban-fallen trees. We cut every joint ourselves — no biscuits, no pocket screws — because a mortise-and-tenon will still be tight in fifty years. Boards keep their live edges when the tree offers a good one.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=1200&h=500&fit=crop",
    isFeatured: true,
    products: [
      {
        title: "Walnut End-Grain Board",
        description:
          "An end-grain cutting board in black walnut, glued in a checker of heartwood and sapwood. End grain is gentle on knives and self-heals; oil it once a month and it will outlive the trend cycle.",
        category: "Woodwork",
        price: 135,
        imageUrl:
          "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=800&fit=crop",
        materials: ["Black walnut", "Food-safe oil & wax"],
        madeToOrder: true,
        stock: 8,
      },
      {
        title: "White Oak Stool",
        description:
          "A three-legged stool with hand-cut wedge tenons, finished in hardwax oil. Equally at home as a plant stand, a nightstand, or a seat by the door.",
        category: "Woodwork",
        price: 240,
        imageUrl:
          "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&h=800&fit=crop",
        materials: ["White oak", "Hardwax oil"],
        madeToOrder: true,
        stock: 5,
      },
      {
        title: "Serving Paddle in Cherry",
        description:
          "A slim serving paddle with a hand-carved handle groove, in cherry that deepens to a warm russet with use. For cheese, bread, or moving a roast to the table.",
        category: "Woodwork",
        price: 72,
        imageUrl:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=800&fit=crop",
        materials: ["Cherry", "Food-safe finish"],
        madeToOrder: false,
        stock: 12,
      },
    ],
  },
  {
    shopName: "Small Anvil",
    bio: "Recycled-gold jewelry cast and finished by hand, one piece at a time.",
    location: "Providence, RI",
    craft: "Jewelry",
    story:
      "I trained as a silversmith and now work exclusively in recycled gold and responsibly sourced stones. Every ring is carved in wax, cast in small batches, and set under a microscope. Made for hands that actually use them — I wear my own samples daily so the prototypes earn their place.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=500&fit=crop",
    isFeatured: false,
    products: [
      {
        title: "Molten Signet Ring",
        description:
          "A signet with an organic, barely-melted face that catches light like water. Cast in recycled 14k gold, sized on request. The inside face is left soft so it seats to your finger over time.",
        category: "Jewelry",
        price: 380,
        imageUrl:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
        materials: ["Recycled 14k gold"],
        madeToOrder: true,
        stock: 3,
      },
      {
        title: "Seam Studs",
        description:
          "Tiny studs with a visible seam of texture down the front — a nod to the wax models they were carved from. Sterling silver or 14k gold fill.",
        category: "Jewelry",
        price: 95,
        imageUrl:
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop",
        materials: ["Sterling silver", "14k gold fill"],
        madeToOrder: false,
        stock: 20,
      },
    ],
  },
  {
    shopName: "Hide & Hem",
    bio: "Vegetable-tanned leather goods stitched by saddle process in small batches.",
    location: "Austin, TX",
    craft: "Leather",
    story:
      "I buy hides from a tannery in Pennsylvania, cut every panel by hand, and saddle-stitch with linen thread — two needles, one seam, no machine. Leather goods are supposed to get better looking as they absorb your life. I make the things you pass down.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=500&fit=crop",
    isFeatured: false,
    products: [
      {
        title: "Everyday Field Wallet",
        description:
          "A four-pocket wallet in English bridle leather, saddle-stitched with braided linen. Skived thin so it disappears in a back pocket, burnished edges that darken with handling.",
        category: "Leather",
        price: 85,
        imageUrl:
          "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop",
        materials: ["English bridle leather", "Linen thread"],
        madeToOrder: false,
        stock: 15,
      },
      {
        title: "Brass-Key Carry Case",
        description:
          "A snap-closing key case lined in pigskin, with brass hardware that will outshine the scratches of daily pockets. Fits six keys and a car fob.",
        category: "Leather",
        price: 62,
        imageUrl:
          "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&h=800&fit=crop",
        materials: ["Veg-tan leather", "Solid brass"],
        madeToOrder: true,
        stock: 10,
      },
    ],
  },
  {
    shopName: "Inkline Press",
    bio: "Linocut prints pulled by hand on an antique press in Hudson, NY.",
    location: "Hudson, NY",
    craft: "Prints",
    story:
      "Each print starts as a block of linoleum I carve with hand tools. I ink and pull every print on a 1930s press — the slight variations are the signature of the process, not a flaw. Small editions, signed and numbered, framed or unframed.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=500&fit=crop",
    isFeatured: false,
    products: [
      {
        title: "Night Heron Linocut",
        description:
          "An edition of 50, pulled in charcoal-black oil ink on cotton paper. A heron mid-step, rendered in confident cuts. Ships flat with archival backing; frame not included.",
        category: "Prints",
        price: 78,
        imageUrl:
          "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=800&fit=crop",
        materials: ["Cotton paper", "Oil-based ink"],
        madeToOrder: false,
        stock: 22,
      },
      {
        title: "Kitchen Garden Candles",
        description:
          "Hand-poured soy candles in ceramic vessels thrown by a neighboring potter — scented with tomato leaf, basil, and a trace of earth. When the wax is gone, the vessel stays.",
        category: "Candles",
        price: 38,
        imageUrl:
          "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=800&h=800&fit=crop",
        materials: ["Soy wax", "Wheel-thrown vessel"],
        madeToOrder: false,
        stock: 25,
      },
    ],
  },
];

/**
 * Idempotently seeds the marketplace catalog (makers + products).
 * Safe to call repeatedly — it exits early if data already exists.
 */
export const seedCatalog = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("makers").first();
    if (existing !== null) return;

    for (const m of seed) {
      const makerId = await ctx.db.insert("makers", {
        shopName: m.shopName,
        bio: m.bio,
        location: m.location,
        craft: m.craft,
        story: m.story,
        image: m.image,
        coverImage: m.coverImage,
        isFeatured: m.isFeatured,
      });
      for (const p of m.products) {
        await ctx.db.insert("products", {
          makerId,
          title: p.title,
          description: p.description,
          // seeded categories are from our fixed list
          category: p.category as
            | "Ceramics"
            | "Textiles"
            | "Woodwork"
            | "Jewelry"
            | "Leather"
            | "Prints"
            | "Candles",
          price: p.price,
          imageUrl: p.imageUrl,
          materials: [...p.materials],
          madeToOrder: p.madeToOrder,
          stock: p.stock,
          isActive: true,
        });
      }
    }
  },
});
