/**
 * Every word Optionality's own pages say, en español.
 * Keys, {{places}} and <tags> are those of en.ts.
 */

import type { Translation } from "./en.ts";

const words: Translation = {
  // ─── game.journal ───
  "game.journal.col.symbol": "Símbolo",
  "game.journal.col.historicity": "Historicidad",
  "game.journal.col.difficulty": "Dificultad",
  "game.journal.col.created": "Creado",
  "game.journal.col.updated": "Modificado",
  "game.journal.col.grade": "Calificación",
  "game.journal.col.score": "Puntos",
  "game.journal.col.status": "Estado",
  "game.journal.group.none": "Ninguno",

  // ─── game.tool ───
  "game.tool.deal_scenario": "Escenario de operación",
  "game.tool.judge_trade": "Evaluación del pitch",
  "game.tool.ask_tip": "Petición de pista",
  "game.tool.save_draft": "Guardar borrador",
  "game.tool.purchase_credits": "Recargar",
  "game.tool.check_payment": "Comprobación de pago",
  "game.tool.check_balance": "Comprobación de saldo",
  "game.tool.check_price": "Vista previa del precio",
  "game.tool.get_leaderboard": "Clasificación",
  "game.tool.get_my_rank": "Mi puesto",
  "game.tool.get_journal": "Consulta del diario",
  "game.tool.list_journal": "Lista del diario",
  "game.tool.delete_journal": "Borrado del diario",
  "game.tool.set_display_name": "Nombre visible",
  "game.tool.get_api_usage_stats": "Uso de la API",
  "game.tool.account_statement": "Estado de cuenta",
  "game.tool.request_npub_proof": "Inicio de sesión (petición)",
  "game.tool.receive_npub_proof": "Inicio de sesión (verificación)",

  // ─── game.difficulty ───
  "game.difficulty.apprentice.label": "Aprendiz",
  "game.difficulty.apprentice.blurb": "Planteamientos direccionales limpios. Contexto macro sencillo.",
  "game.difficulty.journeyman.label": "Oficial",
  "game.difficulty.journeyman.blurb": "El régimen de volatilidad importa. Resultados, días de la Fed, catalizadores únicos.",
  "game.difficulty.adept.label": "Experto",
  "game.difficulty.adept.blurb": "Multifactor. Correlaciones entre activos. Skew y estructura temporal.",
  "game.difficulty.sovereign.label": "Soberano",
  "game.difficulty.sovereign.blurb": "Era de cambio de régimen. Devaluación monetaria, geopolítica, cobertura de colas.",
  "game.difficulty.mulligan.label": "Revancha",

  // ─── game.mode ───
  "game.mode.historical.label": "Ficción histórica",
  "game.mode.historical.blurb": "Anclado en un momento real de la historia de los mercados. Macro real; cifras calibradas.",
  "game.mode.fiction.label": "Ficción",
  "game.mode.fiction.blurb": "Pura invención. Hipótesis de un futuro cercano, contrafactuales, regímenes especulativos.",
  "game.mode.live.label": "Eventos en vivo",
  "game.mode.live.blurb": "Basado en el mercado real de hoy mediante búsqueda web. Ticker real, catalizador real, ahora.",

  // ─── game.sector ───
  "game.sector.any": "Cualquiera",
  "game.sector.biotech": "Biotecnología",
  "game.sector.semis": "Semiconductores",
  "game.sector.megaTech": "Megatecnológicas",
  "game.sector.banks": "Bancos",
  "game.sector.energy": "Energía",
  "game.sector.miners": "Minería",
  "game.sector.consumer": "Consumo",
  "game.sector.homebuilders": "Constructoras de viviendas",
  "game.sector.defense": "Defensa",
  "game.sector.airlines": "Aerolíneas",
  "game.sector.crypto": "Acciones cripto",
  "game.sector.index": "Índice/ETF",

  // ─── game.dimension ───
  "game.dimension.strategy_selection": "Estructura",
  "game.dimension.strikes_and_tenor": "Strikes y plazo",
  "game.dimension.risk_reward": "Riesgo / beneficio",
  "game.dimension.macro_integration": "Contexto macro",
  "game.dimension.tail_risk": "Conciencia de colas",
  "game.dimension.communication": "Comunicación",

  // ─── game.zoom ───
  "game.zoom.title": "Toca para leer esto en letra más grande",

  // ─── game.loading ───
  "game.loading.tape": "Leyendo el mercado",
  "game.loading.wire": "Escuchando los teletipos",
  "game.loading.judging": "Evaluando tu pitch",
  "game.loading.reissuing": "Reeditando el escenario",

  // ─── game.error ───
  "game.error.agedOut": "Ese encargo caducó antes de que volvieras. No se cobró ningún peaje. Pide uno nuevo.",
  "game.error.recover": "No se pudo recuperar ese encargo. {{message}}",
  "game.error.start": "No se pudo iniciar el escenario. {{message}}",
  "game.error.typeFirst": "Escribe primero tu operación.",
  "game.error.noScenario": "No hay escenario activo. Pide uno nuevo primero.",
  "game.error.notInJournal": "Ese escenario ya no está en tu diario, así que no se puede evaluar. Pide uno nuevo para presentar un pitch. No se cobró ningún peaje.",
  "game.error.evaluation": "La evaluación falló. {{message}}",
  "game.error.noScenarioToSave": "No hay escenario activo donde guardar.",
  "game.error.save": "No se pudo guardar. {{message}}",
  "game.error.acceptFirst": "Acepta un reto antes de pedir una pista.",
  "game.error.clue": "La petición de pista falló. {{message}}",
  "game.error.replay": "No se pudo repetir. {{message}}",
  "game.error.nothingToResume": "Esta entrada no tiene escenario que retomar.",

  // ─── game.entry ───
  "game.entry.yourTrade": "Tu operación",
  "game.entry.headline": "En una frase",
  "game.entry.riskProfile": "Perfil de riesgo",
  "game.entry.alternative": "Alternativa",
  "game.entry.deeper": "Contexto más profundo",
  "game.entry.redoTitle": "Reeditar este escenario como revancha: mismo planteamiento, pitch nuevo",
  "game.entry.redo": "Repetir",
  "game.entry.sharedTitle": "Compartido en tu fila de la clasificación. Haz clic para hacerlo privado.",
  "game.entry.shareTitle": "Compartir este pitch en tu fila de la clasificación para que otros puedan comparar",
  "game.entry.shared": "✓ Compartido",
  "game.entry.share": "Compartir",
  "game.entry.visibleToAll": "Visible para todos",
  "game.entry.resumeDraftTitle": "Tienes un borrador guardado. Retómalo en el parqué para terminarlo y presentarlo. Sin escenario nuevo y sin cargo.",
  "game.entry.resumeTitle": "Retoma este escenario abierto en el parqué para presentar una operación y recibir una evaluación. Sin escenario nuevo y sin cargo.",
  "game.entry.resume": "🙋 Retomar",
  "game.entry.noReview": "Estado de la entrada: {{status}}. No hay evaluación del pitch.",

  // ─── game.brand ───
  "game.brand.tagline": "Entrenador gamificado de consultores de trading de opciones",

  // ─── game.stats ───
  "game.stats.sessions": "Sesiones",
  "game.stats.avg": "Nota media",
  "game.stats.best": "Mejor",
  "game.stats.streak": "Racha",

  // ─── game.balance ───
  "game.balance.title": "Recargar: compra sats por Bitcoin Lightning",
  "game.balance.label": "Saldo",
  "game.balance.sats": " sats",
  "game.balance.topUp": "＋ Recargar",

  // ─── game.signOut ───
  "game.signOut.title": "Cerrar sesión: borra la npub y el token de prueba guardados",
  "game.signOut.label": "Cerrar sesión",

  // ─── game.tab ───
  "game.tab.welcome": "Bienvenida",
  "game.tab.play": "El parqué",
  "game.tab.sample": "Ver evaluación",
  "game.tab.journal": "Diario",
  "game.tab.leaderboard": "Clasificación",
  "game.tab.usage": "Uso",
  "game.tab.profile": "Perfil",

  // ─── game.openingFloor ───
  "game.openingFloor": "Abriendo el parqué",

  // ─── game.guest ───
  "game.guest.label": "Pase de invitado",
  "game.guest.welcome": "Bienvenido, trader invitado <id>{{id}}</id>.",
  "game.guest.body": "El sitio está en marcha, pero solo puedes usar los servicios gratuitos hasta que compres tokens DPYC.\nVe a la pestaña <b>Uso</b> para ver tu cuenta y comprar tokens.\nRecibir un reto, pedir pistas y ser evaluado son servicios de pago, pero las tarifas son mínimas: unos pocos sats cada uno.\nCuando tengas tus credenciales Nostr, puedes recargar aquí.\nEntonces podrás trabajar tus retos, guardar tu trabajo en curso y escribir a otros jugadores de la clasificación.\nCon práctica serás más hábil presentando operaciones con opciones ante públicos profesionales.\nBienvenido.",
  "game.guest.signIn": "Entrar para jugar →",

  // ─── game.briefing ───
  "game.briefing.label": "Briefing",
  "game.briefing.title": "La mesa está abierta.",
  "game.briefing.prose": "La Firma te presenta una oportunidad: un momento de los mercados, quizá real, quizá inventado, quizá en curso ahora mismo.\nVerás una fecha, un contexto macro, un activo, un catalizador, niveles clave y las restricciones de tu cartera.\nLéelo como un expediente judicial.\nLuego escribe tu operación con tus propias palabras: estructura, strikes, vencimiento, tamaño y razonamiento.",
  "game.briefing.integration": "<b>La integración se premia.</b> Una respuesta sólida tiene en cuenta los hechos políticos, monetarios y entre activos que la Firma puso delante de ti.\nCuantos más hechos relevantes tejas en tu tesis, más alta tu nota, sobre todo en la dimensión Contexto macro.",
  "game.briefing.herrings": "<b>Hay pistas falsas sembradas.</b> La Firma incluye uno o dos hechos totalmente ciertos pero irrelevantes para la operación ideal.\nSon ruido del mundo real que un trader podría notar razonablemente y sobrevalorar.\nUna nota sobre el skew puede ser color, no catalizador.\nUn titular puede estar ya en el precio.\nUna posición declarada puede estar desfasada.\nSon trampas de relevancia, nunca de falsedad.\nConstruir tu tesis sobre una te cuesta puntos; reconocerla como ruido y dejarla de lado te los da.",
  "game.briefing.coda": "Elige tu historicidad. Elige tu persona. Acepta el reto.",

  // ─── game.chooser ───
  "game.chooser.historicity": "Historicidad",
  "game.chooser.persona": "Persona",
  "game.chooser.risk": "Límite de riesgo",
  "game.chooser.maxLoss": "Pérdida máx. por operación:",
  "game.chooser.optional": "opcional",
  "game.chooser.clear": "borrar",
  "game.chooser.maxLossHint": "Opcional. Si lo fijas, la Firma dimensiona la cuenta y las restricciones de la oportunidad para que una estructura bien elegida quepa en tu límite. El juez penaliza las operaciones cuyo peor caso lo supere.",
  "game.chooser.sector": "Sector",
  "game.chooser.sectorLimit": "Limitar al crupier a {{sector}}",
  "game.chooser.sectorAny": "Dejar que el crupier elija cualquier sector",
  "game.chooser.customSector": "o escribe un sector propio:",
  "game.chooser.customExample": "p. ej. artículos de lujo",
  "game.chooser.sectorHint": "Opcional. La Firma elige el subyacente dentro del sector elegido y adapta el catalizador, los hechos relevantes y las pistas falsas a su dinámica.",

  // ─── game.topUp ───
  "game.topUp.title": "Compra sats al operador por Bitcoin Lightning",
  "game.topUp.label": "Recargar",

  // ─── game.toll ───
  "game.toll.label": "Peaje",

  // ─── game.sats_one ───
  "game.sats_one": "{{count}} sat",
  "game.sats_other": "{{count}} sats",

  // ─── game.sats_other ───

  // ─── game.toll ───
  "game.toll.noModel": "El modelo de precios aún no tiene multiplicadores. Ejecuta reset_pricing_model en este operador.",

  // ─── game.signInToPlayTitle ───
  "game.signInToPlayTitle": "Entra con tu identidad Nostr para recibir un escenario de operación",

  // ─── game.signInToPlay ───
  "game.signInToPlay": "Entrar para jugar",

  // ─── game.deal ───
  "game.deal.another": "Otro más",
  "game.deal.challenge": "Aceptar el reto",
  "game.deal.watchTitle": "Volver a la pantalla de lectura del mercado de tu último escenario",
  "game.deal.preparing_one": "{{count}} escenario ya en preparación. Ver ›",
  "game.deal.preparing_other": "{{count}} escenarios ya en preparación. Ver ›",
  "game.deal.confirmPriced": "¿Otro más? Cada escenario es un peaje aparte de {{price}} sats.",
  "game.deal.confirm": "¿Otro más? Cada escenario es un peaje aparte.",
  "game.deal.yes": "Sí, otro más",
  "game.deal.notYet": "Todavía no",

  // ─── game.card ───
  "game.card.macro": "Contexto macro",
  "game.card.skewNote": "Nota sobre el skew",
  "game.card.catalyst": "Catalizador",
  "game.card.keyLevels": "Niveles clave",
  "game.card.constraints": "Restricciones",
  "game.card.question": "La pregunta",
  "game.card.sources": "Fuentes",
  "game.card.spot": "Spot",
  "game.card.iv30": "IV 30 d",
  "game.card.ivRank": "IV Rank",
  "game.card.skew": "Skew · ",

  // ─── game.pitch ───
  "game.pitch.saveTitle": "Guarda este borrador en tu entrada del diario para que sobreviva a una recarga de la página",
  "game.pitch.save": "Guardar borrador",
  "game.pitch.discardTitle": "Descartar este escenario y elegir otro. La tarifa del escenario no es reembolsable, así que se te pedirá confirmación.",
  "game.pitch.discard": "Descartar escenario",
  "game.pitch.placeholder": "p. ej. Vender el put spread 95/90 a 30 días por 1,20 de crédito, dimensionado para arriesgar el 0,5 % del patrimonio neto. La pausa dura de la Fed pone un suelo al dólar, pero la acción tiene compras de directivos; cobrar prima por debajo de la media de 200 días parece asimétrico…",
  "game.pitch.presentTitle": "Presenta tu operación al gestor sénior para que la evalúe y audite tu pitch con nota",
  "game.pitch.present": "Presentar pitch",
  "game.pitch.saved": "✓ Borrador guardado a las {{time}}",

  // ─── game.clue ───
  "game.clue.heading": "Pedir una pista",
  "game.clue.hint": "Pregunta lo que quieras por una pequeña tarifa. p. ej. <q>«¿Qué quieres decir con skew de calls?»</q>",
  "game.clue.copied": "Copiado al portapapeles",
  "game.clue.copyTitle": "Copia esta conversación de pistas al portapapeles para seguirla en tu propia sesión de Claude.ai",
  "game.clue.copy": "Copiar conversación",
  "game.clue.q": "P · {{question}}",
  "game.clue.placeholder": "Escribe tu pregunta…",
  "game.clue.asking": "Consultando a la mesa de pistas…",
  "game.clue.sendTitle": "Enviar esta pregunta. Se aplica una pequeña tarifa por pista.",
  "game.clue.send": "Enviar pregunta",

  // ─── game.review ───
  "game.review.label": "Evaluación del pitch",
  "game.review.overall": "Global",
  "game.review.byDimension": "Por dimensión",
  "game.review.right": "Lo que hiciste bien",
  "game.review.sharpen": "Lo que hay que afinar",
  "game.review.alternative": "Una alternativa que habría tomado la casa",
  "game.review.replayTitle": "Volver al selector de escenarios",
  "game.review.replay": "🔁 Repetir",

  // ─── game.ledger ───
  "game.ledger.label": "Libro DPYC",
  "game.ledger.title": "Saldo en sats y uso de herramientas MCP",
  "game.ledger.intro": "Tu saldo en Optionality MCP, lo que gastaste y compraste en los últimos 30 días y las herramientas a las que fueron los sats.\nLos peajes se cobran en el momento de la llamada; la contabilidad del operador se escribe en Neon tras cada liquidación.",
  "game.ledger.tools": "Uso de herramientas MCP: últimos 30 días",
  "game.ledger.empty": "Ninguna llamada a herramientas de pago en los últimos 30 días.",
  "game.ledger.health": "Salud de la cuenta",

  // ─── game.ai ───
  "game.ai.refresh": "Actualizar uso de la API",
  "game.ai.label": "Uso",
  "game.ai.title": "Uso de IA y lo que costó",
  "game.ai.intro": "Optionality llama a un modelo para cada escenario, pista y veredicto.\nEsto es lo que tus llamadas han gastado en tokens y lo que el proveedor facturó realmente al operador por ellas.\nTu peaje cubre esto más los gastos del operador.\nSin margen oculto.",
  "game.ai.estimated": "Las cifras marcadas «est.» son anteriores al registro de costo por llamada y se infieren de las tarifas publicadas (consultadas el {{date}}); el resto es lo que facturó el proveedor.",
  "game.ai.reported": "Los costos son las cifras por llamada del propio proveedor, no una estimación.",
  "game.ai.tallying": "Sumando los recibos",
  "game.ai.none": "Aún no hay llamadas a modelos registradas. Acepta un reto.",
  "game.ai.unknown": "desconocido",
  "game.ai.runs": "Llamadas:",
  "game.ai.input": "Entrada:",
  "game.ai.output": "Salida:",
  "game.ai.cost": "Costo:",
  "game.ai.costEst": "Costo (est.):",
  "game.ai.perCall": "Por llamada:",
  "game.ai.costPartEst": "Costo de IA (en parte est.)",
  "game.ai.costBilled": "Costo de IA facturado",
  "game.ai.tokens": "{{tokens}} tokens en {{calls}} llamadas a modelos",
  "game.ai.costPerCall": "Costo por llamada",
  "game.ai.averaged": "promedio de cada escenario, pista y veredicto",
  "game.ai.sats": "Equivalente en sats",
  "game.ai.atRate": "a ~{{rate}}/BTC",
  "game.ai.footnote": "El operador traslada el costo de la IA a los jugadores mediante micropagos Lightning.\nEsta vista es la transparencia en bruto: lo que realmente costó cada escenario, pista y veredicto, más un equivalente en sats a una tasa de referencia fija de {{rate}}/BTC.\nEsa tasa es una vara de medir para comparar, no la cotización de hoy.",

  // ─── game.lb ───
  "game.lb.label": "Clasificación",
  "game.lb.title": "Traders soberanos, ordenados por habilidad",
  "game.lb.intro": "El modelo de precios es el único mando: un pitch difícil y caro bien calificado supera a uno barato bien calificado.\nCuando el operador reajusta un multiplicador (revancha, soberano, cualquiera), el siguiente recálculo de la clasificación aplica los nuevos pesos a cada entrada, sin instantáneas que se desvíen.\nEl orden por defecto es la media ponderada; también hay notas brutas.",
  "game.lb.sort.weighted_avg": "Media ponderada",
  "game.lb.sort.weighted_best": "Mejor ponderada",
  "game.lb.sort.avg": "Media bruta",
  "game.lb.sort.best": "Mejor bruta",
  "game.lb.sort.streak": "Racha",
  "game.lb.sort.played": "Jugadas",
  "game.lb.loading": "Cargando…",
  "game.lb.refresh": "Actualizar",
  "game.lb.failed": "No se pudo cargar la clasificación. {{error}}",
  "game.lb.unknownError": "Error desconocido.",
  "game.lb.empty": "Aún no hay operaciones evaluadas. Sé el primero.",
  "game.lb.trader": "Trader",
  "game.lb.wavg": "Med·P",
  "game.lb.wavgTitle": "Media ponderada: nota bruta × multiplicador de dificultad",
  "game.lb.wbest": "Mej·P",
  "game.lb.wbestTitle": "Mejor pitch individual, ponderado",
  "game.lb.avg": "Media",
  "game.lb.avgTitle": "Media bruta de todos los pitches evaluados",
  "game.lb.streak": "Racha",
  "game.lb.played": "Jugadas",
  "game.lb.rowTitle": "Haz clic para ver los pitches compartidos de este trader",
  "game.lb.dmSelf": "Enviarte un DM: prueba la ruta de los relés",
  "game.lb.dm": "DM a {{name}}",
  "game.lb.anonymous": "Anónimo",
  "game.lb.you": "TÚ",
  "game.lb.last": "  ·  último: {{date}}",
  "game.lb.fetching": "Obteniendo pitches compartidos",
  "game.lb.youNone": "Aún no has compartido ningún pitch. Abre una de tus entradas evaluadas del diario y toca Compartir.",
  "game.lb.theyNone": "Este trader aún no ha compartido ningún pitch.",
  "game.lb.yourShared": "Tus pitches compartidos · {{count}}",
  "game.lb.shared": "Pitches compartidos · {{count}}",
  "game.lb.theirPitch": "Su pitch",
  "game.lb.houseAlt": "Alternativa de la casa",

  // ─── game.journal ───
  "game.journal.label": "Diario",
  "game.journal.title": "Tu sala de estudio",
  "game.journal.intro": "Bienvenido a tu sala de estudio.\nAquí puedes repasar tus propuestas anteriores, releer tus evaluaciones y retomar los pitches que empezaste y tuviste que dejar.",
  "game.journal.introNamed": "Bienvenido a tu sala de estudio, {{name}}.\nAquí puedes repasar tus propuestas anteriores, releer tus evaluaciones y retomar los pitches que empezaste y tuviste que dejar.",

  // ─── game.prep ───
  "game.prep.heading": "Escenarios en preparación · {{count}}",
  "game.prep.rowTitle": "Volver a la pantalla de lectura del mercado de este escenario",
  "game.prep.watch": "Ver ›",
  "game.prep.note": "La Firma los compone en segundo plano, así que puedes irte y volver.\nCuando uno está listo, sale de esta lista y aparece abajo como una entrada abierta para reclamar.",

  // ─── game.journal ───
  "game.journal.pulling": "Cargando sesiones",
  "game.journal.emptyPreparing": "Aún no hay sesiones terminadas. Tu escenario sigue en preparación arriba.",
  "game.journal.empty": "Aún no hay sesiones. Pide tu primer escenario de operación.",
  "game.journal.groupBy": "Agrupar por",
  "game.journal.flipGroups": "Invertir el orden de los grupos",
  "game.journal.groupsAsc": "Grupos ▲",
  "game.journal.groupsDesc": "Grupos ▼",
  "game.journal.sortBy": "Ordenar por",
  "game.journal.flipSort": "Invertir el sentido del orden",
  "game.journal.sortedAsc": "Orden ascendente. Cambiar a descendente.",
  "game.journal.sortedDesc": "Orden descendente. Cambiar a ascendente.",
  "game.journal.asc": "▲ Asc",
  "game.journal.desc": "▼ Desc",
  "game.journal.sessions_one": "{{count}} sesión",
  "game.journal.sessions_other": "{{count}} sesiones",
  "game.journal.avg": " · media {{score}}",

  // ─── game.status ───
  "game.status.open": "abierto",
  "game.status.evaluated": "evaluado",

  // ─── game.journal ───
  "game.journal.sharedTag": "· compartido",
  "game.journal.deleteTitle": "Borrar esta sesión para siempre",
  "game.journal.delete": "Borrar sesión",
  "game.journal.loadingEntry": "Cargando entrada",

  // ─── game.discard ───
  "game.discard.title": "¿Descartar este escenario?",
  "game.discard.body": "Descartar te permite elegir un escenario nuevo.\nCada escenario usa procesamiento externo de LLM de pago, así que la tarifa de este no se puede reembolsar.\n¿Seguro que quieres abandonar este escenario y elegir otro?",
  "game.discard.keep": "Quedarme con este escenario",
  "game.discard.confirm": "Descartar y elegir otro",

  // ─── game.delete ───
  "game.delete.title": "¿Borrar esta sesión para siempre?",
  "game.delete.body": "Vas a borrar para siempre tu sesión de <b>{{ticker}}</b>.\nEl escenario, tu pitch, la evaluación, la nota y cualquier puesto en la clasificación que haya ganado quedan <b>borrados para siempre</b>.\nNo se puede deshacer ni recuperar más tarde.",
  "game.delete.bodyGraded": "Vas a borrar para siempre tu sesión de <b>{{ticker}}</b> (calificada {{grade}}).\nEl escenario, tu pitch, la evaluación, la nota y cualquier puesto en la clasificación que haya ganado quedan <b>borrados para siempre</b>.\nNo se puede deshacer ni recuperar más tarde.",
  "game.delete.this": "esta",
  "game.delete.keep": "Conservarla",
  "game.delete.deleting": "Borrando…",
  "game.delete.confirm": "Borrar para siempre",

  // ─── game.zoom ───
  "game.zoom.copyTitle": "Copiar este texto al portapapeles",
  "game.zoom.copy": "Copiar texto",
  "game.zoom.closeTitle": "Cerrar (Esc)",
  "game.zoom.close": "Cerrar",

  // ─── game.status ───
  "game.status.submitted": "enviado",
  "game.status.abandoned": "abandonado",

  // ─── app.lapsed ───
  "app.lapsed": "Tu sesión caducó mientras no estabas. Vuelve a iniciar sesión para seguir.",

  // ─── signIn.welcome ───
  "signIn.welcome": "Un entrenador agéntico de trading de opciones. La Firma compone la oportunidad, tú escribes el pitch y un juez califica tu disciplina.",

  // ─── signIn.nsecHint ───
  "signIn.nsecHint": "¿Entras con una nsec? Se queda en este navegador para firmar cada llamada.\nOptionality también guarda una copia cifrada para poder firmar tus DM.\nRetírala cuando quieras desde Perfil.\nPara una identidad que custodias tú mismo, entra mejor con tu npub.",

  // ─── signIn.or ───
  "signIn.or": "o",

  // ─── signIn.guest ───
  "signIn.guest": "Continuar como invitado",

  // ─── signIn.guestHint ───
  "signIn.guestHint": "Los invitados pueden recorrer el selector, el briefing y la evaluación de ejemplo.",

  // ─── signIn.footnote ───
  "signIn.footnote": "Optionality™ es un juego agéntico de trading de opciones construido sobre <link>Tollbooth-DPYC™</link>: micropagos Bitcoin Lightning e identidad Nostr para agentes de IA.",

  // ─── welcome.guestName ───
  "welcome.guestName": "Invitado {{id}}",

  // ─── welcome.anonymous ───
  "welcome.anonymous": "Visitante anónimo",

  // ─── welcome.label ───
  "welcome.label": "Bienvenida",

  // ─── welcome.greeting ───
  "welcome.greeting": "Bienvenido, <name>{{name}}</name>.",

  // ─── welcome.signedInAs ───
  "welcome.signedInAs": " Sesión iniciada como <npub>{{npub}}</npub>.",

  // ─── welcome.why ───
  "welcome.why": "Por qué Optionality.",

  // ─── welcome.why1 ───
  "welcome.why1": "Optionality™ es aprendizaje gamificado y basado en escenarios para quienes se forman como traders de opciones con soltura.\nSe queda fuera del temario habitual de matemáticas de valoración y mecánica de plataformas.\nTe involucra con narrativas que piden una operación clara y ejecutable, y el razonamiento que la respalda.",

  // ─── welcome.why2 ───
  "welcome.why2": "La jerga te es ajena y te trabas cuando te piden describir tu estrategia y tus ideas de operación actuales.\nQuieres ver la situación mundial en su conjunto y hacer propuestas de operación sólidas bajo presión.\nPero tus ideas son difusas, persigues grandes ganancias y no sabes decir, antes de una situación, qué harías en ella.\nOptionality™ te ayuda a aprender estrategias sensatas, incorporar la actualidad mundial y afinar cómo describes tus estrategias.",

  // ─── welcome.why3 ───
  "welcome.why3": "Optionality™ hace de tu Firma, tu casa de inversión.\nUsa servicios de IA modernos para presentarte escenarios mundiales simulados y exigentes que te dan ocasión de pensar y luego de presentar tu operación.\nLos auditores de la Firma califican tu propuesta según la elección de estructura, strikes y plazo, riesgo/beneficio, integración macro y riesgo de cola.\nEsa respuesta te ayuda a mejorar tus propuestas narrativas.\nCon el tiempo serás capaz de concebir, presentar y ejecutar operaciones más sabias, con rapidez y acierto.",

  // ─── welcome.play ───
  "welcome.play.label": "Cómo se juega",
  "welcome.play.round": "Una ronda",
  "welcome.play.1": "<b>Acepta el reto.</b> Elige una historicidad (histórica, ficción o en vivo), un persona (aprendiz → soberano) y, si quieres, un límite de pérdida máxima. El peaje crece con la dificultad de tu selección.",
  "welcome.play.2": "<b>Lee el escenario.</b> Activo, spot, IV, skew, niveles clave, el catalizador, las restricciones de tu cartera y un par de pistas falsas incrustadas para ver si distingues el ruido de lo que de verdad pesa.",
  "welcome.play.3": "<b>Presenta la operación.</b> Texto libre. Indica la estructura, los strikes, el plazo, el tamaño y tu razonamiento.",
  "welcome.play.4": "<b>Lee la evaluación.</b> Clasificación en una frase, nota en cinco dimensiones, registro de hechos integrados, la operación alternativa que habría hecho la casa, gráfico del perfil de riesgo y contexto más profundo.",
  "welcome.play.5": "<b>Repite un escenario pasado</b> desde tu Diario cuando quieras verlo de nuevo. Mismo planteamiento, pitch nuevo, registrado aparte.",

  // ─── welcome.toll ───
  "welcome.toll": "El peaje",
  "welcome.toll.fair": "Optionality™ usa un precio justo según el uso.\nSi no lo usas, no pagas nada: no hay suscripción ni KYC.\nEl precio sigue lo que cada escenario cuesta de verdad componer y calificar.\nLos más simples usan menos tokens de LLM; los más exigentes, como el mercado en vivo con búsqueda web o la dificultad soberano, usan más.\nIncluso el escenario más complejo cuesta solo unos cientos de sats.",
  "welcome.toll.inspect": "El operador fija cada multiplicador directamente, y puedes revisarlos tú mismo en la pestaña <b>Uso</b> en cuanto tengas saldo.\nAhora mismo, tomados del modelo de precios en vivo:",
  "welcome.toll.cheap": "Escenario más simple (ficción × aprendiz): <b>{{price}}</b>",
  "welcome.toll.expensive": "Escenario más exigente (mercado en vivo × soberano con búsqueda web completa): <b>{{price}}</b>",
  "welcome.toll.pitch": "Auditoría del pitch: <b>{{price}}</b>",
  "welcome.toll.session": "Una sesión de unas 30 rondas calificadas en dificultad media cuesta aproximadamente {{sats}} sats, unos {{usd}} en BTC.\nRecargar compra sats con una factura Lightning; sirve Wallet of Satoshi, Phoenix, Mutiny o cualquier billetera Lightning.",
  "welcome.toll.fallback": "Optionality™ usa un precio justo según el uso: si no lo usas, no pagas nada.\nLa dificultad y el modo hacen variar el peaje; puedes revisar cada multiplicador en la pestaña <b>Uso</b> en cuanto tengas saldo.\nRecargar compra sats con una factura Lightning; sirve Wallet of Satoshi, Phoenix, Mutiny o cualquier billetera Lightning.",
  "welcome.toll.unreachable": "(Ahora mismo no se pudo consultar el modelo de precios para dar cifras concretas.)",

  // ─── welcome.economy ───
  "welcome.economy.label": "La economía",
  "welcome.economy.title": "Optionality funciona sobre Tollbooth-DPYC™",
  "welcome.economy.intro": "Optionality es un juego agéntico de trading de opciones construido sobre <dpyc>Tollbooth-DPYC™ →</dpyc>, una pila Bitcoin Lightning + Nostr para servicios de IA monetizados.\nLa gobernanza, los operadores certificados y el registro comunitario están a la vista en <community>github.com/lonniev/dpyc-community →</community>.\nVale la pena nombrar tres propiedades:",
  "welcome.economy.identity": "<b>Identidad soberana.</b> Entras con un par de claves Nostr, no con correo y contraseña.\nTu nsec es tu única credencial: sin KYC ni cuenta emitida por una plataforma.\nOptionality guarda una copia cifrada solo si se lo pides (Perfil → Clave de persona de juego), y puedes retirarla cuando quieras.",
  "welcome.economy.pricing": "<b>Precios dinámicos sin redesplegar.</b> Los precios de las herramientas del operador se guardan en un modelo de precios, no en el código.\nLos multiplicadores de dificultad y modo se ajustan en vivo, y puedes comprobarlos tú mismo en la pestaña Uso.\nLa clasificación usa el mismo mecanismo para ponderar las notas.",
  "welcome.economy.money": "<b>Dinero sano.</b> Los micropagos por rieles fiat están económicamente muertos: solo las comisiones de intercambio superan un peaje de 1 sat.\nBitcoin Lightning hace trivial cobrar peaje por cada llamada a una herramienta de IA.\nSaldos Lightning prepagados, liquidación atómica en cada llamada y ningún custodio guardando tu gasto fuera de la cadena: eso es lo que hace funcionar servicios como Optionality.",

  // ─── welcome.ready ───
  "welcome.ready": "¿Listo?",
  "welcome.ready.guest": "Echa un vistazo: la pestaña <b>Ver evaluación</b> muestra una ronda calificada completa, para que veas lo que ofrece el juego antes de unirte.\nCuando quieras empezar a presentar operaciones de verdad, entra con una identidad Nostr.",
  "welcome.ready.guestPriced": "Echa un vistazo: la pestaña <b>Ver evaluación</b> muestra una ronda calificada completa, para que veas lo que ofrece el juego antes de unirte.\nCuando quieras empezar a presentar operaciones de verdad, entra con una identidad Nostr y recarga unos {{usd}} en BTC.",
  "welcome.ready.patron": "Echa un vistazo: la pestaña <b>Ver evaluación</b> muestra una ronda calificada completa, para que veas lo que ofrece el juego antes de poner sats sobre la mesa.\nCuando quieras empezar a presentar operaciones de verdad:",

  // ─── welcome.seeAssessment ───
  "welcome.seeAssessment": "Ver evaluación",

  // ─── welcome.signInToPlay ───
  "welcome.signInToPlay": "Entrar para jugar",

  // ─── welcome.topUpPriced ───
  "welcome.topUpPriced": "Recargar: ~{{usd}} para empezar",

  // ─── welcome.topUp ───
  "welcome.topUp": "Recargar",

  // ─── profile.label ───
  "profile.label": "Perfil",

  // ─── profile.title ───
  "profile.title": "Tu identidad soberana.",

  // ─── profile.intro ───
  "profile.intro": "Tu perfil vive en tus metadatos Nostr kind-0, leídos de los relés y mostrados en cada cliente Nostr.\nLos cambios se firman en tu navegador y se retransmiten; tu clave nunca sale de este dispositivo.",

  // ─── profile.tz ───
  "profile.tz.label": "Zona horaria",
  "profile.tz.title": "Todos los relojes, una sola zona.",
  "profile.tz.intro": "Cada fecha en Optionality sigue esta zona. Es local a este navegador; nada de aquí se publica ni se comparte.",

  // ─── profile.theme ───
  "profile.theme.label": "Preferencias",
  "profile.theme.title": "Cómo ves Optionality.",
  "profile.theme.intro": "Local a este navegador; nada de aquí se publica ni se comparte.",
  "profile.theme.dark": "🌑 Oscuro",
  "profile.theme.light": "☀ Claro",

  // ─── profile.language ───
  "profile.language.label": "Idioma",
  "profile.language.title": "Las palabras de estas páginas.",
  "profile.language.intro": "Se guarda en este navegador. Los escenarios, pistas y evaluaciones de la Firma siguen en inglés.",

  // ─── profile.build ───
  "profile.build.label": "Versión y licencia",
  "profile.build.title": "Código abierto, comercio privado.",
  "profile.build.intro": "Optionality y Tollbooth-DPYC™ se publican como código abierto bajo la licencia Apache 2.0: cualquiera puede leer el código, bifurcarlo y operar su propio operador.\nLos <i>servicios</i> alojados sobre ese código son comercio privado: cada operador fija sus peajes y su modelo de precios, y los clientes prepagan un saldo Lightning y pagan por llamada.\nEl protocolo es compartido; los negocios que lo usan no.",

  // ─── profile.key ───
  "profile.key.notNsec": "Eso no parece una cadena bech32 nsec1….",
  "profile.key.depositFailed": "El depósito falló.",
  "profile.key.ackMismatch": "La frase de confirmación no coincide exactamente.",
  "profile.key.withdrawFailed": "La retirada falló.",
  "profile.key.label": "Clave de persona de juego",
  "profile.key.title": "Custodia de la nsec",
  "profile.key.intro": "Si creaste tu npub expresamente para Optionality, puedes entregar la nsec al operador para que el servidor firme tus DM de Nostr por ti, sin extensión de firma (cómodo en iPad).\nLa nsec se guarda cifrada con AES-256-GCM.\n<b>No pegues aquí tu identidad Nostr real</b>, solo personas de juego recién creados.",
  "profile.key.deposit": "Depositar una nsec",
  "profile.key.encrypting": "Cifrando…",
  "profile.key.depositBtn": "Depositar",
  "profile.key.held": "✓ En manos de Optionality (cifrada en la bóveda). Los DM a otros jugadores pasan por el firmante del servidor, sin extensión de navegador.",
  "profile.key.withdraw": "Retirar y custodiar yo",
  "profile.key.ackIntro": "Escribe exactamente la frase de abajo para confirmar.\nLa nsec se muestra una sola vez para que la copies, y luego Optionality la olvida.\nDespués de retirarla necesitarás una extensión de firma Nostr (Alby, nos2x) para enviar DM.\nLa frase queda en inglés: el servidor la comprueba palabra por palabra.",
  "profile.key.ack": "Confirmación",
  "profile.key.cancel": "Cancelar",
  "profile.key.withdrawing": "Retirando…",
  "profile.key.confirm": "Confirmar retirada",
  "profile.key.copyNow": "<b>Copia tu nsec ahora.</b> Optionality la ha borrado de su bóveda.\nEs la única vez que se mostrará.\nGuárdala en un cliente Nostr (0xchat, Damus, Amber) o en un gestor de contraseñas.",
  "profile.key.copy": "Copiar",
  "profile.key.saved": "Ya la guardé",

  // ─── clock.left ───
  "clock.left": "quedan ~{{clock}}",

  // ─── clock.wrapping ───
  "clock.wrapping": "terminando…",

  // ─── deal.preparing ───
  "deal.preparing": "La Firma está preparando tu encargo",

  // ─── deal.elapsed ───
  "deal.elapsed": "Transcurrido",

  // ─── deal.estimate ───
  "deal.estimate": "Estimación",

  // ─── deal.claim ───
  "deal.claim": "Resguardo",

  // ─── deal.reassure ───
  "deal.reassure": "Tómate tu tiempo: puedes salir de esta página.\nTu encargo llega a tu <b>Diario</b> cuando esté listo, y sigue justo donde estaba si se cae tu conexión.",

  // ─── deal.claimInJournal ───
  "deal.claimInJournal": "Recoger en el Diario",

  // ─── deal.live ───
  "deal.live": "El modo en vivo busca en la web, así que puede tardar unos minutos.",

  // ─── lib.quotes ───
  "lib.quotes.0": "El dinero sano es un instrumento de protección de las libertades civiles frente a las intromisiones despóticas de los gobiernos.",
  "lib.quotes.1": "La curiosa tarea de la economía es demostrar a los hombres lo poco que saben realmente de lo que imaginan que pueden diseñar.",
  "lib.quotes.2": "El problema de fondo de la moneda convencional es toda la confianza que hace falta para que funcione.",
  "lib.quotes.3": "No creo que volvamos a tener un buen dinero antes de sacarlo de las manos del gobierno.",
  "lib.quotes.4": "La inflación es un impuesto sin legislación.",

  // ─── judge.title ───
  "judge.title": "Evaluando tu pitch",

  // ─── judge.sub ───
  "judge.sub": "Sopesando seis dimensiones de la propuesta",

  // ─── judge.dim ───
  "judge.dim.tail": "Riesgo de cola",

  // ─── ledger.title ───
  "ledger.title": "Registro de hechos",

  // ─── ledger.integrated ───
  "ledger.integrated": "Hechos que integraste",

  // ─── ledger.integratedNone ───
  "ledger.integratedNone": "Ninguno. Prueba a citar directamente los hechos relevantes.",

  // ─── ledger.missed ───
  "ledger.missed": "Hechos relevantes que se te escaparon",

  // ─── ledger.missedNone ───
  "ledger.missedNone": "Pleno: abordaste los hechos que importaban.",

  // ─── ledger.caught ───
  "ledger.caught": "Pistas falsas que dejaste de lado",

  // ─── ledger.caughtNone ───
  "ledger.caughtNone": "Ninguna anotada.",

  // ─── ledger.followed ───
  "ledger.followed": "Pistas falsas que arrastraron tu tesis",

  // ─── ledger.followedNone ───
  "ledger.followedNone": "Ninguna. Mantuviste el ruido fuera de la tesis.",

  // ─── legs.side ───
  "legs.side": "Lado",

  // ─── legs.type ───
  "legs.type": "Tipo",

  // ─── legs.strike ───
  "legs.strike": "Strike",

  // ─── legs.dte ───
  "legs.dte": "DHV",

  // ─── legs.premium ───
  "legs.premium": "Prima",

  // ─── legs.qty ───
  "legs.qty": "Cant.",

  // ─── legs.long ───
  "legs.long": "largo",

  // ─── legs.short ───
  "legs.short": "corto",

  // ─── legs.call ───
  "legs.call": "call",

  // ─── legs.put ───
  "legs.put": "put",

  // ─── legs.days ───
  "legs.days": "{{days}} d",

  // ─── risk.noLegs ───
  "risk.noLegs": "No se leyeron patas de operación estructuradas, así que el gráfico no está disponible. Las posiciones desnudas en acciones o bonos y las operaciones ilegibles no tienen gráfico.",

  // ─── risk.days ───
  "risk.days": "Días en la operación: {{days}} d",

  // ─── risk.entry ───
  "risk.entry": "(entrada)",

  // ─── risk.expiration ───
  "risk.expiration": "(vencimiento)",

  // ─── risk.overlay ───
  "risk.overlay": "Superponer la operación alternativa",

  // ─── risk.maxProfit ───
  "risk.maxProfit": "Ganancia máx.",

  // ─── risk.maxLoss ───
  "risk.maxLoss": "Pérdida máx.",

  // ─── risk.unlimited ───
  "risk.unlimited": "Ilimitada",

  // ─── risk.breakeven_one ───
  "risk.breakeven_one": "Punto de equilibrio",
  "risk.breakeven_other": "Puntos de equilibrio",

  // ─── risk.breakeven_other ───

  // ─── risk.iv ───
  "risk.iv": "IV usada",

  // ─── risk.r ───
  "risk.r": "r supuesta",

  // ─── risk.footnote ───
  "risk.footnote": "Black-Scholes sin dividendos.\nLa tasa libre de riesgo se fija en 4,5 %.\nLa vol se mantiene en la IV del escenario; no se modelan los efectos reales de la vol de la vol.\nCantidad por pata tal como se leyó, con un multiplicador de 100 acciones.",

  // ─── risk.parsed ───
  "risk.parsed": "Patas leídas",

  // ─── risk.yours ───
  "risk.yours": "Tu operación",

  // ─── risk.alt ───
  "risk.alt": "Operación alternativa",

  // ─── chain.triggerTitle ───
  "chain.triggerTitle": "Mostrar la cadena de opciones completa: toca un mid para comprar, vender o quitar",

  // ─── chain.title ───
  "chain.title": "Cadena de opciones",

  // ─── chain.legs_one ───
  "chain.legs_one": "{{count}} pata",
  "chain.legs_other": "{{count}} patas",

  // ─── chain.legs_other ───

  // ─── chain.close ───
  "chain.close": "Cerrar la cadena",

  // ─── chain.lede ───
  "chain.lede": "Toca un mid de <b>Call</b> o <b>Put</b> para comprar, vender o quitar un contrato.\nLos mids y deltas de la cadena salen de una sonrisa Black-Scholes anclada en las volatilidades ATM, put 25Δ y call 25Δ.\nLa columna IV lee la sonrisa en cada strike: la misma IV valora el call y el put de ese strike, porque la sonrisa es una sola curva, no dos.\nLa fila más cercana al spot (<b>{{spot}}</b>) se resalta como ATM.",

  // ─── chain.dte ───
  "chain.dte": "{{dte}} DHV",

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
  "chain.held": "{{side}} · haz clic para cambiar",

  // ─── chain.long ───
  "chain.long": "LARGO",

  // ─── chain.short ───
  "chain.short": "CORTO",

  // ─── chain.tapCall ───
  "chain.tapCall": "Haz clic para comprar o vender este call",

  // ─── chain.tapPut ───
  "chain.tapPut": "Haz clic para comprar o vender este put",

  // ─── chain.proposed ───
  "chain.proposed": "Estructura propuesta",

  // ─── chain.clearTitle ───
  "chain.clearTitle": "Borrar todas las patas",

  // ─── chain.clear ───
  "chain.clear": "Borrar",

  // ─── chain.noLegs ───
  "chain.noLegs": "Aún no hay patas. Toca un mid de Call o Put arriba para empezar.",

  // ─── chain.buyCaps ───
  "chain.buyCaps": "COMPRA",

  // ─── chain.sellCaps ───
  "chain.sellCaps": "VENTA",

  // ─── chain.fewer ───
  "chain.fewer": "Reducir contratos",

  // ─── chain.useRemove ───
  "chain.useRemove": "Usa Quitar para retirar esta pata",

  // ─── chain.oneFewer ───
  "chain.oneFewer": "Un contrato menos",

  // ─── chain.qty ───
  "chain.qty": "Cantidad de contratos",

  // ─── chain.more ───
  "chain.more": "Aumentar contratos",

  // ─── chain.oneMore ───
  "chain.oneMore": "Un contrato más",

  // ─── chain.net ───
  "chain.net": "Prima neta",

  // ─── chain.credit ───
  "chain.credit": "crédito",

  // ─── chain.debit ───
  "chain.debit": "débito",

  // ─── chain.buy ───
  "chain.buy": "Comprar",

  // ─── chain.sell ───
  "chain.sell": "Vender",

  // ─── chain.remove ───
  "chain.remove": "Quitar",

  // ─── chain.cancel ───
  "chain.cancel": "Cancelar",

  // ─── modeler.fiction ───
  "modeler.fiction": "Subyacente hipotético: los modeladores externos solo cotizan cadenas reales y listadas, así que este resultado es el de Optionality.",

  // ─── modeler.historical ───
  "modeler.historical": "Este escenario ocurre en el pasado. Los modeladores externos cotizan la cadena de hoy, no la de la fecha del escenario, así que este resultado es la reconstrucción de Optionality.",

  // ─── modeler.noPreset ───
  "modeler.noPreset": "Los modeladores externos no tienen plantilla para esta estructura; el resultado de arriba ya la cubre.",

  // ─── payoff.captionMulti ───
  "payoff.captionMulti": "Perfil al vencimiento más cercano · {{dte}} DHV · patas lejanas valoradas con Black-Scholes",

  // ─── payoff.caption ───
  "payoff.caption": "Perfil al vencimiento · {{dte}} DHV",

  // ─── payoff.credit ───
  "payoff.credit": "crédito {{amount}}",

  // ─── payoff.debit ───
  "payoff.debit": "débito {{amount}}",

  // ─── payoff.netEntry ───
  "payoff.netEntry": "Entrada neta",

  // ─── payoff.received ───
  "payoff.received": "crédito recibido",

  // ─── payoff.paid ───
  "payoff.paid": "débito pagado",

  // ─── payoff.rr ───
  "payoff.rr": "Beneficio : riesgo",

  // ─── payoff.undefined ───
  "payoff.undefined": "indefinido",

  // ─── payoff.breakeven ───
  "payoff.breakeven": "Punto de equilibrio",

  // ─── payoff.verifyTitle ───
  "payoff.verifyTitle": "Abrir este {{structure}} en {{provider}} para ver griegas, IV y probabilidad en vivo",

  // ─── payoff.verify ───
  "payoff.verify": "Verificar en {{provider}} ↗",

  // ─── payoff.verifyNote ───
  "payoff.verifyNote": "griegas · IV · probabilidad en vivo, sobre la cadena real",

  // ─── payoff.ticket ───
  "payoff.ticket": "Boleta de orden",

  // ─── payoff.copyTitle ───
  "payoff.copyTitle": "Copiar esta boleta estilo bróker al portapapeles",

  // ─── payoff.copied ───
  "payoff.copied": "copiado ✓",

  // ─── payoff.copy ───
  "payoff.copy": "copiar",

  // ─── payoff.try ───
  "payoff.try": "Probar una estructura de ejemplo",

  // ─── payoff.tryHint ───
  "payoff.tryHint": " · ejemplos para estudiar, no para enviar",

  // ─── payoff.presetsCaption ───
  "payoff.presetsCaption": "Ejemplos para estudiar, no para enviar. Las primas salen de la cadena real: los mismos números que verías si tocaras esos strikes tú mismo.",

  // ─── presets.0 ───
  "presets.0": "Put OTM vendido + put más bajo comprado. Spread de crédito alcista.",

  // ─── presets.1 ───
  "presets.1": "Call OTM vendido + call más alto comprado. Spread de crédito bajista.",

  // ─── presets.2 ───
  "presets.2": "Ambas alas vendidas, ambas alas compradas más lejos. Rango amplio.",

  // ─── presets.3 ───
  "presets.3": "Straddle ATM vendido + alas OTM lejanas compradas. Apuesta a un precio clavado.",

  // ─── presets.4 ───
  "presets.4": "Call ATM comprado + put ATM comprado. Jugada de vol antes de un evento.",

  // ─── presets.5 ───
  "presets.5": "Call OTM vendido + put OTM vendido. Cobro de prima en un rango.",

  // ─── presets.6 ───
  "presets.6": "Call ATM cercano vendido + call lejano comprado al mismo strike.",

  // ─── presets.7 ───
  "presets.7": "Put ATM cercano vendido + put lejano comprado al mismo strike.",

  // ─── presets.8 ───
  "presets.8": "Call lejano muy ITM comprado + call cercano OTM vendido.",

  // ─── payoff.replaceTitle ───
  "payoff.replaceTitle": "¿Reemplazar las patas actuales?",

  // ─── payoff.replaceBody_one ───
  "payoff.replaceBody_one": "Cargar <b>{{preset}}</b> reemplaza tu {{count}} pata actual por la estructura de la plantilla, con primas de la cadena en vivo.",
  "payoff.replaceBody_other": "Cargar <b>{{preset}}</b> reemplaza tus {{count}} patas actuales por la estructura de la plantilla, con primas de la cadena en vivo.",

  // ─── payoff.replaceBody_other ───

  // ─── payoff.keep ───
  "payoff.keep": "Conservar mis patas",

  // ─── payoff.replace ───
  "payoff.replace": "Reemplazar por {{preset}}",

  // ─── skew.level ───
  "skew.level.none": "Este escenario no trae IV Rank, así que juzga el nivel por la IV ATM ({{iv}} %) y tu propio criterio sobre si es alta para {{ticker}}.",
  "skew.level.rich": "IV Rank {{rank}}: la prima está rica (cara) frente al rango reciente de {{ticker}}.\nEs luz verde para el vendedor: las opciones están bien pagadas en todo el tablero ahora mismo.\nLuego el skew te dice qué strike vender.",
  "skew.level.mid": "IV Rank {{rank}}: la prima es intermedia, ni una ganga ni una sequía.\nApóyate en los catalizadores del escenario y deja que el skew decida dónde está el valor relativo.",
  "skew.level.cheap": "IV Rank {{rank}}: la prima está barata frente al rango de {{ticker}}.\nPoca recompensa para los vendedores; toda la curva está baja, así que sé más selectivo incluso donde el skew parece tentador.",

  // ─── skew.verdict ───
  "skew.verdict.flat": "Este escenario no trae anclas de sonrisa 25Δ, así que aquí la curva es una IV plana de {{iv}} % ATM: solo el nivel, no la forma.\nLee la skew_note del escenario para la historia del régimen.",
  "skew.verdict.smirkWide": "Smirk inverso (demanda de puts).\nEl put que compras ({{long}}) es claramente más rico en vol que el que vendes ({{short}}): el skew se come parte de tu crédito, pero el ala paga por el miedo.\nVende por debajo de la parte más empinada para tener un colchón real.",
  "skew.verdict.smirkNarrow": "Smirk inverso (demanda de puts).\nCerca del spot el skew es suave; ambas patas tienen una vol similar, así que el crédito es limpio.\nPero estás más cerca del dinero, así que el colchón es más fino.\nEl clásico compromiso.",
  "skew.verdict.forward": "Skew directo: aquí el ala rica es la de los calls.\nPara un put spread sobre {{ticker}} eso es favorable, porque los puts que operas están del lado más barato y plano.\nEl peligro que valora esta curva es un pico al alza, no un desplome.",
  "skew.verdict.symmetric": "Aproximadamente simétrica: ambas alas tienen una IV parecida.\nEl ATM no es un valle profundo ni está muy sesgado, así que léelo para el posicionamiento del spot o del evento en lugar de contar con que el skew pague un ala.",

  // ─── skew.trigger ───
  "skew.trigger": "Guía del skew",

  // ─── skew.close ───
  "skew.close": "Cerrar la guía",

  // ─── skew.title ───
  "skew.title": "Guía del skew",

  // ─── skew.lede ───
  "skew.lede": "La volatilidad implícita no es un solo número: es una <em>curva</em> a lo largo de los strikes, un mapa de dónde el mercado paga caro el miedo.\nPara quien vende prima muestra dónde el seguro está más <em>rico</em>, y en toda esta guía <b>rico significa caro</b> (una prima alta): bueno para <em>vender</em>, malo para comprar.\nNunca significa que quien tiene la opción se haga rico.",
  "skew.lede.smile": "La curva de abajo es la sonrisa <em>literal</em> que valora este escenario, anclada en <b>{{who}}</b> con spot <b>{{spot}}</b>, IV ATM a 30 días <b>{{iv}} %</b>, IV del put 25Δ <b>{{put}} %</b> e IV del call 25Δ <b>{{call}} %</b>.\nEs la misma sonrisa de la que la cadena de opciones saca el precio de cada strike.",
  "skew.lede.flat": "Este escenario se generó antes de que se registraran las anclas estructuradas de la sonrisa, así que la curva de abajo muestra una IV plana de <b>{{iv}} %</b> en todos los strikes: <em>solo nivel, sin forma</em>.\nLee la skew_note del escenario para la historia del régimen.",

  // ─── skew.aria ───
  "skew.aria": "Curva de skew de volatilidad implícita de {{ticker}}",

  // ─── skew.put25 ───
  "skew.put25": "put 25Δ",

  // ─── skew.call25 ───
  "skew.call25": "call 25Δ",

  // ─── skew.chip ───
  "skew.chip": "25Δ {{value}} pts",

  // ─── skew.leg ───
  "skew.leg.long": "compra {{strike}}",
  "skew.leg.short": "venta {{strike}}",

  // ─── skew.axis ───
  "skew.axis.spot": "SPOT",
  "skew.axis.strike": "STRIKE",
  "skew.axis.iv": "VOLATILIDAD IMPLÍCITA",

  // ─── skew.legend ───
  "skew.legend.curve": "curva de IV",
  "skew.legend.short": "put vendido",
  "skew.legend.long": "put comprado",
  "skew.legend.wings": "alas 25Δ (skew)",
  "skew.legend.spot": "spot ≈ {{spot}}",

  // ─── skew.slider ───
  "skew.slider": "Strike vendido (el put que vendes): arrástralo para bajarlo por la curva",

  // ─── skew.wide ───
  "skew.wide": "{{width}} de ancho",

  // ─── skew.read ───
  "skew.read.shortIv": "IV del put vendido",
  "skew.read.longIv": "IV del put comprado",
  "skew.read.gap": "Brecha de skew (de pata a pata)",
  "skew.read.fear": "Skew 25Δ (medidor de miedo)",

  // ─── skew.pts ───
  "skew.pts": "{{value}} pts",

  // ─── skew.card ───
  "skew.card.reverse.tag": "Acciones e índices: lo habitual",
  "skew.card.reverse.title": "Skew inverso (smirk)",
  "skew.card.reverse.body": "La IV sube a medida que bajan los strikes. <put>Los puts OTM son las opciones más caras del tablero.</put>\nEl mercado demanda permanentemente protección contra caídas: la demanda de cobertura eleva la IV a la baja.\nEste es el mundo en el que viven los bull put spreads.",
  "skew.card.smile.tag": "Divisas, acciones individuales, antes de eventos",
  "skew.card.smile.title": "Sonrisa de volatilidad",
  "skew.card.smile.body": "Ambas alas suben; el ATM es el valle barato.\nEl mercado teme un <em>gran movimiento en cualquier sentido</em> sin inclinarse claramente.\nEs típico antes de eventos binarios (resultados, FOMC, un dato de IPC) donde el riesgo de gap es en ambos sentidos.",
  "skew.card.forward.tag": "Materias primas: petróleo, gas, granos",
  "skew.card.forward.title": "Skew directo",
  "skew.card.forward.body": "La IV sube a medida que los strikes <em>suben</em>. <call>Los calls OTM son las opciones más caras del tablero</call> porque el choque temido es al <em>alza</em>: una interrupción del suministro que dispara el precio.\nLas energéticas viven más cerca de este régimen.",
  "skew.card.delta.tag": "El número que de verdad hay que mirar",
  "skew.card.delta.title": "Skew 25-delta",
  "skew.card.delta.body": "Inclinación = <b>IV del put 25Δ menos IV del call 25Δ</b>.\nUna brecha que se abre es el miedo encareciendo el ala de puts (tensión).\nUna brecha que se aplana es complacencia.\nEs la lectura más clara de cuánto miedo da este valor ahora mismo.",

  // ─── skew.sell ───
  "skew.sell.title": "Por qué importa cuando vendes prima",
  "skew.sell.intro": "No compras un seguro: lo suscribes.\nPero quien vende se hace en realidad <b>dos preguntas distintas</b>, y <em>el skew solo responde la segunda.</em>",

  // ─── skew.q ───
  "skew.q.head.question": "La pregunta",
  "skew.q.head.answered": "La responde",
  "skew.q.head.card": "En esta ficha",
  "skew.q.rich": "«¿Está la prima <em>rica</em> ahora mismo?»",
  "skew.q.richBy": "<b>Nivel de IV + IV Rank</b>: lo alta que está toda la curva",
  "skew.q.card": "IV 30 d {{iv}} %",
  "skew.q.cardRank": "IV 30 d {{iv}} %, IV Rank {{rank}}",
  "skew.q.which": "«¿<em>Qué strike</em>, y con qué estructura, me deja quedarme con la mayor parte?»",
  "skew.q.whichBy": "<b>El skew</b>: la <em>forma</em> de la curva a lo largo de los strikes",
  "skew.q.curve": "la curva de arriba",

  // ─── skew.levelPays ───
  "skew.levelPays": "<b>El nivel es lo que te paga. El skew solo decide cómo se reparte ese pago entre los strikes y qué estructura lo captura o lo devuelve.</b>\nUna curva rica (cara) significa que las opciones están bien pagadas en todas partes; el skew es tu tabla actuarial para saber dónde se concentra el sobrepago.",

  // ─── skew.step1 ───
  "skew.step1": "Paso 1 · La lectura del nivel (entrar o no)",

  // ─── skew.step2 ───
  "skew.step2": "Paso 2 · La lectura de la forma, y el matiz del spread",
  "skew.step2.intro": "Cuando el nivel dice «juega», el skew dice <em>cómo</em>.\nLas dos estructuras de vendedor usan el skew de formas opuestas:",
  "skew.step2.csp": "<b>Put cubierto con efectivo</b> (vender un put solo): un skew de puts empinado es puro <em>viento a favor</em>.\nCobras la opción más rica y más cargada de miedo del tablero, y te la quedas entera.",
  "skew.step2.bps": "<b>Bull put spread</b> (vender el put más alto, comprar el más bajo): aquí un skew empinado es un <em>impuesto</em>.\nEl put que <b>compras</b> está más arriba en la curva que el que <b>vendes</b>, así que pagas caro y cobras barato.\nCuanto más empinado el skew, menor tu crédito neto.\nEse crédito reducido es el precio de un riesgo limitado y definido.\nMira cómo el indicador de <b>brecha de skew</b> hace justo eso cuando bajas el strike vendido.",

  // ─── skew.fearOpportunity ───
  "skew.fearOpportunity": "Así que <gold>«miedo = oportunidad»</gold> y el matiz del spread no se contradicen.\nUn ala de puts cargada de miedo significa una <em>prima absoluta elevada</em> (bueno: cobras más), mientras que la <em>inclinación</em> de esa ala es lo que un spread devuelve a cambio de limitar el riesgo.\nTu ventaja es la misma en ambas estructuras: vende donde el miedo que valora el mercado sea <b>más rico que tu propia convicción de que el precio aguantará</b>.",

  // ─── skew.check ───
  "skew.check.title": "Una lista práctica de lectura",
  "skew.check.see": "Lo que ves",
  "skew.check.means": "Lo que significa",
  "skew.check.move": "La jugada del vendedor",
  "skew.check.0.see": "IV Rank alto + skew de puts empinado",
  "skew.check.0.means": "Prima rica (cara) Y esa riqueza está en los puts",
  "skew.check.0.move": "El planteamiento de manual del vendedor: un ala rica que vender, y el nivel dice que está bien pagada",
  "skew.check.1.see": "Skew de puts empinado",
  "skew.check.1.means": "Miedo al desplome caro",
  "skew.check.1.move": "La prima de los puts es gorda: pon tu strike vendido <em>por debajo</em> de la parte más empinada de la rampa, para cobrar prima cargada de miedo en un strike que el precio aún tiene margen para evitar",
  "skew.check.2.see": "Skew plano",
  "skew.check.2.means": "Complacencia",
  "skew.check.2.move": "Prima fina, poco colchón en el precio: sé más selectivo",
  "skew.check.3.see": "Skew que se empina rápido",
  "skew.check.3.means": "Crece la tensión",
  "skew.check.3.move": "La IV se expande: se abre la ventana de entrada",
  "skew.check.4.see": "Se forma una sonrisa",
  "skew.check.4.means": "Evento binario por delante",
  "skew.check.4.move": "Riesgo de gap en ambos sentidos: no te quedes vendido durante él",
  "skew.check.5.see": "Skew directo (energía)",
  "skew.check.5.means": "Se teme un choque al alza",
  "skew.check.5.move": "Los calls son el ala cara; los puts, relativamente baratos para vender",

  // ─── skew.foot ───
  "skew.foot.smile": "La curva es la sonrisa literal de tres anclas que valora este escenario: IV ATM {{iv}} %, IV del put 25Δ {{put}} %, IV del call 25Δ {{call}} %, anclada en el spot de {{ticker}} de {{spot}}.\nLas tablas de la cadena de opciones valoran cada strike con esta misma sonrisa.\nLa vol implícita es la apuesta del mercado sobre el futuro, no un pronóstico: léela como sentimiento con precio.",
  "skew.foot.flat": "Este escenario es anterior a las anclas estructuradas de la sonrisa, así que la curva es una IV plana de {{iv}} % en todos los strikes (nivel, no forma).\nLee la skew_note del escenario para la historia del régimen hasta que recibas un escenario nuevo.",

  // ─── sample.label ───
  "sample.label": "Ejemplo · Solo ilustrativo",

  // ─── sample.title ───
  "sample.title": "Así es una evaluación de pitch de Optionality.",

  // ─── sample.intro ───
  "sample.intro": "Una ronda real la compone la Firma desde cero, según el modo y el persona que elijas.\nLuego se presenta a un segundo LLM que te califica en seis dimensiones, y se guarda en tu Diario.\nEsta es fija: una oportunidad de marzo de 2023, un pitch de put spread a crédito y una evaluación completa.\nÚsala para ver lo que ofrece el juego antes de poner sats sobre la mesa.\nLa Firma escribe sus escenarios y evaluaciones en inglés.",

  // ─── sample.scenario ───
  "sample.scenario": "Escenario · {{date}}",

  // ─── sample.maxLoss ───
  "sample.maxLoss": "Límite de pérdida máx.",

  // ─── sample.pitch ───
  "sample.pitch": "Pitch del alumno",

  // ─── dm.failed ───
  "dm.failed": "El DM no se envió.",

  // ─── dm.titleSelf ───
  "dm.titleSelf": "Enviarte un DM",

  // ─── dm.title ───
  "dm.title": "Enviar DM",

  // ─── dm.you ───
  "dm.you": " (tú)",

  // ─── dm.selfNote ───
  "dm.selfNote": "DM a ti mismo: el mensaje llega a la bandeja de entrada de tu propio cliente Nostr.\nEs una forma de comprobar de punta a punta tu firmante NIP-07 y la ruta de los relés sin molestar a nadie.",

  // ─── dm.loading ───
  "dm.loading": "El conjunto de relés compartido aún se está cargando. Cierra esto y vuelve a intentarlo en un momento.",

  // ─── dm.close ───
  "dm.close": "Cerrar",

  // ─── dm.placeholder ───
  "dm.placeholder": "Escribe un solo mensaje. El destinatario lo ve en su cliente Nostr.",

  // ─── dm.escrowNote ───
  "dm.escrowNote": "Firmado por Optionality con tu nsec en custodia, guardada en un almacenamiento gestionado por el operador.\nEl DM aparece en Nostr firmado por tu npub.\nRetira la clave cuando quieras en <b>Perfil → Clave de persona de juego</b>.",

  // ─── dm.nip07Note_one ───
  "dm.nip07Note_one": "Firmado localmente por tu extensión NIP-07; tu nsec nunca llega a Optionality.\nPublicado en <b>{{count}}</b> relé del conjunto DPYC compartido.",
  "dm.nip07Note_other": "Firmado localmente por tu extensión NIP-07; tu nsec nunca llega a Optionality.\nPublicado en <b>{{count}}</b> relés del conjunto DPYC compartido.",

  // ─── dm.nip07Note_other ───

  // ─── dm.cancel ───
  "dm.cancel": "Cancelar",

  // ─── dm.send ───
  "dm.send": "Firmar y enviar",

  // ─── dm.sending ───
  "dm.sending": "Cifrando, firmando, difundiendo…",

  // ─── dm.sent ───
  "dm.sent": "✓ Enviado",

  // ─── dm.notAccepted ───
  "dm.notAccepted": "✗ No aceptado",

  // ─── dm.relays ───
  "dm.relays": "{{ok}} / {{total}} relés",

  // ─── dm.perRelay ───
  "dm.perRelay": "Resultados por relé",

  // ─── dm.eventNote ───
  "dm.eventNote": "Id del evento <id>{{id}}…</id>. El destinatario lo ve en cualquier cliente Nostr suscrito a uno de estos relés.",

  // ─── dm.serverNote ───
  "dm.serverNote": "El DM va en camino por la red de relés de Optionality. El destinatario lo verá en su cliente Nostr.",

  // ─── dm.done ───
  "dm.done": "Listo",

  // ─── dm.tryAgain ───
  "dm.tryAgain": "Reintentar",

  // ─── dm.install ───
  "dm.install": "<b>Instala una extensión de firma Nostr</b> para enviar DM.\nOptionality nunca ve tu nsec: la extensión firma el DM en su propio entorno aislado y el mensaje cifrado va directo a los relés.",

  // ─── dm.alby ───
  "dm.alby": "Extensión de navegador + iOS / Android. Incluye también una billetera Lightning.",

  // ─── dm.nos2x ───
  "dm.nos2x": "Extensión mínima para Chrome / Firefox. Solo NIP-07, sin billetera.",

  // ─── dm.flamingo ───
  "dm.flamingo": "Envoltorio para iOS / escritorio alrededor de tu nsec; ofrece NIP-07 a las páginas web.",

  // ─── nostr.badNpub ───
  "nostr.badNpub": "npub no válida: {{npub}}",

  // ─── nostr.noRelays ───
  "nostr.noRelays": "No hay relés configurados. Añade al menos uno en Perfil → Relés Nostr.",

  // ─── nostr.noSigner ───
  "nostr.noSigner": "No se detectó un firmante NIP-07. Instala Alby, nos2x o Flamingo.",

  // ─── nostr.empty ───
  "nostr.empty": "El mensaje no puede estar vacío.",

  // ─── glossary.delta_neutral ───
  "glossary.delta_neutral": "Posición con delta neto cercano a cero: el P/G direccional se anula al construirla. Las ganancias salen del vega, el theta o el gamma, no de la dirección del precio.",

  // ─── glossary.iron_condor ───
  "glossary.iron_condor": "Vender un call spread OTM y un put spread OTM con el mismo vencimiento. Operación de cobro de prima con riesgo definido; gana si el subyacente se queda entre los dos strikes vendidos.",

  // ─── glossary.iron_butterfly ───
  "glossary.iron_butterfly": "Vender un straddle ATM y comprar alas OTM de protección. Versión con riesgo definido de un straddle vendido; ganancia máxima si el subyacente se clava en el strike vendido.",

  // ─── glossary.jade_lizard ───
  "glossary.jade_lizard": "Call spread vendido + put vendido cuya prima total supera la anchura del call spread. Sin riesgo al alza; la bajada queda acotada por dónde está el put vendido.",

  // ─── glossary.calendar_spread ───
  "glossary.calendar_spread": "Vender una opción cercana y comprar otra más lejana al mismo strike. Aprovecha el theta en la pata cercana y la subida del vega en la lejana.",

  // ─── glossary.diagonal_spread ───
  "glossary.diagonal_spread": "Calendar spread con strikes distintos: añade una inclinación direccional a la jugada de volatilidad en el tiempo.",

  // ─── glossary.ratio_spread ───
  "glossary.ratio_spread": "Comprar una opción y vender dos (o más) del mismo tipo más OTM. Entrada barata o incluso a crédito; riesgo de cola si el subyacente rebasa los strikes vendidos.",

  // ─── glossary.vertical_spread ───
  "glossary.vertical_spread": "Comprar una opción y vender otra del mismo tipo y vencimiento a otro strike. Riesgo definido, beneficio definido. Bull call / bear put / bear call / bull put.",

  // ─── glossary.credit_spread ───
  "glossary.credit_spread": "Vertical en la que la opción vendida tiene más prima que la comprada: se cobra prima al entrar. Gana si el subyacente se mantiene lejos del strike vendido.",

  // ─── glossary.debit_spread ───
  "glossary.debit_spread": "Vertical en la que la opción comprada cuesta más que la vendida: se paga al entrar. Gana si el subyacente va hacia el strike comprado.",

  // ─── glossary.short_strangle ───
  "glossary.short_strangle": "Vender un call OTM y un put OTM. Riesgo no definido en ambos sentidos; cobra dos primas por asumir ese riesgo.",

  // ─── glossary.short_straddle ───
  "glossary.short_straddle": "Vender un call ATM y un put ATM. Máximo cobro de prima, máximo riesgo gamma: movimientos pequeños cuestan dinero de verdad muy rápido.",

  // ─── glossary.long_straddle ───
  "glossary.long_straddle": "Comprar un call ATM y un put ATM. Paga en movimientos explosivos en cualquier sentido; pierde theta si el subyacente no se mueve.",

  // ─── glossary.long_strangle ───
  "glossary.long_strangle": "Comprar un call OTM y un put OTM. Más barato que un straddle; necesita un movimiento mayor para pagar.",

  // ─── glossary.covered_call ───
  "glossary.covered_call": "Acciones en cartera + call vendido a un strike más alto. Renuncia a la subida por encima del strike a cambio de prima y un pequeño colchón.",

  // ─── glossary.cash_secured_put ───
  "glossary.cash_secured_put": "Put vendido con efectivo disponible para comprar las acciones si te asignan. Una forma paciente de entrar largo en la acción a un costo efectivo menor.",

  // ─── glossary.protective_put ───
  "glossary.protective_put": "Acciones en cartera + put comprado. Un seguro contra la caída; su costo es la prima del put.",

  // ─── glossary.put_spread ───
  "glossary.put_spread": "Spread vertical con puts. Bear put = pagar débito, ganar con las bajadas; bull put = cobrar crédito, ganar si se mantiene por encima del strike vendido.",

  // ─── glossary.call_spread ───
  "glossary.call_spread": "Spread vertical con calls. Bull call = pagar débito, ganar con las subidas; bear call = cobrar crédito, ganar si se mantiene por debajo del strike vendido.",

  // ─── glossary.iv_crush ───
  "glossary.iv_crush": "Caída brusca de la volatilidad implícita tras un evento (resultados, FDA, FOMC). Las estructuras largas en vol pierden; las cortas en vol ganan.",

  // ─── glossary.vol_crush ───
  "glossary.vol_crush": "La misma idea que el IV crush: la volatilidad implícita se desploma tras el evento y desinfla las primas, sea cual sea la dirección.",

  // ─── glossary.vol_regime ───
  "glossary.vol_regime": "El entorno de volatilidad de la operación: realizada frente a implícita, IV rank, forma de la estructura temporal, skew. Determina si comprar o vender prima.",

  // ─── glossary.iv_rank ───
  "glossary.iv_rank": "Dónde está la volatilidad implícita actual dentro de su rango de un año, de 0 a 100. Un IV rank alto favorece vender prima; bajo, comprar prima o calendars.",

  // ─── glossary.skew ───
  "glossary.skew": "Diferencia de volatilidad implícita entre strikes. Skew de acciones = los puts cotizan más caros que los calls; skew inverso (materias primas) = los calls más caros.",

  // ─── glossary.term_structure ───
  "glossary.term_structure": "Cómo varía la volatilidad implícita entre vencimientos. Contango = meses lejanos más altos (mercado tranquilo); backwardation = meses cercanos más altos (tensión).",

  // ─── glossary.gamma_risk ───
  "glossary.gamma_risk": "Riesgo de que el delta cambie más rápido de lo que puedes cubrir. Las posiciones cortas en gamma pierden en un mercado volátil y errático.",

  // ─── glossary.vega_exposure ───
  "glossary.vega_exposure": "Sensibilidad a los cambios de volatilidad implícita. Largo en vega = gana si sube la IV; corto en vega = gana si baja.",

  // ─── glossary.theta_decay ───
  "glossary.theta_decay": "La erosión diaria de la prima que cobran los vendedores de opciones y pagan los compradores. Se acelera al acercarse el vencimiento.",

  // ─── glossary.delta ───
  "glossary.delta": "Cambio aproximado del precio de la opción por un movimiento de 1 $ del subyacente. También aproxima la probabilidad de acabar ITM.",

  // ─── glossary.gamma ───
  "glossary.gamma": "Ritmo de cambio del delta. Gamma alto = el delta oscila rápido: favorable a quien compra opciones, hostil a quien las vende cerca de los strikes.",

  // ─── glossary.vega ───
  "glossary.vega": "Cambio del precio de la opción por cada punto de volatilidad implícita. Las opciones compradas tienen vega positivo; las vendidas, negativo.",

  // ─── glossary.theta ───
  "glossary.theta": "Pérdida diaria del valor temporal de una opción. Las opciones compradas pagan theta; las vendidas lo cobran.",

  // ─── glossary.rho ───
  "glossary.rho": "Sensibilidad del precio de una opción a la tasa libre de riesgo. Mayor en vencimientos largos; a menudo irrelevante en los cortos.",

  // ─── glossary.moneyness ───
  "glossary.moneyness": "Qué tan lejos está el strike de una opción del spot: ITM (dentro del dinero), ATM (en el dinero) u OTM (fuera del dinero). La distancia OTM importa para el delta.",

  // ─── glossary.breakeven ───
  "glossary.breakeven": "El precio del subyacente al vencimiento en que el P/G de la operación es exactamente cero. Las estructuras de varias patas pueden tener dos (p. ej. los condors).",

  // ─── glossary.max_loss ───
  "glossary.max_loss": "El peor resultado al vencimiento si mantienes hasta el final. Las estructuras de riesgo definido lo limitan; las ventas en descubierto tienen pérdida máxima ilimitada.",

  // ─── glossary.max_gain ───
  "glossary.max_gain": "El mejor resultado al vencimiento. Comprando prima es ilimitado (calls) o grande (puts); vendiendo prima es el crédito cobrado.",

  // ─── glossary.dte ───
  "glossary.dte": "Días hasta el vencimiento. Determinan la aceleración del theta y la exposición al vega. Por debajo de 21 días las estructuras suelen estar dominadas por el gamma; por encima de 45, por el vega.",

  // ─── glossary.assignment_risk ───
  "glossary.assignment_risk": "Riesgo de que una opción vendida se ejerza antes de tiempo y te obligue a entregar o recibir acciones. Máximo cerca del vencimiento y en torno a la fecha ex dividendo.",

  // ─── glossary.pin_risk ───
  "glossary.pin_risk": "Riesgo de que el subyacente cierre justo en un strike vendido al vencimiento, dejándote sin saber si te asignarán.",

  // ─── glossary.expected_move ───
  "glossary.expected_move": "Rango aproximado de una desviación típica para el subyacente en un periodo dado. Suele salir del precio del straddle o de volatilidad implícita × raíz(tiempo).",

  // ─── glossary.atm_straddle ───
  "glossary.atm_straddle": "Comprar o vender un call en el dinero y un put en el dinero. El straddle ATM comprado es la operación típica de «espero un gran movimiento».",

  // ─── glossary.wheel_strategy ───
  "glossary.wheel_strategy": "Vender puts cubiertos con efectivo sobre una acción que querrías tener; si te asignan, vender calls cubiertos hasta que te la reclamen. Y repetir. El manual de cobro de prima.",

  // ─── glossary.chartLink ───
  "glossary.chartLink": "Abrir el gráfico de {{symbol}} en TradingView",

  // ─── chart.underlying ───
  "chart.underlying": "Subyacente  {{price}}",

  // ─── chart.net ───
  "chart.net": "P/G neto",

  // ─── chart.alt ───
  "chart.alt": "P/G alt.",

  // ─── chart.spot ───
  "chart.spot": "spot",
};

export default words;
