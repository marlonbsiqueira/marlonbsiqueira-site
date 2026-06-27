/* =============================================================
   i18n.js — bilingual dictionary (EN / PT) + toggle controller
   Every translatable node carries data-i18n="key".
   Values may contain inline HTML (used with innerHTML).
   ============================================================= */

const I18N = {
  en: {
    /* chrome */
    "brand.role": "Finance Transformation",
    "nav.next": "Next",
    "nav.back": "Back",
    "lang.aria": "Select language",

    /* rail labels */
    "dot.1": "Intro",
    "dot.2": "Impact",
    "dot.3": "Global Reach",
    "dot.4": "Experience",
    "dot.5": "Education",
    "dot.6": "Capabilities",
    "dot.7": "Contact",
    "impact.eyebrow": "Impact at Scale",
    "impact.note": "Cumulative outcomes delivered across multinational SSC/GBS programmes.",
    "ph.photo": "Drop your portrait here · square, ≥800px",

    /* ---- Slide 1 — Hero ---- */
    "hero.eyebrow": "Finance Transformation Manager · SAP S/4HANA · Automation · Analytics",
    "hero.headline": "I lead finance transformation <span class='text-gold'>across borders</span>, at scale, with measurable impact.",
    "hero.value": "12+ years across Portugal, Ireland and Brazil — translating enterprise-wide complexity into governed, scalable solutions at the intersection of SAP S/4HANA, intelligent automation and advanced analytics.",
    "hero.chip.loc": "Porto, Portugal",
    "hero.chip.eu": "EU Citizen · Brazilian & Italian",
    "hero.chip.belt": "Lean Six Sigma Black Belt",
    "hero.chip.open": "Open to international relocation",
    "hero.cta": "Begin the journey",
    "hero.hint": "Use the path, arrows or swipe to fly through",
    "hero.badge.years": "12+ yrs",
    "hero.badge.label": "International",
    "metric.savings.l": "Productivity savings",
    "metric.fte.l": "Direct efficiency contribution",
    "metric.entities.l": "EU entities transformed",
    "metric.solutions.l": "Automation solutions delivered",

    /* ---- Slide 2 — Globe ---- */
    "globe.eyebrow": "International Profile",
    "globe.title": "A career built across borders.",
    "globe.lede": "From Belo Horizonte to Dublin to Porto — delivering finance transformation, tax advisory and intelligent automation across more than fifteen European entities and three countries of residence.",
    "globe.legend.base": "Home base — Porto",
    "globe.legend.lived": "Lived & worked",
    "globe.legend.served": "Markets served",
    "globe.stat.countries": "Countries of residence",
    "globe.stat.entities": "EU entities served",
    "globe.stat.jurisdictions": "EU tax jurisdictions",
    "globe.legend.worked": "Lived &amp; worked",
    "globe.legend.visited": "Visited",
    "globe.stat.worked": "Countries worked",
    "flow.data": "Data &amp; Analytics",
    "flow.process": "Process &amp; FP&amp;A",
    "flow.quality": "Quality · DMAIC",
    "flow.hub": "Continuous Improvement",
    "flow.sap": "SAP S/4HANA",
    "flow.auto": "Intelligent Automation",

    /* ---- Slide 3 — Experience ---- */
    "exp.eyebrow": "Professional Experience",
    "exp.title": "A track record across industries and continents.",
    "exp.subtitle": "From SSC/GBS transformation to strategic FP&A and EU tax advisory.",
    "exp.now": "Current",

    "exp.stellantis.role": "Senior Finance & Digital Transformation Specialist",
    "exp.stellantis.meta": "Shared Services Centre of Excellence · Porto",
    "exp.stellantis.b1": "Led SAP S/4HANA finance transformation (R2R, P2P, OTC) across 15+ European entities — full UAT cycles, 25+ post-go-live improvements, 10–20% cycle-time reduction.",
    "exp.stellantis.b2": "Architected 20+ automation solutions (RPA, VBA, Power Platform) — ~9 FTE personal efficiency, ~18 FTE team portfolio impact, €200K+ savings.",
    "exp.stellantis.b3": "Engineered a 200,000+ automated communications programme across the EU — GDPR-compliant, fully auditable, zero disruption.",

    "exp.fyi.role": "Finance Manager",
    "exp.fyi.meta": "FYI Digital Innovation · Porto",
    "exp.fyi.b1": "Built AP/AR, cash-flow forecasting and a financial control framework from the ground up — cash conversion cycle improved by 15 days, DSO down 20%.",
    "exp.fyi.b2": "Recovered ~€18K in receivables and eliminated recurring banking penalties through disciplined liquidity planning.",
    "exp.fyi.b3": "Cut audit preparation time 50–60% with clean findings; developed a team of 4.",

    "exp.renova.role": "Financial Analyst",
    "exp.renova.meta": "Fundação Renova · Belo Horizonte",
    "exp.renova.b1": "Managed budgeting, forecasting and variance analysis across an R$11B+ portfolio spanning 40+ cost centres under high public scrutiny.",
    "exp.renova.b2": "Implemented SAP procurement controls and automated reporting — manual reporting time down 40–60%, rework down 50%.",

    "exp.meridian.role": "VAT Analyst",
    "exp.meridian.meta": "Meridian Global Services · Dublin",
    "exp.meridian.b1": "Managed VAT compliance and reclaim across 30+ EU jurisdictions for 15+ multinational clients — 100% audit success, zero adjustments.",
    "exp.meridian.b2": "Built deep EU indirect-tax advisory expertise through cross-border transaction analysis for major technology multinationals.",

    "exp.ale.role": "Senior Cost & Budget Analyst",
    "exp.ale.meta": "ALE Combustíveis · Belo Horizonte",
    "exp.ale.b1": "Built cost models across 40+ fuel distribution bases supporting strategic pricing on multi-billion-litre volumes.",
    "exp.ale.b2": "Created the company's first historical cost database — surfaced a zero-margin operation; enabled ~20–30% storage cost reduction.",

    "exp.vale.role": "Continuous Improvement Intern",
    "exp.vale.meta": "Vale S.A. · Minas Gerais",
    "exp.vale.b1": "Applied Lean Six Sigma, Kaizen, 5S and PDCA across iron-ore extraction sites — embedding the continuous-improvement discipline behind all later work.",

    /* ---- Slide 4 — Education ---- */
    "edu.eyebrow": "Education & Certifications",
    "edu.title": "Academic foundation, certified depth.",
    "edu.pg.yr": "2019 – 2020",
    "edu.pg.deg": "Postgraduate Diploma — Finance & Taxation",
    "edu.pg.inst": "Porto Business School, Portugal",
    "edu.bsc.yr": "2009 – 2013",
    "edu.bsc.deg": "BSc Business Administration",
    "edu.bsc.inst": "Faculdade Arnaldo, Brazil",
    "edu.cert.label": "Certifications",
    "edu.mensa.h": "Mensa Brasil Member",
    "edu.mensa.p": "Admitted in 2014 at the 98th percentile or above — member MB 1129 of the world's largest high-IQ society.",
    "edu.mensa.seal": "TOP 2%",

    /* ---- Slide 5 — Skills ---- */
    "sk.eyebrow": "Knowledge & Capabilities",
    "sk.title": "The technical foundation behind the transformation.",
    "sk.cap.finance": "Finance Transformation",
    "sk.cap.auto": "Automation & Analytics",
    "sk.cap.ai": "AI & Productivity",
    "sk.cap.method": "Continuous Improvement",
    "sk.prof.label": "Proficiency",
    "sk.lvl.expert": "Expert",
    "sk.lvl.advanced": "Advanced",
    "sk.lvl.applied": "Applied",
    "sk.lvl.proficient": "Proficient",

    /* ---- Slide 6 — Contact ---- */
    "ct.eyebrow": "Let's Connect",
    "ct.signoff": "Let's discuss your next <span class='text-gold'>transformation.</span>",
    "ct.lede": "Always open to meaningful professional conversations — finance transformation, automation, analytics or knowledge sharing.",
    "ct.email.l": "Email",
    "ct.linkedin.l": "LinkedIn",
    "ct.site.l": "Portfolio",
    "ct.phone.l": "Phone",
    "ct.cta": "Start a conversation",
    "ct.foot": "Lean Six Sigma Black Belt · Full EU Work Authorisation · Open to international relocation",
  },

  pt: {
    /* chrome */
    "brand.role": "Transformação Financeira",
    "nav.next": "Avançar",
    "nav.back": "Voltar",
    "lang.aria": "Selecionar idioma",

    /* rail labels */
    "dot.1": "Introdução",
    "dot.2": "Impacto",
    "dot.3": "Alcance Global",
    "dot.4": "Experiência",
    "dot.5": "Formação",
    "dot.6": "Competências",
    "dot.7": "Contacto",
    "impact.eyebrow": "Impacto à Escala",
    "impact.note": "Resultados acumulados em programas multinacionais de SSC/GBS.",
    "ph.photo": "Coloque o seu retrato aqui · quadrado, ≥800px",

    /* ---- Slide 1 — Hero ---- */
    "hero.eyebrow": "Manager de Transformação Financeira · SAP S/4HANA · Automação · Analytics",
    "hero.headline": "Lidero a transformação financeira <span class='text-gold'>além-fronteiras</span>, à escala, com impacto mensurável.",
    "hero.value": "12+ anos entre Portugal, Irlanda e Brasil — traduzo a complexidade empresarial em soluções governadas e escaláveis, no cruzamento entre SAP S/4HANA, automação inteligente e analytics avançada.",
    "hero.chip.loc": "Porto, Portugal",
    "hero.chip.eu": "Cidadão Europeu · Brasileiro & Italiano",
    "hero.chip.belt": "Lean Six Sigma Black Belt",
    "hero.chip.open": "Disponível para relocalização internacional",
    "hero.cta": "Começar a jornada",
    "hero.hint": "Use o percurso, as setas ou o swipe para voar",
    "hero.badge.years": "12+ anos",
    "hero.badge.label": "Internacional",
    "metric.savings.l": "Ganhos de produtividade",
    "metric.fte.l": "Contribuição direta de eficiência",
    "metric.entities.l": "Entidades europeias transformadas",
    "metric.solutions.l": "Soluções de automação entregues",

    /* ---- Slide 2 — Globe ---- */
    "globe.eyebrow": "Perfil Internacional",
    "globe.title": "Uma carreira construída além-fronteiras.",
    "globe.lede": "De Belo Horizonte a Dublin e ao Porto — entregando transformação financeira, consultoria fiscal e automação inteligente em mais de quinze entidades europeias e três países de residência.",
    "globe.legend.base": "Base — Porto",
    "globe.legend.lived": "Onde vivi e trabalhei",
    "globe.legend.served": "Mercados atendidos",
    "globe.stat.countries": "Países de residência",
    "globe.stat.entities": "Entidades europeias atendidas",
    "globe.stat.jurisdictions": "Jurisdições fiscais da UE",
    "globe.legend.worked": "Onde vivi e trabalhei",
    "globe.legend.visited": "Visitei",
    "globe.stat.worked": "Países onde trabalhei",
    "flow.data": "Dados &amp; Analytics",
    "flow.process": "Processos &amp; FP&amp;A",
    "flow.quality": "Qualidade · DMAIC",
    "flow.hub": "Melhoria Contínua",
    "flow.sap": "SAP S/4HANA",
    "flow.auto": "Automação Inteligente",

    /* ---- Slide 3 — Experience ---- */
    "exp.eyebrow": "Experiência Profissional",
    "exp.title": "Um percurso entre indústrias e continentes.",
    "exp.subtitle": "Da transformação em SSC/GBS ao FP&A estratégico e à consultoria fiscal europeia.",
    "exp.now": "Atual",

    "exp.stellantis.role": "Especialista Sénior em Transformação Financeira & Digital",
    "exp.stellantis.meta": "Centro de Serviços Partilhados de Excelência · Porto",
    "exp.stellantis.b1": "Liderei a transformação financeira em SAP S/4HANA (R2R, P2P, OTC) em 15+ entidades europeias — ciclos completos de UAT, 25+ melhorias pós-go-live, redução de 10–20% nos tempos de ciclo.",
    "exp.stellantis.b2": "Concebi 20+ soluções de automação (RPA, VBA, Power Platform) — ~9 FTE de eficiência pessoal, ~18 FTE de impacto na equipa, €200K+ de poupança.",
    "exp.stellantis.b3": "Desenvolvi um programa de 200.000+ comunicações automatizadas na UE — conforme RGPD, totalmente auditável, sem qualquer disrupção.",

    "exp.fyi.role": "Diretor Financeiro",
    "exp.fyi.meta": "FYI Digital Innovation · Porto",
    "exp.fyi.b1": "Construí processos de AP/AR, previsão de tesouraria e um framework de controlo financeiro de raiz — ciclo de conversão de caixa melhorado em 15 dias, DSO reduzido em 20%.",
    "exp.fyi.b2": "Recuperei ~€18K em créditos e eliminei penalizações bancárias recorrentes através de uma gestão de liquidez disciplinada.",
    "exp.fyi.b3": "Reduzi o tempo de preparação de auditoria em 50–60% com pareceres limpos; desenvolvi uma equipa de 4 pessoas.",

    "exp.renova.role": "Analista Financeiro",
    "exp.renova.meta": "Fundação Renova · Belo Horizonte",
    "exp.renova.b1": "Geri orçamentação, previsão e análise de desvios num portefólio de R$11B+ em 40+ centros de custo, sob elevado escrutínio público.",
    "exp.renova.b2": "Implementei controlos de compras em SAP e relatórios automatizados — tempo de reporte manual reduzido em 40–60%, retrabalho em 50%.",

    "exp.meridian.role": "Analista de IVA",
    "exp.meridian.meta": "Meridian Global Services · Dublin",
    "exp.meridian.b1": "Geri conformidade e reembolso de IVA em 30+ jurisdições da UE para 15+ clientes multinacionais — 100% de sucesso em auditoria, zero ajustamentos.",
    "exp.meridian.b2": "Desenvolvi profunda especialização em fiscalidade indireta da UE através da análise de transações transfronteiriças para grandes multinacionais tecnológicas.",

    "exp.ale.role": "Analista Sénior de Custos & Orçamento",
    "exp.ale.meta": "ALE Combustíveis · Belo Horizonte",
    "exp.ale.b1": "Construí modelos de custos em 40+ bases de distribuição de combustível, suportando preços estratégicos sobre volumes de milhares de milhões de litros.",
    "exp.ale.b2": "Criei a primeira base de dados histórica de custos da empresa — revelei uma operação de margem zero; viabilizei ~20–30% de redução em custos de armazenamento.",

    "exp.vale.role": "Estagiário de Melhoria Contínua",
    "exp.vale.meta": "Vale S.A. · Minas Gerais",
    "exp.vale.b1": "Apliquei Lean Six Sigma, Kaizen, 5S e PDCA em sites de extração de minério de ferro — consolidando a disciplina de melhoria contínua que sustenta todo o trabalho seguinte.",

    /* ---- Slide 4 — Education ---- */
    "edu.eyebrow": "Formação & Certificações",
    "edu.title": "Base académica, profundidade certificada.",
    "edu.pg.yr": "2019 – 2020",
    "edu.pg.deg": "Pós-Graduação — Finanças & Fiscalidade",
    "edu.pg.inst": "Porto Business School, Portugal",
    "edu.bsc.yr": "2009 – 2013",
    "edu.bsc.deg": "Licenciatura em Administração de Empresas",
    "edu.bsc.inst": "Faculdade Arnaldo, Brasil",
    "edu.cert.label": "Certificações",
    "edu.mensa.h": "Membro Mensa Brasil",
    "edu.mensa.p": "Admitido em 2014 no percentil 98 ou superior — membro MB 1129 da maior sociedade de alto QI do mundo.",
    "edu.mensa.seal": "TOP 2%",

    /* ---- Slide 5 — Skills ---- */
    "sk.eyebrow": "Conhecimento & Competências",
    "sk.title": "A base técnica por detrás da transformação.",
    "sk.cap.finance": "Transformação Financeira",
    "sk.cap.auto": "Automação & Analytics",
    "sk.cap.ai": "IA & Produtividade",
    "sk.cap.method": "Melhoria Contínua",
    "sk.prof.label": "Proficiência",
    "sk.lvl.expert": "Especialista",
    "sk.lvl.advanced": "Avançado",
    "sk.lvl.applied": "Aplicado",
    "sk.lvl.proficient": "Proficiente",

    /* ---- Slide 6 — Contact ---- */
    "ct.eyebrow": "Vamos Conversar",
    "ct.signoff": "Vamos falar sobre a sua próxima <span class='text-gold'>transformação.</span>",
    "ct.lede": "Sempre aberto a conversas profissionais relevantes — transformação financeira, automação, analytics ou partilha de conhecimento.",
    "ct.email.l": "Email",
    "ct.linkedin.l": "LinkedIn",
    "ct.site.l": "Portfólio",
    "ct.phone.l": "Telefone",
    "ct.cta": "Iniciar uma conversa",
    "ct.foot": "Lean Six Sigma Black Belt · Autorização total de trabalho na UE · Disponível para relocalização internacional",
  }
};

/* ---------- Controller ---------- */
const I18nController = (() => {
  let current = "en";

  function detect(){
    const saved = localStorage.getItem("mbs-lang");
    if (saved === "en" || saved === "pt") return saved;
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("pt") ? "pt" : "en";
  }

  function apply(lang, animate){
    current = lang;
    const dict = I18N[lang] || I18N.en;
    const nodes = document.querySelectorAll("[data-i18n]");

    const swap = () => {
      nodes.forEach(el => {
        const key = el.getAttribute("data-i18n");
        const v = dict[key];
        if (v == null) return;
        if (el instanceof SVGElement){
          // SVG <text> needs textContent; strip tags + decode entities
          el.textContent = v.replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">");
        } else {
          el.innerHTML = v;
        }
      });
      // rail hover labels + aria
      document.querySelectorAll(".rail button[data-dot]").forEach(b => {
        const k = b.getAttribute("data-dot");
        if (dict[k] != null){ b.setAttribute("data-label", dict[k]); b.setAttribute("aria-label", dict[k]); }
      });
      document.documentElement.lang = lang;
      // toggle button states
      document.querySelectorAll(".lang button").forEach(b => {
        b.classList.toggle("active", b.dataset.lang === lang);
        b.setAttribute("aria-pressed", b.dataset.lang === lang);
      });
    };

    if (animate && !matchMedia("(prefers-reduced-motion: reduce)").matches){
      const main = document.querySelector(".world") || document.body;
      main.style.transition = "opacity .22s ease";
      main.style.opacity = "0";
      setTimeout(() => { swap(); main.style.opacity = "1"; }, 200);
    } else {
      swap();
    }
    localStorage.setItem("mbs-lang", lang);
  }

  function init(){
    current = detect();
    apply(current, false);
    document.querySelectorAll(".lang button").forEach(b => {
      b.addEventListener("click", () => { if (b.dataset.lang !== current) apply(b.dataset.lang, true); });
    });
  }

  return { init, apply, get: () => current };
})();

window.I18N = I18N;
window.I18nController = I18nController;
