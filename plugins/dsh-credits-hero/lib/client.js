// dsh-credits-hero — chip de credito no cabecalho (Modo PTC / barra de acoes).
// Le a cota das contas ChatGPT/Codex pelo RPC do dsh-plugin-subscriptions e
// mostra a conta que o pool escolheria agora; o painel lista todas ordenadas por disponibilidade.
window.__ModuleLoader__.load({
  id: "dsh-credits-hero",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    console.info("[dsh-credits-hero] v0.2.1 carregado (modal fixo ao clicar/arrastar)");

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

    
    const HISTORY_STORAGE = "dsh-credits-hero-history";
    function loadHistory() {
      try {
        const raw = localStorage.getItem(HISTORY_STORAGE);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    }
    function saveHistory(hist) {
      try {
        localStorage.setItem(HISTORY_STORAGE, JSON.stringify(hist));
      } catch {}
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
      const history = loadHistory();
      const updatedHistory = { ...history };
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
        let isResetNow = false;

        const prevRecord = history[account.key];

        if (weeklyCapped) {
          statusText = weeklyReset ? "Libera " + formatReset(weeklyReset, now) : "Esgotado";
          blockerReset = weeklyReset;
        } else if (sessionCapped) {
          statusText = sessionReset ? "Libera " + formatReset(sessionReset, now) : "Limite 5h";
          blockerReset = sessionReset;
        } else {
          // Conta disponível: verificar evidência real de desbloqueio recente
          if (prevRecord) {
            const wasCapped = prevRecord.capped === true;
            const resetExpired = prevRecord.blockerReset && prevRecord.blockerReset <= now && (now - prevRecord.blockerReset < 3 * 3600 * 1000);
            if (wasCapped || resetExpired) {
              // Se estava bloqueada e agora está livre (ou o reset passou recentemente há menos de 3h)
              isResetNow = true;
              statusText = "Resetado agora";
            }
          }
        }

        updatedHistory[account.key] = {
          capped: !available,
          blockerReset: blockerReset || (prevRecord && prevRecord.blockerReset > now ? prevRecord.blockerReset : undefined),
          lastSeen: now,
          isResetNow: isResetNow,
          sessionRem: sessionPct !== undefined ? 100 - sessionPct : 100,
          weeklyRem: weeklyPct !== undefined ? 100 - weeklyPct : 100
        };

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
          isResetNow: isResetNow,
          sessionCapped: sessionCapped,
          weeklyCapped: weeklyCapped,
          statusText: statusText,
          blockerReset: blockerReset
        });
      }

      saveHistory(updatedHistory);

      rows.sort((a, b) => {
        // Prioridade 1: Contas disponíveis vêm antes de bloqueadas
        if (a.available !== b.available) return a.available ? -1 : 1;
        // Prioridade 1.1: Entre as disponíveis, contas recém-resetadas ganham destaque no topo
        if (a.available && b.available) {
          if (a.isResetNow !== b.isResetNow) return a.isResetNow ? -1 : 1;
        }
        // 1. Contas disponíveis vêm antes de bloqueadas
        if (a.available !== b.available) return a.available ? -1 : 1;
        if (a.available) {
          // Ordenar por menor gargalo disponível: quanto maior a sobra mínima, mais capacidade tem
          const aMinRem = Math.min(
            a.session !== undefined ? (100 - a.session) : 100,
            a.weekly !== undefined ? (100 - a.weekly) : 100
          );
          const bMinRem = Math.min(
            b.session !== undefined ? (100 - b.session) : 100,
            b.weekly !== undefined ? (100 - b.weekly) : 100
          );
          if (bMinRem !== aMinRem) return bMinRem - aMinRem;
          return (b.urgency || 0) - (a.urgency || 0);
        }
        // Para bloqueadas: priorizar desbloqueio semanal mais cedo
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
      minWidth: "390px",
      padding: "10px 14px",
      border: "1px solid rgba(127,127,127,.35)",
      borderRadius: "10px",
      background: "var(--dsw-alias-surface-overlay, #1c1c1f)",
      color: "var(--dsw-alias-label-primary, #e6edf3)",
      boxShadow: "0 14px 36px rgba(0,0,0,.55)",
      fontSize: "12px",
      lineHeight: 1.6,
      fontWeight: 400,
      cursor: "default",
      userSelect: "text"
    };
    const headerRowStyle = {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      paddingBottom: "6px",
      marginBottom: "4px",
      borderBottom: "1px solid rgba(127,127,127,.18)",
      fontSize: "10.5px",
      fontWeight: 600,
      letterSpacing: "0.04em",
      color: "var(--dsw-alias-label-tertiary, #8b949e)",
      cursor: "help"
    };
    const rowStyle = { display: "flex", gap: "8px", alignItems: "center", padding: "3px 4px", borderRadius: "5px", cursor: "pointer" };
    const rowNameStyle = { width: "125px", flexShrink: 0, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
    const badgeWrapStyle = { flex: "1 1 auto", display: "flex", justifyContent: "flex-end", paddingRight: "4px" };
    const badgeStyle = { fontSize: "10px", padding: "1px 5px", borderRadius: "4px", background: "rgba(248,81,73,.14)", color: "#f85149", border: "1px solid rgba(248,81,73,.22)", whiteSpace: "nowrap", fontWeight: 500, letterSpacing: "-0.01em" };
    const badgeResetStyle = { fontSize: "10px", padding: "1px 5px", borderRadius: "4px", background: "rgba(56,189,248,.14)", color: "#38bdf8", border: "1px solid rgba(56,189,248,.25)", whiteSpace: "nowrap", fontWeight: 600, letterSpacing: "-0.01em" };
    const highlightBannerStyle = { background: "rgba(56,189,248,.1)", border: "1px solid rgba(56,189,248,.22)", borderRadius: "6px", padding: "4px 8px", marginBottom: "8px", fontSize: "11px", color: "#38bdf8", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 };
    const rowNum5hStyle = { fontVariantNumeric: "tabular-nums", width: "48px", textAlign: "right", whiteSpace: "nowrap", fontWeight: 600, fontSize: "11.5px", flexShrink: 0 };
    const rowNumWeekStyle = { fontVariantNumeric: "tabular-nums", width: "52px", textAlign: "right", whiteSpace: "nowrap", fontWeight: 600, fontSize: "11.5px", flexShrink: 0 };
    const dividerStyle = { height: "1px", background: "rgba(127,127,127,.22)", margin: "8px 0 6px 0" };
    const footerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--dsw-alias-label-secondary, #d4d4d8)", paddingTop: "2px" };
    const refreshBtnStyle = {
      background: "rgba(255,255,255,.06)",
      border: "1px solid rgba(255,255,255,.14)",
      color: "var(--dsw-alias-label-primary, #f4f4f5)",
      borderRadius: "4px",
      cursor: "pointer",
      padding: "2px 7px",
      fontSize: "10.5px",
      fontWeight: 500,
      transition: "all .12s ease"
    };

    function remPct(usedValue) {
      if (usedValue === undefined) return "-";
      const remaining = Math.max(0, Math.min(100, 100 - Math.round(usedValue)));
      return remaining + "%";
    }

    // Regra exata: Verde > 30% | Amarelo 10% a 30% | Vermelho < 10%
    function remColor(usedValue) {
      if (usedValue === undefined) return "inherit";
      const remaining = 100 - Math.round(usedValue);
      if (remaining < 10) return "#f85149"; // Vermelho: abaixo de 10%
      if (remaining <= 30) return "#e3b341"; // Amarelo: entre 10% e 30%
      return "#3fb950"; // Verde: acima de 30%
    }

    // Indicador geral da conta à esquerda:
    // Vermelho: indisponível (algum limite foi atingido)
    // Amarelo: disponível, mas próxima de algum limite (algum valor <= 30%)
    // Verde: disponível normalmente (todos > 30%)
    function rowDotColor(row) {
      if (!row.available || row.sessionCapped || row.weeklyCapped) return "#f85149"; // Vermelho: bloqueada
      if (row.isResetNow) return "#38bdf8"; // Azul celeste com destaque: conta recém-resetada
      const sessionRem = row.session !== undefined ? (100 - Math.round(row.session)) : 100;
      const weeklyRem = row.weekly !== undefined ? (100 - Math.round(row.weekly)) : 100;
      const minRem = Math.min(sessionRem, weeklyRem);
      if (minRem < 10) return "#f85149"; // Vermelho: crítico
      if (minRem <= 30) return "#e3b341"; // Amarelo: atenção
      return "#3fb950"; // Verde: saudável
    }

    function CreditsChip(props) {
      const rpc = props.rpc;
      const chipRef = React.useRef(null);
      const [state, setState] = React.useState({ phase: "loading", rows: [] });
      const [open, setOpen] = React.useState(false);
      const [refreshing, setRefreshing] = React.useState(false);

      React.useEffect(() => {
        if (!open) return;
        const onPointerDown = (event) => {
          if (chipRef.current && !chipRef.current.contains(event.target)) {
            setOpen(false);
          }
        };
        const onKeyDown = (event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
          document.removeEventListener("pointerdown", onPointerDown);
          document.removeEventListener("keydown", onKeyDown);
        };
      }, [open]);

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
      const resetCount = rows.filter((r) => r.available && r.isResetNow).length;
      const weeklyCappedCount = rows.filter((r) => r.weeklyCapped).length;
      const sessionCappedCount = rows.filter((r) => r.sessionCapped && !r.weeklyCapped).length;

      const summaryParts = [];
      if (availableCount > 0) summaryParts.push(availableCount + " disponível" + (availableCount > 1 ? "eis" : ""));
      if (resetCount > 0) summaryParts.push(resetCount + " recém-resetada" + (resetCount > 1 ? "s" : ""));
      if (weeklyCappedCount > 0) summaryParts.push(weeklyCappedCount + " no limite semanal");
      if (sessionCappedCount > 0) summaryParts.push(sessionCappedCount + " no limite de 5h");
      const summaryText = summaryParts.join(" · ") || "todas as contas no limite";

      const topSessionRem = remPct(top.session);
      const topWeeklyRem = remPct(top.weekly);
      const children = [
        h("span", { key: "dot", style: Object.assign({}, dotStyle, { background: dotColor }) }),
        h("span", {
          key: "name",
          style: nameStyle,
          title: top.available ? "Melhor conta disponível no momento" : (top.label || top.key)
        }, (top.available ? "★ " : "") + shortName(top.label, top.key)),
        h("span", { key: "s", style: Object.assign({}, dimStyle, { color: remColor(top.session) }), title: "Limite de 5h disponível: " + topSessionRem }, "5H " + topSessionRem),
        h("span", { key: "sep", style: { opacity: 0.4 } }, "·"),
        h("span", { key: "w", style: Object.assign({}, dimStyle, { color: remColor(top.weekly) }), title: "Limite semanal disponível: " + topWeeklyRem }, "Semana " + topWeeklyRem)
      ];

      if (open) {
        children.push(h("span", {
          key: "panel",
          "data-credits-panel": "true",
          style: panelStyle,
          onClick: (e) => e.stopPropagation()
        }, [
          resetCount > 0 ? h("div", {
            key: "banner",
            style: highlightBannerStyle
          }, [
            h("span", { key: "bicon" }, "⚡"),
            h("span", { key: "btxt" }, resetCount === 1 ? "1 conta liberada após reset" : resetCount + " contas liberadas após reset")
          ]) : null,
          h("div", {
            key: "head",
            style: headerRowStyle,
            title: "Os percentuais representam o limite ainda disponível."
          }, [
            h("span", { key: "hdot", style: { width: "7px", opacity: 0 } }),
            h("span", { key: "hn", style: { width: "125px", flexShrink: 0 } }, "CONTA"),
            h("span", { key: "hb", style: { flex: "1 1 auto" } }),
            h("span", { key: "hs", style: { width: "48px", textAlign: "right", flexShrink: 0 } }, "5H"),
            h("span", { key: "hw", style: { width: "52px", textAlign: "right", flexShrink: 0 } }, "SEMANA")
          ]),
          h("div", { key: "rows" }, rows.map((row, idx) => {
            const sRem = remPct(row.session);
            const wRem = remPct(row.weekly);
            const sColor = remColor(row.session);
            const wColor = remColor(row.weekly);
            const sVal = row.session !== undefined ? (100 - Math.round(row.session)) : 100;
            const wVal = row.weekly !== undefined ? (100 - Math.round(row.weekly)) : 100;

            const isBestAccount = idx === 0 && row.available;
            const starTitle = isBestAccount ? "Melhor conta disponível no momento" : "";

            const sTooltip = sVal < 10
              ? "Crítico · " + sRem + " do limite de 5h disponível" + (row.sessionReset ? " (libera " + formatReset(row.sessionReset, Date.now()) + ")" : "")
              : "Janela 5h: " + sRem + " disponível" + (row.sessionReset ? " (libera " + formatReset(row.sessionReset, Date.now()) + ")" : "");

            const wTooltip = wVal < 10
              ? "Crítico · " + wRem + " do limite semanal disponível" + (row.weeklyReset ? " (libera " + formatReset(row.weeklyReset, Date.now()) + ")" : "")
              : "Janela semanal: " + wRem + " disponível" + (row.weeklyReset ? " (libera " + formatReset(row.weeklyReset, Date.now()) + ")" : "");

            return h("div", {
              key: row.key,
              style: rowStyle,
              onClick: (e) => {
                e.stopPropagation();
                if (rpc && !refreshing) {
                  callRpc(rpc, "setDefault", { provider: PROVIDER, account: row.key }).then(() => {
                    refreshData(true);
                  }).catch(() => {});
                }
              },
              title: "Clique para ativar esta conta como padrão imediatamente"
            }, [
              h("span", { key: "dot", style: Object.assign({}, dotStyle, { background: rowDotColor(row) }) }),
              h("span", {
                key: "n",
                style: rowNameStyle,
                title: (isBestAccount ? "★ " + starTitle + "\n" : "") + (row.label || row.key)
              }, [
                isBestAccount ? h("span", { key: "star", style: { color: "#e3b341", fontWeight: 700, marginRight: "3px", cursor: "help" }, title: starTitle }, "★") : null,
                shortName(row.label, row.key)
              ]),
              h("div", { key: "wrap", style: badgeWrapStyle }, [
                row.statusText ? h("span", { key: "b", style: row.isResetNow ? badgeResetStyle : badgeStyle }, row.statusText) : null
              ]),
              h("span", {
                key: "s",
                style: Object.assign({}, rowNum5hStyle, { color: sColor, cursor: sVal < 10 ? "help" : "inherit" }),
                title: sTooltip
              }, sRem),
              h("span", {
                key: "w",
                style: Object.assign({}, rowNumWeekStyle, { color: wColor, cursor: wVal < 10 ? "help" : "inherit" }),
                title: wTooltip
              }, wRem)
            ]);
          })),
          h("div", { key: "div", style: dividerStyle }),
          h("div", { key: "foot", style: footerStyle }, [
            h("span", { key: "sum" }, summaryText),
            h("button", {
              key: "ref",
              style: refreshBtnStyle,
              onClick: (e) => {
                e.stopPropagation();
                refreshData(true);
              },
              disabled: refreshing
            }, refreshing ? "atualizando..." : "↻ atualizar")
          ])
        ]));
      }

      return h("span", {
        ref: chipRef,
        style: chipStyle,
        onClick: (e) => {
          if (e.target && e.target.closest && e.target.closest("[data-credits-panel]")) {
            return;
          }
          setOpen((prev) => !prev);
        },
        title: "Pool ChatGPT/Codex — conta ativa e cotas",
        "aria-label": "Cota das contas ChatGPT/Codex",
        "aria-expanded": open
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