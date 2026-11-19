/**
 * Every word Optionality's own pages say, हिंदी में.
 * Keys, {{places}} and <tags> are those of en.ts.
 */

import type { Translation } from "./en.ts";

const words: Translation = {
  // ─── game.journal ───
  "game.journal.col.symbol": "सिंबल",
  "game.journal.col.historicity": "ऐतिहासिकता",
  "game.journal.col.difficulty": "कठिनाई",
  "game.journal.col.created": "बनाया",
  "game.journal.col.updated": "बदला",
  "game.journal.col.grade": "ग्रेड",
  "game.journal.col.score": "अंक",
  "game.journal.col.status": "स्थिति",
  "game.journal.group.none": "कोई नहीं",

  // ─── game.tool ───
  "game.tool.deal_scenario": "ट्रेड परिदृश्य",
  "game.tool.judge_trade": "पिच समीक्षा",
  "game.tool.ask_tip": "संकेत का अनुरोध",
  "game.tool.save_draft": "ड्राफ़्ट सहेजो",
  "game.tool.purchase_credits": "टॉप अप",
  "game.tool.check_payment": "भुगतान जाँच",
  "game.tool.check_balance": "बैलेंस जाँच",
  "game.tool.check_price": "मूल्य पूर्वावलोकन",
  "game.tool.get_leaderboard": "लीडरबोर्ड",
  "game.tool.get_my_rank": "मेरी रैंक",
  "game.tool.get_journal": "जर्नल देखना",
  "game.tool.list_journal": "जर्नल सूची",
  "game.tool.delete_journal": "जर्नल हटाना",
  "game.tool.set_display_name": "प्रदर्शन नाम",
  "game.tool.get_api_usage_stats": "API उपयोग",
  "game.tool.account_statement": "खाता विवरण",
  "game.tool.request_npub_proof": "साइन-इन (अनुरोध)",
  "game.tool.receive_npub_proof": "साइन-इन (सत्यापन)",

  // ─── game.difficulty ───
  "game.difficulty.apprentice.label": "प्रशिक्षु",
  "game.difficulty.apprentice.blurb": "साफ़ दिशात्मक सेटअप। सीधी-सादी मैक्रो पृष्ठभूमि।",
  "game.difficulty.journeyman.label": "कारीगर",
  "game.difficulty.journeyman.blurb": "अस्थिरता का दौर मायने रखता है। नतीजे, फ़ेड के दिन, एकल कैटलिस्ट।",
  "game.difficulty.adept.label": "निपुण",
  "game.difficulty.adept.blurb": "कई कारक। एसेट्स के बीच सहसंबंध। स्क्यू और टर्म संरचना।",
  "game.difficulty.sovereign.label": "संप्रभु",
  "game.difficulty.sovereign.blurb": "व्यवस्था-परिवर्तन का दौर। मुद्रा अवमूल्यन, भू-राजनीति, टेल हेजिंग।",
  "game.difficulty.mulligan.label": "दोबारा मौक़ा",

  // ─── game.mode ───
  "game.mode.historical.label": "ऐतिहासिक कथा",
  "game.mode.historical.blurb": "बाज़ार के इतिहास के एक असली पल पर आधारित। मैक्रो असली; आँकड़े समायोजित।",
  "game.mode.fiction.label": "काल्पनिक",
  "game.mode.fiction.blurb": "पूरी तरह गढ़ा हुआ। निकट भविष्य की परिकल्पनाएँ, प्रति-तथ्य, सट्टात्मक दौर।",
  "game.mode.live.label": "लाइव घटनाएँ",
  "game.mode.live.blurb": "वेब सर्च के ज़रिए आज के असली बाज़ार पर आधारित। असली टिकर, असली कैटलिस्ट, अभी।",

  // ─── game.sector ───
  "game.sector.any": "कोई भी",
  "game.sector.biotech": "बायोटेक",
  "game.sector.semis": "सेमीकंडक्टर",
  "game.sector.megaTech": "मेगा टेक",
  "game.sector.banks": "बैंक",
  "game.sector.energy": "ऊर्जा",
  "game.sector.miners": "खनन",
  "game.sector.consumer": "उपभोक्ता",
  "game.sector.homebuilders": "आवास निर्माण",
  "game.sector.defense": "रक्षा",
  "game.sector.airlines": "एयरलाइंस",
  "game.sector.crypto": "क्रिप्टो शेयर",
  "game.sector.index": "इंडेक्स/ETF",

  // ─── game.dimension ───
  "game.dimension.strategy_selection": "संरचना",
  "game.dimension.strikes_and_tenor": "स्ट्राइक और अवधि",
  "game.dimension.risk_reward": "जोखिम / लाभ",
  "game.dimension.macro_integration": "मैक्रो संदर्भ",
  "game.dimension.tail_risk": "टेल की समझ",
  "game.dimension.communication": "संप्रेषण",

  // ─── game.zoom ───
  "game.zoom.title": "इसे बड़े अक्षरों में पढ़ने के लिए टैप करो",

  // ─── game.loading ───
  "game.loading.tape": "बाज़ार पढ़ा जा रहा है",
  "game.loading.wire": "ख़बरें सुनी जा रही हैं",
  "game.loading.judging": "तुम्हारी पिच जाँची जा रही है",
  "game.loading.reissuing": "परिदृश्य दोबारा जारी हो रहा है",

  // ─── game.error ───
  "game.error.agedOut": "तुम्हारे लौटने से पहले वह असाइनमेंट समाप्त हो गया। कोई शुल्क नहीं लिया गया। एक नया लो।",
  "game.error.recover": "वह असाइनमेंट वापस नहीं मिल सका। {{message}}",
  "game.error.start": "परिदृश्य शुरू नहीं हो सका। {{message}}",
  "game.error.typeFirst": "पहले अपना ट्रेड लिखो।",
  "game.error.noScenario": "कोई सक्रिय परिदृश्य नहीं। पहले एक नया लो।",
  "game.error.notInJournal": "वह परिदृश्य अब तुम्हारी जर्नल में नहीं है, इसलिए उसे जाँचा नहीं जा सकता। पिच करने के लिए एक नया लो। कोई शुल्क नहीं लिया गया।",
  "game.error.evaluation": "मूल्यांकन विफल रहा। {{message}}",
  "game.error.noScenarioToSave": "सहेजने के लिए कोई सक्रिय परिदृश्य नहीं।",
  "game.error.save": "सहेजना विफल रहा। {{message}}",
  "game.error.acceptFirst": "संकेत माँगने से पहले चुनौती स्वीकार करो।",
  "game.error.clue": "संकेत का अनुरोध विफल रहा। {{message}}",
  "game.error.replay": "दोबारा खेलना विफल रहा। {{message}}",
  "game.error.nothingToResume": "इस प्रविष्टि में फिर से शुरू करने लायक कोई परिदृश्य नहीं है।",

  // ─── game.entry ───
  "game.entry.yourTrade": "तुम्हारा ट्रेड",
  "game.entry.headline": "एक पंक्ति में",
  "game.entry.riskProfile": "जोखिम प्रोफ़ाइल",
  "game.entry.alternative": "विकल्प",
  "game.entry.deeper": "गहरा संदर्भ",
  "game.entry.redoTitle": "इस परिदृश्य को दोबारा मौक़े के रूप में जारी करो: वही सेटअप, नई पिच",
  "game.entry.redo": "फिर से",
  "game.entry.sharedTitle": "तुम्हारी लीडरबोर्ड पंक्ति पर साझा है। निजी करने के लिए क्लिक करो।",
  "game.entry.shareTitle": "यह पिच अपनी लीडरबोर्ड पंक्ति पर साझा करो ताकि साथी तुलना कर सकें",
  "game.entry.shared": "✓ साझा",
  "game.entry.share": "साझा करो",
  "game.entry.visibleToAll": "सबको दिखता है",
  "game.entry.resumeDraftTitle": "तुम्हारा एक सहेजा हुआ ड्राफ़्ट है। इसे पूरा करके पिच करने के लिए पिट में फिर से शुरू करो। न नया परिदृश्य, न शुल्क।",
  "game.entry.resumeTitle": "ट्रेड पिच करने और समीक्षा पाने के लिए यह खुला परिदृश्य पिट में फिर से शुरू करो। न नया परिदृश्य, न शुल्क।",
  "game.entry.resume": "🙋 फिर से शुरू करो",
  "game.entry.noReview": "प्रविष्टि की स्थिति: {{status}}। कोई पिच समीक्षा उपलब्ध नहीं।",

  // ─── game.brand ───
  "game.brand.tagline": "गेम-आधारित ऑप्शन ट्रेडिंग सलाहकार प्रशिक्षक",

  // ─── game.stats ───
  "game.stats.sessions": "सत्र",
  "game.stats.avg": "औसत अंक",
  "game.stats.best": "सर्वश्रेष्ठ",
  "game.stats.streak": "लगातार",

  // ─── game.balance ───
  "game.balance.title": "टॉप अप: Bitcoin Lightning से sats ख़रीदो",
  "game.balance.label": "बैलेंस",
  "game.balance.sats": " sats",
  "game.balance.topUp": "＋ टॉप अप",

  // ─── game.signOut ───
  "game.signOut.title": "साइन आउट: सहेजा गया npub और प्रमाण टोकन मिटाओ",
  "game.signOut.label": "साइन आउट",

  // ─── game.tab ───
  "game.tab.welcome": "स्वागत",
  "game.tab.play": "पिट",
  "game.tab.sample": "मूल्यांकन देखो",
  "game.tab.journal": "जर्नल",
  "game.tab.leaderboard": "लीडरबोर्ड",
  "game.tab.usage": "उपयोग",
  "game.tab.profile": "प्रोफ़ाइल",

  // ─── game.openingFloor ───
  "game.openingFloor": "ट्रेडिंग फ़्लोर खुल रहा है",

  // ─── game.guest ───
  "game.guest.label": "अतिथि पास",
  "game.guest.welcome": "स्वागत है, अतिथि ट्रेडर <id>{{id}}</id>।",
  "game.guest.body": "साइट चालू है, पर DPYC टोकन ख़रीदने तक तुम सिर्फ़ मुफ़्त सेवाएँ इस्तेमाल कर सकते हो।\nअपना खाता देखने और टोकन ख़रीदने के लिए <b>उपयोग</b> टैब पर जाओ।\nचुनौती लेना, संकेत माँगना और मूल्यांकन करवाना सशुल्क सेवाएँ हैं, पर शुल्क बहुत छोटे हैं: हर एक के कुछ sats।\nNostr क्रेडेंशियल मिल जाने पर तुम यहाँ टॉप अप कर सकते हो।\nफिर तुम अपनी चुनौतियों पर काम कर सकते हो, अधूरा काम सहेज सकते हो और लीडरबोर्ड के साथियों को संदेश भेज सकते हो।\nअभ्यास से तुम पेशेवर श्रोताओं के सामने ऑप्शन ट्रेड पिच करने में ज़्यादा कुशल होते जाते हो।\nस्वागत है।",
  "game.guest.signIn": "खेलने के लिए साइन इन करो →",

  // ─── game.briefing ───
  "game.briefing.label": "ब्रीफ़िंग",
  "game.briefing.title": "डेस्क खुला है।",
  "game.briefing.prose": "फ़र्म एक अवसर रखती है: बाज़ार का एक पल, शायद असली, शायद गढ़ा हुआ, शायद अभी घट रहा।\nतुम्हें एक तारीख़, मैक्रो पृष्ठभूमि, एक एसेट, एक कैटलिस्ट, अहम स्तर और तुम्हारी बुक की पाबंदियाँ दिखेंगी।\nइसे अदालत के मुक़दमे की फ़ाइल की तरह पढ़ो।\nफिर अपने शब्दों में अपना ट्रेड लिखो: संरचना, स्ट्राइक, एक्सपायरी, आकार और तुम्हारा तर्क।",
  "game.briefing.integration": "<b>एकीकरण को पुरस्कार मिलता है।</b> एक मज़बूत उत्तर उन राजनीतिक, मौद्रिक और अंतर-एसेट तथ्यों का ध्यान रखता है जो फ़र्म ने तुम्हारे सामने रखे।\nतुम अपने तर्क में जितने प्रासंगिक तथ्य बुनते हो, उतने ज़्यादा अंक मिलते हैं, ख़ासकर मैक्रो संदर्भ आयाम पर।",
  "game.briefing.herrings": "<b>भटकाने वाले तथ्य रखे गए हैं।</b> फ़र्म एक-दो ऐसे तथ्य डालती है जो पूरी तरह सच हैं पर आदर्श ट्रेड के लिए बेमानी हैं।\nये असल दुनिया का शोर हैं जिन्हें कोई ट्रेडर स्वाभाविक रूप से देख सकता है और ज़्यादा अहमियत दे सकता है।\nस्क्यू की टिप्पणी सिर्फ़ रंग हो सकती है, कैटलिस्ट नहीं।\nकोई सुर्ख़ी पहले ही भाव में शामिल हो सकती है।\nकोई घोषित पोज़ीशन पुरानी हो सकती है।\nये प्रासंगिकता के जाल हैं, झूठ के कभी नहीं।\nइनमें से किसी पर तर्क खड़ा करने से अंक कटते हैं; इसे शोर पहचानकर अलग रखने से अंक मिलते हैं।",
  "game.briefing.coda": "अपनी ऐतिहासिकता चुनो। अपना पर्सोना चुनो। चुनौती स्वीकार करो।",

  // ─── game.chooser ───
  "game.chooser.historicity": "ऐतिहासिकता",
  "game.chooser.persona": "पर्सोना",
  "game.chooser.risk": "जोखिम सीमा",
  "game.chooser.maxLoss": "प्रति ट्रेड अधिकतम नुक़सान:",
  "game.chooser.optional": "वैकल्पिक",
  "game.chooser.clear": "हटाओ",
  "game.chooser.maxLossHint": "वैकल्पिक। तय करने पर फ़र्म अवसर के खाते और पाबंदियों को इस तरह आकार देती है कि अच्छी तरह चुनी गई संरचना तुम्हारी सीमा में आ जाए। जिन ट्रेडों का सबसे बुरा नतीजा इससे ज़्यादा हो, निर्णायक उनके अंक घटाता है।",
  "game.chooser.sector": "सेक्टर",
  "game.chooser.sectorLimit": "डीलर को {{sector}} तक सीमित करो",
  "game.chooser.sectorAny": "डीलर को कोई भी सेक्टर चुनने दो",
  "game.chooser.customSector": "या अपना सेक्टर लिखो:",
  "game.chooser.customExample": "जैसे लग्ज़री सामान",
  "game.chooser.sectorHint": "वैकल्पिक। फ़र्म चुने गए सेक्टर से अंडरलाइंग लेती है और कैटलिस्ट, प्रासंगिक तथ्यों और भटकाने वाले तथ्यों को उसकी गतिशीलता के अनुसार ढालती है।",

  // ─── game.topUp ───
  "game.topUp.title": "ऑपरेटर से Bitcoin Lightning के ज़रिए sats ख़रीदो",
  "game.topUp.label": "टॉप अप",

  // ─── game.toll ───
  "game.toll.label": "शुल्क",

  // ─── game.sats_one ───
  "game.sats_one": "{{count}} sat",
  "game.sats_other": "{{count}} sats",

  // ─── game.sats_other ───

  // ─── game.toll ───
  "game.toll.noModel": "मूल्य मॉडल में अभी कोई गुणक नहीं है। इस ऑपरेटर पर reset_pricing_model चलाओ।",

  // ─── game.signInToPlayTitle ───
  "game.signInToPlayTitle": "ट्रेड परिदृश्य पाने के लिए अपनी Nostr पहचान से साइन इन करो",

  // ─── game.signInToPlay ───
  "game.signInToPlay": "खेलने के लिए साइन इन करो",

  // ─── game.deal ───
  "game.deal.another": "एक और",
  "game.deal.challenge": "चुनौती लो",
  "game.deal.watchTitle": "अपने नवीनतम परिदृश्य की बाज़ार-पढ़ाई वाली स्क्रीन पर लौटो",
  "game.deal.preparing_one": "{{count}} परिदृश्य पहले से तैयार हो रहा है। देखो ›",
  "game.deal.preparing_other": "{{count}} परिदृश्य पहले से तैयार हो रहे हैं। देखो ›",
  "game.deal.confirmPriced": "एक और? हर परिदृश्य का अलग {{price}} sats शुल्क है।",
  "game.deal.confirm": "एक और? हर परिदृश्य का शुल्क अलग है।",
  "game.deal.yes": "हाँ, एक और",
  "game.deal.notYet": "अभी नहीं",

  // ─── game.card ───
  "game.card.macro": "मैक्रो पृष्ठभूमि",
  "game.card.skewNote": "स्क्यू टिप्पणी",
  "game.card.catalyst": "कैटलिस्ट",
  "game.card.keyLevels": "अहम स्तर",
  "game.card.constraints": "पाबंदियाँ",
  "game.card.question": "प्रश्न",
  "game.card.sources": "स्रोत",
  "game.card.spot": "स्पॉट",
  "game.card.iv30": "IV 30 दिन",
  "game.card.ivRank": "IV रैंक",
  "game.card.skew": "स्क्यू · ",

  // ─── game.pitch ───
  "game.pitch.saveTitle": "यह ड्राफ़्ट अपनी जर्नल प्रविष्टि में रखो ताकि पेज दोबारा लोड होने पर भी बचा रहे",
  "game.pitch.save": "ड्राफ़्ट सहेजो",
  "game.pitch.discardTitle": "यह परिदृश्य छोड़कर नया चुनो। परिदृश्य का शुल्क वापस नहीं होता, इसलिए तुमसे पुष्टि माँगी जाएगी।",
  "game.pitch.discard": "परिदृश्य छोड़ो",
  "game.pitch.placeholder": "जैसे: 30-दिन का 95/90 पुट स्प्रेड 1.20 के क्रेडिट पर बेचो, NAV का 0.5% जोखिम में रखने के आकार में। फ़ेड का सख़्त रुख़ डॉलर को सहारा देता है, पर इनसाइडर ख़रीद से शेयर को समर्थन है; 200-दिन औसत से नीचे प्रीमियम लेना असमान लगता है…",
  "game.pitch.presentTitle": "समीक्षा और अंकों वाले पिच ऑडिट के लिए अपना ट्रेड वरिष्ठ PM के सामने रखो",
  "game.pitch.present": "पिच पेश करो",
  "game.pitch.saved": "✓ ड्राफ़्ट {{time}} पर सहेजा गया",

  // ─── game.clue ───
  "game.clue.heading": "संकेत माँगो",
  "game.clue.hint": "छोटे शुल्क पर जो चाहो पूछो। जैसे <q>“कॉल स्क्यू से तुम्हारा क्या मतलब है?”</q>",
  "game.clue.copied": "क्लिपबोर्ड पर कॉपी हो गया",
  "game.clue.copyTitle": "यह संकेत-वार्तालाप क्लिपबोर्ड पर कॉपी करो, ताकि अपने Claude.ai सत्र में जारी रख सको",
  "game.clue.copy": "वार्तालाप कॉपी करो",
  "game.clue.q": "प्र · {{question}}",
  "game.clue.placeholder": "अपना प्रश्न लिखो…",
  "game.clue.asking": "संकेत डेस्क से पूछा जा रहा है…",
  "game.clue.sendTitle": "यह प्रश्न भेजो। छोटा संकेत शुल्क लगता है।",
  "game.clue.send": "प्रश्न भेजो",

  // ─── game.review ───
  "game.review.label": "पिच समीक्षा",
  "game.review.overall": "कुल",
  "game.review.byDimension": "आयाम के अनुसार",
  "game.review.right": "तुमने क्या सही किया",
  "game.review.sharpen": "क्या निखारना है",
  "game.review.alternative": "एक विकल्प जो फ़र्म लेती",
  "game.review.replayTitle": "परिदृश्य चयन पर वापस",
  "game.review.replay": "🔁 फिर खेलो",

  // ─── game.ledger ───
  "game.ledger.label": "DPYC खाता-बही",
  "game.ledger.title": "sats बैलेंस और MCP टूल उपयोग",
  "game.ledger.intro": "Optionality MCP पर तुम्हारा बैलेंस, पिछले 30 दिनों में क्या ख़र्च हुआ और क्या ख़रीदा, और sats किन टूलों पर गए।\nशुल्क कॉल के समय कटते हैं; ऑपरेटर का हिसाब हर निपटान के बाद Neon में लिखा जाता है।",
  "game.ledger.tools": "MCP टूल उपयोग: पिछले 30 दिन",
  "game.ledger.empty": "पिछले 30 दिनों में कोई सशुल्क टूल कॉल नहीं।",
  "game.ledger.health": "खाते की स्थिति",

  // ─── game.ai ───
  "game.ai.refresh": "API उपयोग ताज़ा करो",
  "game.ai.label": "उपयोग",
  "game.ai.title": "AI उपयोग और उसकी लागत",
  "game.ai.intro": "Optionality हर परिदृश्य, संकेत और निर्णय के लिए एक मॉडल बुलाता है।\nयह वह है जो तुम्हारे टूल कॉल ने टोकन में ख़र्च किया, और जो प्रदाता ने असल में ऑपरेटर से वसूला।\nतुम्हारा शुल्क इसे और ऑपरेटर के ख़र्च को ढकता है।\nकोई छिपा मुनाफ़ा नहीं।",
  "game.ai.estimated": "“अनु.” लिखे आँकड़े प्रति-कॉल लागत दर्ज होने से पहले के हैं और प्रकाशित दरों से अनुमानित हैं ({{date}} को लिए गए); बाक़ी वह है जो प्रदाता ने वसूला।",
  "game.ai.reported": "लागतें प्रदाता के अपने प्रति-कॉल आँकड़े हैं, अनुमान नहीं।",
  "game.ai.tallying": "रसीदें जोड़ी जा रही हैं",
  "game.ai.none": "अभी तक कोई मॉडल कॉल दर्ज नहीं। एक चुनौती लो।",
  "game.ai.unknown": "अज्ञात",
  "game.ai.runs": "कॉल:",
  "game.ai.input": "इनपुट:",
  "game.ai.output": "आउटपुट:",
  "game.ai.cost": "लागत:",
  "game.ai.costEst": "लागत (अनु.):",
  "game.ai.perCall": "प्रति कॉल:",
  "game.ai.costPartEst": "AI लागत (कुछ अनुमानित)",
  "game.ai.costBilled": "वसूली गई AI लागत",
  "game.ai.tokens": "{{calls}} मॉडल कॉल में {{tokens}} टोकन",
  "game.ai.costPerCall": "प्रति कॉल लागत",
  "game.ai.averaged": "हर परिदृश्य, संकेत और निर्णय का औसत",
  "game.ai.sats": "sats में बराबर",
  "game.ai.atRate": "~{{rate}}/BTC पर",
  "game.ai.footnote": "ऑपरेटर AI की लागत Lightning माइक्रोपेमेंट से खिलाड़ियों तक पहुँचाता है।\nयह दृश्य पूरी पारदर्शिता है: हर परिदृश्य, संकेत और निर्णय की असल लागत, साथ में {{rate}}/BTC की तय संदर्भ दर पर sats में बराबर राशि।\nयह दर तुलना का पैमाना है, आज का भाव नहीं।",

  // ─── game.lb ───
  "game.lb.label": "लीडरबोर्ड",
  "game.lb.title": "संप्रभु ट्रेडर, कौशल के क्रम में",
  "game.lb.intro": "मूल्य मॉडल ही एकमात्र डायल है: एक कठिन, महँगी पिच जिसे अच्छे अंक मिले, सस्ती पिच से ऊपर रहती है जिसे अच्छे अंक मिले।\nजब ऑपरेटर कोई गुणक (दोबारा मौक़ा, संप्रभु, कोई भी) बदलता है, तो लीडरबोर्ड की अगली गणना हर प्रविष्टि पर नए वज़न लागू करती है, कोई पुराना स्नैपशॉट नहीं भटकता।\nडिफ़ॉल्ट क्रम भारित औसत है; कच्चे अंक भी उपलब्ध हैं।",
  "game.lb.sort.weighted_avg": "भारित औसत",
  "game.lb.sort.weighted_best": "भारित सर्वश्रेष्ठ",
  "game.lb.sort.avg": "कच्चा औसत",
  "game.lb.sort.best": "कच्चा सर्वश्रेष्ठ",
  "game.lb.sort.streak": "लगातार",
  "game.lb.sort.played": "खेले",
  "game.lb.loading": "लोड हो रहा है…",
  "game.lb.refresh": "ताज़ा करो",
  "game.lb.failed": "लीडरबोर्ड लोड नहीं हुआ। {{error}}",
  "game.lb.unknownError": "अज्ञात त्रुटि।",
  "game.lb.empty": "अभी तक कोई जाँचा गया ट्रेड नहीं। पहले बनो।",
  "game.lb.trader": "ट्रेडर",
  "game.lb.wavg": "भा·औसत",
  "game.lb.wavgTitle": "भारित औसत: कच्चे अंक × कठिनाई गुणक",
  "game.lb.wbest": "भा·श्रेष्ठ",
  "game.lb.wbestTitle": "भारित सर्वश्रेष्ठ एकल पिच",
  "game.lb.avg": "औसत",
  "game.lb.avgTitle": "सभी मूल्यांकित पिचों का कच्चा औसत",
  "game.lb.streak": "लगातार",
  "game.lb.played": "खेले",
  "game.lb.rowTitle": "इस ट्रेडर की साझा की गई पिच देखने के लिए क्लिक करो",
  "game.lb.dmSelf": "खुद को DM करो: रिले का रास्ता जाँचो",
  "game.lb.dm": "{{name}} को DM",
  "game.lb.anonymous": "अनाम",
  "game.lb.you": "तुम",
  "game.lb.last": "  ·  पिछला: {{date}}",
  "game.lb.fetching": "साझा की गई पिच लाई जा रही हैं",
  "game.lb.youNone": "तुमने अभी तक कोई पिच साझा नहीं की। अपनी कोई मूल्यांकित जर्नल प्रविष्टि खोलो और साझा करो पर टैप करो।",
  "game.lb.theyNone": "इस ट्रेडर ने अभी तक कोई पिच साझा नहीं की।",
  "game.lb.yourShared": "तुम्हारी साझा की गई पिच · {{count}}",
  "game.lb.shared": "साझा की गई पिच · {{count}}",
  "game.lb.theirPitch": "उनकी पिच",
  "game.lb.houseAlt": "फ़र्म का विकल्प",

  // ─── game.journal ───
  "game.journal.label": "जर्नल",
  "game.journal.title": "तुम्हारा अध्ययन कक्ष",
  "game.journal.intro": "अपने अध्ययन कक्ष में स्वागत है।\nयहाँ तुम अपने पिछले प्रस्ताव देख सकते हो, अपने मूल्यांकन दोबारा पढ़ सकते हो, और वे पिच फिर से शुरू कर सकते हो जो शुरू करके बीच में छोड़नी पड़ीं।",
  "game.journal.introNamed": "अपने अध्ययन कक्ष में स्वागत है, {{name}}।\nयहाँ तुम अपने पिछले प्रस्ताव देख सकते हो, अपने मूल्यांकन दोबारा पढ़ सकते हो, और वे पिच फिर से शुरू कर सकते हो जो शुरू करके बीच में छोड़नी पड़ीं।",

  // ─── game.prep ───
  "game.prep.heading": "तैयार हो रहे परिदृश्य · {{count}}",
  "game.prep.rowTitle": "इस परिदृश्य की बाज़ार-पढ़ाई वाली स्क्रीन पर लौटो",
  "game.prep.watch": "देखो ›",
  "game.prep.note": "फ़र्म इन्हें पृष्ठभूमि में तैयार कर रही है, इसलिए तुम जाकर लौट सकते हो।\nजब कोई तैयार होता है, तो वह इस सूची से हटकर नीचे लेने लायक खुली प्रविष्टि के रूप में दिखता है।",

  // ─── game.journal ───
  "game.journal.pulling": "सत्र लाए जा रहे हैं",
  "game.journal.emptyPreparing": "अभी कोई पूरा सत्र नहीं। तुम्हारा परिदृश्य अभी ऊपर तैयार हो रहा है।",
  "game.journal.empty": "अभी कोई सत्र नहीं। अपना पहला ट्रेड परिदृश्य लो।",
  "game.journal.groupBy": "समूह बनाओ",
  "game.journal.flipGroups": "समूहों का क्रम उलटो",
  "game.journal.groupsAsc": "समूह ▲",
  "game.journal.groupsDesc": "समूह ▼",
  "game.journal.sortBy": "क्रम से",
  "game.journal.flipSort": "क्रम की दिशा उलटो",
  "game.journal.sortedAsc": "आरोही क्रम। अवरोही में बदलो।",
  "game.journal.sortedDesc": "अवरोही क्रम। आरोही में बदलो।",
  "game.journal.asc": "▲ आरोही",
  "game.journal.desc": "▼ अवरोही",
  "game.journal.sessions_one": "{{count}} सत्र",
  "game.journal.sessions_other": "{{count}} सत्र",
  "game.journal.avg": " · औसत {{score}}",

  // ─── game.status ───
  "game.status.open": "खुला",
  "game.status.evaluated": "मूल्यांकित",

  // ─── game.journal ───
  "game.journal.sharedTag": "· साझा",
  "game.journal.deleteTitle": "यह सत्र हमेशा के लिए हटाओ",
  "game.journal.delete": "सत्र हटाओ",
  "game.journal.loadingEntry": "प्रविष्टि लोड हो रही है",

  // ─── game.discard ───
  "game.discard.title": "यह परिदृश्य छोड़ो?",
  "game.discard.body": "छोड़ने पर तुम नया परिदृश्य चुन सकते हो।\nहर परिदृश्य सशुल्क बाहरी LLM प्रोसेसिंग इस्तेमाल करता है, इसलिए इसका शुल्क वापस नहीं हो सकता।\nक्या तुम सच में यह परिदृश्य छोड़कर दूसरा चुनना चाहते हो?",
  "game.discard.keep": "यही परिदृश्य रखो",
  "game.discard.confirm": "छोड़ो और दूसरा चुनो",

  // ─── game.delete ───
  "game.delete.title": "यह सत्र हमेशा के लिए हटाओ?",
  "game.delete.body": "तुम अपना <b>{{ticker}}</b> सत्र हमेशा के लिए हटाने जा रहे हो।\nपरिदृश्य, तुम्हारी पिच, समीक्षा, अंक और इससे मिली लीडरबोर्ड की जगह <b>हमेशा के लिए मिट जाएँगे</b>।\nइसे पलटा नहीं जा सकता, और बाद में वापस नहीं पाया जा सकता।",
  "game.delete.bodyGraded": "तुम अपना <b>{{ticker}}</b> सत्र (ग्रेड {{grade}}) हमेशा के लिए हटाने जा रहे हो।\nपरिदृश्य, तुम्हारी पिच, समीक्षा, अंक और इससे मिली लीडरबोर्ड की जगह <b>हमेशा के लिए मिट जाएँगे</b>।\nइसे पलटा नहीं जा सकता, और बाद में वापस नहीं पाया जा सकता।",
  "game.delete.this": "यह",
  "game.delete.keep": "रखो",
  "game.delete.deleting": "हटाया जा रहा है…",
  "game.delete.confirm": "हमेशा के लिए हटाओ",

  // ─── game.zoom ───
  "game.zoom.copyTitle": "यह पाठ क्लिपबोर्ड पर कॉपी करो",
  "game.zoom.copy": "पाठ कॉपी करो",
  "game.zoom.closeTitle": "बंद करो (Esc)",
  "game.zoom.close": "बंद करो",

  // ─── game.status ───
  "game.status.submitted": "जमा किया",
  "game.status.abandoned": "छोड़ा गया",

  // ─── app.lapsed ───
  "app.lapsed": "तुम्हारे दूर रहते हुए तुम्हारा साइन-इन समाप्त हो गया। जारी रखने के लिए फिर से साइन इन करो।",

  // ─── signIn.welcome ───
  "signIn.welcome": "एक एजेंटिक ऑप्शन-ट्रेडिंग ट्रेनर। फ़र्म अवसर तैयार करती है, तुम पिच लिखते हो, और एक निर्णायक तुम्हारे अनुशासन को अंक देता है।",

  // ─── signIn.nsecHint ───
  "signIn.nsecHint": "nsec से साइन इन कर रहे हैं? यह हर कॉल पर हस्ताक्षर करने के लिए इसी ब्राउज़र में रहती है।\nOptionality इसकी एक एन्क्रिप्टेड प्रति भी रखता है ताकि तुम्हारे DM पर हस्ताक्षर कर सके।\nप्रोफ़ाइल से इसे कभी भी वापस ले लो।\nजिस पहचान को तुम खुद संभालते हो, उसके लिए इसके बजाय अपने npub से साइन इन करो।",

  // ─── signIn.or ───
  "signIn.or": "या",

  // ─── signIn.guest ───
  "signIn.guest": "अतिथि के रूप में जारी रखो",

  // ─── signIn.guestHint ───
  "signIn.guestHint": "अतिथि चयन पृष्ठ, ब्रीफ़िंग और नमूना मूल्यांकन देख सकते हैं।",

  // ─── signIn.footnote ───
  "signIn.footnote": "Optionality™ एक एजेंटिक ऑप्शन-ट्रेडिंग गेम है, जो <link>Tollbooth-DPYC™</link> पर बना है: AI एजेंटों के लिए Bitcoin Lightning माइक्रोपेमेंट और Nostr पहचान।",

  // ─── welcome.guestName ───
  "welcome.guestName": "अतिथि {{id}}",

  // ─── welcome.anonymous ───
  "welcome.anonymous": "अनाम आगंतुक",

  // ─── welcome.label ───
  "welcome.label": "स्वागत है",

  // ─── welcome.greeting ───
  "welcome.greeting": "स्वागत है, <name>{{name}}</name>।",

  // ─── welcome.signedInAs ───
  "welcome.signedInAs": " <npub>{{npub}}</npub> के रूप में साइन इन हैं।",

  // ─── welcome.why ───
  "welcome.why": "Optionality क्यों।",

  // ─── welcome.why1 ───
  "welcome.why1": "Optionality™ उन लोगों के लिए गेम जैसी, परिदृश्य-आधारित सीख है जो कुशल ऑप्शन ट्रेडर बनना चाहते हैं।\nयह प्राइसिंग गणित और प्लेटफ़ॉर्म के तौर-तरीक़ों वाले सामान्य पाठ्यक्रम से अलग रहता है।\nयह तुम्हें ऐसी कहानियों में जोड़ता है जो एक साफ़, अमल में लाने योग्य ट्रेड और उसके पीछे का तर्क माँगती हैं।",

  // ─── welcome.why2 ───
  "welcome.why2": "तुम शब्दावली से अनजान हो और अपनी रणनीति और मौजूदा ट्रेड विचार बताने को कहा जाए तो अटक जाते हो।\nतुम दुनिया की बड़ी तस्वीर देखना और दबाव में ठोस ट्रेड प्रस्ताव देना चाहते हो।\nपर तुम्हारे विचार धुंधले हैं, तुम बड़े मुनाफ़े के पीछे भागते हो, और किसी स्थिति से पहले नहीं बता पाते कि उसमें तुम क्या करोगे।\nOptionality™ तुम्हें ठोस रणनीतियाँ सीखने, दुनिया की घटनाओं को शामिल करने और अपनी रणनीतियाँ बेहतर ढंग से बताने में मदद करता है।",

  // ─── welcome.why3 ───
  "welcome.why3": "Optionality™ तुम्हारी निवेश फ़र्म की भूमिका निभाता है।\nयह आधुनिक AI सेवाओं से तुम्हारे सामने चुनौतीपूर्ण, नक़ली विश्व परिदृश्य रखता है जो तुम्हें सोचने का और फिर अपना ट्रेड पेश करने का मौक़ा देते हैं।\nफ़र्म के ऑडिटर तुम्हारे प्रस्ताव को संरचना के चुनाव, स्ट्राइक और अवधि, जोखिम/लाभ, मैक्रो एकीकरण और टेल रिस्क पर अंक देते हैं।\nयह प्रतिक्रिया तुम्हारे कथात्मक प्रस्तावों को बेहतर बनाने में मदद करती है।\nसमय के साथ तुम समझदार ट्रेड तेज़ी से और अच्छी तरह सोच, पेश और अमल में ला पाते हो।",

  // ─── welcome.play ───
  "welcome.play.label": "खेल कैसे चलता है",
  "welcome.play.round": "एक राउंड",
  "welcome.play.1": "<b>चुनौती स्वीकारो।</b> एक ऐतिहासिकता (ऐतिहासिक, काल्पनिक या लाइव), एक पर्सोना (प्रशिक्षु → संप्रभु) और चाहो तो अधिकतम नुक़सान की सीमा चुनो। शुल्क तुम्हारे चुनाव की कठिनाई के साथ बढ़ता है।",
  "welcome.play.2": "<b>परिदृश्य पढ़ो।</b> एसेट, स्पॉट, IV, स्क्यू, अहम स्तर, कैटलिस्ट, तुम्हारी बुक की पाबंदियाँ, और कुछ भटकाने वाले तथ्य जो देखते हैं कि तुम शोर और असल ज़रूरी बात में फ़र्क़ कर पाते हो या नहीं।",
  "welcome.play.3": "<b>ट्रेड पिच करो।</b> खुला लेखन। संरचना, स्ट्राइक, अवधि, आकार और अपना तर्क बताओ।",
  "welcome.play.4": "<b>समीक्षा पढ़ो।</b> एक पंक्ति का निष्कर्ष, पाँच आयामों पर अंक, शामिल किए गए तथ्यों का खाता, वह वैकल्पिक ट्रेड जो फ़र्म लेती, जोखिम-प्रोफ़ाइल चार्ट और गहरा संदर्भ।",
  "welcome.play.5": "<b>पुराना परिदृश्य दोबारा खेलो</b>, जब दोबारा देखना हो तो अपनी जर्नल से। वही सेटअप, नई पिच, अलग से दर्ज।",

  // ─── welcome.toll ───
  "welcome.toll": "शुल्क",
  "welcome.toll.fair": "Optionality™ उपयोग के आधार पर उचित मूल्य लेता है।\nइस्तेमाल न करो तो कुछ नहीं देना: न सदस्यता, न KYC।\nमूल्य इस पर चलता है कि हर परिदृश्य बनाने और जाँचने में असल में कितना ख़र्च आता है।\nसरल परिदृश्य कम LLM टोकन लेते हैं; कठिन वाले, जैसे वेब-सर्च वाला लाइव बाज़ार या संप्रभु स्तर, ज़्यादा लेते हैं।\nसबसे जटिल परिदृश्य का शुल्क भी बस कुछ सौ sats है।",
  "welcome.toll.inspect": "ऑपरेटर हर गुणक सीधे तय करता है, और बैलेंस होते ही तुम <b>उपयोग</b> टैब में हर एक खुद देख सकते हो।\nअभी, लाइव मूल्य मॉडल से लिए गए:",
  "welcome.toll.cheap": "सबसे सरल परिदृश्य (काल्पनिक × प्रशिक्षु): <b>{{price}}</b>",
  "welcome.toll.expensive": "सबसे कठिन परिदृश्य (लाइव बाज़ार × संप्रभु, पूरी वेब-सर्च के साथ): <b>{{price}}</b>",
  "welcome.toll.pitch": "पिच ऑडिट: <b>{{price}}</b>",
  "welcome.toll.session": "मध्यम कठिनाई पर लगभग 30 जाँचे गए राउंड का एक सत्र मोटे तौर पर {{sats}} sats का होता है, BTC में लगभग {{usd}}।\nटॉप अप Lightning इनवॉइस से sats ख़रीदता है; Wallet of Satoshi, Phoenix, Mutiny या कोई भी Lightning वॉलेट चलेगा।",
  "welcome.toll.fallback": "Optionality™ उपयोग के आधार पर उचित मूल्य लेता है: इस्तेमाल न करो तो कुछ नहीं देना।\nकठिनाई और मोड से शुल्क बदलता है; बैलेंस होते ही तुम <b>उपयोग</b> टैब में हर गुणक देख सकते हो।\nटॉप अप Lightning इनवॉइस से sats ख़रीदता है; Wallet of Satoshi, Phoenix, Mutiny या कोई भी Lightning वॉलेट चलेगा।",
  "welcome.toll.unreachable": "(अभी मूल्य मॉडल तक पहुँच नहीं हो सकी, इसलिए सटीक आँकड़े नहीं दे सकते।)",

  // ─── welcome.economy ───
  "welcome.economy.label": "अर्थव्यवस्था",
  "welcome.economy.title": "Optionality, Tollbooth-DPYC™ पर चलता है",
  "welcome.economy.intro": "Optionality एक एजेंटिक ऑप्शन-ट्रेडिंग गेम है जो <dpyc>Tollbooth-DPYC™ →</dpyc> पर बना है, जो सशुल्क AI सेवाओं के लिए Bitcoin Lightning + Nostr का ढाँचा है।\nशासन, प्रमाणित ऑपरेटर और सामुदायिक रजिस्टर खुले तौर पर <community>github.com/lonniev/dpyc-community →</community> पर हैं।\nतीन ख़ूबियाँ बताने लायक हैं:",
  "welcome.economy.identity": "<b>स्व-संप्रभु पहचान।</b> तुम ईमेल और पासवर्ड से नहीं, Nostr की-पेयर से साइन इन करते हो।\nतुम्हारी nsec ही एकमात्र पहचान-पत्र है: न KYC, न किसी प्लेटफ़ॉर्म का दिया खाता।\nOptionality उसकी एन्क्रिप्टेड प्रति तभी रखता है जब तुम कहो (प्रोफ़ाइल → गेम पर्सोना कुंजी), और तुम उसे कभी भी वापस ले सकते हो।",
  "welcome.economy.pricing": "<b>बिना दोबारा डिप्लॉय किए बदलते मूल्य।</b> ऑपरेटर के टूल मूल्य कोड में नहीं, एक मूल्य मॉडल में रखे जाते हैं।\nकठिनाई और मोड के गुणक लाइव बदले जाते हैं, और तुम उपयोग टैब में उन्हें खुद जाँच सकते हो।\nलीडरबोर्ड अंकों को वज़न देने के लिए यही तरीक़ा अपनाता है।",
  "welcome.economy.money": "<b>ठोस पैसा।</b> फ़िएट रेल पर माइक्रोपेमेंट आर्थिक रूप से बेकार हैं: केवल इंटरचेंज शुल्क ही 1 sat के शुल्क से ज़्यादा है।\nBitcoin Lightning हर AI टूल कॉल पर शुल्क लेना आसान बना देता है।\nपहले से भरे Lightning बैलेंस, हर कॉल पर एटॉमिक निपटान, और कोई संरक्षक नहीं जो तुम्हारा ख़र्च ऑफ़-चेन रखे: यही Optionality जैसी सेवाओं को चलने लायक बनाता है।",

  // ─── welcome.ready ───
  "welcome.ready": "तैयार हैं?",
  "welcome.ready.guest": "घूमकर देखो: <b>मूल्यांकन देखो</b> टैब एक पूरा जाँचा गया राउंड दिखाता है, ताकि जुड़ने से पहले तुम देख सको कि खेल क्या देता है।\nजब असल में ट्रेड पिच करना शुरू करना हो, तो Nostr पहचान से साइन इन करो।",
  "welcome.ready.guestPriced": "घूमकर देखो: <b>मूल्यांकन देखो</b> टैब एक पूरा जाँचा गया राउंड दिखाता है, ताकि जुड़ने से पहले तुम देख सको कि खेल क्या देता है।\nजब असल में ट्रेड पिच करना शुरू करना हो, तो Nostr पहचान से साइन इन करो और BTC में लगभग {{usd}} टॉप अप करो।",
  "welcome.ready.patron": "घूमकर देखो: <b>मूल्यांकन देखो</b> टैब एक पूरा जाँचा गया राउंड दिखाता है, ताकि sats लगाने से पहले तुम देख सको कि खेल क्या देता है।\nजब असल में ट्रेड पिच करना शुरू करना हो:",

  // ─── welcome.seeAssessment ───
  "welcome.seeAssessment": "मूल्यांकन देखो",

  // ─── welcome.signInToPlay ───
  "welcome.signInToPlay": "खेलने के लिए साइन इन करो",

  // ─── welcome.topUpPriced ───
  "welcome.topUpPriced": "टॉप अप: शुरू करने के लिए ~{{usd}}",

  // ─── welcome.topUp ───
  "welcome.topUp": "टॉप अप",

  // ─── profile.label ───
  "profile.label": "प्रोफ़ाइल",

  // ─── profile.title ───
  "profile.title": "तुम्हारी स्व-संप्रभु पहचान।",

  // ─── profile.intro ───
  "profile.intro": "तुम्हारी प्रोफ़ाइल तुम्हारे Nostr kind-0 मेटाडेटा में रहती है, रिले से पढ़ी जाती है और हर Nostr क्लाइंट में दिखती है।\nबदलाव तुम्हारे ब्राउज़र में हस्ताक्षरित होकर रिले होते हैं; तुम्हारी कुंजी कभी इस डिवाइस से बाहर नहीं जाती।",

  // ─── profile.tz ───
  "profile.tz.label": "समय क्षेत्र",
  "profile.tz.title": "हर घड़ी, एक समय क्षेत्र।",
  "profile.tz.intro": "Optionality की हर तारीख़ इसी समय क्षेत्र को मानती है। यह इसी ब्राउज़र तक सीमित है; यहाँ से कुछ भी प्रकाशित या साझा नहीं होता।",

  // ─── profile.theme ───
  "profile.theme.label": "पसंद",
  "profile.theme.title": "Optionality तुम्हें कैसा दिखे।",
  "profile.theme.intro": "इसी ब्राउज़र तक सीमित; यहाँ से कुछ भी प्रकाशित या साझा नहीं होता।",
  "profile.theme.dark": "🌑 गहरा",
  "profile.theme.light": "☀ हल्का",

  // ─── profile.language ───
  "profile.language.label": "भाषा",
  "profile.language.title": "इन पृष्ठों के शब्द।",
  "profile.language.intro": "इसी ब्राउज़र में रखी जाती है। फ़र्म के परिदृश्य, संकेत और समीक्षाएँ अंग्रेज़ी में ही रहते हैं।",

  // ─── profile.build ───
  "profile.build.label": "बिल्ड और लाइसेंस",
  "profile.build.title": "खुला स्रोत, निजी व्यापार।",
  "profile.build.intro": "Optionality और Tollbooth-DPYC™ Apache License 2.0 के तहत खुले स्रोत के रूप में जारी होते हैं: कोई भी कोड पढ़ सकता है, फ़ोर्क कर सकता है और अपना ऑपरेटर चला सकता है।\nउस कोड पर चलने वाली <i>सेवाएँ</i> निजी व्यापार हैं: हर ऑपरेटर अपने शुल्क और मूल्य मॉडल तय करता है, और ग्राहक Lightning बैलेंस पहले से भरकर हर कॉल पर भुगतान करते हैं।\nप्रोटोकॉल साझा है; उस पर चलने वाले व्यवसाय नहीं।",

  // ─── profile.key ───
  "profile.key.notNsec": "यह bech32 nsec1… स्ट्रिंग जैसा नहीं दिखता।",
  "profile.key.depositFailed": "जमा करना विफल रहा।",
  "profile.key.ackMismatch": "पुष्टि वाक्य बिल्कुल मेल नहीं खाता।",
  "profile.key.withdrawFailed": "वापस लेना विफल रहा।",
  "profile.key.label": "गेम पर्सोना कुंजी",
  "profile.key.title": "nsec की अभिरक्षा",
  "profile.key.intro": "अगर तुमने अपना npub ख़ास Optionality के लिए नया बनाया है, तो तुम nsec ऑपरेटर को सौंप सकते हो ताकि सर्वर तुम्हारी ओर से Nostr DM पर हस्ताक्षर करे, बिना किसी साइनर एक्सटेंशन के (iPad के लिए आसान)।\nnsec को AES-256-GCM से एन्क्रिप्ट करके रखा जाता है।\n<b>यहाँ अपनी असली Nostr पहचान न चिपकाओ</b>, सिर्फ़ नए गेम पर्सोना।",
  "profile.key.deposit": "nsec जमा करो",
  "profile.key.encrypting": "एन्क्रिप्ट हो रहा है…",
  "profile.key.depositBtn": "जमा करो",
  "profile.key.held": "✓ Optionality के पास (वॉल्ट में एन्क्रिप्टेड)। दूसरे खिलाड़ियों को DM सर्वर के साइनर से जाते हैं, ब्राउज़र एक्सटेंशन की ज़रूरत नहीं।",
  "profile.key.withdraw": "वापस लो और खुद रखो",
  "profile.key.ackIntro": "पुष्टि के लिए नीचे का वाक्य बिल्कुल वैसा ही टाइप करो।\nnsec कॉपी करने के लिए एक बार दिखेगी, फिर Optionality उसे भूल जाएगा।\nवापस लेने के बाद DM भेजने के लिए तुम्हें Nostr साइनर एक्सटेंशन (Alby, nos2x) चाहिए होगा।\nवाक्य अंग्रेज़ी में ही रहता है: सर्वर इसे शब्दशः जाँचता है।",
  "profile.key.ack": "पुष्टि",
  "profile.key.cancel": "रद्द करो",
  "profile.key.withdrawing": "वापस लिया जा रहा है…",
  "profile.key.confirm": "वापसी की पुष्टि करो",
  "profile.key.copyNow": "<b>अपनी nsec अभी कॉपी करो।</b> Optionality ने उसे अपने वॉल्ट से हटा दिया है।\nयह केवल इसी बार दिखेगी।\nइसे किसी Nostr क्लाइंट (0xchat, Damus, Amber) या पासवर्ड मैनेजर में रख लो।",
  "profile.key.copy": "कॉपी करो",
  "profile.key.saved": "मैंने सहेज लिया",

  // ─── clock.left ───
  "clock.left": "~{{clock}} बाक़ी",

  // ─── clock.wrapping ───
  "clock.wrapping": "पूरा हो रहा है…",

  // ─── deal.preparing ───
  "deal.preparing": "फ़र्म तुम्हारा असाइनमेंट तैयार कर रही है",

  // ─── deal.elapsed ───
  "deal.elapsed": "बीता समय",

  // ─── deal.estimate ───
  "deal.estimate": "अनुमान",

  // ─── deal.claim ───
  "deal.claim": "रसीद",

  // ─── deal.reassure ───
  "deal.reassure": "आराम से: तुम यह पेज छोड़ सकते हो।\nतैयार होने पर तुम्हारा असाइनमेंट तुम्हारी <b>जर्नल</b> में आ जाता है, और कनेक्शन टूटने पर भी वहीं से जारी रहता है।",

  // ─── deal.claimInJournal ───
  "deal.claimInJournal": "जर्नल में लो",

  // ─── deal.live ───
  "deal.live": "लाइव मोड वेब पर खोजता है, इसलिए इसमें कुछ मिनट लग सकते हैं।",

  // ─── lib.quotes ───
  "lib.quotes.0": "ठोस पैसा सरकारों के निरंकुश अतिक्रमण से नागरिक स्वतंत्रताओं की रक्षा का एक साधन है।",
  "lib.quotes.1": "अर्थशास्त्र का अनोखा काम लोगों को यह दिखाना है कि जिन चीज़ों को वे गढ़ सकने की कल्पना करते हैं, उनके बारे में वे असल में कितना कम जानते हैं।",
  "lib.quotes.2": "पारंपरिक मुद्रा की जड़ की समस्या वह सारा भरोसा है जो उसे चलाने के लिए चाहिए।",
  "lib.quotes.3": "मुझे नहीं लगता कि जब तक हम पैसे को सरकार के हाथों से नहीं निकालते, हमें फिर कभी अच्छा पैसा मिलेगा।",
  "lib.quotes.4": "मुद्रास्फीति बिना क़ानून का कर है।",

  // ─── judge.title ───
  "judge.title": "तुम्हारी पिच जाँची जा रही है",

  // ─── judge.sub ───
  "judge.sub": "प्रस्ताव के छह आयाम तौले जा रहे हैं",

  // ─── judge.dim ───
  "judge.dim.tail": "टेल रिस्क",

  // ─── ledger.title ───
  "ledger.title": "तथ्यों का खाता",

  // ─── ledger.integrated ───
  "ledger.integrated": "तुम्हारे शामिल किए तथ्य",

  // ─── ledger.integratedNone ───
  "ledger.integratedNone": "कोई नहीं। प्रासंगिक तथ्यों का सीधे ज़िक्र करके देखो।",

  // ─── ledger.missed ───
  "ledger.missed": "छूटे हुए प्रासंगिक तथ्य",

  // ─── ledger.missedNone ───
  "ledger.missedNone": "पूरा: तुमने अहम तथ्यों पर ध्यान दिया।",

  // ─── ledger.caught ───
  "ledger.caught": "भटकाने वाले तथ्य जो तुमने अलग रखे",

  // ─── ledger.caughtNone ───
  "ledger.caughtNone": "कोई दर्ज नहीं।",

  // ─── ledger.followed ───
  "ledger.followed": "भटकाने वाले तथ्य जिन्होंने तुम्हारे तर्क को खींचा",

  // ─── ledger.followedNone ───
  "ledger.followedNone": "कोई नहीं। तुमने शोर को तर्क से बाहर रखा।",

  // ─── legs.side ───
  "legs.side": "पक्ष",

  // ─── legs.type ───
  "legs.type": "प्रकार",

  // ─── legs.strike ───
  "legs.strike": "स्ट्राइक",

  // ─── legs.dte ───
  "legs.dte": "DTE",

  // ─── legs.premium ───
  "legs.premium": "प्रीमियम",

  // ─── legs.qty ───
  "legs.qty": "मात्रा",

  // ─── legs.long ───
  "legs.long": "लॉन्ग",

  // ─── legs.short ───
  "legs.short": "शॉर्ट",

  // ─── legs.call ───
  "legs.call": "कॉल",

  // ─── legs.put ───
  "legs.put": "पुट",

  // ─── legs.days ───
  "legs.days": "{{days}} दिन",

  // ─── risk.noLegs ───
  "risk.noLegs": "कोई संरचित ट्रेड लेग पढ़ा नहीं जा सका, इसलिए चार्ट उपलब्ध नहीं है। केवल शेयर या बॉन्ड की पोज़ीशन और न पढ़े जा सकने वाले ट्रेड चार्ट नहीं दिखाते।",

  // ─── risk.days ───
  "risk.days": "ट्रेड में दिन: {{days}}",

  // ─── risk.entry ───
  "risk.entry": "(प्रवेश)",

  // ─── risk.expiration ───
  "risk.expiration": "(एक्सपायरी)",

  // ─── risk.overlay ───
  "risk.overlay": "वैकल्पिक ट्रेड साथ में दिखाओ",

  // ─── risk.maxProfit ───
  "risk.maxProfit": "अधिकतम लाभ",

  // ─── risk.maxLoss ───
  "risk.maxLoss": "अधिकतम नुक़सान",

  // ─── risk.unlimited ───
  "risk.unlimited": "असीमित",

  // ─── risk.breakeven_one ───
  "risk.breakeven_one": "ब्रेकईवन",
  "risk.breakeven_other": "ब्रेकईवन",

  // ─── risk.breakeven_other ───

  // ─── risk.iv ───
  "risk.iv": "उपयोग की गई IV",

  // ─── risk.r ───
  "risk.r": "मानी गई r",

  // ─── risk.footnote ───
  "risk.footnote": "बिना लाभांश का ब्लैक-शोल्स।\nजोखिम-मुक्त दर 4.5% पर तय है।\nअस्थिरता परिदृश्य की IV पर स्थिर रखी गई है; अस्थिरता के असली उतार-चढ़ाव का मॉडल नहीं बनाया गया।\nहर लेग की मात्रा जैसी पढ़ी गई, 100 शेयरों के गुणक के साथ।",

  // ─── risk.parsed ───
  "risk.parsed": "पढ़े गए लेग",

  // ─── risk.yours ───
  "risk.yours": "तुम्हारा ट्रेड",

  // ─── risk.alt ───
  "risk.alt": "वैकल्पिक ट्रेड",

  // ─── chain.triggerTitle ───
  "chain.triggerTitle": "पूरी ऑप्शन चेन खोलो: ख़रीदने, बेचने या हटाने के लिए किसी मिड पर टैप करो",

  // ─── chain.title ───
  "chain.title": "ऑप्शन चेन",

  // ─── chain.legs_one ───
  "chain.legs_one": "{{count}} लेग",
  "chain.legs_other": "{{count}} लेग",

  // ─── chain.legs_other ───

  // ─── chain.close ───
  "chain.close": "चेन बंद करो",

  // ─── chain.lede ───
  "chain.lede": "कोई कॉन्ट्रैक्ट ख़रीदने, बेचने या हटाने के लिए <b>कॉल</b> या <b>पुट</b> के मिड पर टैप करो।\nचेन के मिड और डेल्टा ब्लैक-शोल्स स्माइल से आते हैं, जो ATM, 25Δ-पुट और 25Δ-कॉल अस्थिरताओं पर टिकी है।\nIV कॉलम हर स्ट्राइक पर स्माइल पढ़ता है: वही IV उस स्ट्राइक पर कॉल और पुट दोनों का मूल्य तय करती है, क्योंकि स्माइल एक ही वक्र है, दो नहीं।\nस्पॉट (<b>{{spot}}</b>) के सबसे पास वाली पंक्ति ATM के रूप में उभारी गई है।",

  // ─── chain.dte ───
  "chain.dte": "{{dte}} DTE",

  // ─── chain.calls ───
  "chain.calls": "कॉल",

  // ─── chain.strikeIv ───
  "chain.strikeIv": "स्ट्राइक · IV",

  // ─── chain.puts ───
  "chain.puts": "पुट",

  // ─── chain.mid ───
  "chain.mid": "मिड",

  // ─── chain.strike ───
  "chain.strike": "स्ट्राइक",

  // ─── chain.held ───
  "chain.held": "{{side}} · बदलने के लिए क्लिक करो",

  // ─── chain.long ───
  "chain.long": "लॉन्ग",

  // ─── chain.short ───
  "chain.short": "शॉर्ट",

  // ─── chain.tapCall ───
  "chain.tapCall": "यह कॉल ख़रीदने या बेचने के लिए क्लिक करो",

  // ─── chain.tapPut ───
  "chain.tapPut": "यह पुट ख़रीदने या बेचने के लिए क्लिक करो",

  // ─── chain.proposed ───
  "chain.proposed": "प्रस्तावित संरचना",

  // ─── chain.clearTitle ───
  "chain.clearTitle": "सभी लेग हटाओ",

  // ─── chain.clear ───
  "chain.clear": "हटाओ",

  // ─── chain.noLegs ───
  "chain.noLegs": "अभी कोई लेग नहीं। बनाना शुरू करने के लिए ऊपर किसी कॉल या पुट मिड पर टैप करो।",

  // ─── chain.buyCaps ───
  "chain.buyCaps": "ख़रीद",

  // ─── chain.sellCaps ───
  "chain.sellCaps": "बिक्री",

  // ─── chain.fewer ───
  "chain.fewer": "कॉन्ट्रैक्ट घटाओ",

  // ─── chain.useRemove ───
  "chain.useRemove": "यह लेग हटाने के लिए हटाओ का उपयोग करो",

  // ─── chain.oneFewer ───
  "chain.oneFewer": "एक कॉन्ट्रैक्ट कम",

  // ─── chain.qty ───
  "chain.qty": "कॉन्ट्रैक्ट की मात्रा",

  // ─── chain.more ───
  "chain.more": "कॉन्ट्रैक्ट बढ़ाओ",

  // ─── chain.oneMore ───
  "chain.oneMore": "एक कॉन्ट्रैक्ट ज़्यादा",

  // ─── chain.net ───
  "chain.net": "शुद्ध प्रीमियम",

  // ─── chain.credit ───
  "chain.credit": "क्रेडिट",

  // ─── chain.debit ───
  "chain.debit": "डेबिट",

  // ─── chain.buy ───
  "chain.buy": "ख़रीदो",

  // ─── chain.sell ───
  "chain.sell": "बेचो",

  // ─── chain.remove ───
  "chain.remove": "हटाओ",

  // ─── chain.cancel ───
  "chain.cancel": "रद्द करो",

  // ─── modeler.fiction ───
  "modeler.fiction": "काल्पनिक अंडरलाइंग: बाहरी मॉडलर केवल असली, सूचीबद्ध चेन का भाव देते हैं, इसलिए यह पेऑफ़ Optionality का अपना है।",

  // ─── modeler.historical ───
  "modeler.historical": "यह परिदृश्य अतीत का है। बाहरी मॉडलर परिदृश्य की तारीख़ की नहीं, आज की चेन का भाव देते हैं, इसलिए यह पेऑफ़ Optionality की अपनी पुनर्रचना है।",

  // ─── modeler.noPreset ───
  "modeler.noPreset": "बाहरी मॉडलरों के पास इस संरचना का कोई तैयार नमूना नहीं है; ऊपर का पेऑफ़ इसे पहले ही दिखाता है।",

  // ─── payoff.captionMulti ───
  "payoff.captionMulti": "सबसे निकट एक्सपायरी पर प्रोफ़ाइल · {{dte}} DTE · दूर के लेग ब्लैक-शोल्स से आँके गए",

  // ─── payoff.caption ───
  "payoff.caption": "एक्सपायरी पर प्रोफ़ाइल · {{dte}} DTE",

  // ─── payoff.credit ───
  "payoff.credit": "क्रेडिट {{amount}}",

  // ─── payoff.debit ───
  "payoff.debit": "डेबिट {{amount}}",

  // ─── payoff.netEntry ───
  "payoff.netEntry": "शुद्ध प्रवेश",

  // ─── payoff.received ───
  "payoff.received": "मिला क्रेडिट",

  // ─── payoff.paid ───
  "payoff.paid": "चुकाया डेबिट",

  // ─── payoff.rr ───
  "payoff.rr": "लाभ : जोखिम",

  // ─── payoff.undefined ───
  "payoff.undefined": "अपरिभाषित",

  // ─── payoff.breakeven ───
  "payoff.breakeven": "ब्रेकईवन",

  // ─── payoff.verifyTitle ───
  "payoff.verifyTitle": "लाइव ग्रीक्स, IV और संभावना के लिए यह {{structure}} {{provider}} पर खोलो",

  // ─── payoff.verify ───
  "payoff.verify": "{{provider}} पर जाँचो ↗",

  // ─── payoff.verifyNote ───
  "payoff.verifyNote": "असली चेन पर लाइव ग्रीक्स · IV · संभावना",

  // ─── payoff.ticket ───
  "payoff.ticket": "ऑर्डर टिकट",

  // ─── payoff.copyTitle ───
  "payoff.copyTitle": "यह ब्रोकर-शैली का टिकट क्लिपबोर्ड पर कॉपी करो",

  // ─── payoff.copied ───
  "payoff.copied": "कॉपी हो गया ✓",

  // ─── payoff.copy ───
  "payoff.copy": "कॉपी करो",

  // ─── payoff.try ───
  "payoff.try": "एक उदाहरण संरचना आज़माओ",

  // ─── payoff.tryHint ───
  "payoff.tryHint": " · पढ़ने के लिए उदाहरण, जमा करने के लिए नहीं",

  // ─── payoff.presetsCaption ───
  "payoff.presetsCaption": "पढ़ने के लिए उदाहरण, जमा करने के लिए नहीं। प्रीमियम असली चेन से आते हैं: वही आँकड़े जो तुम खुद इन स्ट्राइक पर टैप करके देखते।",

  // ─── presets.0 ───
  "presets.0": "OTM पुट बेचो + नीचे का पुट ख़रीदो। तेज़ी का क्रेडिट स्प्रेड।",

  // ─── presets.1 ───
  "presets.1": "OTM कॉल बेचो + ऊपर का कॉल ख़रीदो। मंदी का क्रेडिट स्प्रेड।",

  // ─── presets.2 ───
  "presets.2": "दोनों पंख बेचो, उनसे आगे दोनों पंख ख़रीदो। चौड़ी सीमा।",

  // ─── presets.3 ───
  "presets.3": "ATM स्ट्रैडल बेचो + दूर के OTM पंख ख़रीदो। भाव के टिके रहने का संकरा दाँव।",

  // ─── presets.4 ───
  "presets.4": "ATM कॉल ख़रीदो + ATM पुट ख़रीदो। घटना से पहले अस्थिरता का दाँव।",

  // ─── presets.5 ───
  "presets.5": "OTM कॉल बेचो + OTM पुट बेचो। सीमा में प्रीमियम वसूली।",

  // ─── presets.6 ───
  "presets.6": "नज़दीकी ATM कॉल बेचो + उसी स्ट्राइक का दूर का कॉल ख़रीदो।",

  // ─── presets.7 ───
  "presets.7": "नज़दीकी ATM पुट बेचो + उसी स्ट्राइक का दूर का पुट ख़रीदो।",

  // ─── presets.8 ───
  "presets.8": "दूर के महीने का गहरा ITM कॉल ख़रीदो + नज़दीकी महीने का OTM कॉल बेचो।",

  // ─── payoff.replaceTitle ───
  "payoff.replaceTitle": "मौजूदा लेग बदलो?",

  // ─── payoff.replaceBody_one ───
  "payoff.replaceBody_one": "<b>{{preset}}</b> लोड करने से तुम्हारा मौजूदा {{count}} लेग नमूने की संरचना से बदल जाएगा, प्रीमियम लाइव चेन से लिए जाएँगे।",
  "payoff.replaceBody_other": "<b>{{preset}}</b> लोड करने से तुम्हारे मौजूदा {{count}} लेग नमूने की संरचना से बदल जाएँगे, प्रीमियम लाइव चेन से लिए जाएँगे।",

  // ─── payoff.replaceBody_other ───

  // ─── payoff.keep ───
  "payoff.keep": "मेरे लेग रखो",

  // ─── payoff.replace ───
  "payoff.replace": "{{preset}} से बदलो",

  // ─── skew.level ───
  "skew.level.none": "इस परिदृश्य ने IV रैंक नहीं दी, इसलिए स्तर का अंदाज़ा ATM IV ({{iv}}%) और अपनी समझ से लगाओ कि {{ticker}} के लिए यह ऊँचा है या नहीं।",
  "skew.level.rich": "IV रैंक {{rank}}: {{ticker}} की अपनी हालिया सीमा की तुलना में प्रीमियम महँगा है।\nयह बेचने वाले के लिए हरी झंडी है: अभी हर ओर ऑप्शन अच्छे दाम पर बिक रहे हैं।\nफिर स्क्यू बताता है कि कौन-सा स्ट्राइक बेचना है।",
  "skew.level.mid": "IV रैंक {{rank}}: प्रीमियम बीच का है, न बढ़िया मौक़ा न अकाल।\nपरिदृश्य के अपने कैटलिस्ट पर भरोसा करो और स्क्यू को तय करने दो कि सापेक्ष मूल्य कहाँ है।",
  "skew.level.cheap": "IV रैंक {{rank}}: {{ticker}} की अपनी सीमा की तुलना में प्रीमियम सस्ता है।\nबेचने वालों के लिए कम इनाम; पूरा वक्र नीचे है, इसलिए जहाँ स्क्यू लुभावना लगे वहाँ भी ज़्यादा चुनिंदा रहो।",

  // ─── skew.verdict ───
  "skew.verdict.flat": "इस परिदृश्य ने 25Δ स्माइल के आधार-बिंदु नहीं दिए, इसलिए यहाँ वक्र ATM पर {{iv}}% की सपाट IV है: केवल स्तर, आकार नहीं।\nदौर की कहानी के लिए परिदृश्य की skew_note पढ़ो।",
  "skew.verdict.smirkWide": "उल्टा स्मर्क (पुट की माँग)।\nतुम जो पुट ख़रीदते हो ({{long}}) वह बेचे गए पुट ({{short}}) से अस्थिरता में साफ़ तौर पर महँगा है: स्क्यू तुम्हारे क्रेडिट को खाता है, पर यह पंख डर की क़ीमत चुकाता है।\nअसली सहारे के लिए सबसे खड़ी ढलान से नीचे बेचो।",
  "skew.verdict.smirkNarrow": "उल्टा स्मर्क (पुट की माँग)।\nस्पॉट के पास स्क्यू हल्का है; दोनों लेग की अस्थिरता मिलती-जुलती है, इसलिए क्रेडिट साफ़ है।\nपर तुम मनी के ज़्यादा क़रीब हो, इसलिए सहारा पतला है।\nयही क्लासिक सौदा है।",
  "skew.verdict.forward": "सीधा स्क्यू: यहाँ महँगा पंख कॉल का है।\n{{ticker}} पर पुट स्प्रेड के लिए यह अनुकूल है, क्योंकि जिन पुट का तुम सौदा करते हो वे सस्ती, सपाट ओर हैं।\nयह वक्र जिस ख़तरे की क़ीमत लगाता है वह ऊपर की ओर उछाल है, गिरावट नहीं।",
  "skew.verdict.symmetric": "लगभग सममित: दोनों पंखों की IV मिलती-जुलती है।\nATM न गहरी घाटी है न ज़्यादा झुका हुआ, इसलिए स्क्यू से किसी पंख की क़ीमत की उम्मीद करने के बजाय इसे स्पॉट या घटना की स्थिति के लिए पढ़ो।",

  // ─── skew.trigger ───
  "skew.trigger": "स्क्यू गाइड",

  // ─── skew.close ───
  "skew.close": "गाइड बंद करो",

  // ─── skew.title ───
  "skew.title": "स्क्यू की गाइड",

  // ─── skew.lede ───
  "skew.lede": "इम्प्लाइड अस्थिरता एक संख्या नहीं है: यह स्ट्राइकों के आर-पार एक <em>वक्र</em> है, एक नक़्शा कि बाज़ार डर के लिए कहाँ ज़्यादा दाम दे रहा है।\nप्रीमियम बेचने वाले के लिए यह दिखाता है कि बीमा सबसे <em>महँगा</em> कहाँ है, और इस पूरी गाइड में <b>महँगा मतलब ऊँचा प्रीमियम</b>: <em>बेचने</em> के लिए अच्छा, ख़रीदने के लिए बुरा।\nइसका मतलब कभी यह नहीं कि ऑप्शन रखने वाला अमीर हो जाता है।",
  "skew.lede.smile": "नीचे का वक्र वही <em>असली</em> स्माइल है जिससे यह परिदृश्य क़ीमत लगाता है, जो <b>{{who}}</b> के स्पॉट <b>{{spot}}</b>, ATM 30-दिन IV <b>{{iv}}%</b>, 25Δ-पुट IV <b>{{put}}%</b> और 25Δ-कॉल IV <b>{{call}}%</b> पर टिका है।\nऑप्शन चेन हर स्ट्राइक की क़ीमत इसी स्माइल से लगाती है।",
  "skew.lede.flat": "यह परिदृश्य संरचित स्माइल आधार-बिंदु दर्ज होने से पहले बना था, इसलिए नीचे का वक्र सभी स्ट्राइक पर <b>{{iv}}%</b> की सपाट IV दिखाता है: <em>केवल स्तर, कोई आकार नहीं</em>।\nदौर की कहानी के लिए परिदृश्य की skew_note पढ़ो।",

  // ─── skew.aria ───
  "skew.aria": "{{ticker}} का इम्प्लाइड अस्थिरता स्क्यू वक्र",

  // ─── skew.put25 ───
  "skew.put25": "25Δ पुट",

  // ─── skew.call25 ───
  "skew.call25": "25Δ कॉल",

  // ─── skew.chip ───
  "skew.chip": "25Δ {{value}} अंक",

  // ─── skew.leg ───
  "skew.leg.long": "लॉन्ग {{strike}}",
  "skew.leg.short": "शॉर्ट {{strike}}",

  // ─── skew.axis ───
  "skew.axis.spot": "स्पॉट",
  "skew.axis.strike": "स्ट्राइक",
  "skew.axis.iv": "इम्प्लाइड अस्थिरता",

  // ─── skew.legend ───
  "skew.legend.curve": "IV वक्र",
  "skew.legend.short": "शॉर्ट पुट (बेचा)",
  "skew.legend.long": "लॉन्ग पुट (ख़रीदा)",
  "skew.legend.wings": "25Δ पंख (स्क्यू)",
  "skew.legend.spot": "स्पॉट ≈ {{spot}}",

  // ─── skew.slider ───
  "skew.slider": "शॉर्ट स्ट्राइक (जो पुट तुम बेचते हो): इसे वक्र पर नीचे ले जाने के लिए खींचो",

  // ─── skew.wide ───
  "skew.wide": "{{width}} चौड़ा",

  // ─── skew.read ───
  "skew.read.shortIv": "शॉर्ट पुट की IV",
  "skew.read.longIv": "लॉन्ग पुट की IV",
  "skew.read.gap": "स्क्यू अंतर (लेग से लेग)",
  "skew.read.fear": "25Δ स्क्यू (डर का पैमाना)",

  // ─── skew.pts ───
  "skew.pts": "{{value}} अंक",

  // ─── skew.card ───
  "skew.card.reverse.tag": "शेयर और सूचकांक: सामान्य स्थिति",
  "skew.card.reverse.title": "उल्टा स्क्यू (स्मर्क)",
  "skew.card.reverse.body": "स्ट्राइक घटने के साथ IV बढ़ती है। <put>OTM पुट बोर्ड पर सबसे महँगे ऑप्शन हैं।</put>\nबाज़ार में गिरावट से बचाव की माँग हमेशा रहती है: हेजिंग की माँग नीचे की ओर की IV बढ़ाती है।\nबुल पुट स्प्रेड इसी दुनिया में रहते हैं।",
  "skew.card.smile.tag": "विदेशी मुद्रा, एकल शेयर, घटना से पहले",
  "skew.card.smile.title": "अस्थिरता स्माइल",
  "skew.card.smile.body": "दोनों पंख उठते हैं; ATM सस्ती घाटी है।\nबाज़ार किसी साफ़ झुकाव के बिना <em>किसी भी दिशा में बड़ी चाल</em> से डरता है।\nयह द्विआधारी घटनाओं (नतीजे, FOMC, CPI आँकड़ा) से पहले आम है, जहाँ गैप का जोखिम दोनों तरफ़ होता है।",
  "skew.card.forward.tag": "कमोडिटी: तेल, गैस, अनाज",
  "skew.card.forward.title": "सीधा स्क्यू",
  "skew.card.forward.body": "स्ट्राइक <em>बढ़ने</em> के साथ IV बढ़ती है। <call>OTM कॉल बोर्ड पर सबसे महँगे ऑप्शन हैं</call>, क्योंकि जिस झटके का डर है वह <em>ऊपर</em> की ओर है: आपूर्ति में रुकावट जो भाव उछाल देती है।\nऊर्जा कंपनियाँ इस दौर के ज़्यादा क़रीब रहती हैं।",
  "skew.card.delta.tag": "असल में देखने लायक संख्या",
  "skew.card.delta.title": "25-डेल्टा स्क्यू",
  "skew.card.delta.body": "ढलान = <b>25Δ पुट की IV घटा 25Δ कॉल की IV</b>।\nबढ़ता अंतर मतलब डर पुट पंख को ऊपर धकेल रहा है (तनाव)।\nघटता अंतर मतलब लापरवाही।\nयह अभी इस शेयर से बाज़ार कितना डरा है, इसका सबसे साफ़ पाठ है।",

  // ─── skew.sell ───
  "skew.sell.title": "प्रीमियम बेचते समय यह क्यों मायने रखता है",
  "skew.sell.intro": "तुम बीमा नहीं ख़रीद रहे: तुम उसे जारी कर रहे हो।\nपर बेचने वाला असल में <b>दो अलग सवाल</b> पूछ रहा होता है, और <em>स्क्यू केवल दूसरे का जवाब देता है।</em>",

  // ─── skew.q ───
  "skew.q.head.question": "सवाल",
  "skew.q.head.answered": "जवाब कौन देता है",
  "skew.q.head.card": "इस कार्ड पर",
  "skew.q.rich": "“क्या अभी प्रीमियम <em>महँगा</em> है भी?”",
  "skew.q.richBy": "<b>IV स्तर + IV रैंक</b>: पूरा वक्र कितना ऊँचा है",
  "skew.q.card": "IV 30 दिन {{iv}}%",
  "skew.q.cardRank": "IV 30 दिन {{iv}}%, IV रैंक {{rank}}",
  "skew.q.which": "“<em>कौन-सा स्ट्राइक</em>, और किस संरचना के साथ, मुझे उसका सबसे ज़्यादा हिस्सा रखने देता है?”",
  "skew.q.whichBy": "<b>स्क्यू</b>: स्ट्राइकों के आर-पार वक्र का <em>आकार</em>",
  "skew.q.curve": "ऊपर वाला वक्र",

  // ─── skew.levelPays ───
  "skew.levelPays": "<b>तुम्हें भुगतान स्तर करता है। स्क्यू बस यह तय करता है कि वह भुगतान स्ट्राइकों में कैसे बँटता है, और कौन-सी संरचना उसे पकड़ती है और कौन-सी लौटा देती है।</b>\nमहँगे वक्र का मतलब है कि हर जगह ऑप्शन अच्छे दाम पाते हैं; स्क्यू तुम्हारी बीमांकिक तालिका है कि ज़्यादा भुगतान कहाँ जमा होता है।",

  // ─── skew.step1 ───
  "skew.step1": "चरण 1 · स्तर पढ़ना (करो या न करो)",

  // ─── skew.step2 ───
  "skew.step2": "चरण 2 · आकार पढ़ना, और स्प्रेड की बारीकी",
  "skew.step2.intro": "जब स्तर कहे “खेलो”, तो स्क्यू बताता है <em>कैसे</em>।\nबेचने वाले की दो संरचनाएँ स्क्यू का उल्टा इस्तेमाल करती हैं:",
  "skew.step2.csp": "<b>नक़द-सुरक्षित पुट</b> (अकेला एक पुट बेचना): खड़ा पुट स्क्यू पूरी तरह <em>अनुकूल हवा</em> है।\nतुम बोर्ड का सबसे महँगा, सबसे ज़्यादा डर से माँगा गया ऑप्शन वसूलते हो और पूरा रखते हो।",
  "skew.step2.bps": "<b>बुल पुट स्प्रेड</b> (ऊँचा पुट बेचो, नीचा ख़रीदो): यहाँ खड़ा स्क्यू एक <em>कर</em> है।\nजो पुट तुम <b>ख़रीदते</b> हो वह वक्र पर उस पुट से ऊँचा बैठता है जो तुम <b>बेचते</b> हो, इसलिए तुम महँगा चुकाते और सस्ता वसूलते हो।\nस्क्यू जितना खड़ा, तुम्हारा शुद्ध क्रेडिट उतना छोटा।\nवह घटा हुआ क्रेडिट सीमित, तय जोखिम की क़ीमत है।\nशॉर्ट स्ट्राइक नीचे ले जाते हुए देखो कि <b>स्क्यू अंतर</b> का आँकड़ा ठीक यही करता है।",

  // ─── skew.fearOpportunity ───
  "skew.fearOpportunity": "तो <gold>“डर = अवसर”</gold> और स्प्रेड की बारीकी आपस में विरोधी नहीं हैं।\nडर से माँगा गया पुट पंख मतलब <em>ऊँचा कुल प्रीमियम</em> (अच्छा: तुम ज़्यादा वसूलते हो), जबकि उस पंख का <em>झुकाव</em> वह है जो स्प्रेड अपने जोखिम की सीमा के बदले लौटाता है।\nदोनों संरचनाओं में तुम्हारी बढ़त एक ही है: वहाँ बेचो जहाँ बाज़ार का लगाया डर <b>भाव टिके रहने के तुम्हारे अपने भरोसे से ज़्यादा महँगा</b> हो।",

  // ─── skew.check ───
  "skew.check.title": "पढ़ने की एक व्यावहारिक जाँच-सूची",
  "skew.check.see": "तुम क्या देखते हो",
  "skew.check.means": "इसका मतलब",
  "skew.check.move": "बेचने वाले की चाल",
  "skew.check.0.see": "ऊँची IV रैंक + खड़ा पुट स्क्यू",
  "skew.check.0.means": "प्रीमियम महँगा और वह महँगापन पुट में है",
  "skew.check.0.move": "बेचने वाले का किताबी सेटअप: बेचने को एक महँगा पंख, और स्तर कहता है कि दाम अच्छा है",
  "skew.check.1.see": "खड़ा पुट स्क्यू",
  "skew.check.1.means": "गिरावट का डर महँगा आँका गया",
  "skew.check.1.move": "पुट प्रीमियम मोटा है: अपना शॉर्ट स्ट्राइक ढलान के सबसे खड़े हिस्से से <em>नीचे</em> रखो, ताकि ऐसे स्ट्राइक पर डर वाला प्रीमियम वसूलो जिससे बचने की गुंजाइश भाव के पास अभी है",
  "skew.check.2.see": "सपाट स्क्यू",
  "skew.check.2.means": "लापरवाही",
  "skew.check.2.move": "पतला प्रीमियम, क़ीमत में कम सहारा: ज़्यादा चुनिंदा रहो",
  "skew.check.3.see": "स्क्यू तेज़ी से खड़ा हो रहा है",
  "skew.check.3.means": "तनाव बढ़ रहा है",
  "skew.check.3.move": "IV फैल रही है: प्रवेश की खिड़की खुल रही है",
  "skew.check.4.see": "स्माइल बन रही है",
  "skew.check.4.means": "आगे द्विआधारी घटना",
  "skew.check.4.move": "दोनों तरफ़ गैप का जोखिम: इसके दौरान शॉर्ट न रहो",
  "skew.check.5.see": "सीधा स्क्यू (ऊर्जा)",
  "skew.check.5.means": "ऊपर के झटके का डर",
  "skew.check.5.move": "कॉल महँगा पंख हैं; पुट बेचने के लिए अपेक्षाकृत सस्ते",

  // ─── skew.foot ───
  "skew.foot.smile": "यह वक्र वही असली तीन-बिंदु स्माइल है जिससे यह परिदृश्य क़ीमत लगाता है: ATM IV {{iv}}%, 25Δ-पुट IV {{put}}%, 25Δ-कॉल IV {{call}}%, {{ticker}} के स्पॉट {{spot}} पर टिका।\nऑप्शन चेन की तालिकाएँ हर स्ट्राइक की क़ीमत इसी स्माइल से लगाती हैं।\nइम्प्लाइड अस्थिरता बाज़ार का आगे का अनुमान है, भविष्यवाणी नहीं: इसे क़ीमत लगी भावना की तरह पढ़ो।",
  "skew.foot.flat": "यह परिदृश्य संरचित स्माइल आधार-बिंदुओं से पहले का है, इसलिए वक्र सभी स्ट्राइक पर {{iv}}% की सपाट IV है (स्तर, आकार नहीं)।\nनया परिदृश्य मिलने तक दौर की कहानी के लिए परिदृश्य की skew_note पढ़ो।",

  // ─── sample.label ───
  "sample.label": "नमूना · केवल उदाहरण",

  // ─── sample.title ───
  "sample.title": "Optionality की पिच समीक्षा ऐसी दिखती है।",

  // ─── sample.intro ───
  "sample.intro": "एक असली राउंड फ़र्म तुम्हारे चुने मोड और पर्सोना के आधार पर नया गढ़ती है।\nफिर इसे दूसरे LLM के सामने रखा जाता है, जो छह आयामों पर तुम्हें अंक देता है, और यह तुम्हारी जर्नल में रखा जाता है।\nयह राउंड तय है: मार्च 2023 का एक अवसर, क्रेडिट पुट स्प्रेड की एक पिच और पूरी समीक्षा।\nsats लगाने से पहले यह देखने के लिए इसका उपयोग करो कि खेल क्या देता है।\nफ़र्म अपने परिदृश्य और समीक्षाएँ अंग्रेज़ी में लिखती है।",

  // ─── sample.scenario ───
  "sample.scenario": "परिदृश्य · {{date}}",

  // ─── sample.maxLoss ───
  "sample.maxLoss": "अधिकतम नुक़सान सीमा",

  // ─── sample.pitch ───
  "sample.pitch": "प्रशिक्षु की पिच",

  // ─── dm.failed ───
  "dm.failed": "DM नहीं भेजा जा सका।",

  // ─── dm.titleSelf ───
  "dm.titleSelf": "खुद को DM भेजो",

  // ─── dm.title ───
  "dm.title": "DM भेजो",

  // ─── dm.you ───
  "dm.you": " (तुम)",

  // ─── dm.selfNote ───
  "dm.selfNote": "खुद को DM: संदेश तुम्हारे अपने Nostr क्लाइंट के इनबॉक्स में आता है।\nयह किसी साथी को परेशान किए बिना तुम्हारे NIP-07 साइनर और रिले के रास्ते को शुरू से अंत तक जाँचने का तरीक़ा है।",

  // ─── dm.loading ───
  "dm.loading": "साझा रिले सूची अभी लोड हो रही है। इसे बंद करो और थोड़ी देर बाद फिर कोशिश करो।",

  // ─── dm.close ───
  "dm.close": "बंद करो",

  // ─── dm.placeholder ───
  "dm.placeholder": "एक संदेश लिखो। प्राप्तकर्ता इसे अपने Nostr क्लाइंट में देखता है।",

  // ─── dm.escrowNote ───
  "dm.escrowNote": "Optionality तुम्हारी सौंपी गई nsec से हस्ताक्षर करता है, जो ऑपरेटर के प्रबंधित भंडार में रखी है।\nDM, Nostr पर तुम्हारे npub के नाम से दिखता है।\nकुंजी कभी भी <b>प्रोफ़ाइल → गेम पर्सोना कुंजी</b> में वापस लो।",

  // ─── dm.nip07Note_one ───
  "dm.nip07Note_one": "तुम्हारे NIP-07 एक्सटेंशन से इसी डिवाइस पर हस्ताक्षरित; तुम्हारी nsec कभी Optionality तक नहीं पहुँचती।\nसाझा DPYC सूची के <b>{{count}}</b> रिले पर प्रकाशित।",
  "dm.nip07Note_other": "तुम्हारे NIP-07 एक्सटेंशन से इसी डिवाइस पर हस्ताक्षरित; तुम्हारी nsec कभी Optionality तक नहीं पहुँचती।\nसाझा DPYC सूची के <b>{{count}}</b> रिले पर प्रकाशित।",

  // ─── dm.nip07Note_other ───

  // ─── dm.cancel ───
  "dm.cancel": "रद्द करो",

  // ─── dm.send ───
  "dm.send": "हस्ताक्षर करो और भेजो",

  // ─── dm.sending ───
  "dm.sending": "एन्क्रिप्ट, हस्ताक्षर और प्रसारण हो रहा है…",

  // ─── dm.sent ───
  "dm.sent": "✓ भेज दिया",

  // ─── dm.notAccepted ───
  "dm.notAccepted": "✗ स्वीकार नहीं हुआ",

  // ─── dm.relays ───
  "dm.relays": "{{ok}} / {{total}} रिले",

  // ─── dm.perRelay ───
  "dm.perRelay": "हर रिले का नतीजा",

  // ─── dm.eventNote ───
  "dm.eventNote": "इवेंट id <id>{{id}}…</id>। इनमें से किसी रिले की सदस्यता लेने वाले किसी भी Nostr क्लाइंट में प्राप्तकर्ता इसे देखता है।",

  // ─── dm.serverNote ───
  "dm.serverNote": "DM, Optionality के रिले नेटवर्क से रास्ते में है। प्राप्तकर्ता इसे अपने Nostr क्लाइंट में देखेगा।",

  // ─── dm.done ───
  "dm.done": "हो गया",

  // ─── dm.tryAgain ───
  "dm.tryAgain": "फिर कोशिश करो",

  // ─── dm.install ───
  "dm.install": "DM भेजने के लिए <b>Nostr साइनर एक्सटेंशन इंस्टॉल करो</b>।\nOptionality तुम्हारी nsec कभी नहीं देखता: एक्सटेंशन अपने ही सैंडबॉक्स में DM पर हस्ताक्षर करता है, और एन्क्रिप्टेड संदेश सीधे रिले पर जाता है।",

  // ─── dm.alby ───
  "dm.alby": "ब्राउज़र एक्सटेंशन + iOS / Android। इसमें Lightning वॉलेट भी है।",

  // ─── dm.nos2x ───
  "dm.nos2x": "Chrome / Firefox का सादा एक्सटेंशन। केवल NIP-07, कोई वॉलेट नहीं।",

  // ─── dm.flamingo ───
  "dm.flamingo": "तुम्हारी nsec के इर्द-गिर्द iOS / डेस्कटॉप ऐप; वेब पेजों को NIP-07 देता है।",

  // ─── nostr.badNpub ───
  "nostr.badNpub": "मान्य npub नहीं: {{npub}}",

  // ─── nostr.noRelays ───
  "nostr.noRelays": "कोई रिले सेट नहीं है। प्रोफ़ाइल → Nostr रिले में कम से कम एक जोड़ो।",

  // ─── nostr.noSigner ───
  "nostr.noSigner": "कोई NIP-07 साइनर नहीं मिला। Alby, nos2x या Flamingo इंस्टॉल करो।",

  // ─── nostr.empty ───
  "nostr.empty": "संदेश ख़ाली नहीं हो सकता।",

  // ─── glossary.delta_neutral ───
  "glossary.delta_neutral": "ऐसी पोज़ीशन जिसका शुद्ध डेल्टा लगभग शून्य हो: बनाते समय दिशा वाला P/L आपस में कट जाता है। मुनाफ़ा भाव की दिशा से नहीं, वेगा, थीटा या गामा से आता है।",

  // ─── glossary.iron_condor ───
  "glossary.iron_condor": "एक ही एक्सपायरी पर OTM कॉल स्प्रेड और OTM पुट स्प्रेड बेचो। सीमित जोखिम वाला प्रीमियम-वसूली ट्रेड; अंडरलाइंग दोनों बेचे गए स्ट्राइक के बीच रहे तो मुनाफ़ा।",

  // ─── glossary.iron_butterfly ───
  "glossary.iron_butterfly": "ATM स्ट्रैडल बेचो और सुरक्षा के लिए OTM पंख ख़रीदो। बेचे गए स्ट्रैडल का सीमित-जोखिम रूप; अंडरलाइंग बेचे गए स्ट्राइक पर टिके तो अधिकतम मुनाफ़ा।",

  // ─── glossary.jade_lizard ───
  "glossary.jade_lizard": "बेचा गया कॉल स्प्रेड + बेचा गया पुट, जिनका कुल प्रीमियम कॉल स्प्रेड की चौड़ाई से ज़्यादा हो। ऊपर की ओर कोई जोखिम नहीं; नीचे का जोखिम बेचे गए पुट की जगह से सीमित है।",

  // ─── glossary.calendar_spread ───
  "glossary.calendar_spread": "नज़दीकी ऑप्शन बेचो, उसी स्ट्राइक पर दूर का ऑप्शन ख़रीदो। नज़दीकी लेग पर थीटा और दूर वाले लेग पर वेगा बढ़ने का फ़ायदा मिलता है।",

  // ─── glossary.diagonal_spread ───
  "glossary.diagonal_spread": "अलग-अलग स्ट्राइक वाला कैलेंडर स्प्रेड: समय-अंतर वाले अस्थिरता के दाँव में दिशा का झुकाव जोड़ता है।",

  // ─── glossary.ratio_spread ───
  "glossary.ratio_spread": "एक ऑप्शन ख़रीदो और उसी प्रकार के ज़्यादा OTM दो (या अधिक) बेचो। सस्ता या क्रेडिट पर भी प्रवेश; अंडरलाइंग बेचे गए स्ट्राइक से आगे निकल जाए तो टेल रिस्क।",

  // ─── glossary.vertical_spread ───
  "glossary.vertical_spread": "एक ऑप्शन ख़रीदो, उसी प्रकार और एक्सपायरी का दूसरा किसी और स्ट्राइक पर बेचो। जोखिम तय, लाभ तय। बुल कॉल / बेयर पुट / बेयर कॉल / बुल पुट।",

  // ─── glossary.credit_spread ───
  "glossary.credit_spread": "ऐसा वर्टिकल जिसमें बेचे गए ऑप्शन का प्रीमियम ख़रीदे गए से ज़्यादा हो: प्रवेश पर प्रीमियम मिलता है। अंडरलाइंग बेचे गए स्ट्राइक से दूर रहे तो मुनाफ़ा।",

  // ─── glossary.debit_spread ───
  "glossary.debit_spread": "ऐसा वर्टिकल जिसमें ख़रीदा गया ऑप्शन बेचे गए से महँगा हो: प्रवेश पर भुगतान। अंडरलाइंग ख़रीदे गए स्ट्राइक की ओर बढ़े तो मुनाफ़ा।",

  // ─── glossary.short_strangle ───
  "glossary.short_strangle": "OTM कॉल और OTM पुट बेचो। दोनों दिशाओं में असीमित जोखिम; वह जोखिम उठाने के बदले दो प्रीमियम मिलते हैं।",

  // ─── glossary.short_straddle ───
  "glossary.short_straddle": "ATM कॉल और ATM पुट बेचो। सबसे ज़्यादा प्रीमियम, सबसे ज़्यादा गामा जोखिम: छोटी चालें भी जल्दी असली पैसे का नुक़सान करती हैं।",

  // ─── glossary.long_straddle ───
  "glossary.long_straddle": "ATM कॉल और ATM पुट ख़रीदो। किसी भी दिशा में तेज़ चाल पर कमाई; अंडरलाइंग स्थिर रहे तो थीटा घटता जाता है।",

  // ─── glossary.long_strangle ───
  "glossary.long_strangle": "OTM कॉल और OTM पुट ख़रीदो। स्ट्रैडल से सस्ता; मुनाफ़े के लिए बड़ी चाल चाहिए।",

  // ─── glossary.covered_call ───
  "glossary.covered_call": "शेयर रखो + ऊँचे स्ट्राइक पर कॉल बेचो। स्ट्राइक से ऊपर की बढ़त छोड़कर बदले में प्रीमियम और थोड़ा सहारा मिलता है।",

  // ─── glossary.cash_secured_put ───
  "glossary.cash_secured_put": "पुट बेचो और असाइन होने पर शेयर ख़रीदने के लिए नक़द तैयार रखो। कम असरदार लागत पर शेयर में लॉन्ग पोज़ीशन लेने का धैर्य वाला तरीक़ा।",

  // ─── glossary.protective_put ───
  "glossary.protective_put": "शेयर रखो + पुट ख़रीदो। गिरावट के ख़िलाफ़ बीमा; इसकी लागत पुट का प्रीमियम है।",

  // ─── glossary.put_spread ───
  "glossary.put_spread": "पुट से बना वर्टिकल स्प्रेड। बेयर पुट = डेबिट चुकाओ, गिरावट पर मुनाफ़ा; बुल पुट = क्रेडिट लो, बेचे गए स्ट्राइक से ऊपर रहे तो मुनाफ़ा।",

  // ─── glossary.call_spread ───
  "glossary.call_spread": "कॉल से बना वर्टिकल स्प्रेड। बुल कॉल = डेबिट चुकाओ, तेज़ी पर मुनाफ़ा; बेयर कॉल = क्रेडिट लो, बेचे गए स्ट्राइक से नीचे रहे तो मुनाफ़ा।",

  // ─── glossary.iv_crush ───
  "glossary.iv_crush": "किसी घटना (नतीजे, FDA, FOMC) के बाद इम्प्लाइड अस्थिरता में तेज़ गिरावट। लॉन्ग-वोल संरचनाएँ घाटे में; शॉर्ट-वोल संरचनाएँ फ़ायदे में।",

  // ─── glossary.vol_crush ───
  "glossary.vol_crush": "IV क्रश जैसा ही: घटना के बाद इम्प्लाइड अस्थिरता ढह जाती है और दिशा कोई भी हो, ऑप्शन प्रीमियम सिकुड़ जाते हैं।",

  // ─── glossary.vol_regime ───
  "glossary.vol_regime": "ट्रेड के आसपास अस्थिरता का माहौल: वास्तविक बनाम इम्प्लाइड, IV रैंक, टर्म संरचना का आकार, स्क्यू। यही तय करता है कि प्रीमियम ख़रीदना है या बेचना।",

  // ─── glossary.iv_rank ───
  "glossary.iv_rank": "मौजूदा इम्प्लाइड अस्थिरता अपनी 1 साल की सीमा में कहाँ है, 0–100। ऊँची IV रैंक प्रीमियम बेचने के पक्ष में; नीची, प्रीमियम ख़रीदने या कैलेंडर के पक्ष में।",

  // ─── glossary.skew ───
  "glossary.skew": "अलग-अलग स्ट्राइक पर इम्प्लाइड अस्थिरता का अंतर। इक्विटी स्क्यू = पुट कॉल से महँगे; उल्टा स्क्यू (कमोडिटी) = कॉल महँगे।",

  // ─── glossary.term_structure ───
  "glossary.term_structure": "अलग-अलग एक्सपायरी पर इम्प्लाइड अस्थिरता कैसे बदलती है। कॉन्टैंगो = दूर के महीने ऊँचे (शांत बाज़ार); बैकवर्डेशन = नज़दीकी महीने ऊँचे (तनाव)।",

  // ─── glossary.gamma_risk ───
  "glossary.gamma_risk": "जोखिम कि डेल्टा तुम्हारी हेजिंग से तेज़ बदले। शॉर्ट गामा पोज़ीशन अस्थिर, उथल-पुथल वाले बाज़ार में पैसा गँवाती हैं।",

  // ─── glossary.vega_exposure ───
  "glossary.vega_exposure": "इम्प्लाइड अस्थिरता के बदलाव के प्रति संवेदनशीलता। लॉन्ग वेगा = IV बढ़े तो मुनाफ़ा; शॉर्ट वेगा = IV घटे तो मुनाफ़ा।",

  // ─── glossary.theta_decay ───
  "glossary.theta_decay": "प्रीमियम का रोज़ का क्षरण, जो ऑप्शन बेचने वाले वसूलते और ख़रीदने वाले चुकाते हैं। एक्सपायरी पास आने पर तेज़ होता है।",

  // ─── glossary.delta ───
  "glossary.delta": "अंडरलाइंग में $1 की चाल पर ऑप्शन के भाव में अनुमानित बदलाव। ITM पर ख़त्म होने की संभावना का मोटा संकेत भी।",

  // ─── glossary.gamma ───
  "glossary.gamma": "डेल्टा के बदलने की दर। ऊँचा गामा = डेल्टा तेज़ी से झूलता है: ऑप्शन ख़रीदारों के अनुकूल, स्ट्राइक के पास बेचने वालों के प्रतिकूल।",

  // ─── glossary.vega ───
  "glossary.vega": "इम्प्लाइड अस्थिरता में 1 अंक के बदलाव पर ऑप्शन के भाव में बदलाव। ख़रीदे गए ऑप्शन का वेगा धनात्मक; बेचे गए का ऋणात्मक।",

  // ─── glossary.theta ───
  "glossary.theta": "ऑप्शन के समय-मूल्य का रोज़ का क्षय। ख़रीदे गए ऑप्शन थीटा चुकाते हैं; बेचे गए उसे वसूलते हैं।",

  // ─── glossary.rho ───
  "glossary.rho": "जोखिम-मुक्त दर के बदलाव पर ऑप्शन के भाव की संवेदनशीलता। लंबी अवधि वाले ऑप्शन में ज़्यादा; छोटी अवधि में अक्सर नगण्य।",

  // ─── glossary.moneyness ───
  "glossary.moneyness": "ऑप्शन का स्ट्राइक स्पॉट से कितना दूर है: ITM (इन द मनी), ATM (एट द मनी) या OTM (आउट ऑफ़ द मनी)। OTM की दूरी डेल्टा के लिए मायने रखती है।",

  // ─── glossary.breakeven ───
  "glossary.breakeven": "एक्सपायरी पर अंडरलाइंग का वह भाव जहाँ ट्रेड का P/L ठीक शून्य हो। कई लेग वाली संरचनाओं में दो हो सकते हैं (जैसे कॉन्डोर)।",

  // ─── glossary.max_loss ───
  "glossary.max_loss": "अंत तक रखने पर एक्सपायरी का सबसे बुरा नतीजा। सीमित-जोखिम संरचनाएँ इसे साफ़ तौर पर सीमित करती हैं; नेकेड शॉर्ट का अधिकतम नुक़सान असीमित होता है।",

  // ─── glossary.max_gain ───
  "glossary.max_gain": "एक्सपायरी का सबसे अच्छा नतीजा। ख़रीदे प्रीमियम में यह असीमित (कॉल) या बड़ा (पुट) होता है; बेचे प्रीमियम में यह मिला हुआ क्रेडिट है।",

  // ─── glossary.dte ───
  "glossary.dte": "एक्सपायरी तक बचे दिन। थीटा की तेज़ी और वेगा जोखिम इन्हीं से चलते हैं। 21 दिन से कम वाली संरचनाएँ आमतौर पर गामा-प्रधान होती हैं; 45 से ज़्यादा वाली आमतौर पर वेगा-प्रधान।",

  // ─── glossary.assignment_risk ───
  "glossary.assignment_risk": "जोखिम कि बेचा गया ऑप्शन जल्दी इस्तेमाल हो जाए और तुम्हें शेयर देने या लेने पड़ें। एक्सपायरी के पास और एक्स-डिविडेंड तारीख़ के आसपास सबसे ज़्यादा।",

  // ─── glossary.pin_risk ───
  "glossary.pin_risk": "जोखिम कि एक्सपायरी पर अंडरलाइंग ठीक बेचे गए स्ट्राइक पर बंद हो, और तुम अनिश्चित रहो कि असाइन होगे या नहीं।",

  // ─── glossary.expected_move ───
  "glossary.expected_move": "तय अवधि में अंडरलाइंग की लगभग एक-सिग्मा सीमा। अक्सर स्ट्रैडल के भाव से या इम्प्लाइड अस्थिरता × √समय से निकाली जाती है।",

  // ─── glossary.atm_straddle ───
  "glossary.atm_straddle": "एट-द-मनी कॉल और एट-द-मनी पुट ख़रीदो या बेचो। लॉन्ग ATM स्ट्रैडल “मुझे बड़ी चाल की उम्मीद है” वाला आदर्श ट्रेड है।",

  // ─── glossary.wheel_strategy ───
  "glossary.wheel_strategy": "जिस शेयर को तुम रखना चाहो उस पर नक़द-सुरक्षित पुट बेचो; असाइन होने पर उसके बदले कवर्ड कॉल बेचो जब तक शेयर ले न लिया जाए। फिर दोहराओ। प्रीमियम धीरे-धीरे कमाने का तरीक़ा।",

  // ─── glossary.chartLink ───
  "glossary.chartLink": "TradingView पर {{symbol}} का चार्ट खोलो",

  // ─── chart.underlying ───
  "chart.underlying": "अंडरलाइंग  {{price}}",

  // ─── chart.net ───
  "chart.net": "शुद्ध P/L",

  // ─── chart.alt ───
  "chart.alt": "वैकल्पिक P/L",

  // ─── chart.spot ───
  "chart.spot": "स्पॉट",
};

export default words;
