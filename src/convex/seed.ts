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
  daysAgo?: number; // lower = newer; drives the "new arrivals" sort
};

type SeedMaker = {
  shopName: string;
  artisanName: string; // the maker's own name, shown in "Meet the artisan"
  bio: string;
  location: string;
  craft: string;
  story: string;
  image?: string;
  coverImage?: string;
  isFeatured?: boolean;
  products: SeedProduct[];
};

export const seed: SeedMaker[] = [
  {
    shopName: "Mitti Kala",
    artisanName: "Ramesh Prajapati",
    bio: "Wheel-thrown clay and Jaipur blue pottery from a family studio in the Pink City.",
    location: "Jaipur, Rajasthan",
    craft: "Pottery & Terracotta",
    story:
      "Three generations of our family have worked the same wheel in the same courtyard. The clay comes from the beds of the Banganga river, sieved, wedged and thrown by hand. Our blue pottery follows the old Jaipur recipe — quartz, multani mitti and gum — painted with cobalt and finished after a slow wood firing. Every pot that leaves here has been turned, dried, burned and checked by hand.",
    image:
      "https://images.unsplash.com/photo-1607867810523-d10955f2a8df?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=500&fit=crop",
    isFeatured: true,
    products: [
      {
        title: "Jaipur Blue Pottery Vase",
        description:
          "A hand-thrown vase painted in traditional cobalt on white — the classic Jaipur blue pottery recipe of quartz, clay and gum. Fired slowly by wood, it holds flowers or simply holds the light of a room.",
        category: "Pottery & Terracotta",
        price: 1850,
        imageUrl:
          "https://images.unsplash.com/photo-1526198049595-f32cde2a219d?w=800&h=800&fit=crop",
        materials: ["Quartz & clay", "Cobalt paint", "Wood firing"],
        madeToOrder: true,
        stock: 6,
      },
      {
        title: "Terracotta Diya Set of 6",
        description:
          "Six hand-pressed terracotta diyas, unglazed on the outside and oiled inside, ready for the evening aarti. Each one is pressed, smoothed and sun-dried before firing.",
        category: "Pottery & Terracotta",
        price: 950,
        imageUrl:
          "https://images.unsplash.com/photo-1759927576675-995b95ff53ed?w=800&h=800&fit=crop",
        materials: ["River clay", "Mustard oil finish"],
        madeToOrder: false,
        stock: 40,
      },
      {
        title: "Mati Surahi (Water Pitcher)",
        description:
          "A clay surahi that keeps water naturally cool, thrown in one piece and finished with a hand-painted folk pattern. The porous clay does the work — no electricity needed.",
        category: "Pottery & Terracotta",
        price: 1450,
        imageUrl:
          "https://images.unsplash.com/photo-1773442549368-a67c2e5fe49f?w=800&h=800&fit=crop",
        materials: ["Banganaga river clay", "Natural slip paint"],
        madeToOrder: true,
        stock: 8,
      },
      {
        title: "Terracotta Planter Trio",
        description:
          "Three hand-pressed terracotta planters in graduating sizes, unglazed on the outside so the clay can breathe and the roots stay cool. Pressed by hand, sun-dried and wood-fired like every piece from our courtyard.",
        category: "Pottery & Terracotta",
        price: 1200,
        imageUrl:
          "https://images.unsplash.com/photo-1528789386055-75c4b717bad1?w=800&h=800&fit=crop",
        materials: ["River clay", "Natural slip"],
        madeToOrder: true,
        stock: 14,
        daysAgo: 2,
      },
      {
        title: "Hand-Thrown Clay Mugs (Set of 2)",
        description:
          "Thick-walled clay mugs thrown in one piece, the kind that keeps chai hot right to the last sip. The thumb-print of the wheel is left on each handle — no two sit in the hand the same way.",
        category: "Pottery & Terracotta",
        price: 1100,
        imageUrl:
          "https://images.unsplash.com/photo-1627834279031-55924de819b3?w=800&h=800&fit=crop",
        materials: ["River clay", "Natural glaze"],
        madeToOrder: false,
        stock: 18,
        daysAgo: 6,
      },
    ],
  },
  {
    shopName: "Varanasi Vastra",
    artisanName: "Shyam Lal Ansari",
    bio: "Handloom silk and cotton from the old weaving quarters of Banaras.",
    location: "Varanasi, Uttar Pradesh",
    craft: "Handloom Textiles",
    story:
      "The loom in our house is older than anyone can remember. We weave the way Banaras has always woven — silk and cotton threaded by hand, the weft beaten with a wooden comb until the cloth is firm and heavy. A single dupatta can take four days of sitting at the loom. We sell directly, so the price you pay is the price the weaver asked — nothing added in between.",
    image:
      "https://images.unsplash.com/photo-1788015737547-c54a34cbd562?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200&h=500&fit=crop",
    isFeatured: true,
    products: [
      {
        title: "Banarasi Silk Dupatta",
        description:
          "A handloom dupatta in pure Banarasi silk with a woven buti border — heavy enough to drape beautifully, light enough for daily wear. Threaded and woven entirely by hand in our family workshop.",
        category: "Handloom Textiles",
        price: 3200,
        imageUrl:
          "https://images.unsplash.com/photo-1765700326277-8c9d11233fd9?w=800&h=800&fit=crop",
        materials: ["Banarasi silk", "Handloom weave"],
        madeToOrder: true,
        stock: 5,
      },
      {
        title: "Chanderi Cotton Saree",
        description:
          "A soft Chanderi saree in fine hand-spun cotton with a woven zari border. Cool in summer, elegant in winter — woven slowly so the cloth breathes.",
        category: "Handloom Textiles",
        price: 5800,
        imageUrl:
          "https://images.unsplash.com/photo-1597897569252-9df44c7de0db?w=800&h=800&fit=crop",
        materials: ["Hand-spun cotton", "Zari border"],
        madeToOrder: true,
        stock: 3,
      },
      {
        title: "Tussar Silk Stole",
        description:
          "A natural tussar stole in undyed golden silk, woven on the handloom with hand-knotted fringes. The slight slubs are the signature of real tussar — no two stoles alike.",
        category: "Handloom Textiles",
        price: 2600,
        imageUrl:
          "https://images.unsplash.com/photo-1517472292914-9570a594783b?w=800&h=800&fit=crop",
        materials: ["Tussar silk", "Hand-knotted fringe"],
        madeToOrder: false,
        stock: 12,
      },
      {
        title: "Banarasi Silk Stole",
        description:
          "A deep-bordered Banarasi stole in handloom silk, the border threaded separately and woven in so it never frays. Draped over a shoulder or folded at the waist, it is unmistakably Banaras.",
        category: "Handloom Textiles",
        price: 2900,
        imageUrl:
          "https://images.unsplash.com/photo-1698156581290-03689df66ee7?w=800&h=800&fit=crop",
        materials: ["Banarasi silk", "Handloom weave"],
        madeToOrder: true,
        stock: 6,
        daysAgo: 1,
      },
      {
        title: "Handloom Cotton Bedspread",
        description:
          "A generous handloom cotton bedspread in natural dyes, woven on our family looms and washed soft before it leaves the house. Cool in summer, warm in winter — the cloth does both.",
        category: "Handloom Textiles",
        price: 4200,
        imageUrl:
          "https://images.unsplash.com/photo-1623310658847-33f12eaab710?w=800&h=800&fit=crop",
        materials: ["Hand-spun cotton", "Natural dyes"],
        madeToOrder: true,
        stock: 4,
        daysAgo: 5,
      },
    ],
  },
  {
    shopName: "Ajrakh House",
    artisanName: "Sufiyan Khatri",
    bio: "Hand block-printed fabric in natural indigo and madder, from the Kutch desert.",
    location: "Bhuj, Gujarat",
    craft: "Block Printing",
    story:
      "Block printing came to our family from Sindh three generations ago. Every cloth is printed with hand-carved teak blocks: the resist painted by hand, the indigo vat dipped again and again, the madder boiled for colour. One ajrakh cloth passes through fourteen stages and fourteen hands. We keep the old designs — the stars, the borders, the river patterns — because they carry meaning older than any one printer.",
    image:
      "https://images.unsplash.com/photo-1775669954911-fc68d9deae84?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&h=500&fit=crop",
    isFeatured: true,
    products: [
      {
        title: "Ajrakh Block-Printed Throw",
        description:
          "A cotton throw printed with traditional ajrakh borders — natural indigo, madder red and black — using hand-carved blocks and a living indigo vat. Each print is pressed by hand, so no two are identical.",
        category: "Block Printing",
        price: 3900,
        imageUrl:
          "https://images.unsplash.com/photo-1693988112221-86644d24f47a?w=800&h=800&fit=crop",
        materials: ["Washed cotton", "Natural indigo & madder"],
        madeToOrder: true,
        stock: 4,
      },
      {
        title: "Sanganeri Print Cushion Covers (Set of 2)",
        description:
          "Two cotton cushion covers printed with fine Sanganeri floral blocks in indigo and mustard. The cloth is washed and softened before printing, so it is ready for the sofa the day it arrives.",
        category: "Block Printing",
        price: 1400,
        imageUrl:
          "https://images.unsplash.com/photo-1575277340591-849c346c4542?w=800&h=800&fit=crop",
        materials: ["Cotton", "Hand-carved teak blocks"],
        madeToOrder: false,
        stock: 15,
      },
      {
        title: "Indigo Dabu Table Runner",
        description:
          "A hand-printed runner with dabu mud-resist circles, dipped in indigo until the pattern holds. Dabu is a slow craft — each cloth is reserved, dyed and rinsed up to eight times.",
        category: "Block Printing",
        price: 1800,
        imageUrl:
          "https://images.unsplash.com/photo-1693990155103-b349eba41fb5?w=800&h=800&fit=crop",
        materials: ["Cotton", "Indigo & mud resist"],
        madeToOrder: true,
        stock: 7,
      },
      {
        title: "Ajrakh Cotton Scarf",
        description:
          "A soft cotton scarf printed with the old ajrakh star-and-river border, dipped in our living indigo vat and boiled with madder for colour. Wear it, gift it, keep it — it only softens with use.",
        category: "Block Printing",
        price: 1600,
        imageUrl:
          "https://images.unsplash.com/photo-1783762774066-65559f814568?w=800&h=800&fit=crop",
        materials: ["Cotton", "Natural indigo & madder"],
        madeToOrder: false,
        stock: 12,
        daysAgo: 3,
      },
      {
        title: "Sanganeri Block-Print Tablecloth",
        description:
          "A full-size tablecloth printed with fine Sanganeri floral blocks in indigo and turmeric on washed cotton. The hand-pressed blocks leave a tiny unevenness that no machine print can copy.",
        category: "Block Printing",
        price: 1500,
        imageUrl:
          "https://images.unsplash.com/photo-1546828209-f89f24090b36?w=800&h=800&fit=crop",
        materials: ["Cotton", "Hand-carved teak blocks"],
        madeToOrder: false,
        stock: 10,
        daysAgo: 8,
      },
    ],
  },
  {
    shopName: "Kundan Kala",
    artisanName: "Mohan Lal Soni",
    bio: "Kundan, meenakari and thewa jewellery set by hand in the Jaipur tradition.",
    location: "Jaipur, Rajasthan",
    craft: "Jewelry",
    story:
      "Our family has set jewellery in the Jaipur karkhana style for four generations — pure gold and silver, stones set in kundan rather than prongs, enamel added in the meenakari tradition. Nothing is machine-cast. Each piece is built up bead by bead, checked under the loupe, and worn proudly by the people of this city before it is ever sold to anyone else.",
    image:
      "https://images.unsplash.com/photo-1649349106167-91456fd56f5c?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=500&fit=crop",
    isFeatured: false,
    products: [
      {
        title: "Kundan Choker Set",
        description:
          "A hand-set kundan choker with matching earrings — stones seated in gold foil the traditional way, finished with a soft red enamel back. Made to order, sized on request.",
        category: "Jewelry",
        price: 6500,
        imageUrl:
          "https://images.unsplash.com/photo-1616756351484-798f37bdffa0?w=800&h=800&fit=crop",
        materials: ["22k gold foil", "Kundan stones", "Meenakari enamel"],
        madeToOrder: true,
        stock: 3,
      },
      {
        title: "Meenakari Jhumkas",
        description:
          "Lightweight jhumkas with hand-painted meenakari enamel in the front and a traditional dome back. Comfortable for daily wear, ornate enough for festivals.",
        category: "Jewelry",
        price: 2200,
        imageUrl:
          "https://images.unsplash.com/photo-1762686130435-897de4b26aac?w=800&h=800&fit=crop",
        materials: ["Sterling silver", "Enamel work"],
        madeToOrder: false,
        stock: 10,
      },
      {
        title: "Thewa Pendant",
        description:
          "A thewa pendant — 23k gold sheet worked over coloured glass in the old Pratapgarh style, depicting a hunting scene. A vanishing craft, made entirely by hand.",
        category: "Jewelry",
        price: 4800,
        imageUrl:
          "https://images.unsplash.com/photo-1767971958465-16d986fad8df?w=800&h=800&fit=crop",
        materials: ["23k gold foil", "Coloured glass"],
        madeToOrder: true,
        stock: 4,
      },
      {
        title: "Kundan Bangle Set",
        description:
          "A pair of kundan bangles, stones seated in gold foil the traditional way with a soft enamel back. Built up bead by bead under the loupe, sized to slip on and stay on.",
        category: "Jewelry",
        price: 3800,
        imageUrl:
          "https://images.unsplash.com/photo-1758995116383-f51775896add?w=800&h=800&fit=crop",
        materials: ["22k gold foil", "Kundan stones", "Meenakari enamel"],
        madeToOrder: true,
        stock: 3,
        daysAgo: 4,
      },
      {
        title: "Silver Filigree Earrings",
        description:
          "Featherlight earrings in hand-worked silver filigree — wire drawn, twisted and soldered in the karkhana style. Delicate enough for daily wear, bright enough for a festival.",
        category: "Jewelry",
        price: 1500,
        imageUrl:
          "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&h=800&fit=crop",
        materials: ["Sterling silver"],
        madeToOrder: false,
        stock: 9,
        daysAgo: 9,
      },
    ],
  },
  {
    shopName: "Sahariya Woodcraft",
    artisanName: "Ramlal Sahariya",
    bio: "Hand-carved wood from the forest craftspeople of Bundelkhand.",
    location: "Chhatarpur, Madhya Pradesh",
    craft: "Woodwork",
    story:
      "We are Sahariya carvers — the forest people of Bundelkhand. Our wood is seasoned teak and mango, cut by hand and carved with tools older than the town. Nothing is sanded to a factory shine; you can see the chisel's path in every curve. A bowl we carve today will be oiled, used, and still in a kitchen fifty years from now.",
    image:
      "https://images.unsplash.com/photo-1753185234794-e3b41b94a352?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=1200&h=500&fit=crop",
    isFeatured: false,
    products: [
      {
        title: "Carved Teak Serving Bowl",
        description:
          "A single piece of seasoned teak hollowed by hand with traditional chisels, finished with natural oil. Deep enough for a family bowl of dal, handsome enough for the table.",
        category: "Woodwork",
        price: 2600,
        imageUrl:
          "https://images.unsplash.com/photo-1609688538023-2090aa8e874e?w=800&h=800&fit=crop",
        materials: ["Seasoned teak", "Natural oil finish"],
        madeToOrder: true,
        stock: 5,
      },
      {
        title: "Hand-Carved Serving Platter",
        description:
          "A wide mango-wood platter with a carved rim, finished food-safe. For bread, fruit, or the evening thali — the chisel marks are left visible on purpose.",
        category: "Woodwork",
        price: 2400,
        imageUrl:
          "https://images.unsplash.com/photo-1784901391931-db500cac7297?w=800&h=800&fit=crop",
        materials: ["Mango wood", "Food-safe lacquer"],
        madeToOrder: false,
        stock: 9,
      },
      {
        title: "Carved Teak Stool",
        description:
          "A low stool carved from a single block, with a hand-hollowed seat that deepens with use. Perfect beside the door, the rangoli corner, or the plant.",
        category: "Woodwork",
        price: 5200,
        imageUrl:
          "https://images.unsplash.com/photo-1634798245965-03669c757183?w=800&h=800&fit=crop",
        materials: ["Teak", "Natural oil finish"],
        madeToOrder: true,
        stock: 3,
      },
      {
        title: "Carved Mango Wood Spice Box",
        description:
          "A round masala dabba hollowed from a single piece of mango wood, with four snug cups and a hand-carved lid. The chisel path is left visible — this is a forest-carver's box, not a factory one.",
        category: "Woodwork",
        price: 1800,
        imageUrl:
          "https://images.unsplash.com/photo-1644125280477-0ea702960616?w=800&h=800&fit=crop",
        materials: ["Mango wood", "Natural oil finish"],
        madeToOrder: true,
        stock: 7,
        daysAgo: 3,
      },
      {
        title: "Hand-Carved Teak Spoons (Set of 3)",
        description:
          "Three serving spoons carved from seasoned teak in the old Bundelkhand shapes — one long, one round, one for the kadhai's depth. Oiled and food-safe, they grow darker and smoother with every use.",
        category: "Woodwork",
        price: 950,
        imageUrl:
          "https://images.unsplash.com/photo-1594761077961-cadd185540a4?w=800&h=800&fit=crop",
        materials: ["Teak", "Food-safe oil"],
        madeToOrder: false,
        stock: 20,
        daysAgo: 10,
      },
    ],
  },
  {
    shopName: "Dhokra Murtikar",
    artisanName: "Bijay Maharana",
    bio: "Lost-wax brass casting from the tribal craft villages of Odisha.",
    location: "Bhubaneswar, Odisha",
    craft: "Metalwork",
    story:
      "Dhokra is older than history — the lost-wax method our village uses was casting bronze in the Indus valley five thousand years ago. Every figure begins as a wax model, wrapped in clay, fired until the wax melts away, then filled with molten brass. What comes out is never perfect and never the same twice — and that is exactly what we sell.",
    image:
      "https://images.unsplash.com/photo-1694438058376-f7af2f661ac2?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&h=500&fit=crop",
    isFeatured: false,
    products: [
      {
        title: "Dhokra Peacock Lamp",
        description:
          "A lost-wax brass peacock with a bulb-holder on its back — cast by the ancient cire-perdue method, one piece at a time. Soft light through the filigree tail, warm as old brass should be.",
        category: "Metalwork",
        price: 5900,
        imageUrl:
          "https://images.unsplash.com/photo-1755798320739-ebf99af9cfe6?w=800&h=800&fit=crop",
        materials: ["Brass", "Lost-wax casting"],
        madeToOrder: true,
        stock: 2,
      },
      {
        title: "Dancing Nataraja Figure",
        description:
          "A small dhokra Nataraja in traditional detail — cast in brass by the tribal lost-wax method. A devotional piece with the roughness of real hand-casting.",
        category: "Metalwork",
        price: 3600,
        imageUrl:
          "https://images.unsplash.com/photo-1763475945419-20e68c88c05b?w=800&h=800&fit=crop",
        materials: ["Brass"],
        madeToOrder: false,
        stock: 6,
      },
      {
        title: "Dhokra Tribal Necklace",
        description:
          "A hand-cast brass necklace of tribal beads and pendants, each one from its own wax model. Lightweight, striking, and unmistakably handmade.",
        category: "Metalwork",
        price: 4100,
        imageUrl:
          "https://images.unsplash.com/photo-1768728584503-65db42d13856?w=800&h=800&fit=crop",
        materials: ["Brass", "Cotton cord"],
        madeToOrder: true,
        stock: 4,
      },
      {
        title: "Dhokra Temple Bell",
        description:
          "A small dhokra temple bell cast by the lost-wax method — the clapper is a separate casting, the tone deep and true. Ring it at the door, or hang it where you keep your prayers.",
        category: "Metalwork",
        price: 1700,
        imageUrl:
          "https://images.unsplash.com/photo-1764426380349-86862ad2b89a?w=800&h=800&fit=crop",
        materials: ["Brass", "Lost-wax casting"],
        madeToOrder: false,
        stock: 8,
        daysAgo: 2,
      },
      {
        title: "Brass Diya Stand",
        description:
          "A hand-cast brass diya stand with a flared oil cup and a raised wick lip, polished to a soft glow. One diya of oil burns here for a full evening aarti.",
        category: "Metalwork",
        price: 1100,
        imageUrl:
          "https://images.unsplash.com/photo-1783255571174-d329a3895407?w=800&h=800&fit=crop",
        materials: ["Brass"],
        madeToOrder: false,
        stock: 15,
        daysAgo: 7,
      },
    ],
  },
  {
    shopName: "Bans Kala",
    artisanName: "Malati Bora",
    bio: "Bamboo and cane woven in the hill workshops of the Northeast.",
    location: "Guwahati, Assam",
    craft: "Bamboo & Cane",
    story:
      "In Assam, bamboo is called 'green gold', and our family has woven it for as long as anyone remembers. We split the culms by hand, soak and bend them over fire, and weave them while they are still supple. Baskets, bags and furniture from our workshop are used for years — and when one finally wears out, it goes back to the earth.",
    image:
      "https://images.unsplash.com/photo-1759738101532-0c2726bf68af?w=200&h=200&fit=crop&crop=faces",
    coverImage:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=500&fit=crop",
    isFeatured: false,
    products: [
      {
        title: "Cane & Bamboo Storage Basket",
        description:
          "A sturdy woven basket for yarn, rotis, or the week's vegetables — split cane over a bamboo frame, woven tight by hand. Strong enough for daily use, beautiful enough to leave out.",
        category: "Bamboo & Cane",
        price: 1600,
        imageUrl:
          "https://images.unsplash.com/photo-1590751518505-1fc2d227ef9b?w=800&h=800&fit=crop",
        materials: ["Bamboo", "Rattan cane"],
        madeToOrder: false,
        stock: 11,
      },
      {
        title: "Bamboo Tea Coaster Set",
        description:
          "Six hand-woven bamboo coasters, split and bent in the hill workshop tradition. Light, absorbent, and gentle on furniture.",
        category: "Bamboo & Cane",
        price: 750,
        imageUrl:
          "https://images.unsplash.com/photo-1646170629004-b3c84a27fc17?w=800&h=800&fit=crop",
        materials: ["Bamboo"],
        madeToOrder: false,
        stock: 25,
      },
      {
        title: "Cane Handbag",
        description:
          "A woven cane handbag with a bamboo handle and cotton lining — the kind carried through the bazaars of Guwahati. Each weave is worked by hand while the cane is still wet.",
        category: "Bamboo & Cane",
        price: 2800,
        imageUrl:
          "https://images.unsplash.com/photo-1781232756159-97eba33dc051?w=800&h=800&fit=crop",
        materials: ["Rattan cane", "Bamboo handle", "Cotton lining"],
        madeToOrder: true,
        stock: 6,
      },
      {
        title: "Bamboo Lamp Shade",
        description:
          "A hand-woven bamboo lamp shade that throws a soft, freckled light across the room. Split cane over a bamboo frame, woven while supple — no two shades cast the same shadow.",
        category: "Bamboo & Cane",
        price: 2400,
        imageUrl:
          "https://images.unsplash.com/photo-1758352512406-df54693658ab?w=800&h=800&fit=crop",
        materials: ["Bamboo", "Rattan cane"],
        madeToOrder: true,
        stock: 5,
        daysAgo: 1,
      },
      {
        title: "Cane Serving Tray",
        description:
          "A wide cane tray with a bamboo rim, woven tight enough to carry a full set of glasses or the evening chai. Handles are carved from a single bend of bamboo.",
        category: "Bamboo & Cane",
        price: 1300,
        imageUrl:
          "https://images.unsplash.com/photo-1567368407227-719ba57067a7?w=800&h=800&fit=crop",
        materials: ["Rattan cane", "Bamboo frame"],
        madeToOrder: false,
        stock: 9,
        daysAgo: 5,
      },
    ],
  },
];

/**
 * Seeds the marketplace catalog (makers + products).
 * Idempotent: on every run it replaces the pure catalog data (seed makers,
 * which have no userId) with the current seed — so catalog content updates
 * propagate to existing deployments. Artisan-created studios (makers linked
 * to a user) are never touched.
 */
export const seedCatalog = internalMutation({
  args: {},
  handler: async (ctx) => {
    // If the catalog is already current (every seed title present with the
    // matching image, and every seed artisan carrying the right portrait and
    // name), leave it alone — refreshing on every landing mount would orphan
    // carts and favorites that reference the previous seed's product ids.
    // Image/name-only seed updates still propagate because we compare each
    // stored row against the seed.
    const expectedByTitle = new Map(
      seed.flatMap((m) => m.products.map((p) => [p.title, p.imageUrl] as const)),
    );
    const existing = await ctx.db.query("products").collect();
    const byTitle = new Map(existing.map((p) => [p.title, p] as const));
    let stale = false;
    for (const [title, imageUrl] of expectedByTitle) {
      const current = byTitle.get(title);
      if (!current || current.imageUrl !== imageUrl) {
        stale = true;
        break;
      }
    }
    // The artisan portraits/names must be current too — a seed that only
    // changed portraits would otherwise never reach an existing deployment.
    if (!stale) {
      const seededMakers = (await ctx.db.query("makers").collect()).filter(
        (m) => !m.userId,
      );
      const byShop = new Map(seededMakers.map((m) => [m.shopName, m] as const));
      for (const m of seed) {
        const current = byShop.get(m.shopName);
        if (
          !current ||
          current.image !== m.image ||
          current.artisanName !== m.artisanName ||
          current.location !== m.location ||
          current.craft !== m.craft
        ) {
          stale = true;
          break;
        }
      }
    }
    if (!stale) return;

    // Remove previously seeded catalog rows (seed makers have no userId),
    // keeping user-created studios and their products intact.
    const existingMakers = await ctx.db.query("makers").collect();
    for (const m of existingMakers) {
      if (m.userId) continue;
      const products = await ctx.db
        .query("products")
        .withIndex("by_makerId", (q) => q.eq("makerId", m._id))
        .collect();
      for (const p of products) await ctx.db.delete(p._id);
      await ctx.db.delete(m._id);
    }

    const validCategories = new Set([
      "Pottery & Terracotta",
      "Handloom Textiles",
      "Block Printing",
      "Jewelry",
      "Woodwork",
      "Metalwork",
      "Bamboo & Cane",
    ]);

    for (const m of seed) {
      const makerId = await ctx.db.insert("makers", {
        shopName: m.shopName,
        artisanName: m.artisanName,
        bio: m.bio,
        location: m.location,
        craft: m.craft,
        story: m.story,
        image: m.image,
        coverImage: m.coverImage,
        isFeatured: m.isFeatured,
      });
      for (const p of m.products) {
        if (!validCategories.has(p.category)) continue;
        await ctx.db.insert("products", {
          makerId,
          title: p.title,
          description: p.description,
          category: p.category as
            | "Pottery & Terracotta"
            | "Handloom Textiles"
            | "Block Printing"
            | "Jewelry"
            | "Woodwork"
            | "Metalwork"
            | "Bamboo & Cane",
          price: p.price,
          imageUrl: p.imageUrl,
          materials: [...p.materials],
          madeToOrder: p.madeToOrder,
          stock: p.stock,
          isActive: true,
          daysAgo: p.daysAgo,
        });
      }
    }
  },
});