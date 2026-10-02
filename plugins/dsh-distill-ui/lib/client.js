window.__ModuleLoader__.load({
  id: "dsh-distill-ui",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    console.log("[dsh-distill-ui] v1.4.0 - Clean Badges & Smart Error Filtering Active");

    const CSS_STYLES = `
      /* ==========================================================================
         DSH Distill UI v1.2.0 - Ultimate Distilled Suite
         Features: Micro-Ticker, Timeline, Noise Sanitizer, Filter Pills, Zen Mode
         ========================================================================== */

      /* Hide duplicate standalone disclosure rows when inside batch */
      [data-distill-batch-hidden="true"] {
        display: none !important;
      }
      /* 1. COMPACT TOOL CALLS */
      [data-chat-anchor-key^="call:"] {
        margin: 2px 0 !important;
        transition: all 0.15s ease-out;
      }

      [data-chat-anchor-key^="call:"] [data-tool],
      [data-chat-anchor-key^="call:"] [data-sample="bash"],
      [data-chat-anchor-key^="call:"] [data-variant="bash"],
      [data-chat-anchor-key^="call:"] .o3BgMG_root {
        background: var(--dsw-alias-bg-hover, rgba(255, 255, 255, 0.025)) !important;
        border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.07)) !important;
        border-radius: 6px !important;
        padding: 0 !important;
        box-shadow: none !important;
        transition: border-color 0.15s ease, background 0.15s ease, max-height 0.2s ease;
        overflow: hidden !important;
      }

      /* Strict collapsed height (28-32px) */
      [data-chat-anchor-key^="call:"] [data-tool]:not(:has([aria-expanded="true"])),
      [data-chat-anchor-key^="call:"] [data-sample="bash"]:not(:has([aria-expanded="true"])),
      [data-chat-anchor-key^="call:"] [data-variant="bash"]:not(:has([aria-expanded="true"])),
      [data-chat-anchor-key^="call:"] .o3BgMG_root:not(:has([aria-expanded="true"])) {
        max-height: 32px !important;
      }

      /* When expanded: allow full height */
      [data-chat-anchor-key^="call:"] [data-tool]:has([aria-expanded="true"]),
      [data-chat-anchor-key^="call:"] [data-sample="bash"]:has([aria-expanded="true"]),
      [data-chat-anchor-key^="call:"] [data-variant="bash"]:has([aria-expanded="true"]),
      [data-chat-anchor-key^="call:"] .o3BgMG_root:has([aria-expanded="true"]) {
        max-height: none !important;
      }

      [data-chat-anchor-key^="call:"] [data-tool]:hover,
      [data-chat-anchor-key^="call:"] [data-sample="bash"]:hover,
      [data-chat-anchor-key^="call:"] [data-variant="bash"]:hover,
      [data-chat-anchor-key^="call:"] .o3BgMG_root:hover {
        border-color: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.14)) !important;
        background: var(--dsw-alias-bg-active, rgba(255, 255, 255, 0.05)) !important;
      }

      /* Running state */
      [data-chat-anchor-key^="call:"] [data-state="running"] {
        border-color: var(--dsw-alias-state-business-primary, #3b82f6) !important;
        background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3b82f6) 7%, transparent) !important;
      }

      /* Error state */
      [data-chat-anchor-key^="call:"] [data-state="error"],
      [data-distill-batch-id]:has([data-state="error"]) [data-tool] {
        border-color: rgba(239, 68, 68, 0.45) !important;
        background: color-mix(in srgb, rgba(239, 68, 68, 0.08) 100%, transparent) !important;
      }

      /* Compact ToolRow header (28px) */
      [data-chat-anchor-key^="call:"] [data-disclosure-row="true"],
      [data-chat-anchor-key^="call:"] .o3BgMG_row {
        min-height: 28px !important;
        height: 28px !important;
        padding: 2px 10px !important;
        display: flex !important;
        align-items: center !important;
        cursor: pointer !important;
      }

      /* Tool Title: monospace compact badge */
      [data-chat-anchor-key^="call:"] [data-disclosure-row="true"] span:first-child,
      [data-chat-anchor-key^="call:"] .o3BgMG_title {
        font-size: 11.5px !important;
        font-weight: 600 !important;
        font-family: var(--ds-font-family-code, monospace) !important;
        color: var(--dsw-alias-label-secondary, #a1a1aa) !important;
        text-transform: lowercase !important;
      }

      /* Tool separator dot */
      [data-chat-anchor-key^="call:"] .o3BgMG_sep {
        width: 3px !important;
        height: 3px !important;
        margin: 0 6px !important;
        background: var(--dsw-alias-label-caption, #52525b) !important;
        border-radius: 50% !important;
      }

      /* Summary & File Links */
      [data-chat-anchor-key^="call:"] .o3BgMG_summary,
      [data-chat-anchor-key^="call:"] .o3BgMG_fileLink {
        font-size: 12px !important;
        font-family: var(--ds-font-family-code, monospace) !important;
        color: var(--dsw-alias-label-tertiary, #71717a) !important;
        text-decoration: none !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      [data-chat-anchor-key^="call:"] .o3BgMG_fileLink:hover {
        color: var(--dsw-alias-label-primary, #f4f4f5) !important;
        text-decoration: underline !important;
      }

      /* Diff stat (+X -Y) */
      [data-chat-anchor-key^="call:"] .o3BgMG_diffStat {
        font-size: 11px !important;
        font-weight: 500 !important;
        padding: 0 4px !important;
        background: rgba(0, 0, 0, 0.25) !important;
        border-radius: 3px !important;
        margin-left: 6px !important;
      }

      /* ELIMINAR DUPLICIDADE: Quando um tool call pai possui subcall colapsada */
      [data-chat-anchor-key]:has(> [data-subcalls="true"]) > [data-slot="tool.call.toolview"]:not(:has([aria-expanded="true"])) {
        display: none !important;
      }

      [data-chat-anchor-key]:has(> [data-subcalls="true"]) > [data-subcalls="true"] {
        margin-left: 0 !important;
        border-left: none !important;
        padding-left: 0 !important;
      }

      [data-chat-anchor-key]:has(> [data-slot="tool.call.toolview"] [aria-expanded="true"]) > [data-subcalls="true"] {
        margin-left: 14px !important;
        border-left: 1.5px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.08)) !important;
        padding-left: 6px !important;
      }

      [data-chat-anchor-key^="call:"] [data-disclosure-row="true"] ~ div,
      [data-chat-anchor-key^="call:"] .o3BgMG_bodyWrap {
        border-top: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.06)) !important;
        padding: 8px 12px !important;
        background: var(--dsw-alias-bg-base, #0a0a0c) !important;
      }

      /* 2. RACIOCÍNIO PURO E ELEGANTE (THINK / REASONING) */
      [data-variant="think"] {
        margin: 4px 0 !important;
        width: fit-content !important;
        max-width: 100% !important;
        background: transparent !important;
        border: none !important;
      }

      [data-variant="think"] > div:first-child {
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        display: flex !important;
        width: fit-content !important;
        max-width: 100% !important;
      }

      [data-variant="think"] [data-disclosure-row="true"] {
        width: auto !important;
        min-width: fit-content !important;
        max-width: 100% !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 3px 10px !important;
        height: 24px !important;
        min-height: 24px !important;
        border-radius: 5px !important;
        background: var(--dsw-alias-bg-hover, rgba(255, 255, 255, 0.025)) !important;
        border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.07)) !important;
        cursor: pointer !important;
        color: var(--dsw-alias-label-tertiary, #71717a) !important;
        font-size: 11.5px !important;
        font-weight: 500 !important;
        overflow: visible !important;
        box-sizing: border-box !important;
        transition: all 0.15s ease !important;
      }

      [data-variant="think"] [data-disclosure-row="true"]:hover {
        background: var(--dsw-alias-bg-active, rgba(255, 255, 255, 0.05)) !important;
        color: var(--dsw-alias-label-secondary, #a1a1aa) !important;
        border-color: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.12)) !important;
      }

      [data-variant="think"]:not(:has([aria-expanded="true"])) [class*="separator"],
      [data-variant="think"]:not(:has([aria-expanded="true"])) [class*="summary"],
      [data-variant="think"]:not([data-expanded="true"]) [class*="separator"],
      [data-variant="think"]:not([data-expanded="true"]) [class*="summary"] {
        display: none !important;
      }

      [data-variant="think"] [class*="title"],
      [data-variant="think"] [class*="_title"] {
        font-size: 11.5px !important;
        font-weight: 500 !important;
        white-space: nowrap !important;
        overflow: visible !important;
        text-overflow: clip !important;
        flex: none !important;
      }

      [data-variant="think"] [class*="_body"] {
        margin: 6px 0 8px 4px !important;
        padding: 8px 12px !important;
        border: none !important;
        border-left: 2px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.12)) !important;
        background: var(--dsw-alias-bg-hover, rgba(255, 255, 255, 0.015)) !important;
        border-radius: 0 6px 6px 0 !important;
        font-size: 12.5px !important;
        line-height: 1.6 !important;
        color: var(--dsw-alias-label-secondary, #9ca3af) !important;
        max-height: 380px !important;
        overflow-y: auto !important;
      }

      /* 2.5 CONTEXT INJECTIONS COMPACTAS E HIGIENIZADAS */
      [data-chat-flow-kind="context"],
      [data-chat-flow-kind="steering"] {
        margin: 2px 0 !important;
      }

      [data-chat-flow-kind="context"] [data-disclosure-row="true"],
      [data-chat-flow-kind="steering"] [data-disclosure-row="true"],
      .XrJvXW_root [data-disclosure-row="true"] {
        min-height: 26px !important;
        height: 26px !important;
        padding: 2px 8px !important;
        background: var(--dsw-alias-bg-hover, rgba(255, 255, 255, 0.015)) !important;
        border-radius: 5px !important;
      }

      [data-chat-flow-kind="context"] [data-context-source="true"],
      .XrJvXW_source {
        font-family: var(--ds-font-family-code, monospace) !important;
        font-size: 11.5px !important;
        color: var(--dsw-alias-label-secondary, #a1a1aa) !important;
      }

      [data-chat-flow-kind="context"] [data-context-summary="true"],
      .XrJvXW_summary {
        font-size: 11.5px !important;
        color: var(--dsw-alias-label-tertiary, #71717a) !important;
      }

      /* 3. RESPOSTA FINAL DO ASSISTENTE (MARKDOWN) - DOMINANTE VISUAL */
      [data-chat-flow-kind="assistant-step"]:not([data-distill-batch-hidden="true"]) {
        display: block !important;
      }

      [data-chat-anchor-key] article,
      [data-chat-anchor-key] .markdown,
      [data-chat-anchor-key] p {
        color: var(--dsw-alias-label-primary, #f3f4f6) !important;
        font-size: 14.5px !important;
        line-height: 1.68 !important;
        letter-spacing: -0.01em !important;
      }

      [data-chat-anchor-key] h1,
      [data-chat-anchor-key] h2,
      [data-chat-anchor-key] h3 {
        color: #ffffff !important;
        font-weight: 600 !important;
        letter-spacing: -0.02em !important;
        margin-top: 1.4em !important;
        margin-bottom: 0.5em !important;
      }

      [data-chat-anchor-key] h1 { font-size: 1.4em !important; }
      [data-chat-anchor-key] h2 { font-size: 1.22em !important; }
      [data-chat-anchor-key] h3 { font-size: 1.08em !important; }

      [data-chat-anchor-key] pre {
        border-radius: 8px !important;
        border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.08)) !important;
        background: var(--dsw-alias-bg-code, #0d0d0f) !important;
        margin: 12px 0 !important;
      }

      /* 4. TAREFAS / TODO PANEL - STATUS BAR COMPACTA */
      section[data-testid="todo-panel"] {
        border-radius: 6px !important;
        border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.06)) !important;
        background: var(--dsw-alias-bg-hover, rgba(255, 255, 255, 0.015)) !important;
        box-shadow: none !important;
        margin: 3px auto !important;
        transition: all 0.15s ease !important;
      }

      section[data-testid="todo-panel"]:not(:has([aria-expanded="true"])) [class*="body"] {
        padding: 3px 8px !important;
        gap: 0 !important;
      }

      section[data-testid="todo-panel"]:not(:has([aria-expanded="true"])) [class*="header"] {
        min-height: 22px !important;
        height: 22px !important;
        gap: 6px !important;
      }

      section[data-testid="todo-panel"]:not(:has([aria-expanded="true"])) [class*="title"] {
        font-size: 11px !important;
        font-weight: 500 !important;
        line-height: 20px !important;
        color: var(--dsw-alias-label-secondary, #a1a1aa) !important;
      }

      section[data-testid="todo-panel"]:not(:has([aria-expanded="true"])) [class*="progress"] {
        font-size: 11px !important;
        line-height: 20px !important;
        color: var(--dsw-alias-label-tertiary, #71717a) !important;
      }

      section[data-testid="todo-panel"]:has([aria-expanded="true"]) {
        background: var(--dsw-alias-bg-base, #111) !important;
        border-color: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.12)) !important;
      }

      /* 5. MÉTRICAS INFERIORES DISCRETAS */
      [data-turn-tail] [class*="root"],
      .bOPqQW_root {
        opacity: 0.55 !important;
        font-size: 11px !important;
        line-height: 16px !important;
        padding: 2px calc(var(--dsh-composer-side-clearance, 16px) + 8px) 0px !important;
        gap: 8px !important;
        transition: opacity 0.15s ease !important;
      }

      [data-turn-tail] [class*="root"]:hover,
      .bOPqQW_root:hover {
        opacity: 0.95 !important;
      }

      /* 6. VIRTUAL BATCHING - SINGLE-BLOCK UNIFIED BATCHING */
      [data-distill-batch-hidden="true"],
      [data-distill-filter-hidden="true"],
      [data-chat-flow-kind="tool-call"][data-distill-batch-hidden="true"],
      [data-chat-flow-kind="context"][data-distill-batch-hidden="true"],
      [data-chat-flow-kind="steering"][data-distill-batch-hidden="true"],
      [data-chat-flow-kind="assistant-step"][data-distill-batch-hidden="true"],
      [data-subcalls="true"] > [data-distill-batch-hidden="true"],
      .ztWv_q_callRow[data-distill-batch-hidden="true"] {
        display: none !important;
      }

      /* BATCH HEADER STYLES */
      .dsh-distill-batch-header {
        display: flex !important;
        flex-direction: column !important;
        padding: 5px 10px !important;
        min-height: 28px !important;
        margin: 4px 0 !important;
        border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.07)) !important;
        border-radius: 6px !important;
        background: var(--dsw-alias-bg-hover, rgba(255, 255, 255, 0.018)) !important;
        cursor: pointer !important;
        user-select: none !important;
        color: var(--dsw-alias-label-secondary, #a1a1aa) !important;
        font-size: 11.5px !important;
        font-weight: 500 !important;
        transition: background 0.15s ease, border-color 0.15s ease !important;
      }

      .dsh-distill-batch-header:hover {
        background: var(--dsw-alias-bg-active, rgba(255, 255, 255, 0.04)) !important;
        border-color: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.12)) !important;
        color: var(--dsw-alias-label-primary, #f4f4f5) !important;
      }

      .dsh-distill-batch-header[data-has-error="true"] {
        border-color: rgba(239, 68, 68, 0.35) !important;
        background: color-mix(in srgb, rgba(239, 68, 68, 0.06) 100%, transparent) !important;
      }

      .dsh-distill-batch-top {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        width: 100% !important;
      }

      .dsh-distill-batch-title {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        min-width: 0 !important;
        overflow: hidden !important;
        white-space: nowrap !important;
        text-overflow: ellipsis !important;
      }

      .dsh-distill-batch-chevron {
        font-size: 11px !important;
        display: inline-block !important;
        color: var(--dsw-alias-label-tertiary, #71717a) !important;
        flex-shrink: 0 !important;
      }

      .dsh-distill-batch-badge {
        font-size: 10.5px !important;
        padding: 1px 6px !important;
        background: rgba(255, 255, 255, 0.07) !important;
        border-radius: 4px !important;
        color: var(--dsw-alias-label-secondary, #d4d4d8) !important;
        font-family: var(--ds-font-family-code, monospace) !important;
        font-weight: 600 !important;
        letter-spacing: -0.01em !important;
        flex-shrink: 0 !important;
        margin-left: 8px !important;
      }

      .dsh-distill-ticker {
        display: inline-flex !important;
        align-items: center !important;
        gap: 5px !important;
        color: var(--dsw-alias-state-business-primary, #3b82f6) !important;
        font-size: 10.5px !important;
        font-family: var(--ds-font-family-code, monospace) !important;
        background: rgba(59, 130, 246, 0.1) !important;
        padding: 1px 6px !important;
        border-radius: 4px !important;
        max-width: 320px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        flex-shrink: 0 !important;
      }

      .dsh-distill-dot {
        width: 6px !important;
        height: 6px !important;
        border-radius: 50% !important;
        background: currentColor !important;
        animation: dsh-distill-pulse 1.3s infinite !important;
        flex-shrink: 0 !important;
      }

      .dsh-distill-batch-error-tag {
        color: #ef4444 !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        background: rgba(239, 68, 68, 0.12) !important;
        padding: 1px 6px !important;
        border-radius: 4px !important;
        flex-shrink: 0 !important;
      }

      /* 7. CONNECTED TIMELINE (WHEN EXPANDED) */
      [data-chat-flow] > [data-distill-batch-id]:not([data-distill-batch-hidden="true"]) {
        position: relative !important;
        margin-left: 12px !important;
        padding-left: 14px !important;
        border-left: 1.5px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.12)) !important;
        transition: all 0.15s ease !important;
      }

      [data-chat-flow] > [data-distill-batch-id]:not([data-distill-batch-hidden="true"])::before {
        content: "" !important;
        position: absolute !important;
        left: -4px !important;
        top: 10px !important;
        width: 7px !important;
        height: 7px !important;
        border-radius: 50% !important;
        background: var(--dsw-alias-border-l2, #52525b) !important;
        border: 1.5px solid var(--dsw-alias-bg-base, #121214) !important;
        z-index: 2 !important;
      }

      /* Timeline dot for error */
      [data-chat-flow] > [data-distill-batch-id]:not([data-distill-batch-hidden="true"]):has([data-state="error"])::before,
      [data-chat-flow] > [data-distill-batch-id]:not([data-distill-batch-hidden="true"])[data-state="error"]::before {
        background: #ef4444 !important;
        box-shadow: 0 0 7px rgba(239, 68, 68, 0.7) !important;
      }

      [data-chat-flow] > [data-distill-batch-id]:not([data-distill-batch-hidden="true"]):has([data-state="error"]) {
        border-left-color: #ef4444 !important;
      }

      /* 8. FILTER PILLS TOOLBAR (WHEN EXPANDED) */
      .dsh-distill-batch-filters {
        display: flex !important;
        align-items: center !important;
        gap: 5px !important;
        margin-top: 6px !important;
        padding-top: 5px !important;
        border-top: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.06)) !important;
        overflow-x: auto !important;
      }

      .dsh-distill-filter-pill {
        background: var(--dsw-alias-bg-hover, rgba(255, 255, 255, 0.04)) !important;
        border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.08)) !important;
        color: var(--dsw-alias-label-tertiary, #a1a1aa) !important;
        font-size: 10.5px !important;
        font-weight: 500 !important;
        padding: 2px 7px !important;
        border-radius: 4px !important;
        cursor: pointer !important;
        transition: all 0.12s ease !important;
        white-space: nowrap !important;
      }

      .dsh-distill-filter-pill:hover {
        background: var(--dsw-alias-bg-active, rgba(255, 255, 255, 0.08)) !important;
        color: var(--dsw-alias-label-primary, #f4f4f5) !important;
      }

      .dsh-distill-filter-pill[data-active="true"] {
        background: var(--dsw-alias-state-business-primary, #3b82f6) !important;
        border-color: var(--dsw-alias-state-business-primary, #3b82f6) !important;
        color: #ffffff !important;
        font-weight: 600 !important;
      }

      .dsh-distill-filter-pill[data-filter="error"][data-active="true"] {
        background: #ef4444 !important;
        border-color: #ef4444 !important;
      }

      /* 9. HEADER OVERFLOW DROPDOWN */
      .dsh-distill-overflow-trigger {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 28px !important;
        height: 26px !important;
        padding: 0 !important;
        margin-left: 6px !important;
        border-radius: 5px !important;
        border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.08)) !important;
        background: transparent !important;
        color: var(--dsw-alias-label-secondary, #a1a1aa) !important;
        cursor: pointer !important;
        font-size: 13px !important;
        line-height: 1 !important;
        letter-spacing: 1px !important;
        transition: all 0.15s ease !important;
      }

      .dsh-distill-overflow-trigger:hover,
      .dsh-distill-overflow-trigger[data-active="true"],
      .dsh-distill-overflow-trigger:focus-visible {
        background: var(--dsw-alias-bg-hover, rgba(255, 255, 255, 0.06)) !important;
        color: var(--dsw-alias-label-primary, #f4f4f5) !important;
        border-color: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.16)) !important;
      }

      header [data-slot="conversation.session.header.actions"]:not([data-distill-menu-open="true"]) [data-undo-header="true"],
      header [data-slot="conversation.session.header.actions"]:not([data-distill-menu-open="true"]) .dsh-query-nav-toggle,
      header [class*="headerActions"]:not([data-distill-menu-open="true"]) [data-undo-header="true"],
      header [class*="headerActions"]:not([data-distill-menu-open="true"]) .dsh-query-nav-toggle {
        display: none !important;
      }

      header [data-slot="conversation.session.header.actions"][data-distill-menu-open="true"],
      header [class*="headerActions"][data-distill-menu-open="true"] {
        position: relative !important;
      }

      header [data-distill-menu-open="true"] [data-undo-header="true"],
      header [data-distill-menu-open="true"] .dsh-query-nav-toggle {
        position: absolute !important;
        left: 0 !important;
        z-index: 99999 !important;
        min-width: 195px !important;
        background: var(--dsw-alias-bg-floating, #161618) !important;
        border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.15)) !important;
        border-radius: 8px !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6) !important;
        padding: 6px !important;
      }

      header [data-distill-menu-open="true"] [data-undo-header="true"] {
        top: calc(100% + 6px) !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 3px !important;
      }

      header [data-distill-menu-open="true"] .dsh-query-nav-toggle {
        top: calc(100% + 220px) !important;
        display: block !important;
        box-sizing: border-box !important;
        border-top: none !important;
        border-radius: 0 0 8px 8px !important;
        padding: 6px 8px !important;
        text-align: left !important;
      }

      header [data-distill-menu-open="true"] [data-undo-header="true"] button {
        width: 100% !important;
        justify-content: flex-start !important;
        height: 28px !important;
        padding: 0 8px !important;
        border: none !important;
        background: transparent !important;
        color: var(--dsw-alias-label-secondary, #d4d4d8) !important;
        border-radius: 5px !important;
        font-size: 11.5px !important;
        text-align: left !important;
        cursor: pointer !important;
      }

      header [data-distill-menu-open="true"] [data-undo-header="true"] button:hover,
      header [data-distill-menu-open="true"] [data-undo-header="true"] button:focus-visible {
        background: var(--dsw-alias-bg-hover, rgba(255, 255, 255, 0.08)) !important;
        color: #ffffff !important;
      }

      /* ZEN MODE STYLES */
      [data-dsh-distill-mode="zen"] [data-turn-tail] {
        opacity: 0.25 !important;
      }
      [data-dsh-distill-mode="zen"] [data-turn-tail]:hover {
        opacity: 0.95 !important;
      }
      [data-dsh-distill-mode="zen"] .dsh-distill-batch-header {
        border-color: rgba(255, 255, 255, 0.04) !important;
        background: rgba(255, 255, 255, 0.012) !important;
      }
      [data-dsh-distill-mode="zen"] .dsh-distill-batch-header:hover {
        border-color: rgba(255, 255, 255, 0.1) !important;
        background: rgba(255, 255, 255, 0.03) !important;
      }

      @keyframes dsh-distill-pulse {
        0%, 100% { opacity: 0.35; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.15); }
      }
    `;

    function injectStyles() {
      try {
        const STYLE_ID = "dsh-distill-ui-styles";
        let tag = document.getElementById(STYLE_ID);
        if (!tag) {
          tag = document.createElement("style");
          tag.id = STYLE_ID;
          document.head.appendChild(tag);
        }
        tag.textContent = CSS_STYLES;
      } catch (err) {
        console.debug("[dsh-distill-ui] style injection guard:", err);
      }
    }

    function classifyTool(toolName) {
      const t = (toolName || "").toLowerCase().replace(/[-_ ]/g, "");
      if (t === "read" || t === "ler" || t === "grep" || t === "glob" || t === "search" || t === "find" || t === "list" || t === "ls") {
        return "discovery";
      }
      if (t === "write" || t === "gravar" || t === "edit" || t === "editar" || t === "patch") {
        return "mutation";
      }
      if (t === "pwsh" || t === "bash" || t === "runcode" || t === "terminal" || t === "exec" || t === "cmd") {
        return "terminal";
      }
      if (t === "readimage" || t === "readimg" || t === "imagem" || t === "image" || t === "img") {
        return "image";
      }
      if (t === "think" || t === "raciocinio" || t === "pensamento") {
        return "think";
      }
      if (t.includes("context") || t.includes("agentmessage") || t.includes("subagentsettled") || t.includes("subagente")) {
        return "context";
      }
      return "other";
    }

    
    function getToolIcon(tool) {
      const t = (tool || "").toLowerCase();
      if (t === "pwsh" || t === "bash" || t === "terminal" || t === "cmd") return { icon: "💻", label: "Terminal" };
      if (t === "raciocínio" || t === "think" || t === "pensamento") return { icon: "🧠", label: "Raciocínio" };
      if (t === "ler" || t === "read") return { icon: "📖", label: "Leitura" };
      if (t === "gravar" || t === "write") return { icon: "✍️", label: "Gravação" };
      if (t === "editar" || t === "edit") return { icon: "📝", label: "Edição" };
      if (t === "grep") return { icon: "🔍", label: "Grep" };
      if (t === "glob") return { icon: "📂", label: "Busca de Arquivos" };
      if (t === "read_image" || t === "imagem") return { icon: "🖼️", label: "Imagem" };
      if (t.includes("context") || t.includes("subagente") || t.includes("agent")) return { icon: "🤖", label: "Contexto/Agentes" };
      return { icon: "⚡", label: tool };
    }

    function getCategoryTitle(run) {
      const distinctCats = Array.from(new Set(run.map(r => r.cat)));
      if (distinctCats.length === 1) {
        switch (distinctCats[0]) {
          case "discovery": return "operações de leitura e busca";
          case "mutation": return "operações de gravação e edição";
          case "terminal": return "operações de terminal";
          case "image": return "leituras de imagem";
          case "think": return "etapas de raciocínio";
          case "context": return "injeções de contexto";
          default: return "operações técnicas";
        }
      }
      return "operações";
    }

    function getEffectiveToolName(element) {
      if (!element) return "tool";

      const toolAttr = element.querySelector?.("[data-tool]")?.getAttribute("data-tool") ||
                       (element.hasAttribute?.("data-tool") ? element.getAttribute("data-tool") : null);
      if (toolAttr) {
        const lower = toolAttr.toLowerCase();
        if (lower === "run_code" || lower === "runcode") {
          const subTool = element.querySelector?.('[data-subcalls="true"] [data-tool]')?.getAttribute("data-tool");
          if (subTool) return subTool.toLowerCase();
        } else {
          return lower;
        }
      }

      const sample = element.querySelector?.("[data-sample]")?.getAttribute("data-sample") ||
                     (element.hasAttribute?.("data-sample") ? element.getAttribute("data-sample") : null);
      const variant = element.querySelector?.("[data-variant]")?.getAttribute("data-variant") ||
                      (element.hasAttribute?.("data-variant") ? element.getAttribute("data-variant") : null);
      if (sample === "bash" || variant === "bash") {
        const text = (element.textContent || "").toLowerCase();
        if (text.includes("pwsh")) return "pwsh";
        return "bash";
      }

      const titleSpan = element.querySelector?.('[class*="title"], [data-disclosure-row="true"] span:first-child');
      const rawTitle = (titleSpan ? titleSpan.textContent : element.textContent || "").trim().toLowerCase();
      if (rawTitle.startsWith("pwsh")) return "pwsh";
      if (rawTitle.startsWith("bash")) return "bash";
      if (rawTitle.startsWith("ler") || rawTitle.startsWith("read")) return "read";
      if (rawTitle.startsWith("gravar") || rawTitle.startsWith("write")) return "write";
      if (rawTitle.startsWith("editar") || rawTitle.startsWith("edit")) return "edit";
      if (rawTitle.startsWith("grep")) return "grep";
      if (rawTitle.startsWith("glob")) return "glob";
      if (rawTitle.startsWith("read_image") || rawTitle.startsWith("read image")) return "read_image";

      return "tool";
    }

    function hasAssistantReplyContent(el) {
      if (!el || el.nodeType !== 1) return false;

      // Se for apenas uma caixa de pensamento isolada (ou conter apenas tags de pensamento)
      const thinkEl = el.getAttribute("data-variant") === "think" ? el : el.querySelector('[data-variant="think"]');
      const articleEl = el.querySelector("article, .markdown, [class*='markdown'], [class*='MarkdownText']");

      if (articleEl) {
        const text = (articleEl.textContent || "").trim();
        const thinkText = thinkEl ? (thinkEl.textContent || "").trim() : "";
        if (text.length - thinkText.length > 25) return true;
      }

      const richElements = el.querySelectorAll("h1, h2, h3, h4, h5, h6, pre, table, blockquote, ul, ol");
      for (const re of richElements) {
        if (!thinkEl || !thinkEl.contains(re)) return true;
      }

      if (thinkEl) {
        const totalText = (el.textContent || "").trim();
        const thinkText = (thinkEl.textContent || "").trim();
        // Se a diferença entre o texto total e o texto do raciocínio for pequena, é apenas raciocínio/pensamento
        if (totalText.length - thinkText.length > 40) {
          return true;
        }
        return false;
      }

      const text = (el.textContent || "").trim();
      // Não considerar pequenos rótulos de status como texto de resposta real
      if (text.toLowerCase() === "raciocínio" || text.toLowerCase() === "thinking") return false;
      return text.length > 25;
    }

    function isContextInjection(child) {
      if (!child || child.nodeType !== 1) return false;
      const flowKind = child.getAttribute("data-chat-flow-kind");
      if (flowKind === "context" || flowKind === "steering") return true;
      const anchor = child.getAttribute("data-chat-anchor-key") || "";
      if (anchor.startsWith("context:")) return true;
      if (child.querySelector?.('[data-context-source], [data-context-injection-body], [data-context-recall-icon], [class*="ContextInjectionRow"]')) {
        return true;
      }
      const row = child.querySelector?.('[data-disclosure-row="true"]');
      if (row) {
        const text = (row.textContent || "").toLowerCase();
        if (text.includes("injeção de contexto") || text.includes("context injection") || text.includes("context recall") || text.includes("agent-message") || text.includes("subagent-settled")) {
          return true;
        }
      }
      return false;
    }

    function sanitizeContextElements(root) {
      try {
        const rows = root.querySelectorAll?.('[data-chat-flow-kind="context"], [data-chat-flow-kind="steering"], .XrJvXW_root');
        if (!rows) return;

        for (const row of rows) {
          const summaryEl = row.querySelector('[data-context-summary="true"], .XrJvXW_summary');
          if (summaryEl && !summaryEl.getAttribute("data-sanitized")) {
            const text = summaryEl.textContent || "";
            const match = text.match(/Background subagent ([0-9a-f]{6,8})[0-9a-f-]* finished/i);
            if (match) {
              summaryEl.textContent = "🤖 Subagente (" + match[1] + ") concluído";
              summaryEl.setAttribute("data-sanitized", "true");
              summaryEl.title = text;
            }
          }

          const sourceEl = row.querySelector('[data-context-source="true"], .XrJvXW_source');
          if (sourceEl && !sourceEl.getAttribute("data-sanitized")) {
            const srcText = (sourceEl.textContent || "").trim();
            if (srcText === "subagent-settled") {
              sourceEl.textContent = "subagente finalizado";
              sourceEl.setAttribute("data-sanitized", "true");
            } else if (srcText === "agent-message") {
              sourceEl.textContent = "mensagem de agente";
              sourceEl.setAttribute("data-sanitized", "true");
            }
          }
        }
      } catch (err) {
        console.debug("[dsh-distill-ui] sanitizer guard:", err);
      }
    }

    function getContextLabel(child) {
      const srcEl = child.querySelector?.('[data-context-source]');
      if (srcEl) {
        const txt = srcEl.textContent.trim();
        if (txt) return txt;
      }
      const titleSpan = child.querySelector?.('[class*="title"], [data-disclosure-row="true"] span:first-child');
      const rawTitle = (titleSpan ? titleSpan.textContent : "").trim().toLowerCase();
      if (rawTitle.includes("agent-message")) return "agent-message";
      if (rawTitle.includes("subagent-settled") || rawTitle.includes("subagente")) return "subagente";
      return "injeção de contexto";
    }

    function isPureReasoning(child) {
      if (!child || child.nodeType !== 1) return false;
      const flowKind = child.getAttribute("data-chat-flow-kind");
      if (flowKind === "user" || flowKind === "turn-tail" || flowKind === "turn-process") return false;

      if (child.getAttribute("data-variant") === "think" || child.hasAttribute("data-thinking")) return true;
      const thinkEl = child.querySelector?.('[data-variant="think"], [data-thinking], [class*="thought"], [class*="Thought"], [class*="reasoning"], [class*="Reasoning"]');
      if (thinkEl) {
        return !hasAssistantReplyContent(child);
      }

      // Detectar caixas de raciocínio colapsáveis nativas
      const row = child.querySelector?.('[data-disclosure-row="true"]');
      if (row) {
        const text = (row.textContent || "").trim().toLowerCase();
        if (text === "raciocínio" || text === "pensamento" || text.startsWith("raciocínio") || text === "thinking") {
          return !hasAssistantReplyContent(child);
        }
      }
      return false;
    }

    function isGenuineToolCall(child, isSubcallsContainer) {
      if (!child || child.nodeType !== 1) return false;

      const flowKind = child.getAttribute("data-chat-flow-kind");
      if (flowKind === "assistant-step" || flowKind === "user" || flowKind === "turn-tail" || flowKind === "turn-process") {
        return false;
      }

      if (flowKind === "tool-call") return true;

      if (isSubcallsContainer) {
        if (child.classList?.contains("ztWv_q_callRow") || child.hasAttribute("data-chat-call-id")) return true;
        const anchor = child.getAttribute("data-chat-anchor-key") || "";
        if (anchor.startsWith("call:")) return true;
      }

      const anchor = child.getAttribute("data-chat-anchor-key") || "";
      if (anchor.startsWith("call:")) return true;

      // Detectar qualquer container de subchamadas ou disclosure com "chamada de ferramenta"
      if (child.hasAttribute("data-subcalls") || child.querySelector?.('[data-subcalls="true"]')) return true;

      const text = (child.textContent || "").trim().toLowerCase();
      if (text.includes("chamada de ferramenta") || text.includes("tool call") || text.includes("chamadas de ferramentas")) {
        return true;
      }

      if (child.querySelector?.('[data-tool], [data-variant="bash"], [data-sample="bash"], [class*="ToolCall"], [class*="callRow"]')) {
        if (!hasAssistantReplyContent(child) && !child.closest('[data-chat-flow-kind="assistant-step"]')) {
          return true;
        }
      }

      return false;
    }

    function isBatchableIntermediateItem(child, isSubcallsContainer) {
      if (!child || child.nodeType !== 1) return false;

      const flowKind = child.getAttribute("data-chat-flow-kind");
      if (flowKind === "user" || flowKind === "turn-tail" || flowKind === "turn-process") {
        return false;
      }

      if (flowKind === "assistant-step" && hasAssistantReplyContent(child)) {
        return false;
      }

      if (isGenuineToolCall(child, isSubcallsContainer)) return true;
      if (isContextInjection(child)) return true;
      if (isPureReasoning(child)) return true;

      return false;
    }

    function getEffectiveItemInfo(child, isSubcallsContainer) {
      if (isContextInjection(child)) {
        const label = getContextLabel(child);
        return { tool: label, cat: "context" };
      }
      if (isPureReasoning(child)) {
        return { tool: "raciocínio", cat: "think" };
      }
      const text = (child.textContent || "").trim().toLowerCase();
      if (text.includes("chamada de ferramenta") || text.includes("tool call")) {
        return { tool: "ferramenta", cat: "mutation" };
      }
      const toolName = getEffectiveToolName(child);
      let displayTool = toolName;
      if (toolName === "read") displayTool = "ler";
      else if (toolName === "write") displayTool = "gravar";
      else if (toolName === "edit") displayTool = "editar";
      const cat = classifyTool(toolName);
      return { tool: displayTool, cat };
    }

    function getRunningItemDescription(runningRunItem) {
      if (!runningRunItem) return "";
      try {
        const fileLink = runningRunItem.el.querySelector('.o3BgMG_fileLink, [class*="fileLink"]')?.textContent?.trim();
        if (fileLink) return runningRunItem.tool + ": " + fileLink;

        const summary = runningRunItem.el.querySelector('.o3BgMG_summary, [class*="summary"]')?.textContent?.trim();
        if (summary) return runningRunItem.tool + ": " + (summary.length > 28 ? summary.slice(0, 28) + "…" : summary);

        return "executando " + runningRunItem.tool + "…";
      } catch {
        return "executando…";
      }
    }

    function applyBatchFilter(container, batchId, filter) {
      const items = container.querySelectorAll('[data-distill-batch-id="' + batchId + '"]');
      for (const it of items) {
        if (filter === "all") {
          it.removeAttribute("data-distill-filter-hidden");
        } else if (filter === "error") {
          const isErr = it.querySelector('[data-state="error"]') || it.getAttribute("data-state") === "error";
          if (isErr) it.removeAttribute("data-distill-filter-hidden");
          else it.setAttribute("data-distill-filter-hidden", "true");
        } else {
          const itemCat = it.getAttribute("data-distill-item-cat");
          if (itemCat === filter) it.removeAttribute("data-distill-filter-hidden");
          else it.setAttribute("data-distill-filter-hidden", "true");
        }
      }
    }

    /**
     * Batching processor: Groups all consecutive intermediate execution items into ONE unified block.
     */
    function processContainerBatches(container, isSubcallsContainer) {
      if (!container || !container.children || container.children.length === 0) return;

      const children = Array.from(container.children);
      let currentRun = [];
      const runs = [];

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child || child.nodeType !== 1) continue;
        if (child.classList?.contains("dsh-distill-batch-header")) continue;

        if (isBatchableIntermediateItem(child, isSubcallsContainer)) {
          const info = getEffectiveItemInfo(child, isSubcallsContainer);
          currentRun.push({ el: child, tool: info.tool, cat: info.cat });
        } else {
          // Só fecha o run se for um passo de resposta real com conteúdo markdown
          if (currentRun.length >= 2) runs.push(currentRun);
          currentRun = [];

          if (child.hasAttribute("data-distill-batch-id")) {
            child.removeAttribute("data-distill-batch-id");
            child.removeAttribute("data-distill-batch-hidden");
            child.removeAttribute("data-distill-item-cat");
            child.removeAttribute("data-distill-filter-hidden");
          }
        }
      }
      if (currentRun.length >= 2) runs.push(currentRun);

      const validBatchIds = new Set();
      for (const run of runs) {
        if (run.length >= 2) {
          const firstItem = run[0].el;
          const firstKey = firstItem.getAttribute("data-chat-anchor-key") ||
                           firstItem.getAttribute("data-chat-call-id") ||
                           firstItem.getAttribute("data-chat-flow-key") || "item";
          validBatchIds.add("distill-batch-" + firstKey);
        }
      }

      const existingHeaders = container.querySelectorAll(".dsh-distill-batch-header");
      for (const eh of existingHeaders) {
        const bId = eh.getAttribute("data-distill-batch-id");
        if (!validBatchIds.has(bId)) {
          eh.remove();
        }
      }

      for (const run of runs) {
        if (run.length < 2) continue;

        const firstItem = run[0].el;
        const firstKey = firstItem.getAttribute("data-chat-anchor-key") ||
                         firstItem.getAttribute("data-chat-call-id") ||
                         firstItem.getAttribute("data-chat-flow-key") || "item";
        const batchId = "distill-batch-" + firstKey;

        let header = firstItem.previousElementSibling;
        let userToggled = null;
        let activeFilter = "all";

        if (header && header.classList?.contains("dsh-distill-batch-header") && header.getAttribute("data-distill-batch-id") === batchId) {
          if (header.getAttribute("data-user-toggled") === "true") {
            userToggled = header.getAttribute("data-expanded") === "true";
          }
          activeFilter = header.getAttribute("data-active-filter") || "all";
        } else {
          header = document.createElement("div");
          header.className = "dsh-distill-batch-header";
          header.setAttribute("data-distill-batch-id", batchId);
          header.setAttribute("tabindex", "0");
          header.setAttribute("role", "button");
          header.setAttribute("aria-label", "Alternar grupo de operações");
          header.setAttribute("data-active-filter", "all");

          container.insertBefore(header, firstItem);

          const toggleBatch = (e) => {
            if (e.target.closest(".dsh-distill-batch-filters")) return;
            const wasExpanded = header.getAttribute("data-expanded") === "true";
            const nextExpanded = !wasExpanded;
            header.setAttribute("data-user-toggled", "true");
            header.setAttribute("data-expanded", nextExpanded ? "true" : "false");

            const chevron = header.querySelector(".dsh-distill-batch-chevron");
            if (chevron) chevron.textContent = nextExpanded ? "▼" : "▸";

            const filtersBar = header.querySelector(".dsh-distill-batch-filters");
            if (filtersBar) {
              filtersBar.style.display = nextExpanded ? "flex" : "none";
            }

            const items = container.querySelectorAll('[data-distill-batch-id="' + batchId + '"]');
            for (const it of items) {
              it.setAttribute("data-distill-batch-hidden", nextExpanded ? "false" : "true");
            }

            if (nextExpanded) {
              applyBatchFilter(container, batchId, header.getAttribute("data-active-filter") || "all");
            }
          };

          header.addEventListener("click", toggleBatch);
          header.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              if (e.target.closest(".dsh-distill-batch-filters")) return;
              e.preventDefault();
              toggleBatch(e);
            }
          });
        }

        const runningRunItem = run.find(r => r.el.querySelector('[data-state="running"]') || r.el.getAttribute("data-state") === "running");
        const hasRunning = !!runningRunItem;
        const errorItems = run.filter(r => r.el.querySelector('[data-state="error"]') || r.el.getAttribute("data-state") === "error");
        const hasError = errorItems.length > 0;

        // Categories counts
        const catCounts = {};
        const verbCounts = {};
        for (const r of run) {
          catCounts[r.cat] = (catCounts[r.cat] || 0) + 1;
          verbCounts[r.tool] = (verbCounts[r.tool] || 0) + 1;
        }

        const sortedVerbs = Object.entries(verbCounts).sort((a, b) => b[1] - a[1]);
        const maxShown = 5;
        const shownBadges = sortedVerbs.slice(0, maxShown).map(([v, count]) => {
          const info = getToolIcon(v);
          return '<span class="dsh-distill-icon-badge" title="' + count + ' ' + info.label + '">' + info.icon + ' ' + count + '</span>';
        });
        if (sortedVerbs.length > maxShown) {
          const remaining = sortedVerbs.slice(maxShown).reduce((acc, [, c]) => acc + c, 0);
          shownBadges.push('<span class="dsh-distill-icon-badge" title="' + remaining + ' outras operações">+' + remaining + '</span>');
        }
        const verbsDetail = shownBadges.join(" ");
        const categoryTitle = getCategoryTitle(run);

        let isExpanded = false;
        if (userToggled !== null) {
          isExpanded = userToggled;
        } else {
          isExpanded = false;
        }

        header.setAttribute("data-expanded", isExpanded ? "true" : "false");
        header.setAttribute("data-has-error", hasError ? "true" : "false");
        const chevronChar = isExpanded ? "▼" : "▸";

        let runningTickerHtml = "";
        if (hasRunning) {
          const liveAction = getRunningItemDescription(runningRunItem);
          runningTickerHtml = '<span class="dsh-distill-ticker"><span class="dsh-distill-dot"></span> ' + liveAction + '</span>';
        }

        const errorTagHtml = hasError ? ('<span class="dsh-distill-batch-error-tag">⚠️ ' + errorItems.length + ' falha' + (errorItems.length > 1 ? 's' : '') + '</span>') : '';

        // Build Filter Bar HTML (Pills)
        const filterBarDisplay = isExpanded ? "flex" : "none";
        let filterPillsHtml = '';
        if (run.length >= 4) {
          filterPillsHtml = `
            <div class="dsh-distill-batch-filters" style="display: ${filterBarDisplay};">
              <button type="button" class="dsh-distill-filter-pill" data-filter="all" data-active="${activeFilter === 'all'}">Todos (${run.length})</button>
              ${hasError ? ('<button type="button" class="dsh-distill-filter-pill" data-filter="error" data-active="' + (activeFilter === 'error') + '">⚠️ Falhas (' + errorItems.length + ')</button>') : ''}
              ${catCounts.terminal ? ('<button type="button" class="dsh-distill-filter-pill" data-filter="terminal" data-active="' + (activeFilter === 'terminal') + '">Terminal (' + catCounts.terminal + ')</button>') : ''}
              ${catCounts.discovery ? ('<button type="button" class="dsh-distill-filter-pill" data-filter="discovery" data-active="' + (activeFilter === 'discovery') + '">Leitura (' + catCounts.discovery + ')</button>') : ''}
              ${catCounts.mutation ? ('<button type="button" class="dsh-distill-filter-pill" data-filter="mutation" data-active="' + (activeFilter === 'mutation') + '">Edição (' + catCounts.mutation + ')</button>') : ''}
              ${catCounts.context ? ('<button type="button" class="dsh-distill-filter-pill" data-filter="context" data-active="' + (activeFilter === 'context') + '">Agentes/Contexto (' + catCounts.context + ')</button>') : ''}
              ${catCounts.think ? ('<button type="button" class="dsh-distill-filter-pill" data-filter="think" data-active="' + (activeFilter === 'think') + '">Raciocínio (' + catCounts.think + ')</button>') : ''}
            </div>
          `;
        }

        header.innerHTML = `
          <div class="dsh-distill-batch-top">
            <div class="dsh-distill-batch-title">
              <span class="dsh-distill-batch-chevron">${chevronChar}</span>
              <span style="font-weight: 600; color: var(--dsw-alias-label-primary, #f4f4f5);">${run.length} ${categoryTitle}</span>
              <span style="display: inline-flex; gap: 4px; align-items: center; margin-left: 2px;">${verbsDetail}</span>
              ${runningTickerHtml}
              ${errorTagHtml}
            </div>
            <span class="dsh-distill-batch-badge">⚡ ${run.length} agrupadas</span>
          </div>
          ${filterPillsHtml}
        `;

        // Se o usuário clicar na tag de erro, abre a barra e seleciona o filtro de erros
        const errTag = header.querySelector(".dsh-distill-batch-error-tag");
        if (errTag) {
          errTag.addEventListener("click", (ev) => {
            ev.stopPropagation();
            header.setAttribute("data-user-toggled", "true");
            header.setAttribute("data-expanded", "true");
            header.setAttribute("data-active-filter", "error");
            const ch = header.querySelector(".dsh-distill-batch-chevron");
            if (ch) ch.textContent = "▼";
            const fb = header.querySelector(".dsh-distill-batch-filters");
            if (fb) fb.style.display = "flex";
            const pButtons = header.querySelectorAll(".dsh-distill-filter-pill");
            for (const b of pButtons) b.setAttribute("data-active", b.getAttribute("data-filter") === "error" ? "true" : "false");
            const items = container.querySelectorAll('[data-distill-batch-id="' + batchId + '"]');
            for (const it of items) it.setAttribute("data-distill-batch-hidden", "false");
            applyBatchFilter(container, batchId, "error");
          });
        }

        // Wire click handlers on filter pills
        const pillButtons = header.querySelectorAll(".dsh-distill-filter-pill");
        for (const pill of pillButtons) {
          pill.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const f = pill.getAttribute("data-filter");
            header.setAttribute("data-active-filter", f);
            for (const other of pillButtons) other.setAttribute("data-active", other === pill ? "true" : "false");
            applyBatchFilter(container, batchId, f);
          });
        }

        // Mark items
        for (const r of run) {
          r.el.setAttribute("data-distill-batch-id", batchId);
          r.el.setAttribute("data-distill-item-cat", r.cat);
          r.el.setAttribute("data-distill-batch-hidden", isExpanded ? "false" : "true");
        }

        if (isExpanded) {
          applyBatchFilter(container, batchId, activeFilter);
        }
      }
    }

    /**
     * UNIVERSAL VIRTUAL BATCHING ENGINE
     */
    function updateVirtualBatches(root) {
      try {
        if (!root || typeof root.querySelectorAll !== "function") return;

        // 1. Sanitize noisy subagent and context texts
        sanitizeContextElements(root);

        // 2. Process top-level chat flow
        const chatFlow = root.querySelector("[data-chat-flow]") || (root.hasAttribute?.("data-chat-flow") ? root : null) || document.querySelector("[data-chat-flow]");
        if (chatFlow) {
          processContainerBatches(chatFlow, false);
        }

        // 3. Process all subcall containers
        const subcallContainers = root.querySelectorAll('[data-subcalls="true"]');
        for (const sc of subcallContainers) {
          processContainerBatches(sc, true);
        }

        // 4. Guarantee assistant steps with real markdown replies remain 100% visible
        root.querySelectorAll('[data-chat-flow-kind="assistant-step"]').forEach(el => {
          if (hasAssistantReplyContent(el)) {
            el.removeAttribute("data-distill-batch-id");
            el.removeAttribute("data-distill-batch-hidden");
            el.removeAttribute("data-distill-filter-hidden");
          }
        });
      } catch (err) {
        console.debug("[dsh-distill-ui] batching guard:", err);
      }
    }

    /**
     * HEADER OVERFLOW & ZEN/DEV MODE TOGGLE
     */
    function updateHeaderOverflow() {
      try {
        const headerActions = document.querySelector('header [data-slot="conversation.session.header.actions"]') ||
                              document.querySelector('header [class*="headerActions"]');
        if (!headerActions) return;

        const currentMode = localStorage.getItem("dsh-distill-view-mode") || "zen";
        document.documentElement.setAttribute("data-dsh-distill-mode", currentMode);

        const hasSecondary = !!headerActions.querySelector('[data-undo-header="true"], .dsh-query-nav-toggle');
        if (!hasSecondary) return;

        // Injetar alternador de Modo Zen/Dev dentro do container de ações
        const undoHeader = headerActions.querySelector('[data-undo-header="true"]');
        if (undoHeader && !undoHeader.querySelector(".dsh-distill-mode-toggle-btn")) {
          const modeBtn = document.createElement("button");
          modeBtn.type = "button";
          modeBtn.className = "dsh-distill-mode-toggle-btn";
          modeBtn.innerHTML = currentMode === "zen" ? "🌿 Modo: <b>Zen</b> (Foco)" : "💻 Modo: <b>Dev</b> (Completo)";
          modeBtn.title = "Alternar entre modo Zen (foco limpo) e modo Dev (completo)";
          modeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const cur = localStorage.getItem("dsh-distill-view-mode") || "zen";
            const next = cur === "zen" ? "dev" : "zen";
            localStorage.setItem("dsh-distill-view-mode", next);
            document.documentElement.setAttribute("data-dsh-distill-mode", next);
            modeBtn.innerHTML = next === "zen" ? "🌿 Modo: <b>Zen</b> (Foco)" : "💻 Modo: <b>Dev</b> (Completo)";
          });
          undoHeader.insertBefore(modeBtn, undoHeader.firstChild);
        }

        let trigger = headerActions.querySelector(".dsh-distill-overflow-trigger");
        if (!trigger) {
          trigger = document.createElement("button");
          trigger.type = "button";
          trigger.className = "dsh-distill-overflow-trigger";
          trigger.title = "Mais ações e modo de exibição";
          trigger.setAttribute("aria-label", "Mais ações da sessão");
          trigger.setAttribute("aria-haspopup", "menu");
          trigger.setAttribute("aria-expanded", "false");
          trigger.setAttribute("tabindex", "0");
          trigger.textContent = "•••";

          const toggleMenu = () => {
            const isOpen = headerActions.getAttribute("data-distill-menu-open") === "true";
            const next = !isOpen;
            headerActions.setAttribute("data-distill-menu-open", next ? "true" : "false");
            trigger.setAttribute("data-active", next ? "true" : "false");
            trigger.setAttribute("aria-expanded", next ? "true" : "false");
          };

          trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMenu();
          });

          trigger.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleMenu();
            } else if (e.key === "Escape") {
              headerActions.setAttribute("data-distill-menu-open", "false");
              trigger.setAttribute("data-active", "false");
              trigger.setAttribute("aria-expanded", "false");
            }
          });

          document.addEventListener("click", (e) => {
            if (!headerActions.contains(e.target)) {
              headerActions.setAttribute("data-distill-menu-open", "false");
              trigger.setAttribute("data-active", "false");
              trigger.setAttribute("aria-expanded", "false");
            }
          });

          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
              const wasOpen = headerActions.getAttribute("data-distill-menu-open") === "true";
              headerActions.setAttribute("data-distill-menu-open", "false");
              trigger.setAttribute("data-active", "false");
              trigger.setAttribute("aria-expanded", "false");
              if (wasOpen) trigger.focus();
            }
          });

          headerActions.appendChild(trigger);
        }
      } catch (err) {
        console.debug("[dsh-distill-ui] header overflow guard:", err);
      }
    }

    // MUTATIONOBSERVER WITH STRICT REENTRANCY GUARD & DEBOUNCE
    let isProcessing = false;
    let scheduled = false;

    function runCycle() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        if (isProcessing) return;
        isProcessing = true;
        try {
          updateVirtualBatches(document.body);
          updateHeaderOverflow();
        } catch (err) {
          console.debug("[dsh-distill-ui] cycle guard:", err);
        } finally {
          isProcessing = false;
        }
      });
    }

    function initEngine() {
      injectStyles();

      try {
        const observer = new MutationObserver((mutations) => {
          let meaningful = false;
          for (const m of mutations) {
            if (m.type === "childList" && (m.addedNodes.length > 0 || m.removedNodes.length > 0)) {
              for (const n of m.addedNodes) {
                if (n.nodeType === 1 &&
                    !n.classList?.contains("dsh-distill-batch-header") &&
                    !n.classList?.contains("dsh-distill-overflow-trigger") &&
                    !n.classList?.contains("dsh-distill-filter-pill")) {
                  meaningful = true;
                  break;
                }
              }
            }
            if (meaningful) break;
          }
          if (meaningful) runCycle();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener("popstate", runCycle);
        setInterval(runCycle, 1500);

        runCycle();
        setTimeout(runCycle, 400);
        setTimeout(runCycle, 1200);
        setTimeout(runCycle, 2500);
      } catch (err) {
        console.debug("[dsh-distill-ui] observer init guard:", err);
      }
    }

    function apply(ctx) {
      if (typeof window !== "undefined") {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", initEngine);
        } else {
          initEngine();
        }
      }
    }

    exports.apply = apply;
    exports.inject = ["slots"];
    return module.exports;
  }
});
