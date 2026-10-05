/**
 * Client-side utilities for rendering Mermaid diagrams and KaTeX math formulas.
 * Both libraries are loaded dynamically on demand to keep bundle size minimal.
 */

let mermaidInitialized = false;
let currentMermaidTheme = '';

/**
 * Render a Mermaid chart string to an SVG string.
 */
export async function renderMermaid(code: string, isDark: boolean = true): Promise<string> {
  const mermaid = (await import('mermaid')).default;
  const theme = isDark ? 'dark' : 'default';

  if (!mermaidInitialized || currentMermaidTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'strict',
      fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
      themeVariables: isDark
        ? {
            darkMode: true,
            background: '#0f172a',
            primaryColor: '#3b82f6',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#60a5fa',
            lineColor: '#94a3b8',
            secondaryColor: '#1e293b',
            tertiaryColor: '#0f172a',
          }
        : {
            darkMode: false,
            background: '#ffffff',
            primaryColor: '#2563eb',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#3b82f6',
            lineColor: '#64748b',
          },
    });
    mermaidInitialized = true;
    currentMermaidTheme = theme;
  }

  // Generate unique ID without dashes or special chars that can break mermaid query selectors
  const id = `mermaid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const cleanCode = code.trim();

  const { svg } = await mermaid.render(id, cleanCode);
  return svg;
}

/**
 * Render a LaTeX expression to HTML using KaTeX.
 */
export async function renderLatex(latex: string, displayMode: boolean = false): Promise<string> {
  const katex = (await import('katex')).default;
  return katex.renderToString(latex, {
    displayMode,
    throwOnError: false,
  });
}

/**
 * Hydrate rich elements inside a rendered blog content container:
 * 1. Mermaid code blocks (<pre><code class="language-mermaid">)
 * 2. KaTeX math spans/divs ([data-type="inline-math"], [data-type="block-math"])
 */
export async function hydrateRichContent(container: HTMLElement, isDark: boolean = true): Promise<void> {
  if (!container) return;

  // 1. Hydrate Mermaid diagrams
  const mermaidNodes = container.querySelectorAll<HTMLElement>('pre > code.language-mermaid, pre.language-mermaid');
  if (mermaidNodes.length > 0) {
    for (const node of Array.from(mermaidNodes)) {
      const code = node.textContent?.trim() || '';
      if (!code) continue;

      const pre = node.closest('pre') || node;
      if (pre.getAttribute('data-mermaid-hydrated') === 'true') continue;

      // Mark as processed immediately to avoid duplicate hydration
      pre.setAttribute('data-mermaid-hydrated', 'true');

      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-diagram my-6 p-4 rounded-xl border border-border bg-card/60 flex justify-center items-center overflow-x-auto shadow-xs';
      wrapper.innerHTML = '<div class="text-xs text-muted-foreground animate-pulse py-4">Rendering diagram…</div>';

      pre.parentNode?.insertBefore(wrapper, pre);
      pre.style.display = 'none';

      try {
        const svg = await renderMermaid(code, isDark);
        wrapper.innerHTML = svg;
      } catch (err: any) {
        console.warn('Failed to render Mermaid diagram:', err);
        wrapper.innerHTML = `
          <div class="w-full text-left p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            <p class="font-semibold mb-1">Mermaid Syntax Error</p>
            <pre class="overflow-x-auto text-[11px] font-mono text-destructive/90">${err?.message || 'Invalid syntax'}</pre>
          </div>
        `;
        pre.style.display = 'block';
      }
    }
  }

  // 2. Hydrate KaTeX mathematics
  const mathNodes = container.querySelectorAll<HTMLElement>('[data-type="inline-math"], [data-type="block-math"]');
  if (mathNodes.length > 0) {
    const katex = (await import('katex')).default;
    mathNodes.forEach(el => {
      if (el.getAttribute('data-math-hydrated') === 'true') return;
      const latex = el.getAttribute('data-latex') || el.textContent || '';
      if (!latex) return;

      const isBlock = el.getAttribute('data-type') === 'block-math';
      try {
        katex.render(latex, el, {
          displayMode: isBlock,
          throwOnError: false,
        });
        el.setAttribute('data-math-hydrated', 'true');
      } catch (e) {
        console.warn('KaTeX render error:', e);
      }
    });
  }

  // 3. Hydrate standard Code Blocks (add Header with Language badge & Copy button)
  const codeBlocks = container.querySelectorAll<HTMLElement>('pre > code:not(.language-mermaid)');
  if (codeBlocks.length > 0) {
    let hljsInstance: any = null;

    for (const codeEl of Array.from(codeBlocks)) {
      const pre = codeEl.closest('pre');
      if (!pre || pre.getAttribute('data-code-hydrated') === 'true') continue;
      pre.setAttribute('data-code-hydrated', 'true');

      // Extract language from class (e.g. language-typescript -> TypeScript)
      const classList = Array.from(codeEl.classList);
      const langClass = classList.find(c => c.startsWith('language-'));
      const rawLang = langClass ? langClass.replace('language-', '') : '';
      const displayLang = rawLang ? rawLang.toUpperCase() : 'CODE';

      // Highlight syntax with highlight.js if not already highlighted
      if (!codeEl.querySelector('.hljs-keyword') && rawLang) {
        try {
          if (!hljsInstance) {
            hljsInstance = (await import('highlight.js')).default;
          }
          if (hljsInstance.getLanguage(rawLang)) {
            const rawText = codeEl.textContent || '';
            const highlighted = hljsInstance.highlight(rawText, { language: rawLang }).value;
            codeEl.innerHTML = highlighted;
          }
        } catch {
          // Fallback to existing content
        }
      }

      // Build outer container
      const containerEl = document.createElement('div');
      containerEl.className = 'code-block-container not-prose';

      // Build header
      const headerEl = document.createElement('div');
      headerEl.className = 'code-block-header';

      const langSpan = document.createElement('span');
      langSpan.className = 'code-block-lang';
      langSpan.textContent = displayLang;

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'code-block-copy-btn';
      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        <span>Copy</span>
      `;

      copyBtn.addEventListener('click', async () => {
        const textToCopy = codeEl.textContent || '';
        try {
          await navigator.clipboard.writeText(textToCopy);
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            <span style="color: #34d399; font-weight: 600;">Copied!</span>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <span>Copy</span>
            `;
          }, 2000);
        } catch (copyErr) {
          console.error('Failed to copy code:', copyErr);
        }
      });

      headerEl.appendChild(langSpan);
      headerEl.appendChild(copyBtn);

      // Insert container in place of pre, then append header and pre inside container
      pre.parentNode?.insertBefore(containerEl, pre);
      containerEl.appendChild(headerEl);
      containerEl.appendChild(pre);
    }
  }
}
