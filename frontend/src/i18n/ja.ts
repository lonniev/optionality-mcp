/**
 * Every word Optionality's own pages say, 日本語で.
 * Keys, {{places}} and <tags> are those of en.ts.
 */

import type { Translation } from "./en.ts";

const words: Translation = {
  // ─── game.journal ───
  "game.journal.col.symbol": "銘柄",
  "game.journal.col.historicity": "ヒストリシティ",
  "game.journal.col.difficulty": "難度",
  "game.journal.col.created": "作成",
  "game.journal.col.updated": "更新",
  "game.journal.col.grade": "評価",
  "game.journal.col.score": "点数",
  "game.journal.col.status": "状態",
  "game.journal.group.none": "なし",

  // ─── game.tool ───
  "game.tool.deal_scenario": "取引シナリオ",
  "game.tool.judge_trade": "ピッチの評価",
  "game.tool.ask_tip": "ヒントの依頼",
  "game.tool.save_draft": "下書きを保存",
  "game.tool.purchase_credits": "チャージ",
  "game.tool.check_payment": "支払いの確認",
  "game.tool.check_balance": "残高の確認",
  "game.tool.check_price": "料金のプレビュー",
  "game.tool.get_leaderboard": "リーダーボード",
  "game.tool.get_my_rank": "自分の順位",
  "game.tool.get_journal": "ジャーナルの参照",
  "game.tool.list_journal": "ジャーナルの一覧",
  "game.tool.delete_journal": "ジャーナルの削除",
  "game.tool.set_display_name": "表示名",
  "game.tool.get_api_usage_stats": "API 利用状況",
  "game.tool.account_statement": "取引明細",
  "game.tool.request_npub_proof": "サインイン（依頼）",
  "game.tool.receive_npub_proof": "サインイン（確認）",

  // ─── game.difficulty ───
  "game.difficulty.apprentice.label": "見習い",
  "game.difficulty.apprentice.blurb": "わかりやすい方向性の設定。素直なマクロ環境。",
  "game.difficulty.journeyman.label": "職人",
  "game.difficulty.journeyman.blurb": "ボラティリティの局面が重要。決算、FRB の日、単一のカタリスト。",
  "game.difficulty.adept.label": "熟練者",
  "game.difficulty.adept.blurb": "複数の要因。資産間の相関。スキューと期間構造。",
  "game.difficulty.sovereign.label": "ソブリン",
  "game.difficulty.sovereign.blurb": "体制転換の時代。通貨の価値下落、地政学、テールヘッジ。",
  "game.difficulty.mulligan.label": "やり直し",

  // ─── game.mode ───
  "game.mode.historical.label": "歴史フィクション",
  "game.mode.historical.blurb": "市場史の実際の瞬間に基づきます。マクロは実際のもの、数値は調整済み。",
  "game.mode.fiction.label": "フィクション",
  "game.mode.fiction.blurb": "完全な創作。近未来の仮説、反実仮想、投機的な局面。",
  "game.mode.live.label": "ライブイベント",
  "game.mode.live.blurb": "ウェブ検索で今日の実際の市場に基づきます。本物のティッカー、本物のカタリスト、今。",

  // ─── game.sector ───
  "game.sector.any": "指定なし",
  "game.sector.biotech": "バイオテク",
  "game.sector.semis": "半導体",
  "game.sector.megaTech": "巨大テック",
  "game.sector.banks": "銀行",
  "game.sector.energy": "エネルギー",
  "game.sector.miners": "鉱業",
  "game.sector.consumer": "消費",
  "game.sector.homebuilders": "住宅建設",
  "game.sector.defense": "防衛",
  "game.sector.airlines": "航空",
  "game.sector.crypto": "暗号資産関連株",
  "game.sector.index": "指数/ETF",

  // ─── game.dimension ───
  "game.dimension.strategy_selection": "ストラクチャー",
  "game.dimension.strikes_and_tenor": "ストライクと期間",
  "game.dimension.risk_reward": "リスク / リワード",
  "game.dimension.macro_integration": "マクロ環境",
  "game.dimension.tail_risk": "テールへの意識",
  "game.dimension.communication": "伝え方",

  // ─── game.zoom ───
  "game.zoom.title": "タップすると大きな文字で読めます",

  // ─── game.loading ───
  "game.loading.tape": "相場を読んでいます",
  "game.loading.wire": "ニュースを拾っています",
  "game.loading.judging": "ピッチを審査しています",
  "game.loading.reissuing": "シナリオを再発行しています",

  // ─── game.error ───
  "game.error.agedOut": "戻る前にその課題の期限が切れました。料金はかかっていません。新しいシナリオを始めてください。",
  "game.error.recover": "その課題を復元できませんでした。{{message}}",
  "game.error.start": "シナリオを開始できませんでした。{{message}}",
  "game.error.typeFirst": "先に取引を書いてください。",
  "game.error.noScenario": "進行中のシナリオがありません。先に新しいシナリオを始めてください。",
  "game.error.notInJournal": "そのシナリオはもうジャーナルにないため、審査できません。ピッチするには新しいシナリオを始めてください。料金はかかっていません。",
  "game.error.evaluation": "評価に失敗しました。{{message}}",
  "game.error.noScenarioToSave": "保存先となる進行中のシナリオがありません。",
  "game.error.save": "保存に失敗しました。{{message}}",
  "game.error.acceptFirst": "ヒントを求める前に挑戦を受けてください。",
  "game.error.clue": "ヒントの依頼に失敗しました。{{message}}",
  "game.error.replay": "やり直しに失敗しました。{{message}}",
  "game.error.nothingToResume": "このエントリーには再開できるシナリオがありません。",

  // ─── game.entry ───
  "game.entry.yourTrade": "あなたの取引",
  "game.entry.headline": "見出し",
  "game.entry.riskProfile": "リスクプロファイル",
  "game.entry.alternative": "代替案",
  "game.entry.deeper": "より深い背景",
  "game.entry.redoTitle": "このシナリオをやり直しとして再発行します。同じ設定で新しいピッチです",
  "game.entry.redo": "もう一度",
  "game.entry.sharedTitle": "リーダーボードのあなたの行で共有中です。クリックすると非公開になります。",
  "game.entry.shareTitle": "仲間が比較できるよう、このピッチをリーダーボードのあなたの行で共有します",
  "game.entry.shared": "✓ 共有中",
  "game.entry.share": "共有",
  "game.entry.visibleToAll": "全員に公開",
  "game.entry.resumeDraftTitle": "保存した下書きがあります。ピットで再開して仕上げ、ピッチしてください。新しいシナリオも料金もかかりません。",
  "game.entry.resumeTitle": "この未完了のシナリオをピットで再開し、取引をピッチして評価を受けます。新しいシナリオも料金もかかりません。",
  "game.entry.resume": "🙋 再開",
  "game.entry.noReview": "エントリーの状態：{{status}}。ピッチの評価はありません。",

  // ─── game.brand ───
  "game.brand.tagline": "ゲーム型オプション取引コンサルタント養成",

  // ─── game.stats ───
  "game.stats.sessions": "セッション",
  "game.stats.avg": "平均点",
  "game.stats.best": "最高",
  "game.stats.streak": "連続",

  // ─── game.balance ───
  "game.balance.title": "チャージ：Bitcoin Lightning で sats を購入",
  "game.balance.label": "残高",
  "game.balance.sats": " sats",
  "game.balance.topUp": "＋ チャージ",

  // ─── game.signOut ───
  "game.signOut.title": "サインアウト：保存された npub と証明トークンを消去します",
  "game.signOut.label": "サインアウト",

  // ─── game.tab ───
  "game.tab.welcome": "ようこそ",
  "game.tab.play": "ピット",
  "game.tab.sample": "評価を見る",
  "game.tab.journal": "ジャーナル",
  "game.tab.leaderboard": "リーダーボード",
  "game.tab.usage": "利用状況",
  "game.tab.profile": "プロフィール",

  // ─── game.openingFloor ───
  "game.openingFloor": "立会場を開いています",

  // ─── game.guest ───
  "game.guest.label": "ゲストパス",
  "game.guest.welcome": "ようこそ、ゲストトレーダー <id>{{id}}</id> さん。",
  "game.guest.body": "サイトは稼働していますが、DPYC トークンを購入するまでは無料のサービスしか使えません。\n<b>利用状況</b> タブで自分のアカウントを確認し、トークンを購入してください。\n挑戦を受ける、ヒントを求める、評価を受けることは有料のサービスですが、料金はわずかで、それぞれ数 sats です。\nNostr の認証情報を用意したら、ここでチャージできます。\nそうすれば挑戦に取り組み、途中の作業を保存し、リーダーボードの仲間にメッセージを送れます。\n練習を重ねれば、プロの聴き手にオプション取引をピッチするのが上手になります。\nようこそ。",
  "game.guest.signIn": "サインインして遊ぶ →",

  // ─── game.briefing ───
  "game.briefing.label": "ブリーフィング",
  "game.briefing.title": "デスクは開いています。",
  "game.briefing.prose": "ファームが機会を提示します。それは市場のある瞬間で、現実かもしれず、創作かもしれず、まさに今起きていることかもしれません。\n日付、マクロ環境、銘柄、カタリスト、重要な水準、そしてポートフォリオの制約が示されます。\n法廷の訴訟資料のように読んでください。\nそれから、自分の言葉で取引を書きます。ストラクチャー、ストライク、満期、サイズ、そして理由です。",
  "game.briefing.integration": "<b>統合が評価されます。</b> 優れた回答は、ファームが示した政治、金融、資産間の事実を踏まえています。\n関連する事実をテーゼに多く織り込むほど点数が上がり、特にマクロ環境の観点で高くなります。",
  "game.briefing.herrings": "<b>レッドヘリングが仕込まれています。</b> ファームは、まったくの事実だが理想的な取引には関係のない事実を一つか二つ紛れ込ませます。\nそれは、トレーダーが気づいて重視しすぎてもおかしくない、現実世界のノイズです。\nスキューのメモは単なる彩りで、カタリストではないかもしれません。\nある見出しはすでに相場に織り込まれているかもしれません。\n開示されたポジションは古いかもしれません。\nそれらは関連性の罠であり、虚偽の罠ではありません。\nそれに基づいてテーゼを組むと減点され、ノイズと見抜いて脇に置けば加点されます。",
  "game.briefing.coda": "ヒストリシティを選んでください。ペルソナを選んでください。挑戦を受けてください。",

  // ─── game.chooser ───
  "game.chooser.historicity": "ヒストリシティ",
  "game.chooser.persona": "ペルソナ",
  "game.chooser.risk": "リスクの枠",
  "game.chooser.maxLoss": "1 取引あたりの最大損失：",
  "game.chooser.optional": "任意",
  "game.chooser.clear": "消去",
  "game.chooser.maxLossHint": "任意です。設定すると、ファームは機会の口座規模と制約を調整し、よく選んだストラクチャーがその枠に収まるようにします。最悪の場合に枠を超える取引は、審査員が減点します。",
  "game.chooser.sector": "セクター",
  "game.chooser.sectorLimit": "ディーラーを {{sector}} に限定する",
  "game.chooser.sectorAny": "ディーラーに任意のセクターを選ばせる",
  "game.chooser.customSector": "または独自のセクターを入力：",
  "game.chooser.customExample": "例：高級品",
  "game.chooser.sectorHint": "任意です。ファームは選んだセクターから原資産を選び、カタリスト、関連する事実、レッドヘリングをそのセクターの動きに合わせます。",

  // ─── game.topUp ───
  "game.topUp.title": "運営者から Bitcoin Lightning で sats を購入",
  "game.topUp.label": "チャージ",

  // ─── game.toll ───
  "game.toll.label": "料金",

  // ─── game.sats_one ───
  "game.sats_one": "{{count}} sat",
  "game.sats_other": "{{count}} sats",

  // ─── game.sats_other ───

  // ─── game.toll ───
  "game.toll.noModel": "料金モデルにまだ倍率がありません。この運営者で reset_pricing_model を実行してください。",

  // ─── game.signInToPlayTitle ───
  "game.signInToPlayTitle": "取引シナリオを受け取るには Nostr アイデンティティでサインインしてください",

  // ─── game.signInToPlay ───
  "game.signInToPlay": "サインインして遊ぶ",

  // ─── game.deal ───
  "game.deal.another": "もう一つ",
  "game.deal.challenge": "挑戦を受ける",
  "game.deal.watchTitle": "最新のシナリオの「相場を読んでいます」画面に戻る",
  "game.deal.preparing_one": "{{count}} 件のシナリオを準備中です。見る ›",
  "game.deal.preparing_other": "{{count}} 件のシナリオを準備中です。見る ›",
  "game.deal.confirmPriced": "もう一つ始めますか？ シナリオごとに {{price}} sats の料金が別にかかります。",
  "game.deal.confirm": "もう一つ始めますか？ シナリオごとに料金が別にかかります。",
  "game.deal.yes": "はい、もう一つ",
  "game.deal.notYet": "まだです",

  // ─── game.card ───
  "game.card.macro": "マクロ環境",
  "game.card.skewNote": "スキューのメモ",
  "game.card.catalyst": "カタリスト",
  "game.card.keyLevels": "重要な水準",
  "game.card.constraints": "制約",
  "game.card.question": "問い",
  "game.card.sources": "出典",
  "game.card.spot": "スポット",
  "game.card.iv30": "IV 30 日",
  "game.card.ivRank": "IV ランク",
  "game.card.skew": "スキュー · ",

  // ─── game.pitch ───
  "game.pitch.saveTitle": "ページを再読み込みしても残るよう、この下書きをジャーナルのエントリーに保存します",
  "game.pitch.save": "下書きを保存",
  "game.pitch.discardTitle": "このシナリオを破棄して新しいものを選びます。シナリオの料金は返金されないため、確認を求められます。",
  "game.pitch.discard": "シナリオを破棄",
  "game.pitch.placeholder": "例：30 日の 95/90 プットスプレッドを 1.20 のクレジットで売り、NAV の 0.5% をリスクにとるサイズにする。FRB のタカ派的な据え置きはドルの下支えになるが、株はインサイダーの買いで買われている。200 日線の下でプレミアムを受け取るのは非対称に思える…",
  "game.pitch.presentTitle": "シニア PM に取引を提示し、評価と採点付きのピッチ監査を受けます",
  "game.pitch.present": "ピッチを提示",
  "game.pitch.saved": "✓ {{time}} に下書きを保存しました",

  // ─── game.clue ───
  "game.clue.heading": "ヒントを求める",
  "game.clue.hint": "少額の料金で何でも質問できます。例：<q>「コールスキューとはどういう意味ですか？」</q>",
  "game.clue.copied": "クリップボードにコピーしました",
  "game.clue.copyTitle": "このヒントの会話をクリップボードにコピーし、自分の Claude.ai セッションで続けます",
  "game.clue.copy": "会話をコピー",
  "game.clue.q": "Q · {{question}}",
  "game.clue.placeholder": "質問を入力…",
  "game.clue.asking": "ヒント窓口に問い合わせています…",
  "game.clue.sendTitle": "この質問を送信します。少額のヒント料金がかかります。",
  "game.clue.send": "質問を送信",

  // ─── game.review ───
  "game.review.label": "ピッチの評価",
  "game.review.overall": "総合",
  "game.review.byDimension": "観点別",
  "game.review.right": "うまくできた点",
  "game.review.sharpen": "磨くべき点",
  "game.review.alternative": "ファームならとったであろう代替案",
  "game.review.replayTitle": "シナリオ選択に戻る",
  "game.review.replay": "🔁 もう一度",

  // ─── game.ledger ───
  "game.ledger.label": "DPYC 台帳",
  "game.ledger.title": "sats 残高と MCP ツールの利用状況",
  "game.ledger.intro": "Optionality MCP での残高、直近 30 日の支出と購入、そして sats が使われたツールです。\n料金は呼び出し時に差し引かれ、運営者の帳簿は決済のたびに Neon に書き込まれます。",
  "game.ledger.tools": "MCP ツールの利用状況：直近 30 日",
  "game.ledger.empty": "直近 30 日に有料ツールの呼び出しはありません。",
  "game.ledger.health": "アカウントの状態",

  // ─── game.ai ───
  "game.ai.refresh": "API 利用状況を更新",
  "game.ai.label": "利用状況",
  "game.ai.title": "AI の利用と費用",
  "game.ai.intro": "Optionality はシナリオ、ヒント、判定のたびにモデルを呼び出します。\nこれは、あなたのツール呼び出しがトークンとして使った量と、提供元が実際に運営者へ請求した金額です。\nあなたの料金はこれに運営者の経費を加えたものです。\n隠れた利ざやはありません。",
  "game.ai.estimated": "「推定」と記した数字は呼び出しごとの費用記録より前のもので、公表料金（{{date}} 取得）から推定しています。その他は提供元が請求した金額です。",
  "game.ai.reported": "費用は提供元自身の呼び出しごとの数字で、推定ではありません。",
  "game.ai.tallying": "領収書を集計しています",
  "game.ai.none": "まだモデルの呼び出しは記録されていません。挑戦を受けてください。",
  "game.ai.unknown": "不明",
  "game.ai.runs": "呼び出し：",
  "game.ai.input": "入力：",
  "game.ai.output": "出力：",
  "game.ai.cost": "費用：",
  "game.ai.costEst": "費用（推定）：",
  "game.ai.perCall": "1 回あたり：",
  "game.ai.costPartEst": "AI 費用（一部推定）",
  "game.ai.costBilled": "請求された AI 費用",
  "game.ai.tokens": "{{calls}} 回のモデル呼び出しで {{tokens}} トークン",
  "game.ai.costPerCall": "1 回あたりの費用",
  "game.ai.averaged": "すべてのシナリオ、ヒント、判定の平均",
  "game.ai.sats": "sats 換算",
  "game.ai.atRate": "約 {{rate}}/BTC で換算",
  "game.ai.footnote": "運営者は AI の費用を Lightning のマイクロペイメントで利用者に転嫁しています。\nこの画面はありのままの透明性です。各シナリオ、ヒント、判定に実際にかかった費用と、{{rate}}/BTC の固定参照レートでの sats 換算を示します。\nこのレートは比較のための物差しで、今日の相場ではありません。",

  // ─── game.lb ───
  "game.lb.label": "リーダーボード",
  "game.lb.title": "腕前順に並んだソブリントレーダー",
  "game.lb.intro": "料金モデルが唯一のダイヤルです。難しく高価なピッチで高得点を取れば、安いピッチで高得点を取った人より上位になります。\n運営者が倍率（やり直し、ソブリンなど）を調整すると、次回のリーダーボード再計算ですべてのエントリーに新しい重みが反映され、古いスナップショットがずれることはありません。\n既定の並び順は加重平均で、素点でも並べられます。",
  "game.lb.sort.weighted_avg": "加重平均",
  "game.lb.sort.weighted_best": "加重最高",
  "game.lb.sort.avg": "素点平均",
  "game.lb.sort.best": "素点最高",
  "game.lb.sort.streak": "連続",
  "game.lb.sort.played": "プレイ数",
  "game.lb.loading": "読み込み中…",
  "game.lb.refresh": "更新",
  "game.lb.failed": "リーダーボードを読み込めませんでした。{{error}}",
  "game.lb.unknownError": "不明なエラーです。",
  "game.lb.empty": "まだ審査済みの取引はありません。最初の一人になりましょう。",
  "game.lb.trader": "トレーダー",
  "game.lb.wavg": "加重平均",
  "game.lb.wavgTitle": "加重平均：素点 × 難度の倍率",
  "game.lb.wbest": "加重最高",
  "game.lb.wbestTitle": "加重した最高の単一ピッチ",
  "game.lb.avg": "平均",
  "game.lb.avgTitle": "評価済みの全ピッチの素点平均",
  "game.lb.streak": "連続",
  "game.lb.played": "プレイ数",
  "game.lb.rowTitle": "クリックするとこのトレーダーが共有したピッチを見られます",
  "game.lb.dmSelf": "自分に DM：リレーの経路をテスト",
  "game.lb.dm": "{{name}} に DM",
  "game.lb.anonymous": "匿名",
  "game.lb.you": "あなた",
  "game.lb.last": "  ·  最終：{{date}}",
  "game.lb.fetching": "共有されたピッチを取得しています",
  "game.lb.youNone": "まだピッチを共有していません。評価済みのジャーナルエントリーを開いて「共有」をタップしてください。",
  "game.lb.theyNone": "このトレーダーはまだピッチを共有していません。",
  "game.lb.yourShared": "共有したピッチ · {{count}}",
  "game.lb.shared": "共有されたピッチ · {{count}}",
  "game.lb.theirPitch": "このトレーダーのピッチ",
  "game.lb.houseAlt": "ファームの代替案",

  // ─── game.journal ───
  "game.journal.label": "ジャーナル",
  "game.journal.title": "あなたの勉強部屋",
  "game.journal.intro": "勉強部屋へようこそ。\nここでは過去の提案を見直し、評価を読み返し、始めたまま脇に置いたピッチを再開できます。",
  "game.journal.introNamed": "{{name}} さん、勉強部屋へようこそ。\nここでは過去の提案を見直し、評価を読み返し、始めたまま脇に置いたピッチを再開できます。",

  // ─── game.prep ───
  "game.prep.heading": "準備中のシナリオ · {{count}}",
  "game.prep.rowTitle": "このシナリオの「相場を読んでいます」画面に戻る",
  "game.prep.watch": "見る ›",
  "game.prep.note": "ファームがバックグラウンドで作成しているので、離れて戻ってきても大丈夫です。\n準備ができたものはこの一覧から消え、下に受け取り待ちの未完了エントリーとして表示されます。",

  // ─── game.journal ───
  "game.journal.pulling": "セッションを取得しています",
  "game.journal.emptyPreparing": "完了したセッションはまだありません。シナリオは上で準備中です。",
  "game.journal.empty": "まだセッションはありません。最初の取引シナリオを始めましょう。",
  "game.journal.groupBy": "グループ",
  "game.journal.flipGroups": "グループの順序を反転",
  "game.journal.groupsAsc": "グループ ▲",
  "game.journal.groupsDesc": "グループ ▼",
  "game.journal.sortBy": "並べ替え",
  "game.journal.flipSort": "並び順を反転",
  "game.journal.sortedAsc": "昇順です。降順に切り替えます。",
  "game.journal.sortedDesc": "降順です。昇順に切り替えます。",
  "game.journal.asc": "▲ 昇順",
  "game.journal.desc": "▼ 降順",
  "game.journal.sessions_one": "{{count}} セッション",
  "game.journal.sessions_other": "{{count}} セッション",
  "game.journal.avg": " · 平均 {{score}}",

  // ─── game.status ───
  "game.status.open": "未完了",
  "game.status.evaluated": "評価済み",

  // ─── game.journal ───
  "game.journal.sharedTag": "· 共有中",
  "game.journal.deleteTitle": "このセッションを完全に削除",
  "game.journal.delete": "セッションを削除",
  "game.journal.loadingEntry": "エントリーを読み込んでいます",

  // ─── game.discard ───
  "game.discard.title": "このシナリオを破棄しますか？",
  "game.discard.body": "破棄すると新しいシナリオを選べます。\n各シナリオは有料の外部 LLM 処理を使うため、このシナリオの料金は返金できません。\n本当にこのシナリオをあきらめて別のものを選びますか？",
  "game.discard.keep": "このシナリオを続ける",
  "game.discard.confirm": "破棄して別のものを選ぶ",

  // ─── game.delete ───
  "game.delete.title": "このセッションを完全に削除しますか？",
  "game.delete.body": "<b>{{ticker}}</b> のセッションを完全に削除しようとしています。\nシナリオ、ピッチ、評価、点数、そしてこれで得たリーダーボードの順位は<b>完全に消えます</b>。\n元に戻すことはできず、後から復元することもできません。",
  "game.delete.bodyGraded": "<b>{{ticker}}</b> のセッション（評価 {{grade}}）を完全に削除しようとしています。\nシナリオ、ピッチ、評価、点数、そしてこれで得たリーダーボードの順位は<b>完全に消えます</b>。\n元に戻すことはできず、後から復元することもできません。",
  "game.delete.this": "この",
  "game.delete.keep": "残す",
  "game.delete.deleting": "削除しています…",
  "game.delete.confirm": "完全に削除",

  // ─── game.zoom ───
  "game.zoom.copyTitle": "このテキストをクリップボードにコピー",
  "game.zoom.copy": "テキストをコピー",
  "game.zoom.closeTitle": "閉じる（Esc）",
  "game.zoom.close": "閉じる",

  // ─── game.status ───
  "game.status.submitted": "提出済み",
  "game.status.abandoned": "放棄",

  // ─── app.lapsed ───
  "app.lapsed": "離れている間にサインインの期限が切れました。続けるにはもう一度サインインしてください。",

  // ─── signIn.welcome ───
  "signIn.welcome": "エージェント型のオプション取引トレーナーです。ファームが機会を組み立て、あなたがピッチを書き、審査員が規律を採点します。",

  // ─── signIn.nsecHint ───
  "signIn.nsecHint": "nsec でサインインしますか？ nsec はこのブラウザに残り、各呼び出しに署名します。\nOptionality も DM に署名できるよう、暗号化したコピーを保管します。\nプロフィールからいつでも引き出せます。\n自分で保管するアイデンティティなら、代わりに npub でサインインしてください。",

  // ─── signIn.or ───
  "signIn.or": "または",

  // ─── signIn.guest ───
  "signIn.guest": "ゲストとして続ける",

  // ─── signIn.guestHint ───
  "signIn.guestHint": "ゲストは選択画面、ブリーフィング、サンプル評価を閲覧できます。",

  // ─── signIn.footnote ───
  "signIn.footnote": "Optionality™ は <link>Tollbooth-DPYC™</link> の上に作られたエージェント型オプション取引ゲームです。AI エージェントのための Bitcoin Lightning マイクロペイメントと Nostr アイデンティティです。",

  // ─── welcome.guestName ───
  "welcome.guestName": "ゲスト {{id}}",

  // ─── welcome.anonymous ───
  "welcome.anonymous": "匿名の訪問者",

  // ─── welcome.label ───
  "welcome.label": "ようこそ",

  // ─── welcome.greeting ───
  "welcome.greeting": "ようこそ、<name>{{name}}</name> さん。",

  // ─── welcome.signedInAs ───
  "welcome.signedInAs": " <npub>{{npub}}</npub> としてサインインしています。",

  // ─── welcome.why ───
  "welcome.why": "なぜ Optionality なのか。",

  // ─── welcome.why1 ───
  "welcome.why1": "Optionality™ は、オプションを使いこなすトレーダーを目指す人のための、ゲーム化されたシナリオ型の学習です。\n価格計算の数学やプラットフォームの操作といった通常のカリキュラムからは離れています。\n明確で実行可能な取引と、その背後にある理由を求める物語であなたを引き込みます。",

  // ─── welcome.why2 ───
  "welcome.why2": "専門用語に慣れず、戦略や今の取引アイデアを説明するよう求められると言葉に詰まってしまう。\n世界情勢を大きく捉え、プレッシャーの中で説得力のある取引提案をしたい。\nでも考えはぼんやりしていて、大きな利益を追いかけ、状況が起きる前にそこで何をするかを言えない。\nOptionality™ は健全な戦略を学び、世界の出来事を取り入れ、戦略の説明を磨く手助けをします。",

  // ─── welcome.why3 ───
  "welcome.why3": "Optionality™ はあなたの投資会社、ファームの役を務めます。\n最新の AI サービスを使って、考える機会を与え、そのうえで取引を提示させる、手ごたえのある模擬的な世界シナリオを示します。\nファームの監査役は、ストラクチャーの選択、ストライクと期間、リスク/リワード、マクロの統合、テールリスクについて提案を採点します。\nそのフィードバックが、物語としての提案を磨く助けになります。\nやがて、より賢明な取引を素早く的確に構想し、提示し、実行できるようになります。",

  // ─── welcome.play ───
  "welcome.play.label": "ゲームの流れ",
  "welcome.play.round": "1 ラウンド",
  "welcome.play.1": "<b>挑戦を受ける。</b> ヒストリシティ（歴史、フィクション、ライブ）、ペルソナ（見習い → ソブリン）、必要なら最大損失の枠を選びます。料金は選択の難しさに応じて上がります。",
  "welcome.play.2": "<b>シナリオを読む。</b> 銘柄、スポット、IV、スキュー、重要な水準、カタリスト、ポートフォリオの制約、そしてノイズと本当に重要なものを見分けられるか試すために仕込まれたいくつかのレッドヘリング。",
  "welcome.play.3": "<b>取引をピッチする。</b> 自由記述です。ストラクチャー、ストライク、期間、サイズ、そして理由を書きます。",
  "welcome.play.4": "<b>評価を読む。</b> 一文の見出し、5 つの観点の点数、取り入れた事実の台帳、ファームならとったであろう代替取引、リスクプロファイルのチャート、より深い背景。",
  "welcome.play.5": "<b>過去のシナリオをやり直す</b>には、もう一度見たいときにジャーナルから選びます。同じ設定で新しいピッチを書き、別に記録されます。",

  // ─── welcome.toll ───
  "welcome.toll": "料金",
  "welcome.toll.fair": "Optionality™ は使った分だけの公正な料金です。\n使わなければ何も払いません。サブスクリプションも KYC もありません。\n料金は、各シナリオの作成と採点に実際にかかる費用に連動します。\n簡単なものは LLM トークンが少なく、ウェブ検索付きのライブ相場やソブリン難度のような難しいものは多く使います。\n最も複雑なシナリオでも、料金は数百 sats ほどです。",
  "welcome.toll.inspect": "運営者が各倍率を直接設定しており、残高ができれば <b>利用状況</b> タブで自分で確認できます。\n現在のライブ料金モデルから取得した値です：",
  "welcome.toll.cheap": "最も簡単なシナリオ（フィクション × 見習い）：<b>{{price}}</b>",
  "welcome.toll.expensive": "最も難しいシナリオ（ライブ相場 × ソブリン、ウェブ検索付き）：<b>{{price}}</b>",
  "welcome.toll.pitch": "ピッチの監査：<b>{{price}}</b>",
  "welcome.toll.session": "中程度の難度で採点付きのラウンドを約 30 回行うと、およそ {{sats}} sats、BTC で約 {{usd}} です。\nチャージでは Lightning の請求書で sats を購入します。Wallet of Satoshi、Phoenix、Mutiny など、どの Lightning ウォレットでも使えます。",
  "welcome.toll.fallback": "Optionality™ は使った分だけの公正な料金です。使わなければ何も払いません。\n難度とモードで料金が変わります。残高ができれば <b>利用状況</b> タブで各倍率を確認できます。\nチャージでは Lightning の請求書で sats を購入します。Wallet of Satoshi、Phoenix、Mutiny など、どの Lightning ウォレットでも使えます。",
  "welcome.toll.unreachable": "（現在、料金モデルに接続できず、具体的な数字を示せません。）",

  // ─── welcome.economy ───
  "welcome.economy.label": "経済の仕組み",
  "welcome.economy.title": "Optionality は Tollbooth-DPYC™ で動いています",
  "welcome.economy.intro": "Optionality は <dpyc>Tollbooth-DPYC™ →</dpyc> の上に作られたエージェント型オプション取引ゲームです。これは収益化された AI サービスのための Bitcoin Lightning + Nostr の仕組みです。\nガバナンス、認定運営者、コミュニティの登録簿は <community>github.com/lonniev/dpyc-community →</community> で公開されています。\n挙げておきたい特性が 3 つあります：",
  "welcome.economy.identity": "<b>自己主権のアイデンティティ。</b> メールとパスワードではなく、Nostr の鍵ペアでサインインします。\nnsec が唯一の認証情報です。KYC も、プラットフォームが発行するアカウントもありません。\nOptionality が暗号化したコピーを保管するのは頼んだときだけで（プロフィール → ゲームペルソナ鍵）、いつでも引き出せます。",
  "welcome.economy.pricing": "<b>再デプロイなしの動的な料金。</b> 運営者のツール料金はコードではなく料金モデルに保存されています。\n難度とモードの倍率はリアルタイムで調整され、利用状況タブで自分で確認できます。\nリーダーボードも同じ仕組みで点数に重みを付けます。",
  "welcome.economy.money": "<b>健全なお金。</b> 法定通貨の決済網でのマイクロペイメントは経済的に成り立ちません。インターチェンジ手数料だけで 1 sat の料金を超えてしまいます。\nBitcoin Lightning なら、AI ツールの呼び出しごとに料金を取るのは簡単です。\n前払いの Lightning 残高、呼び出しごとのアトミックな決済、チェーン外であなたの支出を預かる管理者がいないこと。それが Optionality のようなサービスを成り立たせています。",

  // ─── welcome.ready ───
  "welcome.ready": "準備はいいですか？",
  "welcome.ready.guest": "まずは見て回ってください。<b>評価を見る</b> タブでは採点済みの 1 ラウンド全体を見られるので、参加する前にゲームの内容がわかります。\n本番で取引をピッチしたくなったら、Nostr アイデンティティでサインインしてください。",
  "welcome.ready.guestPriced": "まずは見て回ってください。<b>評価を見る</b> タブでは採点済みの 1 ラウンド全体を見られるので、参加する前にゲームの内容がわかります。\n本番で取引をピッチしたくなったら、Nostr アイデンティティでサインインし、BTC で約 {{usd}} をチャージしてください。",
  "welcome.ready.patron": "まずは見て回ってください。<b>評価を見る</b> タブでは採点済みの 1 ラウンド全体を見られるので、sats を払う前にゲームの内容がわかります。\n本番で取引をピッチしたくなったら：",

  // ─── welcome.seeAssessment ───
  "welcome.seeAssessment": "評価を見る",

  // ─── welcome.signInToPlay ───
  "welcome.signInToPlay": "サインインして遊ぶ",

  // ─── welcome.topUpPriced ───
  "welcome.topUpPriced": "チャージ：約 {{usd}} で始める",

  // ─── welcome.topUp ───
  "welcome.topUp": "チャージ",

  // ─── profile.label ───
  "profile.label": "プロフィール",

  // ─── profile.title ───
  "profile.title": "あなたの自己主権アイデンティティ。",

  // ─── profile.intro ───
  "profile.intro": "プロフィールは Nostr の kind-0 メタデータにあり、リレーから読み込まれ、すべての Nostr クライアントに表示されます。\n編集はブラウザで署名されてリレーされます。鍵がこの端末を離れることはありません。",

  // ─── profile.tz ───
  "profile.tz.label": "タイムゾーン",
  "profile.tz.title": "すべての時計を一つのタイムゾーンで。",
  "profile.tz.intro": "Optionality のすべての日付はこのタイムゾーンに従います。このブラウザ内だけの設定で、公開も共有もされません。",

  // ─── profile.theme ───
  "profile.theme.label": "設定",
  "profile.theme.title": "Optionality の見た目。",
  "profile.theme.intro": "このブラウザ内だけの設定です。公開も共有もされません。",
  "profile.theme.dark": "🌑 ダーク",
  "profile.theme.light": "☀ ライト",

  // ─── profile.language ───
  "profile.language.label": "言語",
  "profile.language.title": "このページの言葉。",
  "profile.language.intro": "このブラウザに保存されます。ファームのシナリオ、ヒント、評価は英語のままです。",

  // ─── profile.build ───
  "profile.build.label": "ビルドとライセンス",
  "profile.build.title": "オープンソース、私的な商取引。",
  "profile.build.intro": "Optionality と Tollbooth-DPYC™ は Apache License 2.0 のオープンソースとして公開されています。誰でもコードを読み、フォークし、自分の運営者を動かせます。\nそのコードの上で提供される<i>サービス</i>は私的な商取引です。各運営者が料金と料金モデルを決め、利用者は Lightning 残高を前払いして呼び出しごとに支払います。\nプロトコルは共有ですが、その上のビジネスは共有ではありません。",

  // ─── profile.key ───
  "profile.key.notNsec": "bech32 の nsec1… 文字列ではないようです。",
  "profile.key.depositFailed": "預け入れに失敗しました。",
  "profile.key.ackMismatch": "確認の文言が完全には一致しません。",
  "profile.key.withdrawFailed": "引き出しに失敗しました。",
  "profile.key.label": "ゲームペルソナ鍵",
  "profile.key.title": "nsec の保管",
  "profile.key.intro": "Optionality 用に npub を新しく作った場合、nsec を運営者に預けると、サーバーがあなたの代わりに Nostr の DM に署名します。署名用の拡張機能は不要です（iPad でも使えます）。\nnsec は AES-256-GCM で暗号化して保管されます。\n<b>ここに本物の Nostr アイデンティティを貼り付けないでください</b>。新しく作ったゲーム用ペルソナだけにしてください。",
  "profile.key.deposit": "nsec を預ける",
  "profile.key.encrypting": "暗号化しています…",
  "profile.key.depositBtn": "預ける",
  "profile.key.held": "✓ Optionality が保管しています（金庫内で暗号化）。他の利用者への DM はサーバーの署名を通るため、ブラウザ拡張機能は不要です。",
  "profile.key.withdraw": "引き出して自分で保管する",
  "profile.key.ackIntro": "確認のため、下の文言を正確に入力してください。\nnsec はコピーできるよう一度だけ表示され、その後 Optionality は削除します。\n引き出した後、DM を送るには Nostr の署名拡張機能（Alby、nos2x）が必要です。\nサーバーが一語ずつ照合するため、文言は英語のままです。",
  "profile.key.ack": "確認",
  "profile.key.cancel": "キャンセル",
  "profile.key.withdrawing": "引き出しています…",
  "profile.key.confirm": "引き出しを確定",
  "profile.key.copyNow": "<b>今すぐ nsec をコピーしてください。</b> Optionality は金庫から削除しました。\n表示されるのはこの一度だけです。\nNostr クライアント（0xchat、Damus、Amber）かパスワードマネージャーに保存してください。",
  "profile.key.copy": "コピー",
  "profile.key.saved": "保存しました",

  // ─── clock.left ───
  "clock.left": "残り約 {{clock}}",

  // ─── clock.wrapping ───
  "clock.wrapping": "まもなく完了…",

  // ─── deal.preparing ───
  "deal.preparing": "ファームが課題を準備しています",

  // ─── deal.elapsed ───
  "deal.elapsed": "経過",

  // ─── deal.estimate ───
  "deal.estimate": "目安",

  // ─── deal.claim ───
  "deal.claim": "受付番号",

  // ─── deal.reassure ───
  "deal.reassure": "ごゆっくりどうぞ。このページを離れても大丈夫です。\n準備ができると課題は<b>ジャーナル</b>に届き、接続が切れても中断したところから再開します。",

  // ─── deal.claimInJournal ───
  "deal.claimInJournal": "ジャーナルで受け取る",

  // ─── deal.live ───
  "deal.live": "ライブモードはウェブを検索するため、数分かかることがあります。",

  // ─── lib.quotes ───
  "lib.quotes.0": "健全な通貨は、政府による専制的な侵害から市民の自由を守る手段である。",
  "lib.quotes.1": "経済学の奇妙な務めは、人々が設計できると思い込んでいるものについて、実はどれほど知らないかを示すことである。",
  "lib.quotes.2": "従来の通貨の根本的な問題は、それを機能させるのに必要な信頼の大きさにある。",
  "lib.quotes.3": "通貨を政府の手から取り上げない限り、再び良い通貨を手にすることはないだろう。",
  "lib.quotes.4": "インフレは立法なき課税である。",

  // ─── judge.title ───
  "judge.title": "ピッチを審査しています",

  // ─── judge.sub ───
  "judge.sub": "提案の 6 つの観点を検討しています",

  // ─── judge.dim ───
  "judge.dim.tail": "テールリスク",

  // ─── ledger.title ───
  "ledger.title": "事実の台帳",

  // ─── ledger.integrated ───
  "ledger.integrated": "取り入れた事実",

  // ─── ledger.integratedNone ───
  "ledger.integratedNone": "なし。関連する事実を直接引用してみてください。",

  // ─── ledger.missed ───
  "ledger.missed": "見落とした関連事実",

  // ─── ledger.missedNone ───
  "ledger.missedNone": "完璧です。重要な事実をすべて扱いました。",

  // ─── ledger.caught ───
  "ledger.caught": "脇に置いたレッドヘリング",

  // ─── ledger.caughtNone ───
  "ledger.caughtNone": "記録なし。",

  // ─── ledger.followed ───
  "ledger.followed": "テーゼを引きずったレッドヘリング",

  // ─── ledger.followedNone ───
  "ledger.followedNone": "なし。ノイズをテーゼから締め出しました。",

  // ─── legs.side ───
  "legs.side": "売買",

  // ─── legs.type ───
  "legs.type": "種類",

  // ─── legs.strike ───
  "legs.strike": "ストライク",

  // ─── legs.dte ───
  "legs.dte": "残存日数",

  // ─── legs.premium ───
  "legs.premium": "プレミアム",

  // ─── legs.qty ───
  "legs.qty": "数量",

  // ─── legs.long ───
  "legs.long": "買い",

  // ─── legs.short ───
  "legs.short": "売り",

  // ─── legs.call ───
  "legs.call": "コール",

  // ─── legs.put ───
  "legs.put": "プット",

  // ─── legs.days ───
  "legs.days": "{{days}} 日",

  // ─── risk.noLegs ───
  "risk.noLegs": "構造化された取引のレッグを読み取れなかったため、チャートは表示できません。株や債券の単独ポジションや読み取れない取引はチャートを省きます。",

  // ─── risk.days ───
  "risk.days": "取引開始からの日数：{{days}} 日",

  // ─── risk.entry ───
  "risk.entry": "（エントリー）",

  // ─── risk.expiration ───
  "risk.expiration": "（満期）",

  // ─── risk.overlay ───
  "risk.overlay": "代替取引を重ねて表示",

  // ─── risk.maxProfit ───
  "risk.maxProfit": "最大利益",

  // ─── risk.maxLoss ───
  "risk.maxLoss": "最大損失",

  // ─── risk.unlimited ───
  "risk.unlimited": "無制限",

  // ─── risk.breakeven_one ───
  "risk.breakeven_one": "損益分岐点",
  "risk.breakeven_other": "損益分岐点",

  // ─── risk.breakeven_other ───

  // ─── risk.iv ───
  "risk.iv": "使用した IV",

  // ─── risk.r ───
  "risk.r": "想定した r",

  // ─── risk.footnote ───
  "risk.footnote": "配当なしのブラック・ショールズです。\n無リスク金利は 4.5% に固定しています。\nボラティリティはシナリオの IV で一定とし、実際のボラティリティの変動は考慮していません。\nレッグごとの数量は読み取ったとおりで、乗数は 100 株です。",

  // ─── risk.parsed ───
  "risk.parsed": "読み取ったレッグ",

  // ─── risk.yours ───
  "risk.yours": "あなたの取引",

  // ─── risk.alt ───
  "risk.alt": "代替取引",

  // ─── chain.triggerTitle ───
  "chain.triggerTitle": "オプションチェーン全体を表示します。仲値をタップして買い、売り、取り消しができます",

  // ─── chain.title ───
  "chain.title": "オプションチェーン",

  // ─── chain.legs_one ───
  "chain.legs_one": "{{count}} レッグ",
  "chain.legs_other": "{{count}} レッグ",

  // ─── chain.legs_other ───

  // ─── chain.close ───
  "chain.close": "チェーンを閉じる",

  // ─── chain.lede ───
  "chain.lede": "<b>コール</b>か<b>プット</b>の仲値をタップすると、契約を買う、売る、取り消すことができます。\nチェーンの仲値とデルタは、ATM、25Δ プット、25Δ コールのボラティリティを基準にしたブラック・ショールズのスマイルから算出しています。\nIV 列は各ストライクでのスマイルの値です。スマイルは 2 本ではなく 1 本の曲線なので、同じ IV がそのストライクのコールとプットの両方を評価します。\nスポット（<b>{{spot}}</b>）に最も近い行が ATM として強調表示されます。",

  // ─── chain.dte ───
  "chain.dte": "残存 {{dte}} 日",

  // ─── chain.calls ───
  "chain.calls": "コール",

  // ─── chain.strikeIv ───
  "chain.strikeIv": "ストライク · IV",

  // ─── chain.puts ───
  "chain.puts": "プット",

  // ─── chain.mid ───
  "chain.mid": "仲値",

  // ─── chain.strike ───
  "chain.strike": "ストライク",

  // ─── chain.held ───
  "chain.held": "{{side}} · クリックで変更",

  // ─── chain.long ───
  "chain.long": "買い",

  // ─── chain.short ───
  "chain.short": "売り",

  // ─── chain.tapCall ───
  "chain.tapCall": "クリックでこのコールを買うか売る",

  // ─── chain.tapPut ───
  "chain.tapPut": "クリックでこのプットを買うか売る",

  // ─── chain.proposed ───
  "chain.proposed": "提案するストラクチャー",

  // ─── chain.clearTitle ───
  "chain.clearTitle": "すべてのレッグを消去",

  // ─── chain.clear ───
  "chain.clear": "消去",

  // ─── chain.noLegs ───
  "chain.noLegs": "まだレッグがありません。上のコールかプットの仲値をタップして組み立てを始めてください。",

  // ─── chain.buyCaps ───
  "chain.buyCaps": "買い",

  // ─── chain.sellCaps ───
  "chain.sellCaps": "売り",

  // ─── chain.fewer ───
  "chain.fewer": "契約数を減らす",

  // ─── chain.useRemove ───
  "chain.useRemove": "このレッグを外すには「取り消す」を使ってください",

  // ─── chain.oneFewer ───
  "chain.oneFewer": "契約を 1 つ減らす",

  // ─── chain.qty ───
  "chain.qty": "契約数",

  // ─── chain.more ───
  "chain.more": "契約数を増やす",

  // ─── chain.oneMore ───
  "chain.oneMore": "契約を 1 つ増やす",

  // ─── chain.net ───
  "chain.net": "正味プレミアム",

  // ─── chain.credit ───
  "chain.credit": "受取",

  // ─── chain.debit ───
  "chain.debit": "支払",

  // ─── chain.buy ───
  "chain.buy": "買う",

  // ─── chain.sell ───
  "chain.sell": "売る",

  // ─── chain.remove ───
  "chain.remove": "取り消す",

  // ─── chain.cancel ───
  "chain.cancel": "キャンセル",

  // ─── modeler.fiction ───
  "modeler.fiction": "架空の原資産です。外部のモデラーは実在する上場チェーンしか提示しないため、この損益は Optionality 独自のものです。",

  // ─── modeler.historical ───
  "modeler.historical": "このシナリオは過去の設定です。外部のモデラーはシナリオの日付ではなく今日のチェーンを提示するため、この損益は Optionality による再構成です。",

  // ─── modeler.noPreset ───
  "modeler.noPreset": "外部のモデラーにはこのストラクチャーのテンプレートがありません。上の損益で十分に表しています。",

  // ─── payoff.captionMulti ───
  "payoff.captionMulti": "直近の満期時点の損益 · 残存 {{dte}} 日 · 期先のレッグはブラック・ショールズで評価",

  // ─── payoff.caption ───
  "payoff.caption": "満期時点の損益 · 残存 {{dte}} 日",

  // ─── payoff.credit ───
  "payoff.credit": "受取 {{amount}}",

  // ─── payoff.debit ───
  "payoff.debit": "支払 {{amount}}",

  // ─── payoff.netEntry ───
  "payoff.netEntry": "正味の建て値",

  // ─── payoff.received ───
  "payoff.received": "受け取ったクレジット",

  // ─── payoff.paid ───
  "payoff.paid": "支払ったデビット",

  // ─── payoff.rr ───
  "payoff.rr": "リワード : リスク",

  // ─── payoff.undefined ───
  "payoff.undefined": "定義なし",

  // ─── payoff.breakeven ───
  "payoff.breakeven": "損益分岐点",

  // ─── payoff.verifyTitle ───
  "payoff.verifyTitle": "この {{structure}} を {{provider}} で開き、ライブのグリークス、IV、確率を見る",

  // ─── payoff.verify ───
  "payoff.verify": "{{provider}} で確認 ↗",

  // ─── payoff.verifyNote ───
  "payoff.verifyNote": "実際のチェーンでのライブのグリークス · IV · 確率",

  // ─── payoff.ticket ───
  "payoff.ticket": "注文票",

  // ─── payoff.copyTitle ───
  "payoff.copyTitle": "このブローカー形式の注文票をクリップボードにコピー",

  // ─── payoff.copied ───
  "payoff.copied": "コピーしました ✓",

  // ─── payoff.copy ───
  "payoff.copy": "コピー",

  // ─── payoff.try ───
  "payoff.try": "例のストラクチャーを試す",

  // ─── payoff.tryHint ───
  "payoff.tryHint": " · 提出用ではなく学習用の例です",

  // ─── payoff.presetsCaption ───
  "payoff.presetsCaption": "提出用ではなく学習用の例です。プレミアムは実際のチェーンから取得しており、自分でこれらのストライクをタップした場合と同じ数字です。",

  // ─── presets.0 ───
  "presets.0": "OTM プットを売り、より低いプットを買う。強気のクレジットスプレッド。",

  // ─── presets.1 ───
  "presets.1": "OTM コールを売り、より高いコールを買う。弱気のクレジットスプレッド。",

  // ─── presets.2 ───
  "presets.2": "両翼を売り、その外側の両翼を買う。広いレンジ想定。",

  // ─── presets.3 ───
  "presets.3": "ATM ストラドルを売り、遠い OTM の両翼を買う。価格の張り付きを狙う取引。",

  // ─── presets.4 ───
  "presets.4": "ATM コールと ATM プットを買う。イベント前のボラティリティ狙い。",

  // ─── presets.5 ───
  "presets.5": "OTM コールと OTM プットを売る。レンジでのプレミアム獲得。",

  // ─── presets.6 ───
  "presets.6": "期近の ATM コールを売り、同じストライクの期先を買う。",

  // ─── presets.7 ───
  "presets.7": "期近の ATM プットを売り、同じストライクの期先を買う。",

  // ─── presets.8 ───
  "presets.8": "期先の深い ITM コールを買い、期近の OTM コールを売る。",

  // ─── payoff.replaceTitle ───
  "payoff.replaceTitle": "現在のレッグを置き換えますか？",

  // ─── payoff.replaceBody_one ───
  "payoff.replaceBody_one": "<b>{{preset}}</b> を読み込むと、現在の {{count}} レッグがテンプレートのストラクチャーに置き換わり、プレミアムはライブのチェーンから取得されます。",
  "payoff.replaceBody_other": "<b>{{preset}}</b> を読み込むと、現在の {{count}} レッグがテンプレートのストラクチャーに置き換わり、プレミアムはライブのチェーンから取得されます。",

  // ─── payoff.replaceBody_other ───

  // ─── payoff.keep ───
  "payoff.keep": "今のレッグを残す",

  // ─── payoff.replace ───
  "payoff.replace": "{{preset}} に置き換える",

  // ─── skew.level ───
  "skew.level.none": "このシナリオには IV ランクがないため、ATM の IV（{{iv}}%）と、それが {{ticker}} にとって高いかどうかの自分の感覚で水準を判断してください。",
  "skew.level.rich": "IV ランク {{rank}}：プレミアムは {{ticker}} 自身の過去のレンジに比べて割高（高価）です。\n売り手には青信号で、今はどのオプションも高く売れます。\nどのストライクを売るかはスキューが教えてくれます。",
  "skew.level.mid": "IV ランク {{rank}}：プレミアムは中程度で、絶好の球でも品薄でもありません。\nシナリオのカタリストを頼りにし、相対的な価値がどこにあるかはスキューに決めさせましょう。",
  "skew.level.cheap": "IV ランク {{rank}}：プレミアムは {{ticker}} 自身のレンジに比べて割安です。\n売り手の取り分は薄く、曲線全体が低いので、スキューが魅力的に見える所でも慎重に選んでください。",

  // ─── skew.verdict ───
  "skew.verdict.flat": "このシナリオには 25Δ のスマイルの基準点がないため、ここでの曲線は ATM {{iv}}% の平らな IV です。水準だけで、形はありません。\n局面の背景はシナリオの skew_note を読んでください。",
  "skew.verdict.smirkWide": "逆スマーク（プットに買い需要）。\n買うプット（{{long}}）は売るプット（{{short}}）よりボラティリティがはっきり割高です。スキューがクレジットを削りますが、その翼は恐怖への対価です。\n本当の緩衝を得るには、最も急な部分より下で売ってください。",
  "skew.verdict.smirkNarrow": "逆スマーク（プットに買い需要）。\nスポットの近くではスキューは緩やかで、両方のレッグのボラティリティが近いため、クレジットはきれいです。\nただしアット・ザ・マネーに近いので、緩衝は薄くなります。\n典型的なトレードオフです。",
  "skew.verdict.forward": "順スキュー：ここで割高なのはコールの翼です。\n{{ticker}} のプットスプレッドには好都合で、取引するプットは安く平らな側にあります。\nこの曲線が織り込んでいる危険は暴落ではなく、上方向の急騰です。",
  "skew.verdict.symmetric": "ほぼ左右対称：両翼の IV は似ています。\nATM は深い谷でも大きく偏ってもいないので、スキューに翼の対価を期待するより、スポットやイベントの位置取りとして読んでください。",

  // ─── skew.trigger ───
  "skew.trigger": "スキューガイド",

  // ─── skew.close ───
  "skew.close": "ガイドを閉じる",

  // ─── skew.title ───
  "skew.title": "スキューのガイド",

  // ─── skew.lede ───
  "skew.lede": "インプライドボラティリティは一つの数字ではありません。ストライクにまたがる<em>曲線</em>で、市場がどこで恐怖に高値を払っているかを示す地図です。\nプレミアムの売り手にとっては保険が最も<em>割高</em>な場所を示し、このガイドでは一貫して<b>割高とは高価</b>（プレミアムが高い）という意味です。<em>売る</em>には良く、買うには悪いということです。\nオプションの保有者が儲かるという意味ではありません。",
  "skew.lede.smile": "下の曲線は、このシナリオが価格付けに使う<em>そのままの</em>スマイルで、<b>{{who}}</b> のスポット <b>{{spot}}</b>、ATM 30 日 IV <b>{{iv}}%</b>、25Δ プット IV <b>{{put}}%</b>、25Δ コール IV <b>{{call}}%</b> を基準にしています。\nオプションチェーンが各ストライクの価格を出すのと同じスマイルです。",
  "skew.lede.flat": "このシナリオは構造化したスマイルの基準点を記録する前に作られたため、下の曲線はすべてのストライクで <b>{{iv}}%</b> の平らな IV を示します。<em>水準だけで、形はありません</em>。\n局面の背景はシナリオの skew_note を読んでください。",

  // ─── skew.aria ───
  "skew.aria": "{{ticker}} のインプライドボラティリティのスキュー曲線",

  // ─── skew.put25 ───
  "skew.put25": "25Δ プット",

  // ─── skew.call25 ───
  "skew.call25": "25Δ コール",

  // ─── skew.chip ───
  "skew.chip": "25Δ {{value}} pt",

  // ─── skew.leg ───
  "skew.leg.long": "買い {{strike}}",
  "skew.leg.short": "売り {{strike}}",

  // ─── skew.axis ───
  "skew.axis.spot": "スポット",
  "skew.axis.strike": "ストライク",
  "skew.axis.iv": "インプライドボラティリティ",

  // ─── skew.legend ───
  "skew.legend.curve": "IV 曲線",
  "skew.legend.short": "売りプット",
  "skew.legend.long": "買いプット",
  "skew.legend.wings": "25Δ の両翼（スキュー）",
  "skew.legend.spot": "スポット ≈ {{spot}}",

  // ─── skew.slider ───
  "skew.slider": "売りストライク（売るプット）：ドラッグして曲線に沿って下げます",

  // ─── skew.wide ───
  "skew.wide": "幅 {{width}}",

  // ─── skew.read ───
  "skew.read.shortIv": "売りプットの IV",
  "skew.read.longIv": "買いプットの IV",
  "skew.read.gap": "スキューの差（レッグ間）",
  "skew.read.fear": "25Δ スキュー（恐怖の目安）",

  // ─── skew.pts ───
  "skew.pts": "{{value}} pt",

  // ─── skew.card ───
  "skew.card.reverse.tag": "株式と指数：標準的な形",
  "skew.card.reverse.title": "逆スキュー（スマーク）",
  "skew.card.reverse.body": "ストライクが下がるほど IV が上がります。<put>OTM のプットが一覧で最も高いオプションです。</put>\n市場は常に暴落への備えを求めており、ヘッジ需要が下側の IV を押し上げます。\nブルプットスプレッドが生きるのはこの世界です。",
  "skew.card.smile.tag": "為替、個別銘柄、イベント前",
  "skew.card.smile.title": "ボラティリティ・スマイル",
  "skew.card.smile.body": "両翼が上がり、ATM が安い谷になります。\n市場ははっきりした偏りなく、<em>どちらかへの大きな動き</em>を恐れています。\n値飛びのリスクが上下両方にある二択のイベント（決算、FOMC、CPI の発表）の前に典型的です。",
  "skew.card.forward.tag": "商品：原油、ガス、穀物",
  "skew.card.forward.title": "順スキュー",
  "skew.card.forward.body": "ストライクが<em>上がる</em>ほど IV が上がります。<call>OTM のコールが一覧で最も高いオプションです</call>。恐れられているのは<em>上方向</em>の衝撃、つまり価格を急騰させる供給の途絶だからです。\nエネルギー銘柄はこの局面に近いところにいます。",
  "skew.card.delta.tag": "実際に見るべき数字",
  "skew.card.delta.title": "25 デルタ・スキュー",
  "skew.card.delta.body": "傾き = <b>25Δ プットの IV − 25Δ コールの IV</b>。\n差が広がるのは、恐怖がプットの翼を押し上げている（ストレス）ということです。\n差が縮むのは油断です。\n今この銘柄がどれほど恐れられているかを最もはっきり読めます。",

  // ─── skew.sell ───
  "skew.sell.title": "プレミアムを売るときに重要な理由",
  "skew.sell.intro": "あなたは保険を買うのではなく、引き受けるのです。\nしかし売り手は実は<b>二つの別々の問い</b>を立てていて、<em>スキューが答えるのは二つ目だけです。</em>",

  // ─── skew.q ───
  "skew.q.head.question": "問い",
  "skew.q.head.answered": "答えるもの",
  "skew.q.head.card": "このカードでは",
  "skew.q.rich": "「今、そもそもプレミアムは<em>割高</em>か？」",
  "skew.q.richBy": "<b>IV の水準 + IV ランク</b>：曲線全体の高さ",
  "skew.q.card": "IV 30 日 {{iv}}%",
  "skew.q.cardRank": "IV 30 日 {{iv}}%、IV ランク {{rank}}",
  "skew.q.which": "「<em>どのストライク</em>で、どのストラクチャーなら、最も多く手元に残せるか？」",
  "skew.q.whichBy": "<b>スキュー</b>：ストライクにまたがる曲線の<em>形</em>",
  "skew.q.curve": "上の曲線",

  // ─── skew.levelPays ───
  "skew.levelPays": "<b>あなたに報いるのは水準です。スキューは、その報酬がストライクにどう配分され、どのストラクチャーがそれを取り込み、どれが手放すかを決めるだけです。</b>\n割高（高価）な曲線は、どこのオプションも高く売れるということです。スキューは、払い過ぎがどこに集中しているかを示す保険数理表です。",

  // ─── skew.step1 ───
  "skew.step1": "ステップ 1 · 水準を読む（やるか、やらないか）",

  // ─── skew.step2 ───
  "skew.step2": "ステップ 2 · 形を読む、そしてスプレッドの落とし穴",
  "skew.step2.intro": "水準が「やる」と言ったら、スキューが<em>どうやるか</em>を教えます。\n売り手の二つのストラクチャーは、スキューを正反対に使います：",
  "skew.step2.csp": "<b>現金担保プット</b>（プットを単独で売る）：急なプットスキューは純粋な<em>追い風</em>です。\n一覧で最も割高で恐怖に買われたオプションを受け取り、それを丸ごと手元に残せます。",
  "skew.step2.bps": "<b>ブルプットスプレッド</b>（高いプットを売り、低いプットを買う）：ここでは急なスキューは<em>税金</em>です。\n<b>買う</b>プットは<b>売る</b>プットより曲線の高い位置にあるため、高く払って安く受け取ることになります。\nスキューが急なほど、正味のクレジットは小さくなります。\nその目減りしたクレジットが、上限のある限定リスクの代償です。\n売りストライクを下げていくと、<b>スキューの差</b>の表示がまさにそうなるのを確かめてください。",

  // ─── skew.fearOpportunity ───
  "skew.fearOpportunity": "ですから、<gold>「恐怖＝機会」</gold>とスプレッドの落とし穴は矛盾しません。\n恐怖に買われたプットの翼は<em>絶対的なプレミアムが高い</em>ということ（良いこと：より多く受け取れる）であり、その翼の<em>傾き</em>は、スプレッドがリスクの上限と引き換えに返すものです。\nどちらのストラクチャーでも強みは同じです。市場が織り込む恐怖が<b>価格は持ちこたえるという自分の確信より割高な</b>所で売ってください。",

  // ─── skew.check ───
  "skew.check.title": "実践的な読み方のチェックリスト",
  "skew.check.see": "見えるもの",
  "skew.check.means": "意味すること",
  "skew.check.move": "売り手の一手",
  "skew.check.0.see": "高い IV ランク + 急なプットスキュー",
  "skew.check.0.means": "プレミアムが割高（高価）で、しかもその割高さがプットにある",
  "skew.check.0.move": "教科書どおりの売り手の形：売るべき割高な翼があり、水準も高く売れると言っている",
  "skew.check.1.see": "急なプットスキュー",
  "skew.check.1.means": "暴落への恐怖が高く値付けされている",
  "skew.check.1.move": "プットのプレミアムは厚い：売りストライクを傾斜の最も急な部分より<em>下</em>に置き、価格がまだ避ける余地のあるストライクで、恐怖に買われたプレミアムを受け取る",
  "skew.check.2.see": "平らなスキュー",
  "skew.check.2.means": "油断",
  "skew.check.2.move": "プレミアムは薄く、緩衝もほとんど織り込まれていない：慎重に選ぶ",
  "skew.check.3.see": "スキューが急速に急になる",
  "skew.check.3.means": "ストレスが高まっている",
  "skew.check.3.move": "IV が拡大している：参入の窓が開きつつある",
  "skew.check.4.see": "スマイルが形成されている",
  "skew.check.4.means": "二択のイベントが迫っている",
  "skew.check.4.move": "上下両方に値飛びのリスク：その間は売りのままでいない",
  "skew.check.5.see": "順スキュー（エネルギー）",
  "skew.check.5.means": "上方向の衝撃が恐れられている",
  "skew.check.5.move": "コールが割高な翼で、プットは比較的安く売れる",

  // ─── skew.foot ───
  "skew.foot.smile": "この曲線は、このシナリオが価格付けに使う 3 点基準のスマイルそのものです。ATM IV {{iv}}%、25Δ プット IV {{put}}%、25Δ コール IV {{call}}%、{{ticker}} のスポット {{spot}} を基準にしています。\nオプションチェーンの表は、各ストライクをこの同じスマイルから価格付けしています。\nインプライドボラティリティは市場の先読みであって予測ではありません。値の付いた心理として読んでください。",
  "skew.foot.flat": "このシナリオは構造化したスマイルの基準点より前のものなので、曲線はすべてのストライクで {{iv}}% の平らな IV です（形ではなく水準）。\n新しいシナリオを受け取るまでは、局面の背景をシナリオの skew_note で読んでください。",

  // ─── sample.label ───
  "sample.label": "サンプル · 説明用",

  // ─── sample.title ───
  "sample.title": "Optionality のピッチ評価はこのようになります。",

  // ─── sample.intro ───
  "sample.intro": "本番のラウンドは、選んだモードとペルソナに基づいてファームが毎回新しく作ります。\nそれを第二の LLM が 6 つの観点で採点し、ジャーナルに保存します。\nこの例は固定です。2023 年 3 月の機会、クレジットのプットスプレッドのピッチ、そして評価全体です。\nsats を払う前に、ゲームの内容を知るために使ってください。\nファームのシナリオと評価は英語で書かれます。",

  // ─── sample.scenario ───
  "sample.scenario": "シナリオ · {{date}}",

  // ─── sample.maxLoss ───
  "sample.maxLoss": "最大損失の枠",

  // ─── sample.pitch ───
  "sample.pitch": "受講者のピッチ",

  // ─── dm.failed ───
  "dm.failed": "DM を送信できませんでした。",

  // ─── dm.titleSelf ───
  "dm.titleSelf": "自分に DM を送る",

  // ─── dm.title ───
  "dm.title": "DM を送る",

  // ─── dm.you ───
  "dm.you": "（あなた）",

  // ─── dm.selfNote ───
  "dm.selfNote": "自分宛ての DM は、自分の Nostr クライアントの受信箱に届きます。\n仲間に連絡せずに、NIP-07 の署名ツールとリレーの経路を端から端まで確認できます。",

  // ─── dm.loading ───
  "dm.loading": "共有のリレー一覧をまだ読み込んでいます。これを閉じて、少ししてからもう一度お試しください。",

  // ─── dm.close ───
  "dm.close": "閉じる",

  // ─── dm.placeholder ───
  "dm.placeholder": "メッセージを 1 通入力してください。受信者は自分の Nostr クライアントで読みます。",

  // ─── dm.escrowNote ───
  "dm.escrowNote": "運営者が管理する保管場所にある、預けた nsec で Optionality が署名します。\nDM はあなたの npub の投稿として Nostr に表示されます。\n鍵は <b>プロフィール → ゲームペルソナ鍵</b> でいつでも引き出せます。",

  // ─── dm.nip07Note_one ───
  "dm.nip07Note_one": "NIP-07 拡張機能がこの端末で署名します。nsec が Optionality に届くことはありません。\n共有の DPYC 一覧から <b>{{count}}</b> 件のリレーに公開します。",
  "dm.nip07Note_other": "NIP-07 拡張機能がこの端末で署名します。nsec が Optionality に届くことはありません。\n共有の DPYC 一覧から <b>{{count}}</b> 件のリレーに公開します。",

  // ─── dm.nip07Note_other ───

  // ─── dm.cancel ───
  "dm.cancel": "キャンセル",

  // ─── dm.send ───
  "dm.send": "署名して送信",

  // ─── dm.sending ───
  "dm.sending": "暗号化、署名、配信しています…",

  // ─── dm.sent ───
  "dm.sent": "✓ 送信しました",

  // ─── dm.notAccepted ───
  "dm.notAccepted": "✗ 受け付けられませんでした",

  // ─── dm.relays ───
  "dm.relays": "{{ok}} / {{total}} リレー",

  // ─── dm.perRelay ───
  "dm.perRelay": "リレーごとの結果",

  // ─── dm.eventNote ───
  "dm.eventNote": "イベント ID <id>{{id}}…</id>。これらのリレーのいずれかを購読している Nostr クライアントなら、受信者に表示されます。",

  // ─── dm.serverNote ───
  "dm.serverNote": "DM は Optionality のリレー網を通って送られています。受信者は自分の Nostr クライアントで読めます。",

  // ─── dm.done ───
  "dm.done": "完了",

  // ─── dm.tryAgain ───
  "dm.tryAgain": "もう一度",

  // ─── dm.install ───
  "dm.install": "DM を送るには <b>Nostr の署名拡張機能をインストールしてください</b>。\nOptionality が nsec を見ることはありません。拡張機能が自分のサンドボックス内で DM に署名し、暗号化されたメッセージはリレーへ直接届きます。",

  // ─── dm.alby ───
  "dm.alby": "ブラウザ拡張機能 + iOS / Android。Lightning ウォレットも付いています。",

  // ─── dm.nos2x ───
  "dm.nos2x": "Chrome / Firefox 向けの最小限の拡張機能。NIP-07 のみで、ウォレットはありません。",

  // ─── dm.flamingo ───
  "dm.flamingo": "nsec を包む iOS / デスクトップ用アプリ。ウェブページに NIP-07 を提供します。",

  // ─── nostr.badNpub ───
  "nostr.badNpub": "有効な npub ではありません：{{npub}}",

  // ─── nostr.noRelays ───
  "nostr.noRelays": "リレーが設定されていません。プロフィール → Nostr リレーで 1 つ以上追加してください。",

  // ─── nostr.noSigner ───
  "nostr.noSigner": "NIP-07 の署名ツールが見つかりません。Alby、nos2x、Flamingo のいずれかをインストールしてください。",

  // ─── nostr.empty ───
  "nostr.empty": "メッセージを空にはできません。",

  // ─── glossary.delta_neutral ───
  "glossary.delta_neutral": "正味のデルタがほぼゼロのポジション。組んだ時点で方向による損益が打ち消し合います。利益は価格の方向ではなく、ベガ、セータ、ガンマから生まれます。",

  // ─── glossary.iron_condor ───
  "glossary.iron_condor": "同じ満期で OTM のコールスプレッドと OTM のプットスプレッドを売ります。リスク限定のプレミアム獲得取引で、原資産が両方の売りストライクの内側にとどまれば利益になります。",

  // ─── glossary.iron_butterfly ───
  "glossary.iron_butterfly": "ATM のストラドルを売り、保護用の OTM の両翼を買います。売りストラドルのリスク限定版で、原資産が売りストライクに張り付けば最大利益です。",

  // ─── glossary.jade_lizard ───
  "glossary.jade_lizard": "コールスプレッドの売り + プットの売りで、合計プレミアムがコールスプレッドの幅を上回るもの。上昇側のリスクはなく、下落側は売りプットの位置で限られます。",

  // ─── glossary.calendar_spread ───
  "glossary.calendar_spread": "期近のオプションを売り、同じストライクの期先を買います。期近のレッグのセータと、期先のレッグのベガ上昇から利益を得ます。",

  // ─── glossary.diagonal_spread ───
  "glossary.diagonal_spread": "ストライクの異なるカレンダースプレッド。時間差のボラティリティ取引に方向性の傾きを加えます。",

  // ─── glossary.ratio_spread ───
  "glossary.ratio_spread": "オプションを 1 つ買い、同じ種類でより OTM のものを 2 つ（以上）売ります。安く、あるいはクレジットで建てられますが、原資産が売りストライクを大きく超えるとテールリスクがあります。",

  // ─── glossary.vertical_spread ───
  "glossary.vertical_spread": "オプションを 1 つ買い、同じ種類・同じ満期で別のストライクのものを売ります。リスクも利益も限定。ブルコール / ベアプット / ベアコール / ブルプット。",

  // ─── glossary.credit_spread ───
  "glossary.credit_spread": "売るオプションのプレミアムが買うものより高いバーティカル。建てたときにプレミアムを受け取ります。原資産が売りストライクから離れていれば利益です。",

  // ─── glossary.debit_spread ───
  "glossary.debit_spread": "買うオプションが売るものより高いバーティカル。建てたときに支払います。原資産が買いストライクに向かえば利益です。",

  // ─── glossary.short_strangle ───
  "glossary.short_strangle": "OTM のコールと OTM のプットを売ります。上下どちらにもリスクは無限で、そのリスクを負う代わりに 2 つのプレミアムを受け取ります。",

  // ─── glossary.short_straddle ───
  "glossary.short_straddle": "ATM のコールと ATM のプットを売ります。プレミアムの受け取りは最大、ガンマリスクも最大で、小さな動きでもすぐに損失が出ます。",

  // ─── glossary.long_straddle ───
  "glossary.long_straddle": "ATM のコールと ATM のプットを買います。どちらの方向でも急激な動きで利益になりますが、原資産が動かなければセータで目減りします。",

  // ─── glossary.long_strangle ───
  "glossary.long_strangle": "OTM のコールと OTM のプットを買います。ストラドルより安いですが、利益を出すにはより大きな動きが必要です。",

  // ─── glossary.covered_call ───
  "glossary.covered_call": "株の保有 + より高いストライクのコールの売り。ストライクより上の値上がりをあきらめる代わりに、プレミアムと小さな緩衝を得ます。",

  // ─── glossary.cash_secured_put ───
  "glossary.cash_secured_put": "割り当てられたら株を買えるよう現金を用意したプットの売り。より低い実質コストで株の買いポジションに入る、辛抱強い方法です。",

  // ─── glossary.protective_put ───
  "glossary.protective_put": "株の保有 + プットの買い。下落への保険で、費用はプットのプレミアムです。",

  // ─── glossary.put_spread ───
  "glossary.put_spread": "プットを使ったバーティカルスプレッド。ベアプット＝デビットを払い、下落で利益。ブルプット＝クレジットを受け取り、売りストライクの上にとどまれば利益。",

  // ─── glossary.call_spread ───
  "glossary.call_spread": "コールを使ったバーティカルスプレッド。ブルコール＝デビットを払い、上昇で利益。ベアコール＝クレジットを受け取り、売りストライクの下にとどまれば利益。",

  // ─── glossary.iv_crush ───
  "glossary.iv_crush": "イベント（決算、FDA、FOMC）の後にインプライドボラティリティが急落すること。ボラティリティの買いは損失、売りは利益になります。",

  // ─── glossary.vol_crush ───
  "glossary.vol_crush": "IV クラッシュと同じ考え方です。イベント後にインプライドボラティリティが崩れ、方向に関係なくオプションのプレミアムがしぼみます。",

  // ─── glossary.vol_regime ───
  "glossary.vol_regime": "取引を取り巻くボラティリティの環境。実現と予想、IV ランク、期間構造の形、スキュー。プレミアムを買うか売るかを決めます。",

  // ─── glossary.iv_rank ───
  "glossary.iv_rank": "現在のインプライドボラティリティが過去 1 年のレンジのどこにあるかを 0〜100 で表したもの。高ければプレミアムの売りが、低ければ買いやカレンダーが有利です。",

  // ─── glossary.skew ───
  "glossary.skew": "ストライクによるインプライドボラティリティの差。株式のスキュー＝プットがコールより割高。逆スキュー（商品）＝コールが割高。",

  // ─── glossary.term_structure ───
  "glossary.term_structure": "満期によるインプライドボラティリティの違い。コンタンゴ＝期先が高い（落ち着いた市場）。バックワーデーション＝期近が高い（ストレス）。",

  // ─── glossary.gamma_risk ───
  "glossary.gamma_risk": "ヘッジが追いつかないほど速くデルタが変わるリスク。ガンマの売りポジションは、変動が激しく荒れた相場で損失を出します。",

  // ─── glossary.vega_exposure ───
  "glossary.vega_exposure": "インプライドボラティリティの変化への感応度。ベガの買い＝IV が上がれば利益。ベガの売り＝IV が下がれば利益。",

  // ─── glossary.theta_decay ───
  "glossary.theta_decay": "オプションの売り手が受け取り、買い手が払う、毎日のプレミアムの目減り。満期が近づくほど加速します。",

  // ─── glossary.delta ───
  "glossary.delta": "原資産が 1 ドル動いたときのオプション価格のおおよその変化。ITM で終わる確率の目安にもなります。",

  // ─── glossary.gamma ───
  "glossary.gamma": "デルタの変化の速さ。ガンマが高い＝デルタが速く振れます。オプションの買い手には有利、ストライク付近の売り手には不利です。",

  // ─── glossary.vega ───
  "glossary.vega": "インプライドボラティリティが 1 ポイント変わったときのオプション価格の変化。買ったオプションのベガはプラス、売ったオプションはマイナスです。",

  // ─── glossary.theta ───
  "glossary.theta": "オプションの時間価値が毎日減っていく量。買ったオプションはセータを払い、売ったオプションは受け取ります。",

  // ─── glossary.rho ───
  "glossary.rho": "無リスク金利の変化に対するオプション価格の感応度。期先のオプションほど大きく、期近では無視できることが多いです。",

  // ─── glossary.moneyness ───
  "glossary.moneyness": "オプションのストライクがスポットからどれだけ離れているか。ITM（イン・ザ・マネー）、ATM（アット・ザ・マネー）、OTM（アウト・オブ・ザ・マネー）。OTM の度合いはデルタに影響します。",

  // ─── glossary.breakeven ───
  "glossary.breakeven": "満期時に取引の損益がちょうどゼロになる原資産の価格。複数レッグのストラクチャーでは 2 つあることもあります（コンドルなど）。",

  // ─── glossary.max_loss ───
  "glossary.max_loss": "最後まで保有した場合の、満期時の最悪の結果。リスク限定のストラクチャーは上限が明確で、ネイキッドの売りは最大損失が無制限です。",

  // ─── glossary.max_gain ───
  "glossary.max_gain": "満期時の最良の結果。プレミアムの買いでは無制限（コール）または大きく（プット）、売りでは受け取ったクレジットです。",

  // ─── glossary.dte ───
  "glossary.dte": "満期までの日数。セータの加速とベガへのエクスポージャーを左右します。21 日未満のストラクチャーはたいていガンマ主導、45 日超はたいていベガ主導です。",

  // ─── glossary.assignment_risk ───
  "glossary.assignment_risk": "売ったオプションが早期に行使され、株の受け渡しを迫られるリスク。満期近くや配当落ち日の前後に最も高くなります。",

  // ─── glossary.pin_risk ───
  "glossary.pin_risk": "満期に原資産がちょうど売りストライクで引け、割り当てられるかどうかわからなくなるリスク。",

  // ─── glossary.expected_move ───
  "glossary.expected_move": "一定期間における原資産のおおよその 1 シグマの値幅。ストラドルの価格や、インプライドボラティリティ × √時間から求めることが多いです。",

  // ─── glossary.atm_straddle ───
  "glossary.atm_straddle": "アット・ザ・マネーのコールとプットを買うか売るかします。ATM ストラドルの買いは「大きく動くと思う」ときの典型的な取引です。",

  // ─── glossary.wheel_strategy ───
  "glossary.wheel_strategy": "持ってもよい株に現金担保のプットを売り、割り当てられたら売り渡されるまでカバードコールを売ります。それを繰り返します。プレミアムを地道に稼ぐ手法です。",

  // ─── glossary.chartLink ───
  "glossary.chartLink": "TradingView で {{symbol}} のチャートを開く",

  // ─── chart.underlying ───
  "chart.underlying": "原資産  {{price}}",

  // ─── chart.net ───
  "chart.net": "正味損益",

  // ─── chart.alt ───
  "chart.alt": "代替の損益",

  // ─── chart.spot ───
  "chart.spot": "スポット",
};

export default words;
