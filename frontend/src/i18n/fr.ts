/**
 * Every word Optionality's own pages say, en français.
 * Keys, {{places}} and <tags> are those of en.ts.
 */

import type { Translation } from "./en.ts";

const words: Translation = {
  // ─── game.journal ───
  "game.journal.col.symbol": "Symbole",
  "game.journal.col.historicity": "Historicité",
  "game.journal.col.difficulty": "Difficulté",
  "game.journal.col.created": "Créé",
  "game.journal.col.updated": "Modifié",
  "game.journal.col.grade": "Note",
  "game.journal.col.score": "Score",
  "game.journal.col.status": "État",
  "game.journal.group.none": "Aucun",

  // ─── game.tool ───
  "game.tool.deal_scenario": "Scénario de trade",
  "game.tool.judge_trade": "Évaluation du pitch",
  "game.tool.ask_tip": "Demande d'indice",
  "game.tool.save_draft": "Enregistrer le brouillon",
  "game.tool.purchase_credits": "Recharger",
  "game.tool.check_payment": "Vérification du paiement",
  "game.tool.check_balance": "Vérification du solde",
  "game.tool.check_price": "Aperçu du prix",
  "game.tool.get_leaderboard": "Classement",
  "game.tool.get_my_rank": "Mon rang",
  "game.tool.get_journal": "Consultation du journal",
  "game.tool.list_journal": "Liste du journal",
  "game.tool.delete_journal": "Suppression du journal",
  "game.tool.set_display_name": "Nom affiché",
  "game.tool.get_api_usage_stats": "Usage de l'API",
  "game.tool.account_statement": "Relevé de compte",
  "game.tool.request_npub_proof": "Connexion (demande)",
  "game.tool.receive_npub_proof": "Connexion (vérification)",

  // ─── game.difficulty ───
  "game.difficulty.apprentice.label": "Apprenti",
  "game.difficulty.apprentice.blurb": "Configurations directionnelles nettes. Toile de fond macro classique.",
  "game.difficulty.journeyman.label": "Compagnon",
  "game.difficulty.journeyman.blurb": "Le régime de volatilité compte. Résultats, jours de Fed, catalyseurs uniques.",
  "game.difficulty.adept.label": "Expert",
  "game.difficulty.adept.blurb": "Multifactoriel. Corrélations entre classes d'actifs. Skew et structure par terme.",
  "game.difficulty.sovereign.label": "Souverain",
  "game.difficulty.sovereign.blurb": "Ère de changement de régime. Dépréciation monétaire, géopolitique, couverture des queues.",
  "game.difficulty.mulligan.label": "Seconde chance",

  // ─── game.mode ───
  "game.mode.historical.label": "Fiction historique",
  "game.mode.historical.blurb": "Ancré dans un vrai moment de l'histoire des marchés. Macro réelle ; chiffres calibrés.",
  "game.mode.fiction.label": "Fiction",
  "game.mode.fiction.blurb": "Pure invention. Hypothèses d'un futur proche, contrefactuels, régimes spéculatifs.",
  "game.mode.live.label": "Événements en direct",
  "game.mode.live.blurb": "Ancré dans le marché réel d'aujourd'hui grâce à la recherche web. Vrai ticker, vrai catalyseur, maintenant.",

  // ─── game.sector ───
  "game.sector.any": "N'importe lequel",
  "game.sector.biotech": "Biotech",
  "game.sector.semis": "Semi-conducteurs",
  "game.sector.megaTech": "Méga tech",
  "game.sector.banks": "Banques",
  "game.sector.energy": "Énergie",
  "game.sector.miners": "Mines",
  "game.sector.consumer": "Consommation",
  "game.sector.homebuilders": "Construction résidentielle",
  "game.sector.defense": "Défense",
  "game.sector.airlines": "Compagnies aériennes",
  "game.sector.crypto": "Actions crypto",
  "game.sector.index": "Indice/ETF",

  // ─── game.dimension ───
  "game.dimension.strategy_selection": "Structure",
  "game.dimension.strikes_and_tenor": "Strikes et échéance",
  "game.dimension.risk_reward": "Risque / rendement",
  "game.dimension.macro_integration": "Contexte macro",
  "game.dimension.tail_risk": "Conscience des queues",
  "game.dimension.communication": "Communication",

  // ─── game.zoom ───
  "game.zoom.title": "Touche pour lire ce texte en plus grand",

  // ─── game.loading ───
  "game.loading.tape": "Lecture du marché",
  "game.loading.wire": "Écoute des dépêches",
  "game.loading.judging": "Évaluation de ton pitch",
  "game.loading.reissuing": "Réédition du scénario",

  // ─── game.error ───
  "game.error.agedOut": "Cette mission a expiré avant ton retour. Aucun péage n'a été prélevé. Lance-en une nouvelle.",
  "game.error.recover": "Impossible de récupérer cette mission. {{message}}",
  "game.error.start": "Impossible de lancer le scénario. {{message}}",
  "game.error.typeFirst": "Écris d'abord ton trade.",
  "game.error.noScenario": "Aucun scénario actif. Lance-en un nouveau d'abord.",
  "game.error.notInJournal": "Ce scénario n'est plus dans ton journal, il ne peut donc pas être évalué. Lance-en un nouveau pour présenter un pitch. Aucun péage n'a été prélevé.",
  "game.error.evaluation": "L'évaluation a échoué. {{message}}",
  "game.error.noScenarioToSave": "Aucun scénario actif auquel rattacher l'enregistrement.",
  "game.error.save": "L'enregistrement a échoué. {{message}}",
  "game.error.acceptFirst": "Accepte un défi avant de demander un indice.",
  "game.error.clue": "La demande d'indice a échoué. {{message}}",
  "game.error.replay": "La rejouabilité a échoué. {{message}}",
  "game.error.nothingToResume": "Cette entrée n'a pas de scénario à reprendre.",

  // ─── game.entry ───
  "game.entry.yourTrade": "Ton trade",
  "game.entry.headline": "En une phrase",
  "game.entry.riskProfile": "Profil de risque",
  "game.entry.alternative": "Alternative",
  "game.entry.deeper": "Contexte approfondi",
  "game.entry.redoTitle": "Rééditer ce scénario en seconde chance : même mise en place, nouveau pitch",
  "game.entry.redo": "Recommencer",
  "game.entry.sharedTitle": "Partagé sur ta ligne du classement. Clique pour le rendre privé.",
  "game.entry.shareTitle": "Partager ce pitch sur ta ligne du classement pour que les autres puissent comparer",
  "game.entry.shared": "✓ Partagé",
  "game.entry.share": "Partager",
  "game.entry.visibleToAll": "Visible par tous",
  "game.entry.resumeDraftTitle": "Tu as un brouillon enregistré. Reprends-le sur le parquet pour le terminer et le présenter. Pas de nouveau scénario, pas de frais.",
  "game.entry.resumeTitle": "Reprends ce scénario ouvert sur le parquet pour présenter un trade et obtenir une évaluation. Pas de nouveau scénario, pas de frais.",
  "game.entry.resume": "🙋 Reprendre",
  "game.entry.noReview": "État de l'entrée : {{status}}. Aucune évaluation de pitch disponible.",

  // ─── game.brand ───
  "game.brand.tagline": "Entraîneur ludique de consultants en trading d'options",

  // ─── game.stats ───
  "game.stats.sessions": "Séances",
  "game.stats.avg": "Note moy.",
  "game.stats.best": "Meilleure",
  "game.stats.streak": "Série",

  // ─── game.balance ───
  "game.balance.title": "Recharger : acheter des sats via Bitcoin Lightning",
  "game.balance.label": "Solde",
  "game.balance.sats": " sats",
  "game.balance.topUp": "＋ Recharger",

  // ─── game.signOut ───
  "game.signOut.title": "Se déconnecter : effacer la npub et le jeton de preuve enregistrés",
  "game.signOut.label": "Se déconnecter",

  // ─── game.tab ───
  "game.tab.welcome": "Bienvenue",
  "game.tab.play": "Le parquet",
  "game.tab.sample": "Voir une évaluation",
  "game.tab.journal": "Journal",
  "game.tab.leaderboard": "Classement",
  "game.tab.usage": "Usage",
  "game.tab.profile": "Profil",

  // ─── game.openingFloor ───
  "game.openingFloor": "Ouverture du parquet",

  // ─── game.guest ───
  "game.guest.label": "Pass invité",
  "game.guest.welcome": "Bienvenue, trader invité <id>{{id}}</id>.",
  "game.guest.body": "Le site est en ligne, mais tu ne peux utiliser que les services gratuits tant que tu n'as pas acheté de jetons DPYC.\nVa dans l'onglet <b>Usage</b> pour voir ton compte et acheter des jetons.\nObtenir un défi, demander des indices et se faire évaluer sont des services payants, mais les frais sont minimes : quelques sats chacun.\nUne fois tes identifiants Nostr en main, tu peux recharger ici.\nTu pourras alors travailler tes défis, enregistrer ton travail en cours et écrire aux autres joueurs du classement.\nAvec la pratique, tu deviens plus habile à présenter des trades d'options à des publics professionnels.\nBienvenue.",
  "game.guest.signIn": "Se connecter pour jouer →",

  // ─── game.briefing ───
  "game.briefing.label": "Briefing",
  "game.briefing.title": "Le desk est ouvert.",
  "game.briefing.prose": "La Firme te présente une opportunité : un moment des marchés, peut-être réel, peut-être inventé, peut-être en train de se dérouler.\nTu verras une date, une toile de fond macro, un actif, un catalyseur, des niveaux clés et les contraintes de ton portefeuille.\nLis-le comme un dossier de plaidoirie.\nPuis rédige ton trade avec tes propres mots : structure, strikes, échéance, taille et raisonnement.",
  "game.briefing.integration": "<b>L'intégration est récompensée.</b> Une réponse solide tient compte des faits politiques, monétaires et inter-actifs que la Firme a mis sous tes yeux.\nPlus tu tisses de faits pertinents dans ta thèse, plus ta note monte, surtout sur la dimension Contexte macro.",
  "game.briefing.herrings": "<b>Des fausses pistes sont semées.</b> La Firme glisse un ou deux faits parfaitement vrais mais sans importance pour le trade idéal.\nCe sont des bruits du monde réel qu'un trader pourrait raisonnablement remarquer et surpondérer.\nUne note de skew peut être de la couleur, pas un catalyseur.\nUn gros titre peut déjà être dans les cours.\nUne position déclarée peut être périmée.\nCe sont des pièges de pertinence, jamais de fausseté.\nBâtir ta thèse sur l'une d'elles te coûte des points ; la reconnaître comme du bruit et la mettre de côté t'en rapporte.",
  "game.briefing.coda": "Choisis ton historicité. Choisis ton persona. Accepte le défi.",

  // ─── game.chooser ───
  "game.chooser.historicity": "Historicité",
  "game.chooser.persona": "Persona",
  "game.chooser.risk": "Enveloppe de risque",
  "game.chooser.maxLoss": "Perte max. par trade :",
  "game.chooser.optional": "facultatif",
  "game.chooser.clear": "effacer",
  "game.chooser.maxLossHint": "Facultatif. Si tu la fixes, la Firme dimensionne le compte et les contraintes de l'opportunité pour qu'une structure bien choisie tienne dans ton enveloppe. Le juge pénalise les trades dont le pire cas la dépasse.",
  "game.chooser.sector": "Secteur ciblé",
  "game.chooser.sectorLimit": "Limiter le croupier à {{sector}}",
  "game.chooser.sectorAny": "Laisser le croupier choisir n'importe quel secteur",
  "game.chooser.customSector": "ou tape un secteur personnalisé :",
  "game.chooser.customExample": "ex. produits de luxe",
  "game.chooser.sectorHint": "Facultatif. La Firme choisit le sous-jacent dans le secteur choisi et adapte le catalyseur, les faits pertinents et les fausses pistes à sa dynamique.",

  // ─── game.topUp ───
  "game.topUp.title": "Acheter des sats à l'opérateur via Bitcoin Lightning",
  "game.topUp.label": "Recharger",

  // ─── game.toll ───
  "game.toll.label": "Péage",

  // ─── game.sats_one ───
  "game.sats_one": "{{count}} sat",
  "game.sats_other": "{{count}} sats",

  // ─── game.sats_other ───

  // ─── game.toll ───
  "game.toll.noModel": "Le modèle de prix n'a pas encore de multiplicateurs. Lance reset_pricing_model sur cet opérateur.",

  // ─── game.signInToPlayTitle ───
  "game.signInToPlayTitle": "Connecte-toi avec ton identité Nostr pour obtenir un scénario de trade",

  // ─── game.signInToPlay ───
  "game.signInToPlay": "Se connecter pour jouer",

  // ─── game.deal ───
  "game.deal.another": "Un autre",
  "game.deal.challenge": "Relever le défi",
  "game.deal.watchTitle": "Revenir à l'écran de lecture du marché pour ton dernier scénario",
  "game.deal.preparing_one": "{{count}} scénario déjà en préparation. Regarder ›",
  "game.deal.preparing_other": "{{count}} scénarios déjà en préparation. Regarder ›",
  "game.deal.confirmPriced": "Un autre ? Chaque scénario est un péage distinct de {{price}} sats.",
  "game.deal.confirm": "Un autre ? Chaque scénario est un péage distinct.",
  "game.deal.yes": "Oui, un autre",
  "game.deal.notYet": "Pas encore",

  // ─── game.card ───
  "game.card.macro": "Toile de fond macro",
  "game.card.skewNote": "Note sur le skew",
  "game.card.catalyst": "Catalyseur",
  "game.card.keyLevels": "Niveaux clés",
  "game.card.constraints": "Contraintes",
  "game.card.question": "La question",
  "game.card.sources": "Sources",
  "game.card.spot": "Spot",
  "game.card.iv30": "IV 30 j",
  "game.card.ivRank": "IV Rank",
  "game.card.skew": "Skew · ",

  // ─── game.pitch ───
  "game.pitch.saveTitle": "Garder ce brouillon dans ton entrée de journal pour qu'il survive à un rechargement de la page",
  "game.pitch.save": "Enregistrer le brouillon",
  "game.pitch.discardTitle": "Abandonner ce scénario et en choisir un nouveau. Les frais du scénario ne sont pas remboursables, on te demandera donc de confirmer.",
  "game.pitch.discard": "Abandonner le scénario",
  "game.pitch.placeholder": "ex. Vendre le put spread 95/90 à 30 jours pour 1,20 de crédit, dimensionné pour risquer 0,5 % de l'actif net. Le maintien ferme de la Fed met un plancher sous le dollar, mais le titre est soutenu par des achats d'initiés ; encaisser de la prime sous la moyenne 200 jours paraît asymétrique…",
  "game.pitch.presentTitle": "Présenter ton trade au gérant senior pour évaluation et audit noté du pitch",
  "game.pitch.present": "Présenter le pitch",
  "game.pitch.saved": "✓ Brouillon enregistré à {{time}}",

  // ─── game.clue ───
  "game.clue.heading": "Demander un indice",
  "game.clue.hint": "Demande ce que tu veux, pour un petit prix. ex. <q>« Que veut dire skew des calls ? »</q>",
  "game.clue.copied": "Copié dans le presse-papiers",
  "game.clue.copyTitle": "Copier cette conversation d'indices dans ton presse-papiers, pour la poursuivre dans ta propre session Claude.ai",
  "game.clue.copy": "Copier la conversation",
  "game.clue.q": "Q · {{question}}",
  "game.clue.placeholder": "Tape ta question…",
  "game.clue.asking": "Question au bureau des indices…",
  "game.clue.sendTitle": "Envoyer cette question. Un petit prix d'indice s'applique.",
  "game.clue.send": "Envoyer la question",

  // ─── game.review ───
  "game.review.label": "Évaluation du pitch",
  "game.review.overall": "Global",
  "game.review.byDimension": "Par dimension",
  "game.review.right": "Ce que tu as bien fait",
  "game.review.sharpen": "Ce qu'il faut affûter",
  "game.review.alternative": "Une alternative que la maison aurait prise",
  "game.review.replayTitle": "Retour au choix du scénario",
  "game.review.replay": "🔁 Rejouer",

  // ─── game.ledger ───
  "game.ledger.label": "Registre DPYC",
  "game.ledger.title": "Solde en sats et usage des outils MCP",
  "game.ledger.intro": "Ton solde chez Optionality MCP, ce que les 30 derniers jours ont dépensé et acheté, et les outils où sont allés les sats.\nLes péages sont prélevés au moment de l'appel ; la comptabilité de l'opérateur est écrite dans Neon après chaque règlement.",
  "game.ledger.tools": "Usage des outils MCP : 30 derniers jours",
  "game.ledger.empty": "Aucun appel d'outil payant ces 30 derniers jours.",
  "game.ledger.health": "Santé du compte",

  // ─── game.ai ───
  "game.ai.refresh": "Actualiser l'usage de l'API",
  "game.ai.label": "Usage",
  "game.ai.title": "Usage de l'IA et son coût",
  "game.ai.intro": "Optionality appelle un modèle pour chaque scénario, indice et verdict.\nVoici ce que tes appels d'outils ont dépensé en jetons, et ce que le fournisseur a réellement facturé à l'opérateur.\nTon péage couvre cela plus les frais de l'opérateur.\nAucune marge cachée.",
  "game.ai.estimated": "Les montants marqués « est. » sont antérieurs au suivi du coût par appel et sont déduits des tarifs publiés (relevés le {{date}}) ; les autres sont ce que le fournisseur a facturé.",
  "game.ai.reported": "Les coûts sont les montants par appel du fournisseur lui-même, pas une estimation.",
  "game.ai.tallying": "Décompte des reçus",
  "game.ai.none": "Aucun appel de modèle enregistré pour l'instant. Accepte un défi.",
  "game.ai.unknown": "inconnu",
  "game.ai.runs": "Appels :",
  "game.ai.input": "Entrée :",
  "game.ai.output": "Sortie :",
  "game.ai.cost": "Coût :",
  "game.ai.costEst": "Coût (est.) :",
  "game.ai.perCall": "Par appel :",
  "game.ai.costPartEst": "Coût IA (en partie est.)",
  "game.ai.costBilled": "Coût IA facturé",
  "game.ai.tokens": "{{tokens}} jetons sur {{calls}} appels de modèle",
  "game.ai.costPerCall": "Coût par appel",
  "game.ai.averaged": "en moyenne sur chaque scénario, indice et verdict",
  "game.ai.sats": "Équivalent en sats",
  "game.ai.atRate": "à ~{{rate}}/BTC",
  "game.ai.footnote": "L'opérateur répercute le coût de l'IA sur les joueurs par des micropaiements Lightning.\nCette vue est la transparence brute : ce que chaque scénario, indice et verdict a réellement coûté, plus un équivalent en sats à un taux de référence fixe de {{rate}}/BTC.\nCe taux sert d'étalon de comparaison, pas de cours du jour.",

  // ─── game.lb ───
  "game.lb.label": "Classement",
  "game.lb.title": "Traders souverains, classés par talent",
  "game.lb.intro": "Le modèle de prix est l'unique réglage : un pitch difficile et cher bien noté passe devant un pitch bon marché bien noté.\nQuand l'opérateur réajuste un multiplicateur (seconde chance, souverain, n'importe lequel), le prochain recalcul du classement applique les nouveaux poids à chaque entrée, sans aucun instantané qui dérive.\nLe tri par défaut est la moyenne pondérée ; les notes brutes sont aussi disponibles.",
  "game.lb.sort.weighted_avg": "Moy. pondérée",
  "game.lb.sort.weighted_best": "Meilleure pondérée",
  "game.lb.sort.avg": "Moy. brute",
  "game.lb.sort.best": "Meilleure brute",
  "game.lb.sort.streak": "Série",
  "game.lb.sort.played": "Jouées",
  "game.lb.loading": "Chargement…",
  "game.lb.refresh": "Actualiser",
  "game.lb.failed": "Le classement n'a pas pu se charger. {{error}}",
  "game.lb.unknownError": "Erreur inconnue.",
  "game.lb.empty": "Aucun trade évalué pour l'instant. Sois le premier.",
  "game.lb.trader": "Trader",
  "game.lb.wavg": "Moy·P",
  "game.lb.wavgTitle": "Moyenne pondérée : note brute × multiplicateur de difficulté",
  "game.lb.wbest": "Meill·P",
  "game.lb.wbestTitle": "Meilleur pitch unique, pondéré",
  "game.lb.avg": "Moy",
  "game.lb.avgTitle": "Moyenne brute de tous les pitchs évalués",
  "game.lb.streak": "Série",
  "game.lb.played": "Jouées",
  "game.lb.rowTitle": "Clique pour voir les pitchs partagés par ce trader",
  "game.lb.dmSelf": "T'envoyer un DM : teste le chemin des relais",
  "game.lb.dm": "DM à {{name}}",
  "game.lb.anonymous": "Anonyme",
  "game.lb.you": "TOI",
  "game.lb.last": "  ·  dernier : {{date}}",
  "game.lb.fetching": "Récupération des pitchs partagés",
  "game.lb.youNone": "Tu n'as encore partagé aucun pitch. Ouvre une de tes entrées de journal évaluées et touche Partager.",
  "game.lb.theyNone": "Ce trader n'a encore partagé aucun pitch.",
  "game.lb.yourShared": "Tes pitchs partagés · {{count}}",
  "game.lb.shared": "Pitchs partagés · {{count}}",
  "game.lb.theirPitch": "Son pitch",
  "game.lb.houseAlt": "Alternative de la maison",

  // ─── game.journal ───
  "game.journal.label": "Journal",
  "game.journal.title": "Ta salle d'étude",
  "game.journal.intro": "Bienvenue dans ta salle d'étude.\nTu peux y revoir tes propositions passées, relire tes évaluations et reprendre les pitchs commencés que tu as dû mettre de côté.",
  "game.journal.introNamed": "Bienvenue dans ta salle d'étude, {{name}}.\nTu peux y revoir tes propositions passées, relire tes évaluations et reprendre les pitchs commencés que tu as dû mettre de côté.",

  // ─── game.prep ───
  "game.prep.heading": "Scénarios en préparation · {{count}}",
  "game.prep.rowTitle": "Revenir à l'écran de lecture du marché pour ce scénario",
  "game.prep.watch": "Regarder ›",
  "game.prep.note": "La Firme les compose en arrière-plan, tu peux donc partir et revenir.\nQuand l'un est prêt, il quitte cette liste et apparaît plus bas comme une entrée ouverte à réclamer.",

  // ─── game.journal ───
  "game.journal.pulling": "Récupération des séances",
  "game.journal.emptyPreparing": "Aucune séance terminée pour l'instant. Ton scénario est toujours en préparation ci-dessus.",
  "game.journal.empty": "Aucune séance pour l'instant. Lance ton premier scénario de trade.",
  "game.journal.groupBy": "Grouper par",
  "game.journal.flipGroups": "Inverser l'ordre des groupes",
  "game.journal.groupsAsc": "Groupes ▲",
  "game.journal.groupsDesc": "Groupes ▼",
  "game.journal.sortBy": "Trier par",
  "game.journal.flipSort": "Inverser le sens du tri",
  "game.journal.sortedAsc": "Tri croissant. Passer en décroissant.",
  "game.journal.sortedDesc": "Tri décroissant. Passer en croissant.",
  "game.journal.asc": "▲ Croiss.",
  "game.journal.desc": "▼ Décroiss.",
  "game.journal.sessions_one": "{{count}} séance",
  "game.journal.sessions_other": "{{count}} séances",
  "game.journal.avg": " · moy. {{score}}",

  // ─── game.status ───
  "game.status.open": "ouvert",
  "game.status.evaluated": "évalué",

  // ─── game.journal ───
  "game.journal.sharedTag": "· partagé",
  "game.journal.deleteTitle": "Supprimer définitivement cette séance",
  "game.journal.delete": "Supprimer la séance",
  "game.journal.loadingEntry": "Chargement de l'entrée",

  // ─── game.discard ───
  "game.discard.title": "Abandonner ce scénario ?",
  "game.discard.body": "Abandonner te permet de choisir un nouveau scénario.\nChaque scénario utilise un traitement LLM externe payant, les frais de celui-ci ne peuvent donc pas être remboursés.\nVeux-tu vraiment laisser tomber ce scénario et en choisir un autre ?",
  "game.discard.keep": "Garder ce scénario",
  "game.discard.confirm": "Abandonner et en choisir un autre",

  // ─── game.delete ───
  "game.delete.title": "Supprimer définitivement cette séance ?",
  "game.delete.body": "Tu es sur le point de supprimer définitivement ta séance <b>{{ticker}}</b>.\nLe scénario, ton pitch, l'évaluation, la note et toute position au classement qu'elle t'a valu sont <b>effacés pour de bon</b>.\nC'est irréversible, et rien ne pourra être récupéré plus tard.",
  "game.delete.bodyGraded": "Tu es sur le point de supprimer définitivement ta séance <b>{{ticker}}</b> (notée {{grade}}).\nLe scénario, ton pitch, l'évaluation, la note et toute position au classement qu'elle t'a valu sont <b>effacés pour de bon</b>.\nC'est irréversible, et rien ne pourra être récupéré plus tard.",
  "game.delete.this": "cette",
  "game.delete.keep": "La garder",
  "game.delete.deleting": "Suppression…",
  "game.delete.confirm": "Supprimer pour toujours",

  // ─── game.zoom ───
  "game.zoom.copyTitle": "Copier ce texte dans ton presse-papiers",
  "game.zoom.copy": "Copier le texte",
  "game.zoom.closeTitle": "Fermer (Échap)",
  "game.zoom.close": "Fermer",

  // ─── game.status ───
  "game.status.submitted": "soumis",
  "game.status.abandoned": "abandonné",

  // ─── app.lapsed ───
  "app.lapsed": "Ta connexion a expiré pendant ton absence. Reconnecte-toi pour continuer.",

  // ─── signIn.welcome ───
  "signIn.welcome": "Un entraîneur agentique au trading d'options. La Firme compose l'opportunité, tu rédiges le pitch, un juge note ta discipline.",

  // ─── signIn.nsecHint ───
  "signIn.nsecHint": "Tu te connectes avec une nsec ? Elle reste dans ce navigateur pour signer chaque appel.\nOptionality en garde aussi une copie chiffrée pour pouvoir signer tes DM.\nRetire-la quand tu veux depuis Profil.\nPour une identité que tu gardes sous ta propre garde, connecte-toi plutôt avec ta npub.",

  // ─── signIn.or ───
  "signIn.or": "ou",

  // ─── signIn.guest ───
  "signIn.guest": "Continuer en invité",

  // ─── signIn.guestHint ───
  "signIn.guestHint": "Les invités peuvent parcourir le sélecteur, le briefing et l'évaluation d'exemple.",

  // ─── signIn.footnote ───
  "signIn.footnote": "Optionality™ est un jeu agentique de trading d'options bâti sur <link>Tollbooth-DPYC™</link> : micropaiements Bitcoin Lightning et identité Nostr pour les agents IA.",

  // ─── welcome.guestName ───
  "welcome.guestName": "Invité {{id}}",

  // ─── welcome.anonymous ───
  "welcome.anonymous": "Visiteur anonyme",

  // ─── welcome.label ───
  "welcome.label": "Bienvenue",

  // ─── welcome.greeting ───
  "welcome.greeting": "Bienvenue, <name>{{name}}</name>.",

  // ─── welcome.signedInAs ───
  "welcome.signedInAs": " Connecté en tant que <npub>{{npub}}</npub>.",

  // ─── welcome.why ───
  "welcome.why": "Pourquoi Optionality.",

  // ─── welcome.why1 ───
  "welcome.why1": "Optionality™ est un apprentissage ludique, fondé sur des scénarios, pour celles et ceux qui veulent devenir des traders d'options aguerris.\nIl reste en dehors du programme habituel de mathématiques de pricing et de mécanique des plateformes.\nIl t'engage dans des récits qui demandent un trade clair et exécutable, et le raisonnement qui le justifie.",

  // ─── welcome.why2 ───
  "welcome.why2": "Le jargon t'est étranger et tu bafouilles quand on te demande de décrire ta stratégie et tes idées de trade du moment.\nTu veux voir la situation mondiale dans son ensemble et formuler des propositions de trade solides sous pression.\nMais tes idées sont floues, tu cours après les gros gains et tu ne sais pas dire, avant une situation, ce que tu y ferais.\nOptionality™ t'aide à apprendre des stratégies saines, à intégrer l'actualité mondiale et à mieux décrire tes stratégies.",

  // ─── welcome.why3 ───
  "welcome.why3": "Optionality™ joue le rôle de ta Firme, ta maison d'investissement.\nElle utilise des services d'IA modernes pour te présenter des scénarios mondiaux simulés et exigeants, qui te laissent le temps de réfléchir puis de présenter ton trade.\nLes auditeurs de la Firme notent ta proposition sur le choix de structure, les strikes et l'échéance, le rapport risque/rendement, l'intégration macro et le risque de queue.\nCe retour t'aide à améliorer tes propositions narratives.\nAvec le temps, tu deviens capable de concevoir, présenter et exécuter des trades plus sages, vite et bien.",

  // ─── welcome.play ───
  "welcome.play.label": "Le jeu",
  "welcome.play.round": "Une manche",
  "welcome.play.1": "<b>Relève le défi.</b> Choisis une historicité (historique, fiction ou en direct), un persona (apprenti → souverain) et, si tu veux, une enveloppe de perte maximale. Le péage grandit avec la difficulté de ta sélection.",
  "welcome.play.2": "<b>Lis le scénario.</b> Actif, spot, IV, skew, niveaux clés, catalyseur, contraintes de ton portefeuille, et quelques fausses pistes glissées dedans pour voir si tu distingues le bruit de ce qui compte vraiment.",
  "welcome.play.3": "<b>Présente le trade.</b> Texte libre. Donne la structure, les strikes, l'échéance, la taille et ton raisonnement.",
  "welcome.play.4": "<b>Lis l'évaluation.</b> Classement en une phrase, note sur cinq dimensions, registre des faits intégrés, le trade alternatif que la maison aurait pris, graphique du profil de risque et contexte approfondi.",
  "welcome.play.5": "<b>Rejoue un scénario passé</b> depuis ton Journal quand tu veux le revoir. Même mise en place, nouveau pitch, journalisé à part.",

  // ─── welcome.toll ───
  "welcome.toll": "Le péage",
  "welcome.toll.fair": "Optionality™ applique une tarification juste, à l'usage.\nSi tu ne l'utilises pas, tu ne paies rien : pas d'abonnement et pas de KYC.\nLe prix suit ce que chaque scénario coûte réellement à composer et à noter.\nLes plus simples consomment moins de jetons LLM ; les plus exigeants, comme le marché en direct avec recherche web ou la difficulté souverain, en consomment plus.\nMême le scénario le plus complexe ne coûte que quelques centaines de sats.",
  "welcome.toll.inspect": "L'opérateur fixe chaque multiplicateur directement, et tu peux les consulter toi-même dans l'onglet <b>Usage</b> dès que tu as un solde.\nEn ce moment, tirés du modèle de prix en direct :",
  "welcome.toll.cheap": "Scénario le plus simple (fiction × apprenti) : <b>{{price}}</b>",
  "welcome.toll.expensive": "Scénario le plus exigeant (marché en direct × souverain avec recherche web complète) : <b>{{price}}</b>",
  "welcome.toll.pitch": "Audit du pitch : <b>{{price}}</b>",
  "welcome.toll.session": "Une séance d'environ 30 manches notées en difficulté moyenne coûte à peu près {{sats}} sats, soit environ {{usd}} en BTC.\nRecharger achète des sats avec une facture Lightning ; Wallet of Satoshi, Phoenix, Mutiny ou tout portefeuille Lightning convient.",
  "welcome.toll.fallback": "Optionality™ applique une tarification juste, à l'usage : si tu ne l'utilises pas, tu ne paies rien.\nLa difficulté et le mode font varier le péage ; tu peux consulter chaque multiplicateur dans l'onglet <b>Usage</b> dès que tu as un solde.\nRecharger achète des sats avec une facture Lightning ; Wallet of Satoshi, Phoenix, Mutiny ou tout portefeuille Lightning convient.",
  "welcome.toll.unreachable": "(Impossible de joindre le modèle de prix pour le moment et d'annoncer des chiffres précis.)",

  // ─── welcome.economy ───
  "welcome.economy.label": "L'économie",
  "welcome.economy.title": "Optionality fonctionne sur Tollbooth-DPYC™",
  "welcome.economy.intro": "Optionality est un jeu agentique de trading d'options bâti sur <dpyc>Tollbooth-DPYC™ →</dpyc>, une pile Bitcoin Lightning + Nostr pour les services d'IA monétisés.\nLa gouvernance, les opérateurs certifiés et le registre communautaire sont publics sur <community>github.com/lonniev/dpyc-community →</community>.\nTrois propriétés méritent d'être nommées :",
  "welcome.economy.identity": "<b>Identité souveraine.</b> Tu te connectes avec une paire de clés Nostr, pas avec un e-mail et un mot de passe.\nTa nsec est ton seul identifiant : pas de KYC, pas de compte délivré par une plateforme.\nOptionality n'en garde une copie chiffrée que si tu le demandes (Profil → Clé de persona de jeu), et tu peux la retirer quand tu veux.",
  "welcome.economy.pricing": "<b>Prix dynamiques sans redéploiement.</b> Les prix des outils de l'opérateur sont stockés dans un modèle de prix, pas dans le code.\nLes multiplicateurs de difficulté et de mode s'ajustent en direct, et tu peux les vérifier toi-même dans l'onglet Usage.\nLe classement utilise le même mécanisme pour pondérer les notes.",
  "welcome.economy.money": "<b>Monnaie saine.</b> Les micropaiements sur les rails fiat sont économiquement morts : les seuls frais d'interchange dépassent un péage de 1 sat.\nBitcoin Lightning rend trivial le péage de chaque appel d'outil IA.\nDes soldes Lightning prépayés, un règlement atomique à chaque appel et aucun dépositaire qui détient tes dépenses hors chaîne : voilà ce qui fait fonctionner des services comme Optionality.",

  // ─── welcome.ready ───
  "welcome.ready": "Prêt ?",
  "welcome.ready.guest": "Jette un œil : l'onglet <b>Voir une évaluation</b> montre une manche notée complète, pour voir ce que le jeu propose avant de t'inscrire.\nQuand tu veux commencer à présenter des trades pour de vrai, connecte-toi avec une identité Nostr.",
  "welcome.ready.guestPriced": "Jette un œil : l'onglet <b>Voir une évaluation</b> montre une manche notée complète, pour voir ce que le jeu propose avant de t'inscrire.\nQuand tu veux commencer à présenter des trades pour de vrai, connecte-toi avec une identité Nostr et recharge environ {{usd}} en BTC.",
  "welcome.ready.patron": "Jette un œil : l'onglet <b>Voir une évaluation</b> montre une manche notée complète, pour voir ce que le jeu propose avant de mettre des sats sur la table.\nQuand tu veux commencer à présenter des trades pour de vrai :",

  // ─── welcome.seeAssessment ───
  "welcome.seeAssessment": "Voir une évaluation",

  // ─── welcome.signInToPlay ───
  "welcome.signInToPlay": "Se connecter pour jouer",

  // ─── welcome.topUpPriced ───
  "welcome.topUpPriced": "Recharger : ~{{usd}} pour commencer",

  // ─── welcome.topUp ───
  "welcome.topUp": "Recharger",

  // ─── profile.label ───
  "profile.label": "Profil",

  // ─── profile.title ───
  "profile.title": "Ton identité souveraine.",

  // ─── profile.intro ───
  "profile.intro": "Ton profil vit dans tes métadonnées Nostr kind-0, lues sur les relais et affichées dans chaque client Nostr.\nLes modifications sont signées dans ton navigateur puis relayées ; ta clé ne quitte jamais cet appareil.",

  // ─── profile.tz ───
  "profile.tz.label": "Fuseau horaire",
  "profile.tz.title": "Toutes les horloges, un seul fuseau.",
  "profile.tz.intro": "Chaque date sur Optionality suit ce fuseau. Il reste local à ce navigateur ; rien ici n'est publié ni partagé.",

  // ─── profile.theme ───
  "profile.theme.label": "Préférences",
  "profile.theme.title": "L'apparence d'Optionality pour toi.",
  "profile.theme.intro": "Local à ce navigateur ; rien ici n'est publié ni partagé.",
  "profile.theme.dark": "🌑 Sombre",
  "profile.theme.light": "☀ Clair",

  // ─── profile.language ───
  "profile.language.label": "Langue",
  "profile.language.title": "Les mots de ces pages.",
  "profile.language.intro": "Gardée dans ce navigateur. Les scénarios, indices et évaluations de la Firme restent en anglais.",

  // ─── profile.build ───
  "profile.build.label": "Version et licence",
  "profile.build.title": "Code ouvert, commerce privé.",
  "profile.build.intro": "Optionality et Tollbooth-DPYC™ sont publiés en open source sous la licence Apache 2.0 : chacun peut lire le code, le forker et faire tourner son propre opérateur.\nLes <i>services</i> hébergés sur ce code relèvent du commerce privé : chaque opérateur fixe ses péages et son modèle de prix, et les clients prépaient un solde Lightning et paient à chaque appel.\nLe protocole est partagé ; les entreprises qui l'utilisent ne le sont pas.",

  // ─── profile.key ───
  "profile.key.notNsec": "Cela ne ressemble pas à une chaîne bech32 nsec1….",
  "profile.key.depositFailed": "Le dépôt a échoué.",
  "profile.key.ackMismatch": "La phrase de confirmation ne correspond pas exactement.",
  "profile.key.withdrawFailed": "Le retrait a échoué.",
  "profile.key.label": "Clé de persona de jeu",
  "profile.key.title": "Garde de la nsec",
  "profile.key.intro": "Si tu as créé ta npub exprès pour Optionality, tu peux confier la nsec à l'opérateur pour que le serveur signe tes DM Nostr à ta place, sans extension de signature (pratique sur iPad).\nLa nsec est chiffrée au repos en AES-256-GCM.\n<b>Ne colle pas ici ta vraie identité Nostr</b>, seulement des personas de jeu tout neufs.",
  "profile.key.deposit": "Déposer une nsec",
  "profile.key.encrypting": "Chiffrement…",
  "profile.key.depositBtn": "Déposer",
  "profile.key.held": "✓ Détenue par Optionality (chiffrée dans le coffre). Les DM aux autres joueurs passent par le signataire du serveur, sans extension de navigateur.",
  "profile.key.withdraw": "Retirer et garder moi-même",
  "profile.key.ackIntro": "Tape exactement la phrase ci-dessous pour confirmer.\nLa nsec s'affiche une seule fois pour que tu la copies, puis Optionality l'oublie.\nAprès le retrait, il te faudra une extension de signature Nostr (Alby, nos2x) pour envoyer des DM.\nLa phrase reste en anglais : le serveur la vérifie mot pour mot.",
  "profile.key.ack": "Confirmation",
  "profile.key.cancel": "Annuler",
  "profile.key.withdrawing": "Retrait…",
  "profile.key.confirm": "Confirmer le retrait",
  "profile.key.copyNow": "<b>Copie ta nsec maintenant.</b> Optionality l'a supprimée de son coffre.\nC'est la seule fois qu'elle s'affiche.\nRange-la dans un client Nostr (0xchat, Damus, Amber) ou un gestionnaire de mots de passe.",
  "profile.key.copy": "Copier",
  "profile.key.saved": "Je l'ai enregistrée",

  // ─── clock.left ───
  "clock.left": "encore ~{{clock}}",

  // ─── clock.wrapping ───
  "clock.wrapping": "finalisation…",

  // ─── deal.preparing ───
  "deal.preparing": "La Firme prépare ta mission",

  // ─── deal.elapsed ───
  "deal.elapsed": "Écoulé",

  // ─── deal.estimate ───
  "deal.estimate": "Estimation",

  // ─── deal.claim ───
  "deal.claim": "Ticket",

  // ─── deal.reassure ───
  "deal.reassure": "Prends ton temps : tu peux quitter cette page.\nTa mission arrive dans ton <b>Journal</b> quand elle est prête, et reprend exactement où elle en était si ta connexion tombe.",

  // ─── deal.claimInJournal ───
  "deal.claimInJournal": "Récupérer dans le Journal",

  // ─── deal.live ───
  "deal.live": "Le mode en direct cherche sur le web, cela peut donc prendre quelques minutes.",

  // ─── lib.quotes ───
  "lib.quotes.0": "Une monnaie saine est un instrument de protection des libertés civiles contre les empiètements despotiques des gouvernements.",
  "lib.quotes.1": "La curieuse tâche de l'économie est de montrer aux hommes combien ils savent peu de ce qu'ils s'imaginent pouvoir concevoir.",
  "lib.quotes.2": "Le problème de fond de la monnaie conventionnelle, c'est toute la confiance qu'il faut pour la faire fonctionner.",
  "lib.quotes.3": "Je ne crois pas que nous aurons de nouveau une bonne monnaie avant de l'avoir retirée des mains de l'État.",
  "lib.quotes.4": "L'inflation est un impôt sans loi.",

  // ─── judge.title ───
  "judge.title": "Évaluation de ton pitch",

  // ─── judge.sub ───
  "judge.sub": "Six dimensions de la proposition à peser",

  // ─── judge.dim ───
  "judge.dim.tail": "Risque de queue",

  // ─── ledger.title ───
  "ledger.title": "Registre des faits",

  // ─── ledger.integrated ───
  "ledger.integrated": "Faits que tu as intégrés",

  // ─── ledger.integratedNone ───
  "ledger.integratedNone": "Aucun. Essaie de citer directement les faits pertinents.",

  // ─── ledger.missed ───
  "ledger.missed": "Faits pertinents que tu as manqués",

  // ─── ledger.missedNone ───
  "ledger.missedNone": "Sans faute : tu as traité les faits qui comptaient.",

  // ─── ledger.caught ───
  "ledger.caught": "Fausses pistes que tu as écartées",

  // ─── ledger.caughtNone ───
  "ledger.caughtNone": "Aucune relevée.",

  // ─── ledger.followed ───
  "ledger.followed": "Fausses pistes qui ont tiré ta thèse",

  // ─── ledger.followedNone ───
  "ledger.followedNone": "Aucune. Tu as gardé le bruit hors de ta thèse.",

  // ─── legs.side ───
  "legs.side": "Sens",

  // ─── legs.type ───
  "legs.type": "Type",

  // ─── legs.strike ───
  "legs.strike": "Strike",

  // ─── legs.dte ───
  "legs.dte": "JRE",

  // ─── legs.premium ───
  "legs.premium": "Prime",

  // ─── legs.qty ───
  "legs.qty": "Qté",

  // ─── legs.long ───
  "legs.long": "long",

  // ─── legs.short ───
  "legs.short": "court",

  // ─── legs.call ───
  "legs.call": "call",

  // ─── legs.put ───
  "legs.put": "put",

  // ─── legs.days ───
  "legs.days": "{{days}} j",

  // ─── risk.noLegs ───
  "risk.noLegs": "Aucune jambe de trade structurée n'a été lue, le graphique n'est donc pas disponible. Les positions nues en actions ou obligations et les trades illisibles n'ont pas de graphique.",

  // ─── risk.days ───
  "risk.days": "Jours dans le trade : {{days}} j",

  // ─── risk.entry ───
  "risk.entry": "(entrée)",

  // ─── risk.expiration ───
  "risk.expiration": "(échéance)",

  // ─── risk.overlay ───
  "risk.overlay": "Superposer le trade alternatif",

  // ─── risk.maxProfit ───
  "risk.maxProfit": "Gain max.",

  // ─── risk.maxLoss ───
  "risk.maxLoss": "Perte max.",

  // ─── risk.unlimited ───
  "risk.unlimited": "Illimité",

  // ─── risk.breakeven_one ───
  "risk.breakeven_one": "Point mort",
  "risk.breakeven_other": "Points morts",

  // ─── risk.breakeven_other ───

  // ─── risk.iv ───
  "risk.iv": "IV utilisée",

  // ─── risk.r ───
  "risk.r": "r supposé",

  // ─── risk.footnote ───
  "risk.footnote": "Black-Scholes sans dividendes.\nLe taux sans risque est fixé à 4,5 %.\nLa vol est maintenue à l'IV du scénario ; les effets réels de vol de la vol ne sont pas modélisés.\nQuantité par jambe telle que lue, avec un multiplicateur de 100 actions.",

  // ─── risk.parsed ───
  "risk.parsed": "Jambes lues",

  // ─── risk.yours ───
  "risk.yours": "Ton trade",

  // ─── risk.alt ───
  "risk.alt": "Trade alternatif",

  // ─── chain.triggerTitle ───
  "chain.triggerTitle": "Afficher la chaîne d'options complète : touche un mid pour acheter, vendre ou retirer",

  // ─── chain.title ───
  "chain.title": "Chaîne d'options",

  // ─── chain.legs_one ───
  "chain.legs_one": "{{count}} jambe",
  "chain.legs_other": "{{count}} jambes",

  // ─── chain.legs_other ───

  // ─── chain.close ───
  "chain.close": "Fermer la chaîne",

  // ─── chain.lede ───
  "chain.lede": "Touche un mid <b>Call</b> ou <b>Put</b> pour acheter, vendre ou retirer un contrat.\nLes mids et deltas de la chaîne viennent d'un smile Black-Scholes ancré sur les volatilités ATM, put 25Δ et call 25Δ.\nLa colonne IV lit le smile à chaque strike : la même IV valorise le call et le put à ce strike, car le smile est une seule courbe, pas deux.\nLa ligne la plus proche du spot (<b>{{spot}}</b>) est surlignée comme ATM.",

  // ─── chain.dte ───
  "chain.dte": "{{dte}} JRE",

  // ─── chain.calls ───
  "chain.calls": "Calls",

  // ─── chain.strikeIv ───
  "chain.strikeIv": "Strike · IV",

  // ─── chain.puts ───
  "chain.puts": "Puts",

  // ─── chain.mid ───
  "chain.mid": "Mid",

  // ─── chain.strike ───
  "chain.strike": "Strike",

  // ─── chain.held ───
  "chain.held": "{{side}} · clique pour changer",

  // ─── chain.long ───
  "chain.long": "LONG",

  // ─── chain.short ───
  "chain.short": "COURT",

  // ─── chain.tapCall ───
  "chain.tapCall": "Clique pour acheter ou vendre ce call",

  // ─── chain.tapPut ───
  "chain.tapPut": "Clique pour acheter ou vendre ce put",

  // ─── chain.proposed ───
  "chain.proposed": "Structure proposée",

  // ─── chain.clearTitle ───
  "chain.clearTitle": "Effacer toutes les jambes",

  // ─── chain.clear ───
  "chain.clear": "Effacer",

  // ─── chain.noLegs ───
  "chain.noLegs": "Pas encore de jambes. Touche un mid Call ou Put ci-dessus pour commencer.",

  // ─── chain.buyCaps ───
  "chain.buyCaps": "ACHAT",

  // ─── chain.sellCaps ───
  "chain.sellCaps": "VENTE",

  // ─── chain.fewer ───
  "chain.fewer": "Réduire les contrats",

  // ─── chain.useRemove ───
  "chain.useRemove": "Utilise Retirer pour enlever cette jambe",

  // ─── chain.oneFewer ───
  "chain.oneFewer": "Un contrat de moins",

  // ─── chain.qty ───
  "chain.qty": "Nombre de contrats",

  // ─── chain.more ───
  "chain.more": "Augmenter les contrats",

  // ─── chain.oneMore ───
  "chain.oneMore": "Un contrat de plus",

  // ─── chain.net ───
  "chain.net": "Prime nette",

  // ─── chain.credit ───
  "chain.credit": "crédit",

  // ─── chain.debit ───
  "chain.debit": "débit",

  // ─── chain.buy ───
  "chain.buy": "Acheter",

  // ─── chain.sell ───
  "chain.sell": "Vendre",

  // ─── chain.remove ───
  "chain.remove": "Retirer",

  // ─── chain.cancel ───
  "chain.cancel": "Annuler",

  // ─── modeler.fiction ───
  "modeler.fiction": "Sous-jacent fictif : les modélisateurs externes ne cotent que de vraies chaînes listées, ce gain est donc celui d'Optionality.",

  // ─── modeler.historical ───
  "modeler.historical": "Ce scénario se passe dans le passé. Les modélisateurs externes cotent la chaîne d'aujourd'hui, pas celle de la date du scénario, ce gain est donc la reconstruction d'Optionality.",

  // ─── modeler.noPreset ───
  "modeler.noPreset": "Les modélisateurs externes n'ont pas de modèle pour cette structure ; le gain ci-dessus la couvre déjà.",

  // ─── payoff.captionMulti ───
  "payoff.captionMulti": "Profil à l'échéance la plus proche · {{dte}} JRE · jambes lointaines valorisées par Black-Scholes",

  // ─── payoff.caption ───
  "payoff.caption": "Profil à l'échéance · {{dte}} JRE",

  // ─── payoff.credit ───
  "payoff.credit": "crédit {{amount}}",

  // ─── payoff.debit ───
  "payoff.debit": "débit {{amount}}",

  // ─── payoff.netEntry ───
  "payoff.netEntry": "Entrée nette",

  // ─── payoff.received ───
  "payoff.received": "crédit reçu",

  // ─── payoff.paid ───
  "payoff.paid": "débit payé",

  // ─── payoff.rr ───
  "payoff.rr": "Rendement : risque",

  // ─── payoff.undefined ───
  "payoff.undefined": "indéfini",

  // ─── payoff.breakeven ───
  "payoff.breakeven": "Point mort",

  // ─── payoff.verifyTitle ───
  "payoff.verifyTitle": "Ouvrir ce {{structure}} sur {{provider}} pour les Grecques, l'IV et la probabilité en direct",

  // ─── payoff.verify ───
  "payoff.verify": "Vérifier sur {{provider}} ↗",

  // ─── payoff.verifyNote ───
  "payoff.verifyNote": "Grecques · IV · probabilité en direct, sur la vraie chaîne",

  // ─── payoff.ticket ───
  "payoff.ticket": "Ticket d'ordre",

  // ─── payoff.copyTitle ───
  "payoff.copyTitle": "Copier ce ticket façon courtier dans ton presse-papiers",

  // ─── payoff.copied ───
  "payoff.copied": "copié ✓",

  // ─── payoff.copy ───
  "payoff.copy": "copier",

  // ─── payoff.try ───
  "payoff.try": "Essayer une structure d'exemple",

  // ─── payoff.tryHint ───
  "payoff.tryHint": " · exemples à étudier, pas à soumettre",

  // ─── payoff.presetsCaption ───
  "payoff.presetsCaption": "Exemples à étudier, pas à soumettre. Les primes viennent de la vraie chaîne : les mêmes chiffres que si tu touchais ces strikes toi-même.",

  // ─── presets.0 ───
  "presets.0": "Put OTM vendu + put plus bas acheté. Spread de crédit haussier.",

  // ─── presets.1 ───
  "presets.1": "Call OTM vendu + call plus haut acheté. Spread de crédit baissier.",

  // ─── presets.2 ───
  "presets.2": "Les deux ailes vendues, les deux ailes achetées plus loin. Fourchette large.",

  // ─── presets.3 ───
  "presets.3": "Straddle ATM vendu + ailes OTM lointaines achetées. Pari sur un cours épinglé.",

  // ─── presets.4 ───
  "presets.4": "Call ATM acheté + put ATM acheté. Pari sur la vol avant un événement.",

  // ─── presets.5 ───
  "presets.5": "Call OTM vendu + put OTM vendu. Encaissement de prime sur une fourchette.",

  // ─── presets.6 ───
  "presets.6": "Call ATM proche vendu + call lointain acheté au même strike.",

  // ─── presets.7 ───
  "presets.7": "Put ATM proche vendu + put lointain acheté au même strike.",

  // ─── presets.8 ───
  "presets.8": "Call lointain très ITM acheté + call proche OTM vendu.",

  // ─── payoff.replaceTitle ───
  "payoff.replaceTitle": "Remplacer les jambes actuelles ?",

  // ─── payoff.replaceBody_one ───
  "payoff.replaceBody_one": "Charger <b>{{preset}}</b> remplace ta {{count}} jambe actuelle par la structure du modèle, avec des primes tirées de la chaîne en direct.",
  "payoff.replaceBody_other": "Charger <b>{{preset}}</b> remplace tes {{count}} jambes actuelles par la structure du modèle, avec des primes tirées de la chaîne en direct.",

  // ─── payoff.replaceBody_other ───

  // ─── payoff.keep ───
  "payoff.keep": "Garder mes jambes",

  // ─── payoff.replace ───
  "payoff.replace": "Remplacer par {{preset}}",

  // ─── skew.level ───
  "skew.level.none": "Ce scénario ne fournit pas d'IV Rank, alors juge le niveau d'après l'IV ATM ({{iv}} %) et ton propre sens de ce qui est élevé pour {{ticker}}.",
  "skew.level.rich": "IV Rank {{rank}} : la prime est riche (chère) par rapport à la fourchette récente de {{ticker}}.\nC'est un feu vert pour le vendeur : les options sont bien payées sur toute la ligne en ce moment.\nLe skew te dit ensuite quel strike vendre.",
  "skew.level.mid": "IV Rank {{rank}} : la prime est moyenne, ni une aubaine ni une disette.\nAppuie-toi sur les catalyseurs du scénario et laisse le skew décider où se trouve la valeur relative.",
  "skew.level.cheap": "IV Rank {{rank}} : la prime est bon marché par rapport à la fourchette de {{ticker}}.\nMaigre récompense pour les vendeurs ; toute la courbe est basse, alors sois plus sélectif même là où le skew paraît tentant.",

  // ─── skew.verdict ───
  "skew.verdict.flat": "Ce scénario ne fournit pas d'ancres de smile 25Δ, la courbe est donc une IV plate à {{iv}} % ATM : le niveau seul, pas la forme.\nLis la skew_note du scénario pour l'histoire du régime.",
  "skew.verdict.smirkWide": "Smirk inversé (demande de puts).\nLe put que tu achètes ({{long}}) est nettement plus riche en vol que celui que tu vends ({{short}}) : le skew grignote ton crédit, mais l'aile paie pour la peur.\nVends sous la partie la plus raide pour un vrai coussin.",
  "skew.verdict.smirkNarrow": "Smirk inversé (demande de puts).\nPrès du spot, le skew est doux ; les deux jambes portent une vol similaire, le crédit est donc net.\nMais tu es plus près de la monnaie, le coussin est donc plus mince.\nLe compromis classique.",
  "skew.verdict.forward": "Skew direct : ici, c'est l'aile des calls qui est riche.\nPour un put spread sur {{ticker}}, c'est favorable, car les puts que tu traites sont du côté le moins cher et le plus plat.\nLe danger que cette courbe valorise est un pic à la hausse, pas un effondrement.",
  "skew.verdict.symmetric": "À peu près symétrique : les deux ailes portent une IV similaire.\nL'ATM n'est ni une vallée profonde ni fortement penchée, alors lis-la pour le positionnement du spot ou de l'événement plutôt que de compter sur le skew pour payer une aile.",

  // ─── skew.trigger ───
  "skew.trigger": "Guide du skew",

  // ─── skew.close ───
  "skew.close": "Fermer le guide",

  // ─── skew.title ───
  "skew.title": "Guide du skew",

  // ─── skew.lede ───
  "skew.lede": "La volatilité implicite n'est pas un seul nombre : c'est une <em>courbe</em> à travers les strikes, une carte de l'endroit où le marché paie cher sa peur.\nPour un vendeur de prime, elle montre où l'assurance est la plus <em>riche</em>, et dans tout ce guide <b>riche veut dire chère</b> (une prime élevée) : bon à <em>vendre</em>, mauvais à acheter.\nCela ne veut jamais dire que le détenteur de l'option s'enrichit.",
  "skew.lede.smile": "La courbe ci-dessous est le smile <em>littéral</em> que ce scénario valorise, ancré sur <b>{{who}}</b> au spot <b>{{spot}}</b>, IV ATM à 30 jours <b>{{iv}} %</b>, IV du put 25Δ <b>{{put}} %</b> et IV du call 25Δ <b>{{call}} %</b>.\nC'est le même smile dont la chaîne d'options tire le prix de chaque strike.",
  "skew.lede.flat": "Ce scénario a été tiré avant la saisie des ancres de smile structurées, la courbe ci-dessous montre donc une IV plate à <b>{{iv}} %</b> sur tous les strikes : <em>le niveau seul, sans forme</em>.\nLis la skew_note du scénario pour l'histoire du régime.",

  // ─── skew.aria ───
  "skew.aria": "Courbe de skew de volatilité implicite pour {{ticker}}",

  // ─── skew.put25 ───
  "skew.put25": "put 25Δ",

  // ─── skew.call25 ───
  "skew.call25": "call 25Δ",

  // ─── skew.chip ───
  "skew.chip": "25Δ {{value}} pts",

  // ─── skew.leg ───
  "skew.leg.long": "achat {{strike}}",
  "skew.leg.short": "vente {{strike}}",

  // ─── skew.axis ───
  "skew.axis.spot": "SPOT",
  "skew.axis.strike": "STRIKE",
  "skew.axis.iv": "VOLATILITÉ IMPLICITE",

  // ─── skew.legend ───
  "skew.legend.curve": "courbe d'IV",
  "skew.legend.short": "put vendu",
  "skew.legend.long": "put acheté",
  "skew.legend.wings": "ailes 25Δ (skew)",
  "skew.legend.spot": "spot ≈ {{spot}}",

  // ─── skew.slider ───
  "skew.slider": "Strike vendu (le put que tu vends) : fais-le glisser le long de la courbe",

  // ─── skew.wide ───
  "skew.wide": "{{width}} de large",

  // ─── skew.read ───
  "skew.read.shortIv": "IV du put vendu",
  "skew.read.longIv": "IV du put acheté",
  "skew.read.gap": "Écart de skew (d'une jambe à l'autre)",
  "skew.read.fear": "Skew 25Δ (jauge de peur)",

  // ─── skew.pts ───
  "skew.pts": "{{value}} pts",

  // ─── skew.card ───
  "skew.card.reverse.tag": "Actions et indices : le cas par défaut",
  "skew.card.reverse.title": "Skew inversé (smirk)",
  "skew.card.reverse.body": "L'IV monte quand les strikes baissent. <put>Les puts OTM sont les options les plus chères du tableau.</put>\nLe marché est en permanence demandeur de protection contre le krach : la demande de couverture fait monter l'IV à la baisse.\nC'est le monde où vivent les bull put spreads.",
  "skew.card.smile.tag": "Changes, titres isolés, avant un événement",
  "skew.card.smile.title": "Smile de volatilité",
  "skew.card.smile.body": "Les deux ailes montent ; l'ATM est la vallée bon marché.\nLe marché craint un <em>gros mouvement dans un sens ou l'autre</em> sans pencher nettement.\nC'est classique avant les événements binaires (résultats, FOMC, publication du CPI) où le risque de gap est des deux côtés.",
  "skew.card.forward.tag": "Matières premières : pétrole, gaz, céréales",
  "skew.card.forward.title": "Skew direct",
  "skew.card.forward.body": "L'IV monte quand les strikes <em>montent</em>. <call>Les calls OTM sont les options les plus chères du tableau</call> parce que le choc redouté est à la <em>hausse</em> : une rupture d'approvisionnement qui fait flamber le prix.\nLes valeurs de l'énergie vivent plus près de ce régime.",
  "skew.card.delta.tag": "Le nombre à vraiment surveiller",
  "skew.card.delta.title": "Skew 25-delta",
  "skew.card.delta.body": "Raideur = <b>IV du put 25Δ moins IV du call 25Δ</b>.\nUn écart qui s'élargit, c'est la peur qui fait monter l'aile des puts (stress).\nUn écart qui s'aplatit, c'est la complaisance.\nC'est la lecture la plus nette de la peur que suscite ce titre en ce moment.",

  // ─── skew.sell ───
  "skew.sell.title": "Pourquoi c'est important quand tu vends de la prime",
  "skew.sell.intro": "Tu n'achètes pas d'assurance : tu l'émets.\nMais un vendeur se pose en réalité <b>deux questions distinctes</b>, et <em>le skew ne répond qu'à la seconde.</em>",

  // ─── skew.q ───
  "skew.q.head.question": "La question",
  "skew.q.head.answered": "Ce qui y répond",
  "skew.q.head.card": "Sur cette fiche",
  "skew.q.rich": "« La prime est-elle <em>riche</em> en ce moment ? »",
  "skew.q.richBy": "<b>Niveau d'IV + IV Rank</b> : la hauteur de toute la courbe",
  "skew.q.card": "IV 30 j {{iv}} %",
  "skew.q.cardRank": "IV 30 j {{iv}} %, IV Rank {{rank}}",
  "skew.q.which": "« <em>Quel strike</em>, et avec quelle structure, me permet d'en garder le plus ? »",
  "skew.q.whichBy": "<b>Le skew</b> : la <em>forme</em> de la courbe à travers les strikes",
  "skew.q.curve": "la courbe ci-dessus",

  // ─── skew.levelPays ───
  "skew.levelPays": "<b>C'est le niveau qui te paie. Le skew décide seulement comment ce paiement se répartit entre les strikes, et quelle structure le capte ou le rend.</b>\nUne courbe riche (chère) signifie que les options sont bien payées partout ; le skew est ta table actuarielle pour savoir où se concentre le surpaiement.",

  // ─── skew.step1 ───
  "skew.step1": "Étape 1 · La lecture du niveau (on y va / on n'y va pas)",

  // ─── skew.step2 ───
  "skew.step2": "Étape 2 · La lecture de la forme, et la subtilité du spread",
  "skew.step2.intro": "Une fois que le niveau dit « joue », le skew dit <em>comment</em>.\nLes deux structures de vendeur utilisent le skew de façons opposées :",
  "skew.step2.csp": "<b>Put couvert en liquidités</b> (vendre un put seul) : un skew de puts raide est un pur <em>vent arrière</em>.\nTu encaisses l'option la plus riche et la plus portée par la peur du tableau, et tu la gardes en entier.",
  "skew.step2.bps": "<b>Bull put spread</b> (vendre le put le plus haut, acheter le plus bas) : ici, un skew raide est une <em>taxe</em>.\nLe put que tu <b>achètes</b> se trouve plus haut sur la courbe que celui que tu <b>vends</b>, donc tu paies cher et encaisses bon marché.\nPlus le skew est raide, plus ton crédit net est petit.\nCe crédit réduit est le prix d'un risque plafonné et défini.\nRegarde l'indicateur d'<b>écart de skew</b> faire exactement cela quand tu fais descendre le strike vendu.",

  // ─── skew.fearOpportunity ───
  "skew.fearOpportunity": "Donc <gold>« peur = opportunité »</gold> et la subtilité du spread ne se contredisent pas.\nUne aile de puts portée par la peur signifie une <em>prime absolue élevée</em> (bien : tu encaisses plus), tandis que l'<em>inclinaison</em> de cette aile est ce qu'un spread rend en échange de son plafond de risque.\nTon avantage est le même dans les deux structures : vends là où la peur que le marché intègre dans ses prix est <b>plus riche que ta propre conviction que le cours tiendra</b>.",

  // ─── skew.check ───
  "skew.check.title": "Une grille de lecture pratique",
  "skew.check.see": "Ce que tu vois",
  "skew.check.means": "Ce que ça veut dire",
  "skew.check.move": "Le geste du vendeur",
  "skew.check.0.see": "IV Rank élevé + skew de puts raide",
  "skew.check.0.means": "Prime riche (chère) ET cette richesse est dans les puts",
  "skew.check.0.move": "La configuration type du vendeur : une aile riche à vendre, et le niveau dit qu'elle est bien payée",
  "skew.check.1.see": "Skew de puts raide",
  "skew.check.1.means": "Peur du krach chèrement payée",
  "skew.check.1.move": "La prime des puts est grasse : place ton strike vendu <em>sous</em> la partie la plus raide de la rampe, pour encaisser une prime portée par la peur à un strike que le cours a encore de la marge pour éviter",
  "skew.check.2.see": "Skew plat",
  "skew.check.2.means": "Complaisance",
  "skew.check.2.move": "Prime maigre, peu de coussin dans les prix : sois plus sélectif",
  "skew.check.3.see": "Skew qui se raidit vite",
  "skew.check.3.means": "Le stress monte",
  "skew.check.3.move": "L'IV s'étend : la fenêtre d'entrée s'ouvre",
  "skew.check.4.see": "Un smile se forme",
  "skew.check.4.means": "Événement binaire en vue",
  "skew.check.4.move": "Risque de gap des deux côtés : ne reste pas vendeur à travers",
  "skew.check.5.see": "Skew direct (énergie)",
  "skew.check.5.means": "Choc à la hausse redouté",
  "skew.check.5.move": "Les calls sont l'aile chère ; les puts relativement bon marché à vendre",

  // ─── skew.foot ───
  "skew.foot.smile": "La courbe est le smile littéral à trois ancres que ce scénario valorise : IV ATM {{iv}} %, IV du put 25Δ {{put}} %, IV du call 25Δ {{call}} %, ancré sur le spot de {{ticker}} à {{spot}}.\nLes tableaux de la chaîne d'options tirent le prix de chaque strike de ce même smile.\nLa vol implicite est la supposition du marché sur l'avenir, pas une prévision : lis-la comme un sentiment mis en prix.",
  "skew.foot.flat": "Ce scénario est antérieur aux ancres de smile structurées, la courbe est donc une IV plate à {{iv}} % sur tous les strikes (le niveau, pas la forme).\nLis la skew_note du scénario pour l'histoire du régime en attendant un nouveau scénario.",

  // ─── sample.label ───
  "sample.label": "Exemple · À titre d'illustration",

  // ─── sample.title ───
  "sample.title": "À quoi ressemble une évaluation de pitch Optionality.",

  // ─── sample.intro ───
  "sample.intro": "Une vraie manche est composée sur mesure par la Firme, selon le mode et le persona que tu choisis.\nElle est ensuite soumise à un second LLM qui te note sur six dimensions, et gardée dans ton Journal.\nCelle-ci est figée : une opportunité de mars 2023, un pitch de put spread à crédit et une évaluation complète.\nSers-t'en pour voir ce que le jeu propose avant de mettre des sats sur la table.\nLa Firme écrit ses scénarios et ses évaluations en anglais.",

  // ─── sample.scenario ───
  "sample.scenario": "Scénario · {{date}}",

  // ─── sample.maxLoss ───
  "sample.maxLoss": "Enveloppe de perte max.",

  // ─── sample.pitch ───
  "sample.pitch": "Pitch de l'élève",

  // ─── dm.failed ───
  "dm.failed": "Le DM n'est pas parti.",

  // ─── dm.titleSelf ───
  "dm.titleSelf": "T'envoyer un DM",

  // ─── dm.title ───
  "dm.title": "Envoyer un DM",

  // ─── dm.you ───
  "dm.you": " (toi)",

  // ─── dm.selfNote ───
  "dm.selfNote": "DM à toi-même : le message arrive dans la boîte de réception de ton propre client Nostr.\nC'est un moyen de vérifier de bout en bout ton signataire NIP-07 et le chemin des relais sans déranger personne.",

  // ─── dm.loading ───
  "dm.loading": "L'ensemble de relais partagé se charge encore. Ferme ceci et réessaie dans un instant.",

  // ─── dm.close ───
  "dm.close": "Fermer",

  // ─── dm.placeholder ───
  "dm.placeholder": "Tape un seul message. Le destinataire le voit dans son client Nostr.",

  // ─── dm.escrowNote ───
  "dm.escrowNote": "Signé par Optionality avec ta nsec confiée, gardée dans un stockage géré par l'opérateur.\nLe DM apparaît sur Nostr signé par ta npub.\nRetire la clé quand tu veux dans <b>Profil → Clé de persona de jeu</b>.",

  // ─── dm.nip07Note_one ───
  "dm.nip07Note_one": "Signé localement par ton extension NIP-07 ; ta nsec n'atteint jamais Optionality.\nPublié sur <b>{{count}}</b> relais de l'ensemble DPYC partagé.",
  "dm.nip07Note_other": "Signé localement par ton extension NIP-07 ; ta nsec n'atteint jamais Optionality.\nPublié sur <b>{{count}}</b> relais de l'ensemble DPYC partagé.",

  // ─── dm.nip07Note_other ───

  // ─── dm.cancel ───
  "dm.cancel": "Annuler",

  // ─── dm.send ───
  "dm.send": "Signer et envoyer",

  // ─── dm.sending ───
  "dm.sending": "Chiffrement, signature, diffusion…",

  // ─── dm.sent ───
  "dm.sent": "✓ Envoyé",

  // ─── dm.notAccepted ───
  "dm.notAccepted": "✗ Refusé",

  // ─── dm.relays ───
  "dm.relays": "{{ok}} / {{total}} relais",

  // ─── dm.perRelay ───
  "dm.perRelay": "Résultats par relais",

  // ─── dm.eventNote ───
  "dm.eventNote": "Identifiant de l'événement <id>{{id}}…</id>. Le destinataire le voit dans tout client Nostr abonné à l'un de ces relais.",

  // ─── dm.serverNote ───
  "dm.serverNote": "Le DM est en route via le réseau de relais d'Optionality. Le destinataire le verra dans son client Nostr.",

  // ─── dm.done ───
  "dm.done": "Terminé",

  // ─── dm.tryAgain ───
  "dm.tryAgain": "Réessayer",

  // ─── dm.install ───
  "dm.install": "<b>Installe une extension de signature Nostr</b> pour envoyer des DM.\nOptionality ne voit jamais ta nsec : l'extension signe le DM dans son propre bac à sable, et le message chiffré va droit aux relais.",

  // ─── dm.alby ───
  "dm.alby": "Extension de navigateur + iOS / Android. Inclut aussi un portefeuille Lightning.",

  // ─── dm.nos2x ───
  "dm.nos2x": "Extension minimale pour Chrome / Firefox. NIP-07 seulement, sans portefeuille.",

  // ─── dm.flamingo ───
  "dm.flamingo": "Enveloppe iOS / bureau autour de ta nsec ; expose NIP-07 aux pages web.",

  // ─── nostr.badNpub ───
  "nostr.badNpub": "npub invalide : {{npub}}",

  // ─── nostr.noRelays ───
  "nostr.noRelays": "Aucun relais configuré. Ajoutes-en au moins un dans Profil → Relais Nostr.",

  // ─── nostr.noSigner ───
  "nostr.noSigner": "Aucun signataire NIP-07 détecté. Installe Alby, nos2x ou Flamingo.",

  // ─── nostr.empty ───
  "nostr.empty": "Le message ne peut pas être vide.",

  // ─── glossary.delta_neutral ───
  "glossary.delta_neutral": "Position dont le delta net est proche de zéro : le P/L directionnel s'annule au moment de la construction. Les gains viennent du vega, du theta ou du gamma plutôt que du sens du prix.",

  // ─── glossary.iron_condor ───
  "glossary.iron_condor": "Vendre un call spread OTM et un put spread OTM sur la même échéance. Trade d'encaissement de prime à risque défini ; gagne si le sous-jacent reste entre les deux strikes vendus.",

  // ─── glossary.iron_butterfly ───
  "glossary.iron_butterfly": "Vendre un straddle ATM et acheter des ailes OTM protectrices. Version à risque défini d'un straddle vendu ; gain max. si le sous-jacent s'épingle sur le strike vendu.",

  // ─── glossary.jade_lizard ───
  "glossary.jade_lizard": "Call spread vendu + put vendu, dont la prime totale dépasse la largeur du call spread. Aucun risque à la hausse ; la baisse est bornée par la position du put vendu.",

  // ─── glossary.calendar_spread ───
  "glossary.calendar_spread": "Vendre une option proche, acheter une option plus lointaine au même strike. Profite du theta sur la jambe proche et de la hausse du vega sur la jambe lointaine.",

  // ─── glossary.diagonal_spread ───
  "glossary.diagonal_spread": "Calendar spread avec des strikes différents : ajoute une inclinaison directionnelle au jeu de vol sur le temps.",

  // ─── glossary.ratio_spread ───
  "glossary.ratio_spread": "Acheter une option et en vendre deux (ou plus) du même type, plus OTM. Entrée bon marché, voire à crédit ; risque de queue si le sous-jacent dépasse les strikes vendus.",

  // ─── glossary.vertical_spread ───
  "glossary.vertical_spread": "Acheter une option, en vendre une autre du même type et de même échéance à un autre strike. Risque défini, gain défini. Bull call / bear put / bear call / bull put.",

  // ─── glossary.credit_spread ───
  "glossary.credit_spread": "Vertical où l'option vendue a une prime plus élevée que l'option achetée : on encaisse la prime à l'entrée. Gagne si le sous-jacent reste à l'écart du strike vendu.",

  // ─── glossary.debit_spread ───
  "glossary.debit_spread": "Vertical où l'option achetée coûte plus que l'option vendue : on paie à l'entrée. Gagne si le sous-jacent va vers le strike acheté.",

  // ─── glossary.short_strangle ───
  "glossary.short_strangle": "Vendre un call OTM et un put OTM. Risque non défini dans les deux sens ; encaisse deux primes pour porter ce risque.",

  // ─── glossary.short_straddle ───
  "glossary.short_straddle": "Vendre un call ATM et un put ATM. Encaissement de prime maximal, risque gamma maximal : de petits mouvements coûtent vite cher.",

  // ─── glossary.long_straddle ───
  "glossary.long_straddle": "Acheter un call ATM et un put ATM. Paie sur les mouvements explosifs dans un sens ou l'autre ; perd du theta si le sous-jacent ne bouge pas.",

  // ─── glossary.long_strangle ───
  "glossary.long_strangle": "Acheter un call OTM et un put OTM. Moins cher qu'un straddle ; il faut un plus grand mouvement pour qu'il paie.",

  // ─── glossary.covered_call ───
  "glossary.covered_call": "Action détenue + call vendu à un strike plus haut. Renonce à la hausse au-dessus du strike en échange d'une prime et d'un petit coussin.",

  // ─── glossary.cash_secured_put ───
  "glossary.cash_secured_put": "Put vendu avec les liquidités prêtes pour acheter les actions en cas d'assignation. Une manière patiente d'entrer en position longue sur l'action à un prix de revient plus bas.",

  // ─── glossary.protective_put ───
  "glossary.protective_put": "Action détenue + put acheté. Une assurance contre la baisse ; son coût est la prime du put.",

  // ─── glossary.put_spread ───
  "glossary.put_spread": "Spread vertical en puts. Bear put = payer un débit, gagner à la baisse ; bull put = encaisser un crédit, gagner si le cours reste au-dessus du strike vendu.",

  // ─── glossary.call_spread ───
  "glossary.call_spread": "Spread vertical en calls. Bull call = payer un débit, gagner à la hausse ; bear call = encaisser un crédit, gagner si le cours reste sous le strike vendu.",

  // ─── glossary.iv_crush ───
  "glossary.iv_crush": "Chute brutale de la vol implicite après un événement (résultats, FDA, FOMC). Les structures longues en vol perdent ; les structures courtes en vol gagnent.",

  // ─── glossary.vol_crush ───
  "glossary.vol_crush": "Même idée que l'IV crush : la vol implicite s'effondre après l'événement et dégonfle les primes, quel que soit le sens.",

  // ─── glossary.vol_regime ───
  "glossary.vol_regime": "L'environnement de volatilité autour du trade : réalisée contre implicite, IV rank, forme de la structure par terme, skew. Il décide s'il faut acheter ou vendre de la prime.",

  // ─── glossary.iv_rank ───
  "glossary.iv_rank": "La place de la vol implicite actuelle dans sa fourchette sur un an, de 0 à 100. Un IV rank élevé favorise la vente de prime ; bas, l'achat de prime ou les calendars.",

  // ─── glossary.skew ───
  "glossary.skew": "Écart de vol implicite entre strikes. Skew actions = les puts se paient plus cher que les calls ; skew inversé (matières premières) = les calls plus chers.",

  // ─── glossary.term_structure ───
  "glossary.term_structure": "Comment la vol implicite varie selon les échéances. Contango = mois lointains plus hauts (marché calme) ; backwardation = mois proches plus hauts (stress).",

  // ─── glossary.gamma_risk ───
  "glossary.gamma_risk": "Le risque que le delta change plus vite que tu ne peux couvrir. Les positions short gamma perdent dans un marché volatil et heurté.",

  // ─── glossary.vega_exposure ───
  "glossary.vega_exposure": "Sensibilité aux variations de vol implicite. Long vega = gagne si l'IV monte ; short vega = gagne si l'IV baisse.",

  // ─── glossary.theta_decay ───
  "glossary.theta_decay": "L'érosion quotidienne de la prime que les vendeurs d'options encaissent et que les acheteurs paient. S'accélère à l'approche de l'échéance.",

  // ─── glossary.delta ───
  "glossary.delta": "Variation approximative du prix de l'option pour un mouvement de 1 $ du sous-jacent. Aussi une approximation de la probabilité de finir ITM.",

  // ─── glossary.gamma ───
  "glossary.gamma": "Vitesse de variation du delta. Gamma élevé = le delta bouge vite : favorable aux acheteurs d'options, hostile aux vendeurs près des strikes.",

  // ─── glossary.vega ───
  "glossary.vega": "Variation du prix de l'option pour 1 point de vol implicite. Les options achetées ont un vega positif ; les options vendues, un vega négatif.",

  // ─── glossary.theta ───
  "glossary.theta": "Perte quotidienne de valeur temps d'une option. Les options achetées paient le theta ; les options vendues l'encaissent.",

  // ─── glossary.rho ───
  "glossary.rho": "Sensibilité du prix d'une option au taux sans risque. Plus grande pour les échéances lointaines ; souvent négligeable pour les courtes.",

  // ─── glossary.moneyness ───
  "glossary.moneyness": "L'écart entre le strike d'une option et le spot : ITM (dans la monnaie), ATM (à la monnaie) ou OTM (hors de la monnaie). La distance OTM compte pour le delta.",

  // ─── glossary.breakeven ───
  "glossary.breakeven": "Le prix du sous-jacent à l'échéance où le P/L du trade est exactement nul. Les structures à plusieurs jambes peuvent en avoir deux (les condors, par ex.).",

  // ─── glossary.max_loss ───
  "glossary.max_loss": "Le pire résultat à l'échéance si tu tiens jusqu'au bout. Les structures à risque défini le plafonnent ; les ventes à nu ont une perte max. illimitée.",

  // ─── glossary.max_gain ───
  "glossary.max_gain": "Le meilleur résultat à l'échéance. Pour une prime achetée, il est illimité (calls) ou grand (puts) ; pour une prime vendue, c'est le crédit encaissé.",

  // ─── glossary.dte ───
  "glossary.dte": "Jours restants avant l'échéance. Ils pilotent l'accélération du theta et l'exposition au vega. Sous 21 jours, les structures sont surtout dominées par le gamma ; au-delà de 45, par le vega.",

  // ─── glossary.assignment_risk ───
  "glossary.assignment_risk": "Le risque qu'une option vendue soit exercée tôt, t'obligeant à livrer ou à recevoir les actions. Maximal près de l'échéance et autour des dates de détachement du dividende.",

  // ─── glossary.pin_risk ───
  "glossary.pin_risk": "Le risque que le sous-jacent clôture exactement sur un strike vendu à l'échéance, te laissant dans le doute sur une assignation.",

  // ─── glossary.expected_move ───
  "glossary.expected_move": "Fourchette approximative à un écart-type pour le sous-jacent sur une période donnée. Souvent tirée du prix du straddle ou de vol implicite × racine(temps).",

  // ─── glossary.atm_straddle ───
  "glossary.atm_straddle": "Acheter ou vendre un call à la monnaie et un put à la monnaie. Le straddle ATM acheté est le trade type « je m'attends à un gros mouvement ».",

  // ─── glossary.wheel_strategy ───
  "glossary.wheel_strategy": "Vendre des puts couverts en liquidités sur une action que tu veux détenir ; en cas d'assignation, vendre des calls couverts jusqu'à ce que l'action soit appelée. Et recommencer. La méthode de l'encaissement de prime.",

  // ─── glossary.chartLink ───
  "glossary.chartLink": "Ouvrir le graphique de {{symbol}} sur TradingView",

  // ─── chart.underlying ───
  "chart.underlying": "Sous-jacent  {{price}}",

  // ─── chart.net ───
  "chart.net": "P/L net",

  // ─── chart.alt ───
  "chart.alt": "P/L alt.",

  // ─── chart.spot ───
  "chart.spot": "spot",
  // ─── the top-up tiles, the tutorial switch, and the tours ───
  "tiles.oddLot": "Lot impair",
  "tiles.contract": "Un contrat",
  "tiles.spread": "Spread vertical",
  "tiles.condor": "Iron condor",
  "tiles.maker": "Teneur de marché",
  "tutorial.label": "Tutoriel",
  "tutorial.title": "Tutoriel en direct",
  "tutorial.note": "Une courte visite de chaque onglet la première fois qu'il reste calme, qui montre quoi faire.",
  "tour.account.tutorial.title": "Tutoriel en direct",
  "tour.account.tutorial.says": "Cette visite, sur chaque onglet. Coupe-la ici, ou rallume-la pour revoir toutes les visites.",
  "tour.pit.historicity.title": "Historicité",
  "tour.pit.historicity.says": "D'où vient le scénario : un vrai moment de l'histoire des marchés, une pure fiction, ou le marché d'aujourd'hui en direct.",
  "tour.pit.persona.title": "Persona",
  "tour.pit.persona.says": "La pression qu'exerce The Firm. Une persona plus dure apporte plus de facteurs et un péage plus élevé.",
  "tour.pit.risk.title": "Perte maximale",
  "tour.pit.risk.says": "Ta plus grande perte acceptable par trade, en dollars. The Firm dimensionne le compte en conséquence, et le juge pénalise les trades qui la dépassent.",
  "tour.pit.sector.title": "Secteur",
  "tour.pit.sector.says": "Oriente la donne vers un secteur, ou garde N'importe lequel pour une surprise.",
  "tour.pit.toll.title": "Péage",
  "tour.pit.toll.says": "Ce que coûte cette donne, en sats. Il suit ton historicité et ta persona.",
  "tour.pit.topUp.title": "Recharger",
  "tour.pit.topUp.says": "Ajoute des sats via Lightning. Les donnes et les indices sont payés sur ce solde.",
  "tour.pit.deal.title": "Relever le défi",
  "tour.pit.deal.says": "Distribue un scénario au péage affiché. The Firm met environ une minute à le composer.",
  "tour.scenario.facts.title": "Le dossier",
  "tour.scenario.facts.says": "La date, le contexte macro, l'actif, le catalyseur, les niveaux clés et les contraintes. Touche un bloc pour le lire en grand.",
  "tour.scenario.question.title": "La question",
  "tour.scenario.question.says": "Ce que The Firm te demande de trader. Réponds avec les faits qui comptent, et écarte les fausses pistes.",
  "tour.scenario.pitch.title": "Ton pitch",
  "tour.scenario.pitch.says": "Ton trade avec tes mots : structure, strikes, échéance, taille et raisons. Présente-le pour une évaluation avec une note sur 100.",
  "tour.scenario.clue.title": "Demander un indice",
  "tour.scenario.clue.says": "Pose n'importe quelle question au bureau des indices sur ce scénario, pour une petite somme.",
  "tour.journal.table.title": "Ton journal",
  "tour.journal.table.says": "Chaque scénario qui t'a été distribué, avec sa note. Ouvre une ligne pour relire l'évaluation ou reprendre un brouillon.",
  "tour.journal.sort.title": "Trier",
  "tour.journal.sort.says": "Trie le journal par n'importe quelle colonne, et inverse l'ordre.",
  "tour.leaderboard.sort.title": "Classer par",
  "tour.leaderboard.sort.says": "Scores pondérés ou bruts, série ou parties jouées. Les scores pondérés favorisent les donnes difficiles et chères.",
  "tour.leaderboard.table.title": "Le classement",
  "tour.leaderboard.table.says": "La position de chaque trader. Touche un avatar pour envoyer un DM Nostr à ce trader.",
};

export default words;
