import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "hi";

type Dict = Record<string, { en: string; hi: string }>;

export const DICT: Dict = {
  /* Brand */
  "brand.name": { en: "कारीgari", hi: "कारीगरी" },
  "brand.tagline": {
    en: "Sell with AI, buy from the maker",
    hi: "AI से बेचिए, कारीगर से खरीदिए",
  },

  /* Language toggle */
  "lang.label": { en: "Language", hi: "भाषा" },
  "lang.english": { en: "English", hi: "अंग्रेज़ी" },
  "lang.hindi": { en: "हिन्दी", hi: "हिन्दी" },

  /* Header nav */
  "nav.shop": { en: "Market", hi: "बाज़ार" },
  "nav.artisans": { en: "For artisans", hi: "कारीगरों के लिए" },
  "nav.sellWithAi": { en: "Sell with AI", hi: "AI से बेचिए" },
  "nav.bag": { en: "Your bag", hi: "आपकी थैली" },
  "nav.account": { en: "Account", hi: "खाता" },
  "nav.orders": { en: "Orders", hi: "ऑर्डर" },
  "nav.favorites": { en: "Favorites", hi: "पसंदीदा" },
  "nav.studio": { en: "Artisan studio", hi: "कारीगर स्टूडियो" },
  "nav.signIn": { en: "Sign in", hi: "साइन इन" },
  "nav.signOut": { en: "Sign out", hi: "साइन आउट" },

  /* Hero */
  "hero.slogan": { en: "Where every craft has a voice.", hi: "जहाँ हर हुनर की अपनी आवाज़ है।" },
  "hero.slogan.sub": {
    en: "From the artisan's hands — and words — straight to you.",
    hi: "कारीगर के हाथों — और शब्दों — से सीधे आप तक।",
  },
  "hero.badge": {
    en: "Sell with AI · a photo and your voice is all it takes",
    hi: "AI से बेचिए · बस एक फ़ोटो और आपकी आवाज़ काफ़ी है",
  },
  "hero.title1": { en: "Buy straight from", hi: "सीधे कारीगर से" },
  "hero.title2": { en: "the artisan's hands", hi: "कारीगर के हाथों से खरीदें" },
  "hero.subtitle": {
    en: "Not another handicraft marketplace. कारीgari removes the digital barrier for artisans — the forms, the photos, the English, the pricing. Anyone who can take a photo and speak about their craft can sell online, and every piece still ships from the bench it was made on.",
    hi: "यह सिर्फ़ एक और हस्तशिल्प बाज़ार नहीं है। कारीgari कारीगरों के रास्ते से डिजिटल दीवार हटा देता है — फ़ॉर्म, फ़ोटो, अंग्रेज़ी, दाम तय करना। जो एक फ़ोटो ले सके और अपने हुनर के बारे में बोल सके, वह ऑनलाइन बेच सकता है — और हर चीज़ उसी कारखाने से भेजी जाती है जहाँ वह बनी।",
  },
  "hero.cta.shop": { en: "Explore the market", hi: "बाज़ार देखें" },
  "hero.cta.sell": { en: "Sell with AI", hi: "AI से बेचिए" },
  "hero.point1": { en: "A photo and your voice, nothing else", hi: "बस एक फ़ोटो और आपकी आवाज़" },
  "hero.point2": { en: "Studio-to-door, zero middlemen", hi: "स्टूडियो से घर तक, कोई बिचौलिया नहीं" },
  "hero.point3": { en: "Every rupee reaches the maker", hi: "हर रुपया कारीगर तक पहुँचता है" },

  /* Landing sections */
  "sec.latest.eyebrow": { en: "Fresh from the kiln", hi: "आँवे से ताज़ा" },
  "sec.latest.title": { en: "This week's standouts", hi: "इस हफ़्ते की ख़ास चीज़ें" },
  "sec.latest.all": { en: "View all pieces", hi: "सभी चीज़ें देखें" },
  "sec.makers.eyebrow": { en: "The studios", hi: "स्टूडियो" },
  "sec.makers.title": { en: "Meet the hands behind the work", hi: "काम के पीछे के हाथों से मिलिए" },
  "sec.makers.sub": {
    en: "No warehouses, no resellers. Each studio is run by the artisan who answers your questions and signs your parcel.",
    hi: "न गोदाम, न बिचौलिया। हर स्टूडियो उसी कारीगर की है जो आपके सवालों का जवाब देता है और आपके पार्सल पर अपना नाम लिखता है।",
  },
  "maker.pieces": {
    en: "{count} pieces",
    hi: "{count} चीज़ें",
  },
  "maker.onePiece": { en: "1 piece", hi: "1 चीज़" },
  "sec.how.eyebrow": { en: "How it works", hi: "कैसे काम करता है" },
  "sec.how.title": {
    en: "From the town lane to your doorstep",
    hi: "गली के कारखाने से सीधे आपके द्वार तक",
  },
  "how.step1.title": { en: "Find a studio", hi: "कोई स्टूडियो खोजें" },
  "how.step1.body": {
    en: "Browse by craft — pottery, handloom, block print, jewellery — and read the artisan's story before you buy.",
    hi: "हुनर के हिसाब से देखें — मिट्टी के बर्तन, हथकरघा, ब्लॉक प्रिंट, आभूषण — और खरीदने से पहले कारीगर की कहानी पढ़ें।",
  },
  "how.step2.title": { en: "Order the piece", hi: "चीज़ ऑर्डर करें" },
  "how.step2.body": {
    en: "Many pieces are made to order — your mug or dupatta is made for you, not picked from a shelf.",
    hi: "कई चीज़ें ऑर्डर पर बनती हैं — आपका मग या दुपट्टा आपके लिए बनता है, शेल्फ़ से नहीं उठाया जाता।",
  },
  "how.step3.title": { en: "It ships from the bench", hi: "सीधे कारखाने से भेजा जाता है" },
  "how.step3.body": {
    en: "Your parcel leaves the artisan's own workshop, wrapped by the hands that made it. No middlemen, ever.",
    hi: "आपका पार्सल कारीगर के अपने कारखाने से निकलता है, उन्हीं हाथों के बनाए हुए। कभी कोई बिचौलिया नहीं।",
  },
  "sec.stats": { en: "Studio stats", hi: "स्टूडियो के आँकड़े" },
  "stat.studios": { en: "Independent studios", hi: "स्वतंत्र स्टूडियो" },
  "stat.crafts": { en: "Craft categories", hi: "हुनर की श्रेणियाँ" },
  "stat.direct": { en: "Sold by the maker", hi: "कारीगर द्वारा बेची गईं" },
  "stat.middlemen": { en: "Middlemen", hi: "बिचौलिए" },
  "sec.cta.title": {
    en: "You don't need a computer, a website or English",
    hi: "आपको न कंप्यूटर चाहिए, न वेबसाइट, न अंग्रेज़ी",
  },
  "sec.cta.sub": {
    en: "The digital barrier is why master artisans stay offline. Sell with AI takes it away: one photo and a few words in your own language, and your piece is described, translated, priced and live — usually in under a minute.",
    hi: "डिजिटल दीवार ही वजह है कि उस्ताद कारीगर ऑनलाइन नहीं आ पाते। Sell with AI उसे हटा देता है: एक फ़ोटो और अपनी भाषा में कुछ शब्द — बस, फिर आपकी चीज़ का विवरण, अनुवाद, दाम सब तैयार और लाइव — अक्सर एक मिनट से भी कम में।",
  },
  "sec.cta.button": { en: "Start selling with AI", hi: "AI से बेचना शुरू करें" },
  "sec.cta.secondary": { en: "See what's live", hi: "क्या लाइव है देखें" },

  /* Sell with AI — the flagship flow */
  "sellai.eyebrow": { en: "Sell with AI", hi: "AI से बेचिए" },
  "sellai.title": {
    en: "Sell with AI. A photo and your voice — we do the rest.",
    hi: "Sell with AI। एक फ़ोटो और आपकी आवाज़ — बाक़ी सब हम करते हैं।",
  },
  "sellai.sub": {
    en: "Listing online normally needs forms, studio lighting, English and a guess at pricing — which is exactly why so many artisans never start. Sell with AI runs that whole production line for you and shows you each step happening.",
    hi: "ऑनलाइन सूची बनाने के लिए आम तौर पर फ़ॉर्म, स्टूडियो लाइट, अंग्रेज़ी और दाम का अंदाज़ा चाहिए — इसी वजह से बहुत से कारीगर शुरू ही नहीं कर पाते। Sell with AI यह पूरी प्रक्रिया आपके लिए चलाता है और हर क़दम आपको दिखाता है।",
  },
  "sellai.do1": {
    en: "Take one photo of your piece on your phone — that bit is still yours.",
    hi: "अपने फ़ोन से चीज़ की एक फ़ोटो लीजिए — बस यही काम आपका है।",
  },
  "sellai.do2": {
    en: "Say a few words about it in Hindi, Marathi, Tamil — whatever you speak.",
    hi: "उसके बारे में कुछ शब्द बोलिए — हिंदी, मराठी, तमिल, जो भी आप बोलते हैं।",
  },
  "sellai.rest": {
    en: "Everything else — enhancing, writing, translating, categorising, pricing, publishing — AI does for you.",
    hi: "बाक़ी सब — फ़ोटो सुधारना, विवरण लिखना, अनुवाद, श्रेणी, दाम और प्रकाशन — AI आपके लिए करता है।",
  },
  "sellai.cta": { en: "Start selling with AI", hi: "AI से बेचना शुरू करें" },
  "sellai.cta2": { en: "See what it produces", hi: "यह क्या बनाता है देखें" },
  "sellai.pipeline": {
    en: "The pipeline, start to finish",
    hi: "पूरी प्रक्रिया, शुरू से आख़िर तक",
  },
  "sellai.live": { en: "Live", hi: "लाइव" },
  "sellai.note": {
    en: "No forms. No English. No website. Two taps from you.",
    hi: "न फ़ॉर्म, न अंग्रेज़ी, न वेबसाइट। आपकी तरफ़ से बस दो काम।",
  },

  /* Sell with AI — the seven steps */
  "swa.step.photo": { en: "Take or upload a photo", hi: "फ़ोटो खींचें या अपलोड करें" },
  "swa.step.voice": { en: "Speak about the piece", hi: "चीज़ के बारे में बोलिए" },
  "swa.step.enhance": { en: "AI enhances your photo", hi: "AI आपकी फ़ोटो सुधारता है" },
  "swa.step.write": { en: "AI writes the description", hi: "AI विवरण लिखता है" },
  "swa.step.translate": { en: "AI translates it", hi: "AI उसका अनुवाद करता है" },
  "swa.step.price": { en: "AI suggests a category & fair price", hi: "AI श्रेणी और सही दाम सुझाता है" },
  "swa.step.live": { en: "Your piece goes live", hi: "आपकी चीज़ लाइव हो जाती है" },
  "swa.working": { en: "now", hi: "अभी" },
  "swa.work.enhance": { en: "Enhancing your photo…", hi: "आपकी फ़ोटो सुधर रही है…" },
  "swa.work.write": { en: "Writing your description…", hi: "आपका विवरण लिखा जा रहा है…" },
  "swa.work.translate": { en: "Translating it…", hi: "अनुवाद हो रहा है…" },
  "swa.work.price": { en: "Working out a fair price…", hi: "सही दाम तय किया जा रहा है…" },
  "swa.work.live": { en: "Publishing your piece…", hi: "आपकी चीज़ प्रकाशित हो रही है…" },

  /* Shop */
  "shop.title": { en: "The market", hi: "बाज़ार" },
  "shop.all": { en: "All", hi: "सभी" },
  "shop.loading": { en: "Loading pieces…", hi: "चीज़ें लोड हो रही हैं…" },
  "shop.count": {
    en: "{count} pieces from independent studios",
    hi: "स्वतंत्र स्टूडियो से {count} चीज़ें",
  },
  "shop.countOne": {
    en: "1 piece from an independent studio",
    hi: "एक स्वतंत्र स्टूडियो से 1 चीज़",
  },
  "shop.search": { en: "Search pieces, materials, studios…", hi: "चीज़ें, सामग्री, स्टूडियो खोजें…" },
  "shop.search.hero": {
    en: "Find something made by hand",
    hi: "हाथ से बनी कोई चीज़ खोजें",
  },
  "shop.sort": { en: "Sort", hi: "क्रम" },
  "shop.sort.featured": { en: "Featured", hi: "प्रमुख" },
  "shop.sort.newest": { en: "Newest", hi: "नई" },
  "shop.sort.asc": { en: "Price: low to high", hi: "कीमत: कम से ज़्यादा" },
  "shop.sort.desc": { en: "Price: high to low", hi: "कीमत: ज़्यादा से कम" },
  "shop.empty.title": { en: "No pieces found", hi: "कोई चीज़ नहीं मिली" },
  "shop.empty.body": {
    en: "Try another search or category — new work arrives every week.",
    hi: "कोई और खोज या श्रेणी आज़माएँ — हर हफ़्ते नया काम आता है।",
  },
  "shop.clear": { en: "Clear filters", hi: "फ़िल्टर हटाएँ" },
  "shop.newArrivals": { en: "New arrivals", hi: "नई आई चीज़ें" },
  "shop.newArrivals.sub": {
    en: "Fresh from the studios this week",
    hi: "इस हफ़्ते स्टूडियो से ताज़ा",
  },
  "shop.featuredRail": { en: "Handpicked for you", hi: "आपके लिए चुनी गईं" },
  "shop.featuredRail.sub": {
    en: "Studio favourites and bestsellers",
    hi: "स्टूडियो की पसंदीदा और बेस्टसेलर",
  },
  "shop.allRail": { en: "Everything in the market", hi: "बाज़ार की सारी चीज़ें" },
  "shop.allRail.sub": {
    en: "All {count} pieces, across every craft",
    hi: "हर हुनर की सभी {count} चीज़ें",
  },

  /* Product card */
  "card.madeToOrder": { en: "Made to order", hi: "ऑर्डर पर बनाया जाता है" },
  "card.soldOut": { en: "Sold out", hi: "बिक गया" },
  "card.onlyLeft": { en: "Only {count} left", hi: "सिर्फ़ {count} बचे" },
  "card.by": { en: "by {name}", hi: "{name} द्वारा" },
  "card.addToBag": { en: "Add to bag", hi: "थैली में डालें" },
  "card.fav.add": { en: "Add to favorites", hi: "पसंदीदा में जोड़ें" },
  "card.fav.remove": { en: "Remove from favorites", hi: "पसंदीदा से हटाएँ" },
  "toast.fav.added": { en: "Saved to favorites", hi: "पसंदीदा में सहेज लिया" },
  "toast.fav.removed": { en: "Removed from favorites", hi: "पसंदीदा से हटा दिया" },
  "toast.fav.signin": { en: "Sign in to save favorites.", hi: "पसंदीदा सहेजने के लिए साइन इन करें।" },
  "toast.bag.added": { en: "Added to your bag", hi: "आपकी थैली में जुड़ गया" },
  "toast.bag.signin": { en: "Sign in to add pieces to your bag.", hi: "थैली में जोड़ने के लिए साइन इन करें।" },

  /* Product detail */
  "pd.back": { en: "Back", hi: "वापस" },
  "pd.readyToShip": { en: "Ready to ship", hi: "भेजने के लिए तैयार" },
  "pd.maker.visit": { en: "Visit studio →", hi: "स्टूडियो देखें →" },
  "pd.maker.desc": { en: "Materials", hi: "सामग्री" },
  "pd.qty": { en: "Quantity", hi: "मात्रा" },
  "pd.madeForYou": { en: "Made for you after ordering", hi: "ऑर्डर के बाद आपके लिए बनता है" },
  "pd.shipsSoon": { en: "Ships within a few days", hi: "कुछ दिनों में भेजा जाता है" },
  "pd.addToBag": { en: "Add to bag", hi: "थैली में डालें" },
  "pd.more": { en: "More from {name}", hi: "{name} की और चीज़ें" },
  "pd.gone.title": { en: "This piece is no longer listed", hi: "यह चीज़ अब सूची में नहीं है" },
  "pd.gone.body": {
    en: "It may have sold out or been retired by the artisan.",
    hi: "हो सकता है वह बिक गई हो या कारीगर ने हटा दी हो।",
  },
  "pd.gone.cta": { en: "Back to the market", hi: "बाज़ार में वापस जाएँ" },

  /* Maker storefront */
  "mf.pieces": { en: "{count} pieces listed", hi: "{count} चीज़ें सूचीबद्ध" },
  "mf.onePiece": { en: "1 piece listed", hi: "1 चीज़ सूचीबद्ध" },
  "mf.studio": { en: "The studio", hi: "स्टूडियो" },
  "mf.fromThisStudio": { en: "Pieces from this studio", hi: "इस स्टूडियो की चीज़ें" },
  "mf.empty": { en: "Nothing listed right now — check back soon.", hi: "अभी कुछ सूचीबद्ध नहीं — जल्द ही फिर देखें।" },
  "mf.notFound": { en: "This studio doesn't exist", hi: "यह स्टूडियो मौजूद नहीं है" },

  /* Cart */
  "cart.title": { en: "Your bag", hi: "आपकी थैली" },
  "cart.count": { en: "{count} pieces from independent studios", hi: "स्वतंत्र स्टूडियो से {count} चीज़ें" },
  "cart.countOne": { en: "1 piece from an independent studio", hi: "एक स्वतंत्र स्टूडियो से 1 चीज़" },
  "cart.empty": { en: "Your bag is empty", hi: "आपकी थैली खाली है" },
  "cart.empty.body": {
    en: "Find something made by hand — you'll know the difference.",
    hi: "हाथ से बनी कोई चीज़ खोजें — फ़र्क़ आप खुद महसूस करेंगे।",
  },
  "cart.browse": { en: "Browse the market", hi: "बाज़ार देखें" },
  "cart.remove": { en: "Remove {name}", hi: "{name} हटाएँ" },
  "cart.summary": { en: "Order summary", hi: "ऑर्डर का सार" },
  "cart.subtotal": { en: "Subtotal", hi: "कुल" },
  "cart.shipping": { en: "Shipping", hi: "डिलीवरी" },
  "cart.shippingNote": { en: "Set by each maker", hi: "हर कारीगर तय करता है" },
  "cart.total": { en: "Total", hi: "कुल राशि" },
  "cart.checkout": { en: "Checkout", hi: "चेकआउट" },
  "cart.fromStudio": { en: "Every order ships straight from the studio", hi: "हर ऑर्डर सीधे स्टूडियो से आता है" },
  "cart.checkout.title": { en: "Checkout", hi: "चेकआउट" },
  "cart.checkout.body": {
    en: "{count} pieces · {total} — tell us where to send them.",
    hi: "{count} चीज़ें · {total} — बताइए कहाँ भेजनी हैं।",
  },
  "cart.recipient": { en: "Recipient name", hi: "प्राप्तकर्ता का नाम" },
  "cart.recipient.invalid": { en: "Please add the recipient name.", hi: "कृपया प्राप्तकर्ता का नाम लिखें।" },
  "cart.address": { en: "Shipping address", hi: "डिलीवरी का पता" },
  "cart.address.ph": {
    en: "House no., street, city, PIN",
    hi: "मकान नंबर, गली, शहर, पिन कोड",
  },
  "cart.address.invalid": { en: "Please add a complete shipping address.", hi: "कृपया पूरा डिलीवरी पता लिखें।" },
  "cart.cancel": { en: "Cancel", hi: "रद्द करें" },
  "cart.placeOrder": { en: "Place order · {total}", hi: "ऑर्डर करें · {total}" },
  "cart.placing": { en: "Placing order…", hi: "ऑर्डर हो रहा है…" },
  "cart.ordered": { en: "Order placed — thank you!", hi: "ऑर्डर हो गया — धन्यवाद!" },
  "cart.method": { en: "Payment method", hi: "भुगतान का तरीका" },
  "cart.method.sub": { en: "How would you like to pay?", hi: "आप कैसे भुगतान करेंगे?" },
  "cart.method.upi": { en: "UPI", hi: "UPI" },
  "cart.method.upi.sub": { en: "GPay, PhonePe, Paytm…", hi: "GPay, PhonePe, Paytm…" },
  "cart.method.card": { en: "Card", hi: "कार्ड" },
  "cart.method.card.sub": { en: "Credit / debit card", hi: "क्रेडिट / डेबिट कार्ड" },
  "cart.continuePay": { en: "Continue to payment", hi: "भुगतान के लिए आगे बढ़ें" },
  "cart.pay.title": { en: "Complete your payment", hi: "अपना भुगतान पूरा करें" },
  "cart.pay.sub": {
    en: "You're paying {total} for {count} pieces.",
    hi: "आप {count} चीज़ों के लिए {total} भुगतान कर रहे हैं।",
  },
  "cart.pay.upi.label": { en: "UPI ID", hi: "UPI आईडी" },
  "cart.pay.upi.ph": { en: "yourname@upi", hi: "yourname@upi" },
  "cart.pay.card.label": { en: "Card number", hi: "कार्ड नंबर" },
  "cart.pay.card.ph": { en: "1234 5678 9012 3456", hi: "1234 5678 9012 3456" },
  "cart.pay.button": { en: "Pay {total}", hi: "{total} भुगतान करें" },
  "cart.pay.processing": { en: "Processing payment…", hi: "भुगतान हो रहा है…" },
  "cart.pay.secure": {
    en: "Secured by Razorpay · 256-bit encryption",
    hi: "Razorpay द्वारा सुरक्षित · 256-बिट एन्क्रिप्शन",
  },
  "cart.pay.demo": { en: "Demo mode — no real money is charged.", hi: "डेमो मोड — कोई असली पैसा नहीं कटेगा।" },
  "cart.pay.rzp": {
    en: "You'll continue on the secure Razorpay page.",
    hi: "आप सुरक्षित Razorpay पृष्ठ पर जाएँगे।",
  },
  "cart.pay.rzp.button": { en: "Continue to Razorpay", hi: "Razorpay पर जाएँ" },
  "cart.pay.change": { en: "Change", hi: "बदलें" },
  "cart.pay.upi.invalid": { en: "Enter a valid UPI ID (e.g. name@upi).", hi: "सही UPI आईडी लिखें (जैसे name@upi)।" },
  "cart.pay.card.invalid": { en: "Enter a valid card number.", hi: "सही कार्ड नंबर लिखें।" },

  /* Orders */
  "orders.title": { en: "Your orders", hi: "आपके ऑर्डर" },
  "orders.count": { en: "{count} orders from independent studios", hi: "स्वतंत्र स्टूडियो से {count} ऑर्डर" },
  "orders.countOne": { en: "1 order from an independent studio", hi: "एक स्वतंत्र स्टूडियो से 1 ऑर्डर" },
  "orders.empty": { en: "Nothing ordered yet", hi: "अभी कुछ ऑर्डर नहीं हुआ" },
  "orders.empty.body": {
    en: "When you buy from an artisan, it'll show up here.",
    hi: "जब आप किसी कारीगर से खरीदेंगे, तो वह यहाँ दिखेगा।",
  },
  "orders.start": { en: "Start shopping", hi: "खरीदारी शुरू करें" },
  "orders.placedBanner": { en: "Order placed — thank you!", hi: "ऑर्डर हो गया — धन्यवाद!" },
  "orders.placedBody": {
    en: "The artisans you ordered from have been notified and will start preparing your pieces.",
    hi: "आपके ऑर्डर वाले कारीगरों को सूचना मिल गई है और वे आपकी चीज़ें बनाना शुरू कर देंगे।",
  },
  "orders.number": { en: "Order", hi: "ऑर्डर" },
  "orders.status.paid": { en: "Paid", hi: "भुगतान हुआ" },
  "orders.status.shipped": { en: "Shipped", hi: "भेज दिया गया" },
  "orders.status.delivered": { en: "Delivered", hi: "पहुँच गया" },
  "orders.qtyEach": { en: "Qty {qty} · {price} each", hi: "मात्रा {qty} · {price} प्रति" },
  "orders.total": { en: "Total", hi: "कुल राशि" },

  /* Favorites */
  "fav.title": { en: "Favorites", hi: "पसंदीदा" },
  "fav.count": { en: "{count} pieces you love", hi: "{count} चीज़ें जो आपको पसंद हैं" },
  "fav.countOne": { en: "1 piece you love", hi: "1 चीज़ जो आपको पसंद है" },
  "fav.empty": { en: "No favorites yet", hi: "अभी कोई पसंदीदा नहीं" },
  "fav.empty.body": {
    en: "Tap the heart on any piece to keep it here while you decide.",
    hi: "किसी भी चीज़ पर दिल का निशान दबाएँ, वह यहाँ सुरक्षित रहेगी।",
  },

  /* Dashboard */
  "dash.welcome": { en: "Welcome back", hi: "वापसी पर स्वागत है" },
  "dash.hey": { en: "Hey {name}", hi: "नमस्ते {name}" },
  "dash.continue": { en: "Continue shopping", hi: "खरीदारी जारी रखें" },
  "dash.bag": { en: "In your bag", hi: "थैली में" },
  "dash.fav": { en: "Favorites", hi: "पसंदीदा" },
  "dash.orders": { en: "Orders", hi: "ऑर्डर" },
  "dash.saved": { en: "Saved pieces", hi: "सहेजी चीज़ें" },
  "dash.allTime": { en: "All time", hi: "अब तक" },
  "dash.empty": { en: "Empty", hi: "खाली" },
  "dash.browse": { en: "Browse the market", hi: "बाज़ार देखें" },
  "dash.browse.body": {
    en: "Fresh pieces from studios across India.",
    hi: "पूरे भारत के स्टूडियो से नई चीज़ें।",
  },
  "dash.track": { en: "Track your orders", hi: "अपने ऑर्डर देखें" },
  "dash.track.body": {
    en: "No orders yet — your first one is waiting to happen.",
    hi: "अभी कोई ऑर्डर नहीं — आपका पहला ऑर्डर इंतज़ार कर रहा है।",
  },
  "dash.track.bodyN": { en: "{count} orders placed.", hi: "{count} ऑर्डर हो चुके हैं।" },
  "dash.yourFav": { en: "Your favorites", hi: "आपके पसंदीदा" },
  "dash.yourFav.body": { en: "Heart a piece to keep it here.", hi: "किसी चीज़ पर दिल दबाएँ, वह यहाँ रहेगी।" },
  "dash.yourFav.bodyN": { en: "{count} saved pieces.", hi: "{count} सहेजी चीज़ें।" },
  "dash.openStudio": { en: "Open your studio", hi: "अपना स्टूडियो खोलें" },
  "dash.openStudio.body": {
    en: "Sell your own work with zero platform fees.",
    hi: "बिना किसी फ़ीस के अपना काम बेचें।",
  },
  "dash.studio.bodyN": { en: "{count} listings · manage your storefront.", hi: "{count} सूचियाँ · अपना स्टोर संभालें।" },
  "dash.manage": { en: "Manage listings →", hi: "सूचियाँ संभालें →" },
  "dash.live": { en: "your studio is live", hi: "आपका स्टूडियो लाइव है" },
  "dash.new": { en: "New from the studios", hi: "स्टूडियो से नई चीज़ें" },
  "dash.seeAll": { en: "See all", hi: "सभी देखें" },
  "dash.sellai.title": {
    en: "Make things? Sell them with AI.",
    hi: "कुछ बनाते हैं? AI से बेचिए।",
  },
  "dash.sellai.sub": {
    en: "One photo and a few words in your language is all it takes — AI writes, translates, prices and publishes your piece.",
    hi: "बस एक फ़ोटो और अपनी भाषा में कुछ शब्द — AI विवरण लिखता, अनुवाद करता, दाम तय करता और आपकी चीज़ प्रकाशित कर देता है।",
  },

  /* Studio — auth / onboarding */
  "st.title": { en: "Artisan studio", hi: "कारीगर स्टूडियो" },
  "st.phone.title": { en: "Start with your phone number", hi: "अपने फ़ोन नंबर से शुरू करें" },
  "st.phone.sub": {
    en: "No email, no password. We'll send a code to verify it's you.",
    hi: "न ईमेल, न पासवर्ड। हम एक कोड भेजेंगे ताकि पक्का हो कि आप ही हैं।",
  },
  "st.phone.label": { en: "Phone number", hi: "फ़ोन नंबर" },
  "st.phone.placeholder": { en: "e.g. 98765 43210", hi: "जैसे 98765 43210" },
  "st.phone.send": { en: "Send code", hi: "कोड भेजें" },
  "st.phone.sending": { en: "Sending…", hi: "भेजा जा रहा है…" },
  "st.phone.demo": {
    en: "Demo mode — your code is {code}",
    hi: "डेमो मोड — आपका कोड है {code}",
  },
  "st.otp.title": { en: "Enter the code", hi: "कोड दर्ज करें" },
  "st.otp.sub": { en: "We sent a 6-digit code to {phone}", hi: "{phone} पर 6 अंकों का कोड भेजा गया है" },
  "st.otp.verify": { en: "Verify & continue", hi: "सत्यापित करें और आगे बढ़ें" },
  "st.otp.verifying": { en: "Verifying…", hi: "जाँच हो रही है…" },
  "st.otp.wrong": { en: "The code you entered is incorrect.", hi: "आपका कोड सही नहीं है।" },
  "st.otp.tryAgain": { en: "Change number", hi: "नंबर बदलें" },
  "st.otp.resend": { en: "Didn't get the code?", hi: "कोड नहीं मिला?" },
  "st.phone.needed": {
    en: "To sell on कारीgari, first verify your phone number.",
    hi: "कारीgari पर बेचने के लिए पहले अपना फ़ोन नंबर सत्यापित करें।",
  },
  "st.phone.verified": {
    en: "Phone verified — let's open your studio!",
    hi: "फ़ोन सत्यापित — चलिए स्टूडियो खोलते हैं!",
  },

  /* Onboarding steps */
  "ob.step": { en: "Step {n} of 3", hi: "चरण {n} का 3" },
  "ob.name.title": { en: "What's your name?", hi: "आपका नाम क्या है?" },
  "ob.name.sub": { en: "We'll use it for your studio.", hi: "हम इसे आपके स्टूडियो के लिए रखेंगे।" },
  "ob.name.placeholder": { en: "Your name", hi: "आपका नाम" },
  "ob.craft.title": { en: "What do you make?", hi: "आप क्या बनाते हैं?" },
  "ob.craft.sub": { en: "Tap your craft.", hi: "अपना हुनर चुनें।" },
  "ob.craft.subMulti": {
    en: "Tap every craft you make — you can pick more than one.",
    hi: "अपने सभी हुनर दबाएँ — एक से अधिक चुन सकते हैं।",
  },
  "ob.story.title": { en: "Tell your story", hi: "अपनी कहानी सुनाइए" },
  "ob.story.sub": {
    en: "Tap the mic and tell us about your work in your own words — or type if you prefer.",
    hi: "माइक दबाएँ और अपने काम के बारे में अपनी भाषा में बताइए — या चाहें तो लिखिए।",
  },
  "ob.story.record": { en: "Tap to speak", hi: "बोलने के लिए दबाएँ" },
  "ob.story.recording": { en: "Listening… tap to stop", hi: "सुन रहे हैं… रोकने के लिए दबाएँ" },
  "ob.story.recorded": { en: "Voice note recorded", hi: "आवाज़ रिकॉर्ड हो गई" },
  "ob.story.unsupported": {
    en: "Voice input isn't supported here — you can type instead.",
    hi: "इस ब्राउज़र में आवाज़ नहीं चलेगी — आप लिख सकते हैं।",
  },
  "ob.story.or": { en: "or type it here", hi: "या यहाँ लिखें" },
  "ob.story.placeholder": {
    en: "e.g. “I have been making clay pots for 30 years, my grandfather taught me…”",
    hi: "जैसे “मैं 30 साल से मिट्टी के बर्तन बनाता हूँ, यह मेरे दादाजी ने सिखाया था…”",
  },
  "ob.photo": { en: "Add a photo of your work", hi: "अपने काम की फ़ोटो जोड़ें" },
  "ob.photo.sub": { en: "Optional — you can add one later.", hi: "ज़रूरी नहीं — बाद में भी जोड़ सकते हैं।" },
  "ob.photo.upload": { en: "Choose photo", hi: "फ़ोटो चुनें" },
  "ob.photo.uploading": { en: "Uploading…", hi: "अपलोड हो रहा है…" },
  "ob.photo.change": { en: "Change photo", hi: "फ़ोटो बदलें" },
  "ob.generate": { en: "✨ Write my story for me", hi: "✨ मेरी कहानी मेरे लिए लिखिए" },
  "ob.generating": { en: "Writing your story…", hi: "आपकी कहानी लिखी जा रही है…" },
  "ob.review.title": { en: "Your story, your words", hi: "आपकी कहानी, आपके शब्द" },
  "ob.review.sub": {
    en: "We wrote this for you. Read it, change anything you like, then open your studio.",
    hi: "हमने यह आपके लिए लिखा है। पढ़िए, जो चाहें बदलिए, फिर अपना स्टूडियो खोलिए।",
  },
  "ob.review.shopName": { en: "Studio name", hi: "स्टूडियो का नाम" },
  "ob.review.location": { en: "Your town / city", hi: "आपका गाँव / शहर" },
  "ob.review.storyLabel": { en: "Your story", hi: "आपकी कहानी" },
  "ob.review.bioLabel": { en: "Short intro", hi: "छोटा परिचय" },
  "ob.launch": { en: "Open my studio", hi: "मेरा स्टूडियो खोलें" },
  "ob.launching": { en: "Opening…", hi: "खुल रहा है…" },
  "ob.back": { en: "Back", hi: "वापस" },
  "ob.next": { en: "Next", hi: "आगे" },
  "ob.name.required": { en: "Please enter your name.", hi: "कृपया अपना नाम लिखें।" },
  "ob.launched": { en: "Your studio is live!", hi: "आपका स्टूडियो लाइव है!" },

  /* Studio management */
  "stm.active": { en: "Active listings", hi: "सक्रिय सूचियाँ" },
  "stm.total": { en: "Total listings", hi: "कुल सूचियाँ" },
  "stm.sold": { en: "Units sold", hi: "बिकी चीज़ें" },
  "stm.revenue": { en: "Revenue", hi: "आमदनी" },
  "stm.listings": { en: "Your listings", hi: "आपकी सूचियाँ" },
  "stm.sales": { en: "Recent sales", hi: "हाल की बिक्री" },
  "stm.sales.empty": {
    en: "No sales yet — share your studio link and the orders will land here.",
    hi: "अभी कोई बिक्री नहीं — अपना स्टूडियो लिंक बाँटिए, ऑर्डर यहाँ दिखेंगे।",
  },
  "stm.newListing": { en: "New listing", hi: "नई सूची" },
  "stm.sellai.title": {
    en: "Your next piece can be live in about a minute",
    hi: "आपकी अगली चीज़ लगभग एक मिनट में लाइव हो सकती है",
  },
  "stm.sellai.sub": {
    en: "Sell with AI takes one photo and a few words from you, then enhances the photo, writes the description, translates it, picks the category and suggests a fair price. You stay in charge of every word — AI just does the typing.",
    hi: "Sell with AI आपसे एक फ़ोटो और कुछ शब्द लेता है — फिर फ़ोटो सुधारता, विवरण लिखता, अनुवाद करता, श्रेणी चुनता और सही दाम सुझाता है। हर शब्द पर आपका ही हक़ रहता है — AI सिर्फ़ टाइपिंग का काम करता है।",
  },
  "stm.sellai.cta": { en: "Sell with AI", hi: "AI से बेचिए" },
  "stm.profile": { en: "Studio profile", hi: "स्टूडियो प्रोफ़ाइल" },
  "stm.live": { en: "Live", hi: "लाइव" },
  "stm.retired": { en: "Retired", hi: "हटाई गई" },
  "stm.stock": { en: "Stock {n}", hi: "स्टॉक {n}" },
  "stm.retire": { en: "Retire listing", hi: "सूची हटाएँ" },
  "stm.edit": { en: "Edit listing", hi: "सूची बदलें" },
  "stm.retiredToast": { en: "Listing retired", hi: "सूची हटा दी गई" },
  "stm.editToast": { en: "Listing updated", hi: "सूची अपडेट हो गई" },
  "stm.publishToast": { en: "Listing published", hi: "सूची प्रकाशित हो गई" },

  /* Listing dialog */
  "ld.new": { en: "New listing", hi: "नई सूची" },
  "ld.newSub": { en: "Describe the piece so buyers know what they're getting.", hi: "चीज़ के बारे में बताइए ताकि खरीदार समझ सकें कि उन्हें क्या मिलेगा।" },
  "ld.edit": { en: "Edit listing", hi: "सूची बदलें" },
  "ld.editSub": { en: "Update the details of this piece.", hi: "इस चीज़ की जानकारी बदलें।" },
  "ld.name": { en: "Piece name", hi: "चीज़ का नाम" },
  "ld.name.ph": { en: "e.g. Blue pottery vase", hi: "जैसे ब्लू पॉटरी का फूलदान" },
  "ld.category": { en: "Category", hi: "श्रेणी" },
  "ld.price": { en: "Price (₹)", hi: "कीमत (₹)" },
  "ld.photo": { en: "Photo of the piece", hi: "चीज़ की फ़ोटो" },
  "ld.photoHelp": { en: "A clear photo from the front, in good light.", hi: "अच्छी रोशनी में सामने से साफ़ फ़ोटो।" },
  "ld.enhance": { en: "✨ Enhance photo", hi: "✨ फ़ोटो सुधारें" },
  "ld.enhanced": { en: "Photo enhanced ✓", hi: "फ़ोटो सुधरी ✓" },
  "ld.photoMeasured": {
    en: "Photo measured: {light}.",
    hi: "फ़ोटो जाँची गई: {light}।",
  },
  "ld.light.bright_and_evenly_lit": { en: "bright and evenly lit", hi: "तेज़ और सम रोशनी" },
  "ld.light.soft_light": { en: "soft light", hi: "मुलायम रोशनी" },
  "ld.light.low_light": { en: "low light", hi: "कम रोशनी" },
  "ld.smartCatalogue": { en: "🪄 Smart catalogue", hi: "🪄 स्मार्ट कैटलॉग" },
  "ld.smartWorking": { en: "Cataloguing…", hi: "कैटलॉग बन रहा है…" },
  "ld.smartDone": {
    en: "Catalogue filled from your voice & photo — review and edit anything.",
    hi: "कैटलॉग आपकी आवाज़ और फ़ोटो से भर दिया — जाँच लें और बदल भी सकते हैं।",
  },
  "ld.smartNeedsInput": {
    en: "Speak a few words about the piece, or add its photo — then tap Smart catalogue.",
    hi: "चीज़ के बारे में कुछ बोलिए या उसकी फ़ोटो जोड़ें — फिर स्मार्ट कैटलॉग दबाएँ।",
  },
  "ld.smartHelp": {
    en: "Smart catalogue fills the name, category, materials, colors, size, tags and description from what you said and your photo.",
    hi: "स्मार्ट कैटलॉग आपके बोले शब्दों और फ़ोटो से नाम, श्रेणी, सामग्री, रंग, नाप, टैग और विवरण भर देता है।",
  },
  "ld.sellWithAi": { en: "Sell with AI", hi: "AI से बेचिए" },
  "ld.sellWithAiSub": {
    en: "Two things from you — a photo and a few spoken words. AI does the other five steps.",
    hi: "आपकी तरफ़ से दो चीज़ें — एक फ़ोटो और कुछ बोले हुए शब्द। बाक़ी पाँच क़दम AI करता है।",
  },
  "ld.sellRun": { en: "Sell with AI", hi: "AI से बेचिए" },
  "ld.sellRunning": { en: "AI is working…", hi: "AI काम कर रहा है…" },
  "ld.sellNeedsInput": {
    en: "Add a photo or say a few words about your piece first.",
    hi: "पहले फ़ोटो जोड़ें या अपनी चीज़ के बारे में कुछ बोलिए।",
  },
  "ld.sellDone": {
    en: "Filled from your photo and voice — check anything and edit freely.",
    hi: "आपकी फ़ोटो और आवाज़ से भर दिया — जो चाहें जाँचें और बदलें।",
  },
  "ld.sellLive": { en: "Your piece is live 🎉", hi: "आपकी चीज़ लाइव है 🎉" },
  "ld.sellStepNow": { en: "Step {n} of 7", hi: "7 में से क़दम {n}" },
  "ld.priceSuggest": { en: "AI suggests {price}", hi: "AI {price} सुझाता है" },
  "ld.priceWhy": { en: "Why this price", hi: "यह दाम क्यों" },
  "ld.usePrice": { en: "Use this price", hi: "यह दाम रखें" },
  "ld.priceApplied": { en: "This price is applied", hi: "यह दाम लगा हुआ है" },
  "ld.hindiReady": { en: "Hindi version", hi: "हिंदी अनुवाद" },
  "ld.enhanceHint": {
    en: "AI does this for you when you tap Sell with AI.",
    hi: "Sell with AI दबाने पर AI यह ख़ुद कर देता है।",
  },
  "ld.colors": { en: "Colors (comma-separated)", hi: "रंग (अल्पविराम से अलग करें)" },
  "ld.colors.ph": { en: "Indigo, terracotta", hi: "नील, गेरुआ" },
  "ld.dimensions": { en: "Size", hi: "नाप" },
  "ld.dimensions.ph": { en: "25 × 18 cm", hi: "25 × 18 सेमी" },
  "ld.tags": { en: "Search tags (comma-separated)", hi: "खोज टैग (अल्पविराम से अलग करें)" },
  "ld.tags.ph": { en: "diya, clay, festival", hi: "दिया, मिट्टी, त्योहार" },
  "pd.story.title": { en: "The story behind this piece", hi: "इस चीज़ के पीछे की कहानी" },
  "pd.meet.title": { en: "Meet the artisan", hi: "कारीगर से मिलिए" },
  "pd.meet.made": { en: "Made by hand in", hi: "हाथ से बनी —" },
  "pd.maker.crafts": { en: "Also works in", hi: "और भी हुनर" },
  "mf.meet": { en: "Meet the artisan", hi: "कारीगर से मिलिए" },
  "mf.craftStory": { en: "The craft story", hi: "हुनर की कहानी" },
  "mf.craftsLabel": { en: "Crafts", hi: "हुनर" },
  "stm.craftsHint": { en: "Tap all that apply — you can sell under several crafts.", hi: "जो लागू हों सभी दबाएँ — आप कई हुनरों में बेच सकते हैं।" },
  "ld.materials": { en: "Materials (comma-separated)", hi: "सामग्री (अल्पविराम से अलग करें)" },
  "ld.materials.ph": { en: "Clay, natural dye", hi: "मिट्टी, प्राकृतिक रंग" },
  "ld.desc": { en: "Description", hi: "विवरण" },
  "ld.desc.ph": { en: "What is it, how is it made?", hi: "यह क्या है, कैसे बनता है?" },
  "ld.madeToOrder": { en: "Made to order", hi: "ऑर्डर पर बनता है" },
  "ld.public": { en: "Listed publicly", hi: "सार्वजनिक रूप से दिखे" },
  "ld.stock": { en: "Stock", hi: "स्टॉक" },
  "ld.cancel": { en: "Cancel", hi: "रद्द करें" },
  "ld.save": { en: "Save changes", hi: "बदलाव सहेजें" },
  "ld.publish": { en: "Publish listing", hi: "सूची प्रकाशित करें" },
  "ld.voice": { en: "Describe it with your voice", hi: "अपनी आवाज़ में बताइए" },
  "ld.voiceHelp": { en: "Say a few words — we'll write the description for you.", hi: "कुछ शब्द बोलिए — हम विवरण लिख देंगे।" },
  "ld.aiGenerate": { en: "✨ Write it for me", hi: "✨ मेरे लिए लिखिए" },
  "ld.aiGenerating": { en: "Writing…", hi: "लिखा जा रहा है…" },
  "ld.aiNeedsVoice": {
    en: "Tap the mic and say a little about your piece first.",
    hi: "पहले माइक दबाकर अपनी चीज़ के बारे में कुछ कहिए।",
  },

  /* Categories (craft) */
  "cat.Pottery&Terracotta": { en: "Pottery & Terracotta", hi: "मिट्टी के बर्तन" },
  "cat.HandloomTextiles": { en: "Handloom Textiles", hi: "हथकरघा वस्त्र" },
  "cat.BlockPrinting": { en: "Block Printing", hi: "ब्लॉक छपाई" },
  "cat.Jewelry": { en: "Jewelry", hi: "आभूषण" },
  "cat.Woodwork": { en: "Woodwork", hi: "लकड़ी का काम" },
  "cat.Metalwork": { en: "Metalwork", hi: "धातु शिल्प" },
  "cat.Bamboo&Cane": { en: "Bamboo & Cane", hi: "बाँस व बेत" },

  /* Auth */
  "auth.role.buy": { en: "I want to Buy", hi: "मुझे खरीदना है" },
  "auth.role.artisan": { en: "I'm an Artisan", hi: "मैं कारीगर हूँ" },
  "auth.buy.title": { en: "Get started", hi: "शुरू करें" },
  "auth.buy.sub": { en: "Enter your email to log in or sign up.", hi: "लॉगिन या साइन अप के लिए अपना ईमेल डालें।" },
  "auth.buy.email": { en: "name@example.com", hi: "name@example.com" },
  "auth.buy.or": { en: "Or", hi: "या" },
  "auth.buy.guest": { en: "Continue as guest", hi: "बिना खाते जारी रखें" },
  "auth.otp.check": { en: "Check your email", hi: "अपना ईमेल देखें" },
  "auth.otp.sent": { en: "We've sent a code to {email}", hi: "{email} पर कोड भेजा गया है" },
  "auth.otp.verify": { en: "Verify code", hi: "कोड सत्यापित करें" },
  "auth.otp.verifying": { en: "Verifying…", hi: "जाँच हो रही है…" },
  "auth.otp.wrong": { en: "The verification code you entered is incorrect.", hi: "आपका सत्यापन कोड सही नहीं है।" },
  "auth.otp.tryAgain": { en: "Try again", hi: "फिर कोशिश करें" },
  "auth.otp.different": { en: "Use different email", hi: "दूसरा ईमेल इस्तेमाल करें" },
  "auth.artisan.pitch": {
    en: "Verify with your phone, then Sell with AI: one photo and a few spoken words put your piece in front of buyers — described, translated, priced and live.",
    hi: "फ़ोन से सत्यापन कीजिए, फिर Sell with AI: एक फ़ोटो और कुछ बोले हुए शब्द — आपकी चीज़ विवरण, अनुवाद और दाम के साथ खरीदारों के सामने लाइव हो जाती है।",
  },
  "auth.buy.pitch": {
    en: "Buy handmade pieces straight from the maker — and see the artisan behind every one.",
    hi: "हाथ से बनी चीज़ें सीधे कारीगर से खरीदें — और हर चीज़ के पीछे के कारीगर से मिलिए।",
  },
  "auth.footer": { en: "Secured by", hi: "सुरक्षा" },

  /* NotFound */
  "nf.title": { en: "This page took a detour", hi: "यह पृष्ठ रास्ता भूल गया" },
  "nf.body": { en: "The page you're looking for doesn't exist.", hi: "जो पृष्ठ आप ढूँढ रहे हैं वह मौजूद नहीं है।" },
  "nf.home": { en: "Back home", hi: "घर वापस" },

  /* Footer */
  "footer.blurb": {
    en: "A platform built to remove the digital barrier for artisans. Take a photo, say a few words in your own language, and AI describes, translates, prices and publishes your piece — every rupee going straight to the maker.",
    hi: "कारीगरों के रास्ते से डिजिटल दीवार हटाने के लिए बना प्लेटफ़ॉर्म। एक फ़ोटो लीजिए, अपनी भाषा में कुछ बोलिए — AI विवरण लिखता, अनुवाद करता, दाम तय करता और चीज़ प्रकाशित कर देता है। हर रुपया सीधे कारीगर के पास।",
  },
  "footer.shop": { en: "Shop", hi: "खरीदारी" },
  "footer.browseAll": { en: "Browse all", hi: "सभी देखें" },
  "footer.newArrivals": { en: "New arrivals", hi: "नई आई चीज़ें" },
  "footer.makers": { en: "Makers", hi: "कारीगर" },
  "footer.openStudio": { en: "Open a studio", hi: "स्टूडियो खोलें" },
  "footer.home": { en: "Home", hi: "होम" },
  "footer.account": { en: "Account", hi: "खाता" },
  "footer.direct": { en: "Buy straight from the maker", hi: "सीधे कारीगर से खरीदें" },
};

const CATEGORY_KEYS: Record<string, string> = {
  "Pottery & Terracotta": "cat.Pottery&Terracotta",
  "Handloom Textiles": "cat.HandloomTextiles",
  "Block Printing": "cat.BlockPrinting",
  Jewelry: "cat.Jewelry",
  Woodwork: "cat.Woodwork",
  Metalwork: "cat.Metalwork",
  "Bamboo & Cane": "cat.Bamboo&Cane",
};

/** Translate a craft category value into the active language. */
export function categoryName(category: string, lang: Lang): string {
  const key = CATEGORY_KEYS[category];
  if (!key) return category;
  return DICT[key]?.[lang] ?? category;
}

const I18nContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}>({
  lang: "en",
  setLang: () => undefined,
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("kaarigari.lang");
      return saved === "hi" ? "hi" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("kaarigari.lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text = DICT[key]?.[lang] ?? DICT[key]?.en ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.split(`{${k}}`).join(String(v));
        }
      }
      return text;
    },
    [lang],
  );

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}