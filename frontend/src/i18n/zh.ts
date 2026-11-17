/**
 * Every word Optionality's own pages say, 中文.
 * Keys, {{places}} and <tags> are those of en.ts.
 */

import type { Translation } from "./en.ts";

const words: Translation = {
  // ─── game.journal ───
  "game.journal.col.symbol": "代码",
  "game.journal.col.historicity": "历史性",
  "game.journal.col.difficulty": "难度",
  "game.journal.col.created": "创建",
  "game.journal.col.updated": "更新",
  "game.journal.col.grade": "等级",
  "game.journal.col.score": "分数",
  "game.journal.col.status": "状态",
  "game.journal.group.none": "不分组",

  // ─── game.tool ───
  "game.tool.deal_scenario": "交易场景",
  "game.tool.judge_trade": "推介评估",
  "game.tool.ask_tip": "请求提示",
  "game.tool.save_draft": "保存草稿",
  "game.tool.purchase_credits": "充值",
  "game.tool.check_payment": "支付查询",
  "game.tool.check_balance": "余额查询",
  "game.tool.check_price": "价格预览",
  "game.tool.get_leaderboard": "排行榜",
  "game.tool.get_my_rank": "我的排名",
  "game.tool.get_journal": "日志查询",
  "game.tool.list_journal": "日志列表",
  "game.tool.delete_journal": "日志删除",
  "game.tool.set_display_name": "显示名称",
  "game.tool.get_api_usage_stats": "API 用量",
  "game.tool.account_statement": "账户对账单",
  "game.tool.request_npub_proof": "登录（请求）",
  "game.tool.receive_npub_proof": "登录（验证）",

  // ─── game.difficulty ───
  "game.difficulty.apprentice.label": "学徒",
  "game.difficulty.apprentice.blurb": "清晰的方向性设定。普通的宏观背景。",
  "game.difficulty.journeyman.label": "熟手",
  "game.difficulty.journeyman.blurb": "波动率状态很重要。财报、美联储日、单一催化剂。",
  "game.difficulty.adept.label": "行家",
  "game.difficulty.adept.blurb": "多因素。跨资产相关性。偏斜与期限结构。",
  "game.difficulty.sovereign.label": "君主",
  "game.difficulty.sovereign.blurb": "体制转变的时代。货币贬值、地缘政治、尾部对冲。",
  "game.difficulty.mulligan.label": "重来",

  // ─── game.mode ───
  "game.mode.historical.label": "历史虚构",
  "game.mode.historical.blurb": "锚定市场历史上的真实时刻。宏观真实；数字经过校准。",
  "game.mode.fiction.label": "虚构",
  "game.mode.fiction.blurb": "纯属虚构。近未来假设、反事实、投机性情境。",
  "game.mode.live.label": "实时事件",
  "game.mode.live.blurb": "通过网络搜索立足今日的真实市场。真实代码、真实催化剂、此时此刻。",

  // ─── game.sector ───
  "game.sector.any": "任意",
  "game.sector.biotech": "生物科技",
  "game.sector.semis": "半导体",
  "game.sector.megaTech": "科技巨头",
  "game.sector.banks": "银行",
  "game.sector.energy": "能源",
  "game.sector.miners": "矿业",
  "game.sector.consumer": "消费",
  "game.sector.homebuilders": "住宅建筑",
  "game.sector.defense": "国防",
  "game.sector.airlines": "航空",
  "game.sector.crypto": "加密相关股票",
  "game.sector.index": "指数/ETF",

  // ─── game.dimension ───
  "game.dimension.strategy_selection": "结构",
  "game.dimension.strikes_and_tenor": "行权价与期限",
  "game.dimension.risk_reward": "风险 / 回报",
  "game.dimension.macro_integration": "宏观背景",
  "game.dimension.tail_risk": "尾部意识",
  "game.dimension.communication": "表达",

  // ─── game.zoom ───
  "game.zoom.title": "点按以更大字体阅读",

  // ─── game.loading ───
  "game.loading.tape": "正在解读行情",
  "game.loading.wire": "正在收听快讯",
  "game.loading.judging": "正在评审你的推介",
  "game.loading.reissuing": "正在重新发放场景",

  // ─── game.error ───
  "game.error.agedOut": "你回来之前那个任务已过期。没有收取费用。请重新领取一个。",
  "game.error.recover": "无法恢复那个任务。{{message}}",
  "game.error.start": "无法开始场景。{{message}}",
  "game.error.typeFirst": "请先写下你的交易。",
  "game.error.noScenario": "没有进行中的场景。请先领取一个新的。",
  "game.error.notInJournal": "那个场景已不在你的日志里，因此无法评审。请领取一个新的来推介。没有收取费用。",
  "game.error.evaluation": "评估失败。{{message}}",
  "game.error.noScenarioToSave": "没有可供保存的进行中场景。",
  "game.error.save": "保存失败。{{message}}",
  "game.error.acceptFirst": "请先接受挑战再请求提示。",
  "game.error.clue": "请求提示失败。{{message}}",
  "game.error.replay": "重玩失败。{{message}}",
  "game.error.nothingToResume": "这个条目没有可继续的场景。",

  // ─── game.entry ───
  "game.entry.yourTrade": "你的交易",
  "game.entry.headline": "一句话结论",
  "game.entry.riskProfile": "风险曲线",
  "game.entry.alternative": "替代方案",
  "game.entry.deeper": "更深的背景",
  "game.entry.redoTitle": "将这个场景作为重来再次发放：同样的设定，新的推介",
  "game.entry.redo": "再来一次",
  "game.entry.sharedTitle": "已在你的排行榜行中分享。点击设为私密。",
  "game.entry.shareTitle": "在你的排行榜行中分享这次推介，让同伴可以比较",
  "game.entry.shared": "✓ 已分享",
  "game.entry.share": "分享",
  "game.entry.visibleToAll": "所有人可见",
  "game.entry.resumeDraftTitle": "你有一份已保存的草稿。在交易池中继续，完成并推介它。不发新场景，不收费。",
  "game.entry.resumeTitle": "在交易池中继续这个未完成的场景，推介一笔交易并获得评估。不发新场景，不收费。",
  "game.entry.resume": "🙋 继续",
  "game.entry.noReview": "条目状态：{{status}}。没有推介评估。",

  // ─── game.brand ───
  "game.brand.tagline": "游戏化期权交易顾问训练器",

  // ─── game.stats ───
  "game.stats.sessions": "场次",
  "game.stats.avg": "平均分",
  "game.stats.best": "最佳",
  "game.stats.streak": "连胜",

  // ─── game.balance ───
  "game.balance.title": "充值：通过比特币闪电网络购买聪",
  "game.balance.label": "余额",
  "game.balance.sats": " 聪",
  "game.balance.topUp": "＋ 充值",

  // ─── game.signOut ───
  "game.signOut.title": "退出：清除保存的 npub 和证明令牌",
  "game.signOut.label": "退出",

  // ─── game.tab ───
  "game.tab.welcome": "欢迎",
  "game.tab.play": "交易池",
  "game.tab.sample": "查看评估",
  "game.tab.journal": "日志",
  "game.tab.leaderboard": "排行榜",
  "game.tab.usage": "用量",
  "game.tab.profile": "个人资料",

  // ─── game.openingFloor ───
  "game.openingFloor": "正在开启交易大厅",

  // ─── game.guest ───
  "game.guest.label": "访客通行证",
  "game.guest.welcome": "欢迎，访客交易员 <id>{{id}}</id>。",
  "game.guest.body": "网站已上线，但在购买 DPYC 代币之前，你只能使用免费服务。\n前往<b>用量</b>标签查看你的账户并购买代币。\n接受挑战、请求提示和接受评估都是付费服务，但费用很低：每项只需几聪。\n有了 Nostr 凭证后，你就可以在这里充值。\n然后你可以完成挑战、保存进行中的工作，并给排行榜上的同伴发消息。\n多加练习，你会更善于向专业听众推介期权交易。\n欢迎。",
  "game.guest.signIn": "登录开始玩 →",

  // ─── game.briefing ───
  "game.briefing.label": "简报",
  "game.briefing.title": "交易台已开放。",
  "game.briefing.prose": "公司向你呈现一个机会：市场中的某个时刻，可能是真实的，可能是虚构的，也可能正在发生。\n你会看到一个日期、宏观背景、一个标的、一个催化剂、关键价位以及你账户的约束。\n像读法庭案卷一样去读它。\n然后用自己的话写下你的交易：结构、行权价、到期日、仓位规模和你的理由。",
  "game.briefing.integration": "<b>整合会得到奖励。</b> 好的回答会考虑公司摆在你面前的政治、货币和跨资产事实。\n你在论点中融入的相关事实越多，得分越高，尤其是在宏观背景这一维度。",
  "game.briefing.herrings": "<b>设有干扰信息。</b> 公司会埋入一两条完全真实、但与理想交易无关的事实。\n它们是现实世界的噪音，交易者有理由注意到并过度看重。\n一条偏斜说明可能只是点缀，而非催化剂。\n一条头条新闻可能早已反映在价格中。\n一个已披露的头寸可能已经过时。\n它们是关联性的陷阱，从来不是虚假的陷阱。\n把论点建立在它们之上会扣分；识别出它们是噪音并放在一边则会加分。",
  "game.briefing.coda": "选择你的历史性。选择你的角色。接受挑战。",

  // ─── game.chooser ───
  "game.chooser.historicity": "历史性",
  "game.chooser.persona": "角色",
  "game.chooser.risk": "风险范围",
  "game.chooser.maxLoss": "每笔交易最大亏损：",
  "game.chooser.optional": "可选",
  "game.chooser.clear": "清除",
  "game.chooser.maxLossHint": "可选。设定后，公司会调整机会的账户规模和约束，使一个选得好的结构能落在你的范围内。最坏情况超出范围的交易，评审会扣分。",
  "game.chooser.sector": "行业",
  "game.chooser.sectorLimit": "把发牌员限定在{{sector}}",
  "game.chooser.sectorAny": "让发牌员任选行业",
  "game.chooser.customSector": "或输入自定义行业：",
  "game.chooser.customExample": "例如 奢侈品",
  "game.chooser.sectorHint": "可选。公司从所选行业中挑选标的，并按其特性调整催化剂、相关事实和干扰信息。",

  // ─── game.topUp ───
  "game.topUp.title": "通过比特币闪电网络向运营者购买聪",
  "game.topUp.label": "充值",

  // ─── game.toll ───
  "game.toll.label": "费用",

  // ─── game.sats_one ───
  "game.sats_one": "{{count}} 聪",
  "game.sats_other": "{{count}} 聪",

  // ─── game.sats_other ───

  // ─── game.toll ───
  "game.toll.noModel": "定价模型还没有倍数。请在这个运营者上运行 reset_pricing_model。",

  // ─── game.signInToPlayTitle ───
  "game.signInToPlayTitle": "用你的 Nostr 身份登录以领取交易场景",

  // ─── game.signInToPlay ───
  "game.signInToPlay": "登录开始玩",

  // ─── game.deal ───
  "game.deal.another": "再来一个",
  "game.deal.challenge": "接受挑战",
  "game.deal.watchTitle": "回到你最新场景的“正在解读行情”画面",
  "game.deal.preparing_one": "已有 {{count}} 个场景在准备中。查看 ›",
  "game.deal.preparing_other": "已有 {{count}} 个场景在准备中。查看 ›",
  "game.deal.confirmPriced": "再来一个？每个场景单独收取 {{price}} 聪的费用。",
  "game.deal.confirm": "再来一个？每个场景单独收费。",
  "game.deal.yes": "是的，再来一个",
  "game.deal.notYet": "暂时不",

  // ─── game.card ───
  "game.card.macro": "宏观背景",
  "game.card.skewNote": "偏斜说明",
  "game.card.catalyst": "催化剂",
  "game.card.keyLevels": "关键价位",
  "game.card.constraints": "约束",
  "game.card.question": "问题",
  "game.card.sources": "来源",
  "game.card.spot": "现价",
  "game.card.iv30": "IV 30 天",
  "game.card.ivRank": "IV 排名",
  "game.card.skew": "偏斜 · ",

  // ─── game.pitch ───
  "game.pitch.saveTitle": "把这份草稿保存在你的日志条目中，页面重新加载后仍会保留",
  "game.pitch.save": "保存草稿",
  "game.pitch.discardTitle": "放弃这个场景并另选一个。场景费用不予退还，所以会请你确认。",
  "game.pitch.discard": "放弃场景",
  "game.pitch.placeholder": "例如：以 1.20 的权利金收入卖出 30 天的 95/90 看跌价差，规模控制在承担净资产 0.5% 的风险。美联储的鹰派按兵不动为美元托底，但内部人买入支撑着股价；在 200 日均线下方收取权利金显得不对称……",
  "game.pitch.presentTitle": "把你的交易呈交给资深投资经理评审，并接受评分的推介审计",
  "game.pitch.present": "提交推介",
  "game.pitch.saved": "✓ 草稿已于 {{time}} 保存",

  // ─── game.clue ───
  "game.clue.heading": "请求提示",
  "game.clue.hint": "付一点小费，想问什么都行。例如 <q>“你说的看涨期权偏斜是什么意思？”</q>",
  "game.clue.copied": "已复制到剪贴板",
  "game.clue.copyTitle": "把这段提示对话复制到剪贴板，在你自己的 Claude.ai 会话中继续",
  "game.clue.copy": "复制对话",
  "game.clue.q": "问 · {{question}}",
  "game.clue.placeholder": "输入你的问题…",
  "game.clue.asking": "正在询问提示台…",
  "game.clue.sendTitle": "发送这个问题。需支付少量提示费。",
  "game.clue.send": "发送问题",

  // ─── game.review ───
  "game.review.label": "推介评估",
  "game.review.overall": "总分",
  "game.review.byDimension": "分维度",
  "game.review.right": "你做对的地方",
  "game.review.sharpen": "需要打磨的地方",
  "game.review.alternative": "公司本会采用的替代方案",
  "game.review.replayTitle": "返回场景选择",
  "game.review.replay": "🔁 再玩一次",

  // ─── game.ledger ───
  "game.ledger.label": "DPYC 账本",
  "game.ledger.title": "聪余额与 MCP 工具用量",
  "game.ledger.intro": "你在 Optionality MCP 的余额、过去 30 天的花费和购买，以及聪用在了哪些工具上。\n费用在调用时扣除；运营者的账目在每次结算后写入 Neon。",
  "game.ledger.tools": "MCP 工具用量：过去 30 天",
  "game.ledger.empty": "过去 30 天没有付费工具调用。",
  "game.ledger.health": "账户健康",

  // ─── game.ai ───
  "game.ai.refresh": "刷新 API 用量",
  "game.ai.label": "用量",
  "game.ai.title": "AI 用量及其花费",
  "game.ai.intro": "Optionality 为每个场景、提示和裁定调用一次模型。\n这是你的工具调用消耗的令牌，以及服务商实际向运营者收取的费用。\n你的费用涵盖这部分，加上运营者的开销。\n没有隐藏利润。",
  "game.ai.estimated": "标为“估”的数字早于按次成本记录，由公开价格推算（取于 {{date}}）；其余是服务商实际收取的金额。",
  "game.ai.reported": "成本是服务商自己按次给出的数字，不是估算。",
  "game.ai.tallying": "正在汇总收据",
  "game.ai.none": "还没有记录到模型调用。去接受一个挑战吧。",
  "game.ai.unknown": "未知",
  "game.ai.runs": "调用：",
  "game.ai.input": "输入：",
  "game.ai.output": "输出：",
  "game.ai.cost": "成本：",
  "game.ai.costEst": "成本（估）：",
  "game.ai.perCall": "每次：",
  "game.ai.costPartEst": "AI 成本（部分为估算）",
  "game.ai.costBilled": "实际收取的 AI 成本",
  "game.ai.tokens": "{{calls}} 次模型调用共 {{tokens}} 个令牌",
  "game.ai.costPerCall": "每次调用成本",
  "game.ai.averaged": "所有场景、提示和裁定的平均值",
  "game.ai.sats": "折合聪",
  "game.ai.atRate": "按约 {{rate}}/BTC",
  "game.ai.footnote": "运营者通过闪电网络微支付把 AI 成本转给用户。\n这里是原始的透明数据：每个场景、提示和裁定的实际成本，以及按 {{rate}}/BTC 固定参考汇率折合的聪数。\n这个汇率是用于比较的标尺，不是今天的行情。",

  // ─── game.lb ───
  "game.lb.label": "排行榜",
  "game.lb.title": "自主交易者，按水平排序",
  "game.lb.intro": "定价模型是唯一的调节旋钮：一个高难度、高价格且得分高的推介，排在低价且得分高的推介前面。\n运营者重新调整某个倍数（重来、君主或任何一个）后，下一次排行榜重算会对每个条目应用新权重，不会有快照偏离。\n默认按加权平均排序；也可以看原始分数。",
  "game.lb.sort.weighted_avg": "加权平均",
  "game.lb.sort.weighted_best": "加权最佳",
  "game.lb.sort.avg": "原始平均",
  "game.lb.sort.best": "原始最佳",
  "game.lb.sort.streak": "连胜",
  "game.lb.sort.played": "场数",
  "game.lb.loading": "加载中…",
  "game.lb.refresh": "刷新",
  "game.lb.failed": "排行榜没有加载出来。{{error}}",
  "game.lb.unknownError": "未知错误。",
  "game.lb.empty": "还没有已评审的交易。来做第一个吧。",
  "game.lb.trader": "交易者",
  "game.lb.wavg": "加权均",
  "game.lb.wavgTitle": "加权平均：原始分 × 难度倍数",
  "game.lb.wbest": "加权佳",
  "game.lb.wbestTitle": "加权后的单次最佳推介",
  "game.lb.avg": "平均",
  "game.lb.avgTitle": "所有已评估推介的原始平均分",
  "game.lb.streak": "连胜",
  "game.lb.played": "场数",
  "game.lb.rowTitle": "点击查看这位交易者分享的推介",
  "game.lb.dmSelf": "给自己发私信：测试中继路径",
  "game.lb.dm": "私信 {{name}}",
  "game.lb.anonymous": "匿名",
  "game.lb.you": "你",
  "game.lb.last": "  ·  最近：{{date}}",
  "game.lb.fetching": "正在获取分享的推介",
  "game.lb.youNone": "你还没有分享任何推介。打开一个已评估的日志条目，然后点按“分享”。",
  "game.lb.theyNone": "这位交易者还没有分享任何推介。",
  "game.lb.yourShared": "你分享的推介 · {{count}}",
  "game.lb.shared": "分享的推介 · {{count}}",
  "game.lb.theirPitch": "对方的推介",
  "game.lb.houseAlt": "公司的替代方案",

  // ─── game.journal ───
  "game.journal.label": "日志",
  "game.journal.title": "你的书房",
  "game.journal.intro": "欢迎来到你的书房。\n在这里你可以回顾之前的提案，重读评估，并继续那些开了头却不得不搁置的推介。",
  "game.journal.introNamed": "欢迎来到你的书房，{{name}}。\n在这里你可以回顾之前的提案，重读评估，并继续那些开了头却不得不搁置的推介。",

  // ─── game.prep ───
  "game.prep.heading": "准备中的场景 · {{count}}",
  "game.prep.rowTitle": "回到这个场景的“正在解读行情”画面",
  "game.prep.watch": "查看 ›",
  "game.prep.note": "公司在后台构思这些场景，所以你可以离开再回来。\n某个准备好后会从这个列表消失，并在下方显示为可领取的未完成条目。",

  // ─── game.journal ───
  "game.journal.pulling": "正在获取场次",
  "game.journal.emptyPreparing": "还没有完成的场次。你的场景仍在上方准备中。",
  "game.journal.empty": "还没有场次。去领取你的第一个交易场景吧。",
  "game.journal.groupBy": "分组",
  "game.journal.flipGroups": "反转分组顺序",
  "game.journal.groupsAsc": "分组 ▲",
  "game.journal.groupsDesc": "分组 ▼",
  "game.journal.sortBy": "排序",
  "game.journal.flipSort": "反转排序方向",
  "game.journal.sortedAsc": "当前升序。切换为降序。",
  "game.journal.sortedDesc": "当前降序。切换为升序。",
  "game.journal.asc": "▲ 升序",
  "game.journal.desc": "▼ 降序",
  "game.journal.sessions_one": "{{count}} 场",
  "game.journal.sessions_other": "{{count}} 场",
  "game.journal.avg": " · 平均 {{score}}",

  // ─── game.status ───
  "game.status.open": "未完成",
  "game.status.evaluated": "已评估",

  // ─── game.journal ───
  "game.journal.sharedTag": "· 已分享",
  "game.journal.deleteTitle": "永久删除这场",
  "game.journal.delete": "删除场次",
  "game.journal.loadingEntry": "正在加载条目",

  // ─── game.discard ───
  "game.discard.title": "放弃这个场景？",
  "game.discard.body": "放弃后你可以选择一个新场景。\n每个场景都用到付费的外部 LLM 处理，所以这一个的费用无法退还。\n你确定要放弃这个场景并另选一个吗？",
  "game.discard.keep": "保留这个场景",
  "game.discard.confirm": "放弃并另选",

  // ─── game.delete ───
  "game.delete.title": "永久删除这场？",
  "game.delete.body": "你即将永久删除你的 <b>{{ticker}}</b> 场次。\n场景、你的推介、评估、分数以及由此获得的排行榜位置都会<b>永久清除</b>。\n此操作无法撤销，之后也无法恢复。",
  "game.delete.bodyGraded": "你即将永久删除你的 <b>{{ticker}}</b> 场次（等级 {{grade}}）。\n场景、你的推介、评估、分数以及由此获得的排行榜位置都会<b>永久清除</b>。\n此操作无法撤销，之后也无法恢复。",
  "game.delete.this": "这个",
  "game.delete.keep": "保留",
  "game.delete.deleting": "正在删除…",
  "game.delete.confirm": "永久删除",

  // ─── game.zoom ───
  "game.zoom.copyTitle": "把这段文字复制到剪贴板",
  "game.zoom.copy": "复制文字",
  "game.zoom.closeTitle": "关闭（Esc）",
  "game.zoom.close": "关闭",

  // ─── game.status ───
  "game.status.submitted": "已提交",
  "game.status.abandoned": "已放弃",

  // ─── app.lapsed ───
  "app.lapsed": "你离开期间登录已过期。请重新登录以继续。",

  // ─── signIn.welcome ───
  "signIn.welcome": "一个代理式期权交易训练器。公司构思机会，你撰写推介，评审为你的纪律打分。",

  // ─── signIn.nsecHint ───
  "signIn.nsecHint": "用 nsec 登录？它会留在这个浏览器里，为每次调用签名。\nOptionality 也会保存一份加密副本，以便为你的私信签名。\n你随时可以在个人资料中取回它。\n如果是你自行保管的身份，请改用 npub 登录。",

  // ─── signIn.or ───
  "signIn.or": "或",

  // ─── signIn.guest ───
  "signIn.guest": "以访客身份继续",

  // ─── signIn.guestHint ───
  "signIn.guestHint": "访客可以浏览选择页、简报和示例评估。",

  // ─── signIn.footnote ───
  "signIn.footnote": "Optionality™ 是构建在 <link>Tollbooth-DPYC™</link> 之上的代理式期权交易游戏：为 AI 代理提供比特币闪电网络微支付和 Nostr 身份。",

  // ─── welcome.guestName ───
  "welcome.guestName": "访客 {{id}}",

  // ─── welcome.anonymous ───
  "welcome.anonymous": "匿名访客",

  // ─── welcome.label ───
  "welcome.label": "欢迎",

  // ─── welcome.greeting ───
  "welcome.greeting": "欢迎，<name>{{name}}</name>。",

  // ─── welcome.signedInAs ───
  "welcome.signedInAs": " 已登录为 <npub>{{npub}}</npub>。",

  // ─── welcome.why ───
  "welcome.why": "为什么选择 Optionality。",

  // ─── welcome.why1 ───
  "welcome.why1": "Optionality™ 是一种游戏化、基于场景的学习方式，面向想成为熟练期权交易者的人。\n它不讲定价数学和平台操作这些常规课程。\n它用故事吸引你，要求你给出清晰、可执行的交易及其背后的理由。",

  // ─── welcome.why2 ───
  "welcome.why2": "你对行话不熟，被要求描述你的策略和当前交易想法时会语塞。\n你想看清更大的世界局势，并在压力下提出有说服力的交易建议。\n但你的想法模糊，你追逐高回报，而且在情况发生之前说不出自己会怎么做。\nOptionality™ 帮你学习稳健的策略，融入世界大事，并提升你描述策略的能力。",

  // ─── welcome.why3 ───
  "welcome.why3": "Optionality™ 扮演你的投资公司，也就是“公司”。\n它借助现代 AI 服务，向你呈现有挑战性的模拟世界场景，给你思考的机会，然后让你提出交易。\n公司的审计员从结构选择、行权价与期限、风险/回报、宏观整合和尾部风险几方面为你的提案打分。\n这些反馈帮助你改进叙述式的提案。\n久而久之，你就能迅速而出色地构思、呈现并执行更明智的交易。",

  // ─── welcome.play ───
  "welcome.play.label": "玩法",
  "welcome.play.round": "一轮",
  "welcome.play.1": "<b>接受挑战。</b> 选择一种历史性（历史、虚构或实时）、一个角色（学徒 → 君主），也可以设定最大亏损范围。费用随你选择的难度而增加。",
  "welcome.play.2": "<b>阅读场景。</b> 标的、现价、IV、偏斜、关键价位、催化剂、你账户的约束，以及几条埋下的干扰信息，看你能否分辨噪音和真正重要的东西。",
  "welcome.play.3": "<b>推介交易。</b> 自由书写。写明结构、行权价、期限、仓位规模和你的理由。",
  "welcome.play.4": "<b>阅读评估。</b> 一句话的标题结论、五个维度的得分、已整合事实的清单、公司本会采用的替代交易、风险曲线图和更深的背景。",
  "welcome.play.5": "<b>重玩过去的场景</b>：想再看一次时，从日志中选择。同样的设定，新的推介，单独记录。",

  // ─── welcome.toll ───
  "welcome.toll": "费用",
  "welcome.toll.fair": "Optionality™ 按使用量公平计价。\n不用就不付钱：没有订阅，也没有 KYC。\n价格跟随每个场景实际的生成和评分成本。\n简单的场景用的 LLM 令牌少；要求高的场景，比如带网络搜索的实时行情或君主难度，用得多。\n即使最复杂的场景，费用也只有几百聪。",
  "welcome.toll.inspect": "运营者直接设定每个倍数，你有余额后可以在<b>用量</b>标签中自己查看。\n以下是此刻从实时定价模型取得的数据：",
  "welcome.toll.cheap": "最简单的场景（虚构 × 学徒）：<b>{{price}}</b>",
  "welcome.toll.expensive": "要求最高的场景（实时行情 × 君主，完整网络搜索）：<b>{{price}}</b>",
  "welcome.toll.pitch": "推介审计：<b>{{price}}</b>",
  "welcome.toll.session": "在中等难度下进行约 30 轮评分，大约需要 {{sats}} 聪，约合 {{usd}} 的 BTC。\n充值通过闪电网络发票购买聪；Wallet of Satoshi、Phoenix、Mutiny 或任何闪电钱包都可以。",
  "welcome.toll.fallback": "Optionality™ 按使用量公平计价：不用就不付钱。\n难度和模式会改变费用；你有余额后可以在<b>用量</b>标签中查看每个倍数。\n充值通过闪电网络发票购买聪；Wallet of Satoshi、Phoenix、Mutiny 或任何闪电钱包都可以。",
  "welcome.toll.unreachable": "（暂时无法连接定价模型，无法给出具体数字。）",

  // ─── welcome.economy ───
  "welcome.economy.label": "经济机制",
  "welcome.economy.title": "Optionality 运行在 Tollbooth-DPYC™ 之上",
  "welcome.economy.intro": "Optionality 是构建在 <dpyc>Tollbooth-DPYC™ →</dpyc> 之上的代理式期权交易游戏，这是一套为收费 AI 服务打造的比特币闪电网络 + Nostr 技术栈。\n治理规则、认证运营者和社区登记都公开在 <community>github.com/lonniev/dpyc-community →</community>。\n有三个特性值得一提：",
  "welcome.economy.identity": "<b>自主身份。</b> 你用 Nostr 密钥对登录，而不是电子邮件和密码。\n你的 nsec 是唯一凭证：没有 KYC，也没有平台发放的账户。\n只有在你要求时，Optionality 才会保存一份加密副本（个人资料 → 游戏角色密钥），你随时可以取回。",
  "welcome.economy.pricing": "<b>无需重新部署的动态定价。</b> 运营者的工具价格保存在定价模型中，而不是写在代码里。\n难度和模式的倍数实时调整，你可以在用量标签中自己核对。\n排行榜用同样的机制为得分加权。",
  "welcome.economy.money": "<b>健全的货币。</b> 法币通道上的微支付在经济上行不通：光是交换费就超过了 1 聪的费用。\n比特币闪电网络让每次 AI 工具调用都收费变得轻而易举。\n预付的闪电余额、每次调用的原子结算，以及没有托管方在链下持有你的支出，正是这些让 Optionality 这样的服务得以运转。",

  // ─── welcome.ready ───
  "welcome.ready": "准备好了吗？",
  "welcome.ready.guest": "先看看吧：<b>查看评估</b>标签展示了一整轮评分，让你在加入前了解游戏的内容。\n想真正开始推介交易时，请用 Nostr 身份登录。",
  "welcome.ready.guestPriced": "先看看吧：<b>查看评估</b>标签展示了一整轮评分，让你在加入前了解游戏的内容。\n想真正开始推介交易时，请用 Nostr 身份登录，并充值约 {{usd}} 的 BTC。",
  "welcome.ready.patron": "先看看吧：<b>查看评估</b>标签展示了一整轮评分，让你在投入聪之前了解游戏的内容。\n想真正开始推介交易时：",

  // ─── welcome.seeAssessment ───
  "welcome.seeAssessment": "查看评估",

  // ─── welcome.signInToPlay ───
  "welcome.signInToPlay": "登录开始玩",

  // ─── welcome.topUpPriced ───
  "welcome.topUpPriced": "充值：约 {{usd}} 即可开始",

  // ─── welcome.topUp ───
  "welcome.topUp": "充值",

  // ─── profile.label ───
  "profile.label": "个人资料",

  // ─── profile.title ───
  "profile.title": "你的自主身份。",

  // ─── profile.intro ───
  "profile.intro": "你的资料保存在 Nostr kind-0 元数据中，从中继读取，并显示在每个 Nostr 客户端里。\n修改在你的浏览器中签名后再转发；你的密钥从不离开这台设备。",

  // ─── profile.tz ───
  "profile.tz.label": "时区",
  "profile.tz.title": "所有时钟，一个时区。",
  "profile.tz.intro": "Optionality 上的每个日期都按这个时区显示。它只保存在这个浏览器里，不会发布或分享。",

  // ─── profile.theme ───
  "profile.theme.label": "偏好设置",
  "profile.theme.title": "Optionality 在你眼中的样子。",
  "profile.theme.intro": "只保存在这个浏览器里，不会发布或分享。",
  "profile.theme.dark": "🌑 深色",
  "profile.theme.light": "☀ 浅色",

  // ─── profile.language ───
  "profile.language.label": "语言",
  "profile.language.title": "这些页面上的文字。",
  "profile.language.intro": "保存在这个浏览器里。公司给出的场景、提示和评估仍为英文。",

  // ─── profile.build ───
  "profile.build.label": "构建与许可",
  "profile.build.title": "开源代码，私人商业。",
  "profile.build.intro": "Optionality 和 Tollbooth-DPYC™ 以 Apache License 2.0 开源发布：任何人都可以阅读代码、分叉并运行自己的运营者。\n运行在这些代码上的<i>服务</i>是私人商业：每个运营者自定费用和定价模型，用户预付闪电余额并按次付费。\n协议是共享的，基于它的生意不是。",

  // ─── profile.key ───
  "profile.key.notNsec": "这看起来不像 bech32 的 nsec1… 字符串。",
  "profile.key.depositFailed": "存入失败。",
  "profile.key.ackMismatch": "确认语句不完全一致。",
  "profile.key.withdrawFailed": "取回失败。",
  "profile.key.label": "游戏角色密钥",
  "profile.key.title": "nsec 托管",
  "profile.key.intro": "如果你的 npub 是专为 Optionality 新建的，你可以把 nsec 交给运营者，由服务器替你为 Nostr 私信签名，无需签名扩展（适合 iPad）。\nnsec 以 AES-256-GCM 加密存储。\n<b>不要在这里粘贴你真实的 Nostr 身份</b>，只用新建的游戏角色。",
  "profile.key.deposit": "存入 nsec",
  "profile.key.encrypting": "正在加密…",
  "profile.key.depositBtn": "存入",
  "profile.key.held": "✓ 由 Optionality 保管（在保险库中加密）。发给其他用户的私信经由服务器签名，无需浏览器扩展。",
  "profile.key.withdraw": "取回并自行保管",
  "profile.key.ackIntro": "请准确输入下面的语句以确认。\nnsec 只显示一次供你复制，之后 Optionality 会将其删除。\n取回后，你需要 Nostr 签名扩展（Alby、nos2x）才能发送私信。\n服务器会逐字核对，所以语句保持英文。",
  "profile.key.ack": "确认",
  "profile.key.cancel": "取消",
  "profile.key.withdrawing": "正在取回…",
  "profile.key.confirm": "确认取回",
  "profile.key.copyNow": "<b>请立即复制你的 nsec。</b> Optionality 已从保险库中删除它。\n这是它唯一一次显示。\n请把它保存在 Nostr 客户端（0xchat、Damus、Amber）或密码管理器中。",
  "profile.key.copy": "复制",
  "profile.key.saved": "我已保存",

  // ─── clock.left ───
  "clock.left": "还剩约 {{clock}}",

  // ─── clock.wrapping ───
  "clock.wrapping": "即将完成…",

  // ─── deal.preparing ───
  "deal.preparing": "公司正在准备你的任务",

  // ─── deal.elapsed ───
  "deal.elapsed": "已用时",

  // ─── deal.estimate ───
  "deal.estimate": "预计",

  // ─── deal.claim ───
  "deal.claim": "取件号",

  // ─── deal.reassure ───
  "deal.reassure": "慢慢来：你可以离开这个页面。\n任务准备好后会进入你的<b>日志</b>，即使网络断开，也会从中断处继续。",

  // ─── deal.claimInJournal ───
  "deal.claimInJournal": "到日志中领取",

  // ─── deal.live ───
  "deal.live": "实时模式会搜索网络，可能需要几分钟。",

  // ─── lib.quotes ───
  "lib.quotes.0": "健全的货币是保护公民自由、抵御政府专制侵犯的工具。",
  "lib.quotes.1": "经济学的奇特任务，是向人们表明，他们对自以为能设计的东西其实知之甚少。",
  "lib.quotes.2": "传统货币的根本问题在于，要让它运转需要大量的信任。",
  "lib.quotes.3": "在把货币从政府手中拿走之前，我不相信我们还能再拥有好的货币。",
  "lib.quotes.4": "通货膨胀是未经立法的征税。",

  // ─── judge.title ───
  "judge.title": "正在评审你的推介",

  // ─── judge.sub ───
  "judge.sub": "正在权衡提案的六个维度",

  // ─── judge.dim ───
  "judge.dim.tail": "尾部风险",

  // ─── ledger.title ───
  "ledger.title": "事实清单",

  // ─── ledger.integrated ───
  "ledger.integrated": "你整合的事实",

  // ─── ledger.integratedNone ───
  "ledger.integratedNone": "没有。试着直接引用相关事实。",

  // ─── ledger.missed ───
  "ledger.missed": "你漏掉的相关事实",

  // ─── ledger.missedNone ───
  "ledger.missedNone": "全部命中：你处理了所有重要事实。",

  // ─── ledger.caught ───
  "ledger.caught": "你搁置的干扰信息",

  // ─── ledger.caughtNone ───
  "ledger.caughtNone": "无记录。",

  // ─── ledger.followed ───
  "ledger.followed": "牵动你论点的干扰信息",

  // ─── ledger.followedNone ───
  "ledger.followedNone": "没有。你把噪音挡在了论点之外。",

  // ─── legs.side ───
  "legs.side": "方向",

  // ─── legs.type ───
  "legs.type": "类型",

  // ─── legs.strike ───
  "legs.strike": "行权价",

  // ─── legs.dte ───
  "legs.dte": "剩余天数",

  // ─── legs.premium ───
  "legs.premium": "权利金",

  // ─── legs.qty ───
  "legs.qty": "数量",

  // ─── legs.long ───
  "legs.long": "买入",

  // ─── legs.short ───
  "legs.short": "卖出",

  // ─── legs.call ───
  "legs.call": "看涨",

  // ─── legs.put ───
  "legs.put": "看跌",

  // ─── legs.days ───
  "legs.days": "{{days}} 天",

  // ─── risk.noLegs ───
  "risk.noLegs": "没有解析出结构化的交易腿，因此无法显示图表。单纯的股票或债券头寸以及无法解析的交易不显示图表。",

  // ─── risk.days ───
  "risk.days": "持仓天数：{{days}} 天",

  // ─── risk.entry ───
  "risk.entry": "（建仓）",

  // ─── risk.expiration ───
  "risk.expiration": "（到期）",

  // ─── risk.overlay ───
  "risk.overlay": "叠加显示替代交易",

  // ─── risk.maxProfit ───
  "risk.maxProfit": "最大盈利",

  // ─── risk.maxLoss ───
  "risk.maxLoss": "最大亏损",

  // ─── risk.unlimited ───
  "risk.unlimited": "无限",

  // ─── risk.breakeven_one ───
  "risk.breakeven_one": "盈亏平衡点",
  "risk.breakeven_other": "盈亏平衡点",

  // ─── risk.breakeven_other ───

  // ─── risk.iv ───
  "risk.iv": "所用 IV",

  // ─── risk.r ───
  "risk.r": "假定 r",

  // ─── risk.footnote ───
  "risk.footnote": "不含股息的布莱克-斯科尔斯模型。\n无风险利率固定为 4.5%。\n波动率按场景 IV 保持不变；不模拟真实的波动率变化。\n每条腿的数量按解析结果，乘数为 100 股。",

  // ─── risk.parsed ───
  "risk.parsed": "解析出的交易腿",

  // ─── risk.yours ───
  "risk.yours": "你的交易",

  // ─── risk.alt ───
  "risk.alt": "替代交易",

  // ─── chain.triggerTitle ───
  "chain.triggerTitle": "弹出完整的期权链：点按中间价即可买入、卖出或移除",

  // ─── chain.title ───
  "chain.title": "期权链",

  // ─── chain.legs_one ───
  "chain.legs_one": "{{count}} 条腿",
  "chain.legs_other": "{{count}} 条腿",

  // ─── chain.legs_other ───

  // ─── chain.close ───
  "chain.close": "关闭期权链",

  // ─── chain.lede ───
  "chain.lede": "点按<b>看涨</b>或<b>看跌</b>的中间价，即可买入、卖出或移除一份合约。\n期权链的中间价和 Delta 来自布莱克-斯科尔斯微笑曲线，以平值、25Δ 看跌和 25Δ 看涨波动率为锚。\nIV 列读取每个行权价处的微笑值：同一个 IV 为该行权价的看涨和看跌定价，因为微笑是一条曲线，而不是两条。\n最接近现价（<b>{{spot}}</b>）的一行标为平值。",

  // ─── chain.dte ───
  "chain.dte": "剩余 {{dte}} 天",

  // ─── chain.calls ───
  "chain.calls": "看涨",

  // ─── chain.strikeIv ───
  "chain.strikeIv": "行权价 · IV",

  // ─── chain.puts ───
  "chain.puts": "看跌",

  // ─── chain.mid ───
  "chain.mid": "中间价",

  // ─── chain.strike ───
  "chain.strike": "行权价",

  // ─── chain.held ───
  "chain.held": "{{side}} · 点击更改",

  // ─── chain.long ───
  "chain.long": "买入",

  // ─── chain.short ───
  "chain.short": "卖出",

  // ─── chain.tapCall ───
  "chain.tapCall": "点击买入或卖出这个看涨期权",

  // ─── chain.tapPut ───
  "chain.tapPut": "点击买入或卖出这个看跌期权",

  // ─── chain.proposed ───
  "chain.proposed": "拟定结构",

  // ─── chain.clearTitle ───
  "chain.clearTitle": "清除所有交易腿",

  // ─── chain.clear ───
  "chain.clear": "清除",

  // ─── chain.noLegs ───
  "chain.noLegs": "还没有交易腿。点按上方的看涨或看跌中间价开始搭建。",

  // ─── chain.buyCaps ───
  "chain.buyCaps": "买入",

  // ─── chain.sellCaps ───
  "chain.sellCaps": "卖出",

  // ─── chain.fewer ───
  "chain.fewer": "减少合约",

  // ─── chain.useRemove ───
  "chain.useRemove": "用“移除”去掉这条腿",

  // ─── chain.oneFewer ───
  "chain.oneFewer": "减少一份合约",

  // ─── chain.qty ───
  "chain.qty": "合约数量",

  // ─── chain.more ───
  "chain.more": "增加合约",

  // ─── chain.oneMore ───
  "chain.oneMore": "增加一份合约",

  // ─── chain.net ───
  "chain.net": "净权利金",

  // ─── chain.credit ───
  "chain.credit": "收入",

  // ─── chain.debit ───
  "chain.debit": "支出",

  // ─── chain.buy ───
  "chain.buy": "买入",

  // ─── chain.sell ───
  "chain.sell": "卖出",

  // ─── chain.remove ───
  "chain.remove": "移除",

  // ─── chain.cancel ───
  "chain.cancel": "取消",

  // ─── modeler.fiction ───
  "modeler.fiction": "虚构的标的：外部建模工具只为真实上市的期权链报价，所以这条收益曲线是 Optionality 自己的。",

  // ─── modeler.historical ───
  "modeler.historical": "这个场景发生在过去。外部建模工具报的是今天的期权链，而非场景日期的，所以这条收益曲线是 Optionality 的重建。",

  // ─── modeler.noPreset ───
  "modeler.noPreset": "外部建模工具没有这种结构的模板；上方的收益曲线已经涵盖了它。",

  // ─── payoff.captionMulti ───
  "payoff.captionMulti": "最近到期时的盈亏 · 剩余 {{dte}} 天 · 远期腿按布莱克-斯科尔斯估值",

  // ─── payoff.caption ───
  "payoff.caption": "到期时的盈亏 · 剩余 {{dte}} 天",

  // ─── payoff.credit ───
  "payoff.credit": "收入 {{amount}}",

  // ─── payoff.debit ───
  "payoff.debit": "支出 {{amount}}",

  // ─── payoff.netEntry ───
  "payoff.netEntry": "净建仓",

  // ─── payoff.received ───
  "payoff.received": "收到的权利金",

  // ─── payoff.paid ───
  "payoff.paid": "支付的权利金",

  // ─── payoff.rr ───
  "payoff.rr": "回报 : 风险",

  // ─── payoff.undefined ───
  "payoff.undefined": "无定义",

  // ─── payoff.breakeven ───
  "payoff.breakeven": "盈亏平衡点",

  // ─── payoff.verifyTitle ───
  "payoff.verifyTitle": "在 {{provider}} 上打开这个{{structure}}，查看实时希腊值、IV 和概率",

  // ─── payoff.verify ───
  "payoff.verify": "在 {{provider}} 上核实 ↗",

  // ─── payoff.verifyNote ───
  "payoff.verifyNote": "真实期权链上的实时希腊值 · IV · 概率",

  // ─── payoff.ticket ───
  "payoff.ticket": "委托单",

  // ─── payoff.copyTitle ───
  "payoff.copyTitle": "把这张经纪商风格的委托单复制到剪贴板",

  // ─── payoff.copied ───
  "payoff.copied": "已复制 ✓",

  // ─── payoff.copy ───
  "payoff.copy": "复制",

  // ─── payoff.try ───
  "payoff.try": "试试示例结构",

  // ─── payoff.tryHint ───
  "payoff.tryHint": " · 用于学习的示例，不用于提交",

  // ─── payoff.presetsCaption ───
  "payoff.presetsCaption": "用于学习的示例，不用于提交。权利金来自真实的期权链：和你自己点按这些行权价时看到的数字一样。",

  // ─── presets.0 ───
  "presets.0": "卖出虚值看跌 + 买入更低的看跌。看涨的收入型价差。",

  // ─── presets.1 ───
  "presets.1": "卖出虚值看涨 + 买入更高的看涨。看跌的收入型价差。",

  // ─── presets.2 ───
  "presets.2": "两翼卖出，更外侧的两翼买入。宽区间震荡。",

  // ─── presets.3 ───
  "presets.3": "卖出平值跨式 + 买入远端虚值两翼。押注价格钉住的窄幅交易。",

  // ─── presets.4 ───
  "presets.4": "买入平值看涨 + 买入平值看跌。事件前的波动率交易。",

  // ─── presets.5 ───
  "presets.5": "卖出虚值看涨 + 卖出虚值看跌。区间内收取权利金。",

  // ─── presets.6 ───
  "presets.6": "卖出近月平值看涨 + 买入同行权价的远月看涨。",

  // ─── presets.7 ───
  "presets.7": "卖出近月平值看跌 + 买入同行权价的远月看跌。",

  // ─── presets.8 ───
  "presets.8": "买入远月深度实值看涨 + 卖出近月虚值看涨。",

  // ─── payoff.replaceTitle ───
  "payoff.replaceTitle": "替换当前的交易腿？",

  // ─── payoff.replaceBody_one ───
  "payoff.replaceBody_one": "加载 <b>{{preset}}</b> 会用模板结构替换你当前的 {{count}} 条腿，权利金取自实时期权链。",
  "payoff.replaceBody_other": "加载 <b>{{preset}}</b> 会用模板结构替换你当前的 {{count}} 条腿，权利金取自实时期权链。",

  // ─── payoff.replaceBody_other ───

  // ─── payoff.keep ───
  "payoff.keep": "保留我的交易腿",

  // ─── payoff.replace ───
  "payoff.replace": "替换为 {{preset}}",

  // ─── skew.level ───
  "skew.level.none": "这个场景没有提供 IV 排名，所以请根据平值 IV（{{iv}}%）以及你自己对这个水平在 {{ticker}} 上算不算高的判断来评估水平。",
  "skew.level.rich": "IV 排名 {{rank}}：相对 {{ticker}} 自身的近期区间，权利金偏贵。\n这是卖方的绿灯：眼下各类期权都卖得出好价钱。\n接下来由偏斜告诉你卖哪个行权价。",
  "skew.level.mid": "IV 排名 {{rank}}：权利金不高不低，既不是好球也不算荒年。\n倚重场景自身的催化剂，让偏斜决定相对价值在哪里。",
  "skew.level.cheap": "IV 排名 {{rank}}：相对 {{ticker}} 自身的区间，权利金偏便宜。\n卖方收益微薄；整条曲线都偏低，所以即使偏斜看起来诱人，也要更挑剔。",

  // ─── skew.verdict ───
  "skew.verdict.flat": "这个场景没有提供 25Δ 微笑锚点，所以这里的曲线是平值 {{iv}}% 的平坦 IV：只有水平，没有形态。\n请阅读场景的 skew_note 了解所处的情境。",
  "skew.verdict.smirkWide": "反向偏斜（看跌受追捧）。\n你买入的看跌（{{long}}）在波动率上明显比你卖出的（{{short}}）贵：偏斜侵蚀了你的权利金收入，但这一翼是为恐惧付费。\n在最陡的部分之下卖出，才能有真正的缓冲。",
  "skew.verdict.smirkNarrow": "反向偏斜（看跌受追捧）。\n在现价附近偏斜很平缓；两条腿的波动率相近，所以收入干净。\n但你离平值更近，缓冲也更薄。\n这是经典的取舍。",
  "skew.verdict.forward": "正向偏斜：这里偏贵的是看涨一翼。\n对 {{ticker}} 的看跌价差来说这是好事，因为你交易的看跌位于更便宜、更平坦的一侧。\n这条曲线定价的危险是向上的急涨，而不是崩跌。",
  "skew.verdict.symmetric": "大致对称：两翼的 IV 相近。\n平值既不是深谷，也没有明显偏向，所以把它当作现价或事件的定位来读，而不要指望偏斜为某一翼买单。",

  // ─── skew.trigger ───
  "skew.trigger": "偏斜指南",

  // ─── skew.close ───
  "skew.close": "关闭指南",

  // ─── skew.title ───
  "skew.title": "偏斜指南",

  // ─── skew.lede ───
  "skew.lede": "隐含波动率不是一个数字：它是一条跨越各行权价的<em>曲线</em>，一张显示市场在哪里为恐惧花大价钱的地图。\n对权利金卖方来说，它显示保险在哪里最<em>贵</em>；本指南中<b>“贵”就是价格高</b>（权利金高）：适合<em>卖出</em>，不适合买入。\n它从来不是说期权持有人会发财。",
  "skew.lede.smile": "下方的曲线就是这个场景定价所用的<em>实际</em>微笑，锚定在 <b>{{who}}</b> 现价 <b>{{spot}}</b>、平值 30 天 IV <b>{{iv}}%</b>、25Δ 看跌 IV <b>{{put}}%</b> 和 25Δ 看涨 IV <b>{{call}}%</b>。\n期权链正是用这同一条微笑为每个行权价定价。",
  "skew.lede.flat": "这个场景在记录结构化微笑锚点之前就已生成，所以下方曲线在所有行权价上都是 <b>{{iv}}%</b> 的平坦 IV：<em>只有水平，没有形态</em>。\n请阅读场景的 skew_note 了解所处的情境。",

  // ─── skew.aria ───
  "skew.aria": "{{ticker}} 的隐含波动率偏斜曲线",

  // ─── skew.put25 ───
  "skew.put25": "25Δ 看跌",

  // ─── skew.call25 ───
  "skew.call25": "25Δ 看涨",

  // ─── skew.chip ───
  "skew.chip": "25Δ {{value}} 点",

  // ─── skew.leg ───
  "skew.leg.long": "买入 {{strike}}",
  "skew.leg.short": "卖出 {{strike}}",

  // ─── skew.axis ───
  "skew.axis.spot": "现价",
  "skew.axis.strike": "行权价",
  "skew.axis.iv": "隐含波动率",

  // ─── skew.legend ───
  "skew.legend.curve": "IV 曲线",
  "skew.legend.short": "卖出的看跌",
  "skew.legend.long": "买入的看跌",
  "skew.legend.wings": "25Δ 两翼（偏斜）",
  "skew.legend.spot": "现价 ≈ {{spot}}",

  // ─── skew.slider ───
  "skew.slider": "卖出行权价（你卖出的看跌）：拖动它沿曲线往下走",

  // ─── skew.wide ───
  "skew.wide": "宽 {{width}}",

  // ─── skew.read ───
  "skew.read.shortIv": "卖出看跌的 IV",
  "skew.read.longIv": "买入看跌的 IV",
  "skew.read.gap": "偏斜差（腿与腿之间）",
  "skew.read.fear": "25Δ 偏斜（恐惧指标）",

  // ─── skew.pts ───
  "skew.pts": "{{value}} 点",

  // ─── skew.card ───
  "skew.card.reverse.tag": "股票与指数：默认形态",
  "skew.card.reverse.title": "反向偏斜（微笑偏斜）",
  "skew.card.reverse.body": "行权价越低，IV 越高。<put>虚值看跌是盘面上最贵的期权。</put>\n市场对崩盘保护的需求从未停止：对冲需求推高了下行一侧的 IV。\n牛市看跌价差就生活在这样的世界里。",
  "skew.card.smile.tag": "外汇、个股、事件之前",
  "skew.card.smile.title": "波动率微笑",
  "skew.card.smile.body": "两翼都抬高；平值是便宜的谷底。\n市场害怕<em>任一方向的大波动</em>，但没有明显倾向。\n这在二元事件（财报、FOMC、CPI 公布）之前很典型，此时跳空风险是双向的。",
  "skew.card.forward.tag": "大宗商品：石油、天然气、谷物",
  "skew.card.forward.title": "正向偏斜",
  "skew.card.forward.body": "行权价越<em>高</em>，IV 越高。<call>虚值看涨是盘面上最贵的期权</call>，因为人们害怕的是<em>向上</em>的冲击：一次让价格飙升的供应中断。\n能源股更接近这种情境。",
  "skew.card.delta.tag": "真正要看的数字",
  "skew.card.delta.title": "25 Delta 偏斜",
  "skew.card.delta.body": "陡峭度 = <b>25Δ 看跌的 IV 减去 25Δ 看涨的 IV</b>。\n差距扩大，是恐惧在推高看跌一翼（压力）。\n差距收窄，是自满。\n这是读出市场此刻对这只标的有多恐惧的最清晰方式。",

  // ─── skew.sell ───
  "skew.sell.title": "为什么卖出权利金时这很重要",
  "skew.sell.intro": "你不是在买保险，而是在承保。\n但卖方其实在问<b>两个不同的问题</b>，而<em>偏斜只回答第二个。</em>",

  // ─── skew.q ───
  "skew.q.head.question": "问题",
  "skew.q.head.answered": "由什么回答",
  "skew.q.head.card": "在这张卡片上",
  "skew.q.rich": "“现在权利金到底<em>贵</em>不贵？”",
  "skew.q.richBy": "<b>IV 水平 + IV 排名</b>：整条曲线处在多高",
  "skew.q.card": "IV 30 天 {{iv}}%",
  "skew.q.cardRank": "IV 30 天 {{iv}}%，IV 排名 {{rank}}",
  "skew.q.which": "“<em>哪个行权价</em>、用什么结构，能让我留下最多？”",
  "skew.q.whichBy": "<b>偏斜</b>：曲线在各行权价上的<em>形态</em>",
  "skew.q.curve": "上方的曲线",

  // ─── skew.levelPays ───
  "skew.levelPays": "<b>付钱给你的是水平。偏斜只决定这笔钱如何分布在各行权价上，以及哪种结构能拿到它、哪种会把它交回去。</b>\n一条贵的曲线意味着到处的期权都卖得出好价；偏斜是你的精算表，告诉你多付的钱集中在哪里。",

  // ─── skew.step1 ───
  "skew.step1": "第一步 · 读水平（做还是不做）",

  // ─── skew.step2 ───
  "skew.step2": "第二步 · 读形态，以及价差的玄机",
  "skew.step2.intro": "当水平说“做”，偏斜就告诉你<em>怎么做</em>。\n卖方的两种结构以相反的方式利用偏斜：",
  "skew.step2.csp": "<b>现金担保看跌</b>（单独卖出一份看跌）：陡峭的看跌偏斜是纯粹的<em>顺风</em>。\n你收下盘面上最贵、最受恐惧追捧的那份期权，并全数保留。",
  "skew.step2.bps": "<b>牛市看跌价差</b>（卖出较高的看跌，买入较低的）：这里陡峭的偏斜是一种<em>税</em>。\n你<b>买入</b>的看跌在曲线上比你<b>卖出</b>的更高，所以你付得贵、收得便宜。\n偏斜越陡，你的净收入越少。\n这份缩水的收入，就是封顶且明确的风险的代价。\n当你把卖出行权价往下移时，看看<b>偏斜差</b>读数是不是正这样变化。",

  // ─── skew.fearOpportunity ───
  "skew.fearOpportunity": "所以<gold>“恐惧 = 机会”</gold>和价差的玄机并不矛盾。\n受恐惧追捧的看跌一翼意味着<em>绝对权利金偏高</em>（好事：你收得更多），而这一翼的<em>倾斜</em>则是价差为换取风险封顶而交回的部分。\n两种结构里你的优势都一样：在市场定价的恐惧<b>比你自己对价格守得住的信念更贵</b>的地方卖出。",

  // ─── skew.check ───
  "skew.check.title": "实用的阅读清单",
  "skew.check.see": "你看到的",
  "skew.check.means": "它的含义",
  "skew.check.move": "卖方的动作",
  "skew.check.0.see": "IV 排名高 + 看跌偏斜陡峭",
  "skew.check.0.means": "权利金贵，而且贵在看跌上",
  "skew.check.0.move": "教科书式的卖方设定：有一翼贵的可以卖，水平也说明卖得出好价",
  "skew.check.1.see": "看跌偏斜陡峭",
  "skew.check.1.means": "崩盘恐惧被定了高价",
  "skew.check.1.move": "看跌权利金丰厚：把卖出行权价放在斜坡最陡部分<em>之下</em>，在价格仍有余地避开的行权价上收取受恐惧追捧的权利金",
  "skew.check.2.see": "偏斜平坦",
  "skew.check.2.means": "自满",
  "skew.check.2.move": "权利金薄，价格里几乎没有缓冲：要更挑剔",
  "skew.check.3.see": "偏斜迅速变陡",
  "skew.check.3.means": "压力在累积",
  "skew.check.3.move": "IV 在扩张：入场窗口正在打开",
  "skew.check.4.see": "微笑正在形成",
  "skew.check.4.means": "前方有二元事件",
  "skew.check.4.move": "双向跳空风险：不要空着头寸穿过它",
  "skew.check.5.see": "正向偏斜（能源）",
  "skew.check.5.means": "担心向上冲击",
  "skew.check.5.move": "看涨是贵的一翼；看跌相对便宜，可以卖",

  // ─── skew.foot ───
  "skew.foot.smile": "这条曲线就是该场景定价所用的三锚点微笑：平值 IV {{iv}}%，25Δ 看跌 IV {{put}}%，25Δ 看涨 IV {{call}}%，锚定在 {{ticker}} 现价 {{spot}}。\n期权链表格正是用这同一条微笑为每个行权价定价。\n隐含波动率是市场对未来的猜测，不是预测：把它当作被定了价的情绪来读。",
  "skew.foot.flat": "这个场景早于结构化微笑锚点，所以曲线在所有行权价上都是 {{iv}}% 的平坦 IV（水平，而非形态）。\n在领取新场景之前，请阅读场景的 skew_note 了解所处的情境。",

  // ─── sample.label ───
  "sample.label": "示例 · 仅供说明",

  // ─── sample.title ───
  "sample.title": "Optionality 的推介评估是这样的。",

  // ─── sample.intro ───
  "sample.intro": "真实的一轮由公司根据你选择的模式和角色全新构思。\n然后交给第二个 LLM，从六个维度为你打分，并保存在你的日志中。\n这一轮是固定的：一个 2023 年 3 月的机会、一份收入型看跌价差的推介和一份完整的评估。\n在投入聪之前，用它看看游戏提供些什么。\n公司的场景和评估用英文撰写。",

  // ─── sample.scenario ───
  "sample.scenario": "场景 · {{date}}",

  // ─── sample.maxLoss ───
  "sample.maxLoss": "最大亏损范围",

  // ─── sample.pitch ───
  "sample.pitch": "学员的推介",

  // ─── dm.failed ───
  "dm.failed": "私信没有发出。",

  // ─── dm.titleSelf ───
  "dm.titleSelf": "给自己发私信",

  // ─── dm.title ───
  "dm.title": "发私信",

  // ─── dm.you ───
  "dm.you": "（你）",

  // ─── dm.selfNote ───
  "dm.selfNote": "给自己的私信：消息会进入你自己 Nostr 客户端的收件箱。\n这是一种不打扰别人、端到端检查你的 NIP-07 签名工具和中继路径的办法。",

  // ─── dm.loading ───
  "dm.loading": "共享中继列表仍在加载。请关闭这里，稍后再试。",

  // ─── dm.close ───
  "dm.close": "关闭",

  // ─── dm.placeholder ───
  "dm.placeholder": "输入一条消息。收件人会在他们的 Nostr 客户端中看到。",

  // ─── dm.escrowNote ───
  "dm.escrowNote": "由 Optionality 用你托管的 nsec 签名，nsec 保存在运营者管理的存储中。\n私信以你的 npub 名义出现在 Nostr 上。\n你随时可以在<b>个人资料 → 游戏角色密钥</b>中取回密钥。",

  // ─── dm.nip07Note_one ───
  "dm.nip07Note_one": "由你的 NIP-07 扩展在本地签名；你的 nsec 从不传到 Optionality。\n发布到共享 DPYC 列表中的 <b>{{count}}</b> 个中继。",
  "dm.nip07Note_other": "由你的 NIP-07 扩展在本地签名；你的 nsec 从不传到 Optionality。\n发布到共享 DPYC 列表中的 <b>{{count}}</b> 个中继。",

  // ─── dm.nip07Note_other ───

  // ─── dm.cancel ───
  "dm.cancel": "取消",

  // ─── dm.send ───
  "dm.send": "签名并发送",

  // ─── dm.sending ───
  "dm.sending": "正在加密、签名、广播…",

  // ─── dm.sent ───
  "dm.sent": "✓ 已发送",

  // ─── dm.notAccepted ───
  "dm.notAccepted": "✗ 未被接受",

  // ─── dm.relays ───
  "dm.relays": "{{ok}} / {{total}} 个中继",

  // ─── dm.perRelay ───
  "dm.perRelay": "各中继结果",

  // ─── dm.eventNote ───
  "dm.eventNote": "事件 ID <id>{{id}}…</id>。订阅了这些中继之一的任何 Nostr 客户端，收件人都能看到。",

  // ─── dm.serverNote ───
  "dm.serverNote": "私信正通过 Optionality 的中继网络发送。收件人会在他们的 Nostr 客户端中看到。",

  // ─── dm.done ───
  "dm.done": "完成",

  // ─── dm.tryAgain ───
  "dm.tryAgain": "重试",

  // ─── dm.install ───
  "dm.install": "要发送私信，请<b>安装 Nostr 签名扩展</b>。\nOptionality 从不接触你的 nsec：扩展在自己的沙箱里为私信签名，加密后的消息直接发往中继。",

  // ─── dm.alby ───
  "dm.alby": "浏览器扩展 + iOS / Android。还带一个闪电钱包。",

  // ─── dm.nos2x ───
  "dm.nos2x": "精简的 Chrome / Firefox 扩展。只有 NIP-07，没有钱包。",

  // ─── dm.flamingo ───
  "dm.flamingo": "包装你的 nsec 的 iOS / 桌面应用；向网页提供 NIP-07。",

  // ─── nostr.badNpub ───
  "nostr.badNpub": "不是有效的 npub：{{npub}}",

  // ─── nostr.noRelays ───
  "nostr.noRelays": "没有配置中继。请在 个人资料 → Nostr 中继 中至少添加一个。",

  // ─── nostr.noSigner ───
  "nostr.noSigner": "没有检测到 NIP-07 签名工具。请安装 Alby、nos2x 或 Flamingo。",

  // ─── nostr.empty ───
  "nostr.empty": "消息不能为空。",

  // ─── glossary.delta_neutral ───
  "glossary.delta_neutral": "净 Delta 接近零的头寸：建仓时方向性盈亏相互抵消。收益来自 Vega、Theta 或 Gamma，而非价格方向。",

  // ─── glossary.iron_condor ───
  "glossary.iron_condor": "在同一到期日卖出虚值看涨价差和虚值看跌价差。风险有限的收取权利金交易；标的停留在两个卖出行权价之间时获利。",

  // ─── glossary.iron_butterfly ───
  "glossary.iron_butterfly": "卖出平值跨式，买入保护性的虚值两翼。卖出跨式的有限风险版本；标的钉在卖出行权价时获利最大。",

  // ─── glossary.jade_lizard ───
  "glossary.jade_lizard": "卖出看涨价差 + 卖出看跌期权，总权利金超过看涨价差的宽度。上行没有风险；下行风险以卖出看跌的位置为界。",

  // ─── glossary.calendar_spread ───
  "glossary.calendar_spread": "卖出近月期权，买入同一行权价的远月期权。受益于近月腿的 Theta 和远月腿的 Vega 上升。",

  // ─── glossary.diagonal_spread ───
  "glossary.diagonal_spread": "行权价不同的日历价差：在时间价差的波动率交易上加入方向性倾向。",

  // ─── glossary.ratio_spread ───
  "glossary.ratio_spread": "买入一份期权，卖出两份（或更多）同类型、更虚值的期权。建仓便宜甚至有收入；标的冲过卖出行权价时有尾部风险。",

  // ─── glossary.vertical_spread ───
  "glossary.vertical_spread": "买入一份期权，卖出另一份同类型、同到期日但行权价不同的期权。风险有限，收益有限。牛市看涨 / 熊市看跌 / 熊市看涨 / 牛市看跌。",

  // ─── glossary.credit_spread ───
  "glossary.credit_spread": "卖出的期权权利金高于买入期权的垂直价差：建仓时收取权利金。标的远离卖出行权价时获利。",

  // ─── glossary.debit_spread ───
  "glossary.debit_spread": "买入的期权比卖出的贵的垂直价差：建仓时付钱。标的向买入行权价移动时获利。",

  // ─── glossary.short_strangle ───
  "glossary.short_strangle": "卖出虚值看涨和虚值看跌。两个方向的风险都不封顶；为承担这一风险收取两份权利金。",

  // ─── glossary.short_straddle ───
  "glossary.short_straddle": "卖出平值看涨和平值看跌。权利金收入最大，Gamma 风险也最大：小幅波动也会很快造成真金白银的损失。",

  // ─── glossary.long_straddle ───
  "glossary.long_straddle": "买入平值看涨和平值看跌。任一方向的剧烈波动都能获利；标的不动则 Theta 不断损耗。",

  // ─── glossary.long_strangle ───
  "glossary.long_strangle": "买入虚值看涨和虚值看跌。比跨式便宜；需要更大的波动才能获利。",

  // ─── glossary.covered_call ───
  "glossary.covered_call": "持有股票 + 卖出更高行权价的看涨期权。放弃行权价以上的涨幅，换取权利金和一点缓冲。",

  // ─── glossary.cash_secured_put ───
  "glossary.cash_secured_put": "卖出看跌期权，并备好现金以便被行权时买入股票。一种耐心地以更低实际成本建立股票多头的方式。",

  // ─── glossary.protective_put ───
  "glossary.protective_put": "持有股票 + 买入看跌期权。为下跌买保险；成本是看跌期权的权利金。",

  // ─── glossary.put_spread ───
  "glossary.put_spread": "用看跌期权组成的垂直价差。熊市看跌＝支付权利金，下跌时获利；牛市看跌＝收取权利金，停留在卖出行权价之上时获利。",

  // ─── glossary.call_spread ───
  "glossary.call_spread": "用看涨期权组成的垂直价差。牛市看涨＝支付权利金，上涨时获利；熊市看涨＝收取权利金，停留在卖出行权价之下时获利。",

  // ─── glossary.iv_crush ───
  "glossary.iv_crush": "事件（财报、FDA、FOMC）公布后隐含波动率骤降。做多波动率的结构亏损；做空波动率的结构获利。",

  // ─── glossary.vol_crush ───
  "glossary.vol_crush": "和 IV 暴跌是一回事：事件过后隐含波动率崩塌，无论方向如何，期权权利金都会缩水。",

  // ─── glossary.vol_regime ───
  "glossary.vol_regime": "交易所处的波动率环境：实现与隐含、IV 排名、期限结构形态、偏斜。它决定该买入还是卖出权利金。",

  // ─── glossary.iv_rank ───
  "glossary.iv_rank": "当前隐含波动率在过去一年区间中的位置，0–100。IV 排名高有利于卖出权利金；低则有利于买入权利金或日历价差。",

  // ─── glossary.skew ───
  "glossary.skew": "不同行权价之间的隐含波动率差异。股票偏斜＝看跌比看涨贵；反向偏斜（大宗商品）＝看涨更贵。",

  // ─── glossary.term_structure ───
  "glossary.term_structure": "隐含波动率随到期日的变化。期货升水＝远月更高（市场平静）；期货贴水＝近月更高（承压）。",

  // ─── glossary.gamma_risk ───
  "glossary.gamma_risk": "Delta 变化快到来不及对冲的风险。做空 Gamma 的头寸在剧烈震荡的行情中亏钱。",

  // ─── glossary.vega_exposure ───
  "glossary.vega_exposure": "对隐含波动率变化的敏感度。做多 Vega＝IV 上升时获利；做空 Vega＝IV 下降时获利。",

  // ─── glossary.theta_decay ───
  "glossary.theta_decay": "期权卖方每天收取、买方每天支付的权利金损耗。越接近到期越快。",

  // ─── glossary.delta ───
  "glossary.delta": "标的每变动 1 美元时期权价格的大致变化。也可粗略代表以实值结束的概率。",

  // ─── glossary.gamma ───
  "glossary.gamma": "Delta 的变化速度。Gamma 高＝Delta 摆动快：对期权买方有利，对行权价附近的卖方不利。",

  // ─── glossary.vega ───
  "glossary.vega": "隐含波动率每变动 1 个点时期权价格的变化。买入的期权 Vega 为正；卖出的期权 Vega 为负。",

  // ─── glossary.theta ───
  "glossary.theta": "期权时间价值每天的衰减。买入期权支付 Theta；卖出期权收取 Theta。",

  // ─── glossary.rho ───
  "glossary.rho": "期权价格对无风险利率变化的敏感度。远期期权较大；短期期权通常可以忽略。",

  // ─── glossary.moneyness ───
  "glossary.moneyness": "期权行权价与现价的距离：实值（ITM）、平值（ATM）或虚值（OTM）。虚值程度会影响 Delta。",

  // ─── glossary.breakeven ───
  "glossary.breakeven": "到期时交易盈亏恰好为零的标的价格。多腿结构可能有两个（例如鹰式）。",

  // ─── glossary.max_loss ───
  "glossary.max_loss": "持有到最后时到期的最坏结果。有限风险结构明确封顶；裸卖空的最大亏损不封顶。",

  // ─── glossary.max_gain ───
  "glossary.max_gain": "到期时的最好结果。买入权利金时不封顶（看涨）或很大（看跌）；卖出权利金时就是收取的权利金。",

  // ─── glossary.dte ───
  "glossary.dte": "距到期的天数。它决定 Theta 的加速和 Vega 敞口。不足 21 天的结构通常由 Gamma 主导；超过 45 天的通常由 Vega 主导。",

  // ─── glossary.assignment_risk ───
  "glossary.assignment_risk": "卖出的期权被提前行权、迫使你交付或接收股票的风险。在临近到期和除息日前后最高。",

  // ─── glossary.pin_risk ───
  "glossary.pin_risk": "到期时标的恰好收在卖出行权价上，让你无法确定是否会被行权的风险。",

  // ─── glossary.expected_move ───
  "glossary.expected_move": "标的在给定时间段内大致的一倍标准差区间。通常由跨式价格或隐含波动率 × √时间 推算。",

  // ─── glossary.atm_straddle ───
  "glossary.atm_straddle": "买入或卖出平值看涨和平值看跌。买入平值跨式是典型的“我预计会有大行情”的交易。",

  // ─── glossary.wheel_strategy ───
  "glossary.wheel_strategy": "对你愿意持有的股票卖出现金担保看跌期权；若被行权，就针对它卖出备兑看涨，直到股票被买走。然后重复。这是靠收取权利金积少成多的打法。",

  // ─── glossary.chartLink ───
  "glossary.chartLink": "在 TradingView 上打开 {{symbol}} 的图表",

  // ─── chart.underlying ───
  "chart.underlying": "标的  {{price}}",

  // ─── chart.net ───
  "chart.net": "净盈亏",

  // ─── chart.alt ───
  "chart.alt": "替代盈亏",

  // ─── chart.spot ───
  "chart.spot": "现价",
};

export default words;
