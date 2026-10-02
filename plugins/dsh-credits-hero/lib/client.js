// dsh-credits-hero — chip de credito no cabecalho (Modo PTC / barra de acoes).
// Le a cota das contas ChatGPT/Codex pelo RPC do dsh-plugin-subscriptions e
// mostra a conta que o pool escolheria agora; o painel lista todas ordenadas por disponibilidade.
window.__ModuleLoader__.load({
  id: "dsh-credits-hero",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    console.info("[dsh-credits-hero] v0.2.0 carregado (corte 100% + previsao de resets)");

    const React = require("react");
    const h = React.createElement;

    const PROVIDER = "codex";
    const QUOTA_FULL = 100;
    const REFRESH_MS = 5 * 60 * 1000;
    const CHANNEL = "/api";
    const PREFIX = "subscriptions-auth.";

    function callRpc(rpc, endpoint, payload) {
      return rpc.call(CHANNEL, PREFIX + endpoint, payload).then((result) => {
        if (!result || result.ok !== true) {
          const message = result && result.error && result.error.message ? result.error.message : "falha no RPC " + endpoint;
          throw new Error(message);
        }
        return result.value;
      });
    }

    function windowOf(windows, kind) {
      for (const w of windows) {
        if (w && w.kind === kind) return w;
      }
      return undefined;
    }

    function formatReset(epochMs, now) {
      if (!epochMs || typeof epochMs !== "number") return "";
      const diffMs = epochMs - now;
      if (diffMs <= 0) return "agora";
      const diffMin = Math.round(diffMs / 60000);
      if (diffMin < 60) return "em " + diffMin + "m";
      const d = new Date(epochMs);
      const isToday = d.toDateString() === new Date(now).toDateString();
      const pad = (n) => (n < 10 ? "0" + n : String(n));
      const time = pad(d.getHours()) + ":" + pad(d.getMinutes());
      if (isToday) return time;
      return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + " " + time;
    }

    // Pontuacao de urgencia identica ao pool: sobra / tempo ate o reset.
    function scoreAccount(windows, now) {
      let urgency = 0;
      for (const w of windows) {
        if (!w || typeof w.usedPercent !== "number") continue;
        const horizon = typeof w.resetsAt === "number" ? Math.max(w.resetsAt - now, 1) : 1;
        const u = Math.max(0, 1 - w.usedPercent / 100) / horizon;
        if (u > urgency) urgency = u;
      }
      return urgency;
    }

    function shortName(label, key) {
      const text = String(label === undefined || label === "" ? key : label);
      const at = text.indexOf("@");
      if (at > 0) return text.slice(0, at);
      const uuid = /[0-9a-f]{8}-[0-9a-f]{4}/i.exec(text);
      return uuid ? uuid[0].slice(0, 8) : text.slice(0, 14);
    }

    async function loadRows(rpc, force) {
      const status = await callRpc(rpc, "status", {});
      const providers = status && status.providers ? status.providers : {};
      const provider = providers[PROVIDER];
      const accounts = provider && Array.isArray(provider.accounts) ? provider.accounts : [];
      if (accounts.length === 0) return [];
      const now = Date.now();
      const settled = await Promise.allSettled(accounts.map(async (account) => {
        const payload = { provider: PROVIDER, account: account.key };
        if (force === true) payload.force = true;
        const usage = await callRpc(rpc, "usage", payload);
        return { account: account, usage: usage };
      }));
      const rows = [];
      for (const entry of settled) {
        if (entry.status !== "fulfilled") continue;
        const account = entry.value.account;
        const usage = entry.value.usage;
        if (!usage || usage.supported === false) continue;
        const windows = Array.isArray(usage.windows) ? usage.windows : [];
        if (windows.length === 0) continue;

        const sessionW = windowOf(windows, "session");
        const weeklyW = windowOf(windows, "weekly");

        const sessionPct = sessionW && typeof sessionW.usedPercent === "number" ? sessionW.usedPercent : undefined;
        const sessionReset = sessionW && typeof sessionW.resetsAt === "number" ? sessionW.resetsAt : undefined;

        const weeklyPct = weeklyW && typeof weeklyW.usedPercent === "number" ? weeklyW.usedPercent : undefined;
        const weeklyReset = weeklyW && typeof weeklyW.resetsAt === "number" ? weeklyW.resetsAt : undefined;

        const sessionCapped = typeof sessionPct === "number" && sessionPct >= QUOTA_FULL;
        const weeklyCapped = typeof weeklyPct === "number" && weeklyPct >= QUOTA_FULL;
        const available = !sessionCapped && !weeklyCapped;

        let maxUsed = 0;
        for (const w of windows) {
          if (w && typeof w.usedPercent === "number" && w.usedPercent > maxUsed) maxUsed = w.usedPercent;
        }

        const urgency = scoreAccount(windows, now);

        let statusText = "";
        let blockerReset = undefined;
        if (weeklyCapped) {
          statusText = "Sem crédito semanal" + (weeklyReset ? " · libera " + formatReset(weeklyReset, now) : "");
          blockerReset = weeklyReset;
        } else if (sessionCapped) {
          statusText = "Limite 5h atingido" + (sessionReset ? " · libera " + formatReset(sessionReset, now) : "");
          blockerReset = sessionReset;
        }

        rows.push({
          key: account.key,
          label: account.account,
          isDefault: account.isDefault === true,
          plan: usage.plan !== undefined ? usage.plan : account.plan,
          session: sessionPct,
          sessionReset: sessionReset,
          weekly: weeklyPct,
          weeklyReset: weeklyReset,
          maxUsed: maxUsed,
          urgency: urgency,
          available: available,
          sessionCapped: sessionCapped,
          weeklyCapped: weeklyCapped,
          statusText: statusText,
          blockerReset: blockerReset
        });
      }

      rows.sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;
        if (a.available) return b.urgency - a.urgency;
        if (a.weeklyCapped !== b.weeklyCapped) return a.weeklyCapped ? 1 : -1;
        return (a.blockerReset || 0) - (b.blockerReset || 0);
      });

      return rows;
    }

    const chipStyle = {
      display: "inline-flex",
      alignItems: "center",
      gap: "7px",
      position: "relative",
      height: "26px",
      padding: "0 10px",
      border: "1px solid rgba(127,127,127,.35)",
      borderRadius: "999px",
      fontSize: "12px",
      lineHeight: 1,
      whiteSpace: "nowrap",
      userSelect: "none",
      cursor: "pointer"
    };
    const dotStyle = { width: "7px", height: "7px", borderRadius: "50%", flex: "0 0 auto" };
    const nameStyle = { fontWeight: 600 };
    const dimStyle = { opacity: 0.75, fontVariantNumeric: "tabular-nums" };
    const panelStyle = {
      position: "absolute",
      top: "32px",
      left: 0,
      zIndex: 400,
      minWidth: "410px",
      padding: "10px 14px",
      border: "1px solid rgba(127,127,127,.35)",
      borderRadius: "10px",
      background: "var(--dsw-alias-surface-overlay, #1c1c1f)",
      color: "var(--dsw-alias-label-primary, #e6edf3)",
      boxShadow: "0 14px 36px rgba(0,0,0,.55)",
      fontSize: "12px",
      lineHeight: 1.6,
      fontWeight: 400
    };
    const headerRowStyle = {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      paddingBottom: "5px",
      marginBottom: "3px",
      borderBottom: "1px solid rgba(127,127,127,.18)",
      fontSize: "10.5px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      color: "var(--dsw-alias-label-tertiary, #8b949e)"
    };
    const rowStyle = { display: "flex", gap: "10px", alignItems: "center", padding: "3px 0" };
    const rowNameWrap = { flex: "1 1 auto", display: "inline-flex", alignItems: "center", gap: "6px", overflow: "hidden" };
    const rowNameStyle = { fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
    const badgeStyle = { fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "rgba(248,81,73,.15)", color: "#f85149", border: "1px solid rgba(248,81,73,.25)", whiteSpace: "nowrap", fontWeight: 500 };
    const rowNumStyle = { fontVariantNumeric: "tabular-nums", minWidth: "62px", textAlign: "right", whiteSpace: "nowrap", fontWeight: 600 };
    const dividerStyle = { height: "1px", background: "rgba(127,127,127,.22)", margin: "8px 0 6px 0" };
    const footerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", opacity: 0.85, paddingTop: "2px" };
    const refreshBtnStyle = { background: "none", border: "none", color: "inherit", cursor: "pointer", opacity: 0.85, padding: "2px 4px", fontSize: "11px", textDecoration: "underline" };

    function remPct(usedValue) {
      if (usedValue === undefined) return "-";
      const remaining = Math.max(0, Math.min(100, 100 - Math.round(usedValue)));
      return remaining + "%";
    }

    function remColor(usedValue) {
      if (usedValue === undefined) return "inherit";
      const remaining = 100 - usedValue;
      if (remaining <= 5) return "#f85149"; // Vermelho: esgotado ou quase
      if (remaining <= 35) return "#e3b341"; // Amarelo: limite intermediário / baixo
      return "#3fb950"; // Verde: bastante limite restante
    }

    function rowDotColor(row) {
      if (row.weeklyCapped) return "#f85149";
      if (row.sessionCapped) return "#db6d28";
      const minRemaining = 100 - row.maxUsed;
      if (minRemaining <= 5) return "#f85149";
      if (minRemaining <= 35) return "#e3b341";
      return "#3fb950";
    }

    function CreditsChip(props) {
      const rpc = props.rpc;
      const [state, setState] = React.useState({ phase: "loading", rows: [] });
      const [open, setOpen] = React.useState(false);
      const [refreshing, setRefreshing] = React.useState(false);

      const refreshData = React.useCallback((force) => {
        if (!rpc) {
          setState({ phase: "error", rows: [], message: "sem RPC de conexao" });
          return;
        }
        if (force) setRefreshing(true);
        loadRows(rpc, force).then((rows) => {
          setState({ phase: "ready", rows: rows });
          if (force) setRefreshing(false);
        }, (error) => {
          setState({ phase: "error", rows: [], message: String(error && error.message ? error.message : error) });
          if (force) setRefreshing(false);
        });
      }, [rpc]);

      React.useEffect(() => {
        refreshData(false);
        const timer = setInterval(() => refreshData(false), REFRESH_MS);
        return () => clearInterval(timer);
      }, [refreshData]);

      if (state.phase !== "ready" || state.rows.length === 0) return null;
      const rows = state.rows;
      const top = rows[0];
      const dotColor = rowDotColor(top);

      const availableCount = rows.filter((r) => r.available).length;
      const todayUnlockCount = rows.filter((r) => r.sessionCapped && !r.weeklyCapped).length;
      const weeklyCappedCount = rows.filter((r) => r.weeklyCapped).length;

      const summaryParts = [];
      if (availableCount > 0) summaryParts.push(availableCount + " ativa" + (availableCount > 1 ? "s" : ""));
      if (todayUnlockCount > 0) summaryParts.push(todayUnlockCount + " liberam hoje");
      if (weeklyCappedCount > 0) summaryParts.push(weeklyCappedCount + " no limite semanal");
      const summaryText = summaryParts.join(" · ") || "todas as contas no limite";

      const topSessionRem = remPct(top.session);
      const topWeeklyRem = remPct(top.weekly);
      const children = [
        h("span", { key: "dot", style: Object.assign({}, dotStyle, { background: dotColor }) }),
        h("span", { key: "name", style: nameStyle }, (top.isDefault ? "★ " : "") + shortName(top.label, top.key)),
        h("span", { key: "s", style: Object.assign({}, dimStyle, { color: remColor(top.session) }), title: "Limite de 5h restante: " + topSessionRem }, "5h " + topSessionRem + " disp."),
        h("span", { key: "w", style: Object.assign({}, dimStyle, { color: remColor(top.weekly) }), title: "Limite semanal restante: " + topWeeklyRem }, "Semana " + topWeeklyRem + " disp.")
      ];

      if (open) {
        children.push(h("span", {
          key: "panel",
          style: panelStyle,
          onClick: (e) => e.stopPropagation()
        }, [
          h("div", { key: "head", style: headerRowStyle }, [
            h("span", { key: "hdot", style: { width: "7px", opacity: 0 } }),
            h("span", { key: "hn", style: { flex: "1 1 auto" } }, "Conta (% = limite disponível)"),
            h("span", { key: "hs", style: { minWidth: "62px", textAlign: "right" } }, "5 Horas"),
            h("span", { key: "hw", style: { minWidth: "62px", textAlign: "right" } }, "Semanal")
          ]),
          h("div", { key: "rows" }, rows.map((row) => {
            const sRem = remPct(row.session);
            const wRem = remPct(row.weekly);
            const sColor = remColor(row.session);
            const wColor = remColor(row.weekly);
            return h("div", {
              key: row.key,
              style: rowStyle
            }, [
              h("span", { key: "dot", style: Object.assign({}, dotStyle, { background: rowDotColor(row) }) }),
              h("div", { key: "wrap", style: rowNameWrap }, [
                h("span", { key: "n", style: rowNameStyle, title: row.label || row.key }, (row.isDefault ? "★ " : "") + shortName(row.label, row.key)),
                row.statusText ? h("span", { key: "b", style: badgeStyle }, row.statusText) : null
              ]),
              h("span", {
                key: "s",
                style: Object.assign({}, rowNumStyle, { color: sColor }),
                title: "Janela 5h: " + sRem + " disponível" + (row.sessionReset ? " (libera " + formatReset(row.sessionReset, Date.now()) + ")" : "")
              }, sRem),
              h("span", {
                key: "w",
                style: Object.assign({}, rowNumStyle, { color: wColor }),
                title: "Janela semanal: " + wRem + " disponível" + (row.weeklyReset ? " (libera " + formatReset(row.weeklyReset, Date.now()) + ")" : "")
              }, wRem)
            ]);
          })),
          h("div", { key: "div", style: dividerStyle }),
          h("div", { key: "foot", style: footerStyle }, [
            h("span", { key: "sum" }, summaryText),
            h("button", {
              key: "ref",
              style: refreshBtnStyle,
              onClick: () => refreshData(true),
              disabled: refreshing
            }, refreshing ? "atualizando..." : "↻ atualizar")
          ])
        ]));
      }

      return h("span", {
        style: chipStyle,
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onClick: () => setOpen(!open),
        title: "Pool ChatGPT/Codex — conta ativa e cotas",
        "aria-label": "Cota das contas ChatGPT/Codex"
      }, children);
    }

    const inject = ["slots", "connection"];

    function apply(ctx) {
      const connection = ctx.get("connection");
      if (!connection || !connection.rpc) {
        console.warn("[dsh-credits-hero] servico connection indisponivel; chip nao registrado");
        return;
      }
      console.info("[dsh-credits-hero] registrando o chip em conversation.session.header.actions");
      ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
        name: "conversation.session.header.actions",
        id: "credits-hero",
        order: 0,
        inject: () => ({ rpc: connection.rpc })
      }, CreditsChip));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
