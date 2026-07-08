import { useState, useRef, useEffect } from 'react';
import { Copy, Check, ChevronDown, ExternalLink } from 'lucide-react';

interface CopyPageDropdownProps {
  pageUrl: string;
  pageTitle: string;
}

// ChatGPT logo SVG
const ChatGPTIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.602 8.3829l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.1408 1.6465 4.4708 4.4708 0 0 1 .5765 3.0175zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="currentColor"/>
  </svg>
);

// Claude logo SVG (official from Wikimedia)
const ClaudeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 233.959793 800.214905 L 468.644287 668.536987 L 472.590637 657.100647 L 468.644287 650.738403 L 457.208069 650.738403 L 417.986633 648.322144 L 283.892639 644.69812 L 167.597321 639.865845 L 54.926208 633.825623 L 26.577238 627.785339 L 3.3e-05 592.751709 L 2.73832 575.27533 L 26.577238 559.248352 L 60.724873 562.228149 L 136.187973 567.382629 L 249.422867 575.194763 L 331.570496 580.026978 L 453.261841 592.671082 L 472.590637 592.671082 L 475.328857 584.859009 L 468.724915 580.026978 L 463.570557 575.194763 L 346.389313 495.785217 L 219.543671 411.865906 L 153.100723 363.543762 L 117.181267 339.060425 L 99.060455 316.107361 L 91.248367 266.01355 L 123.865784 230.093994 L 167.677887 233.073853 L 178.872513 236.053772 L 223.248367 270.201477 L 318.040283 343.570496 L 441.825592 434.738342 L 459.946411 449.798706 L 467.194672 444.64447 L 468.080597 441.020203 L 459.946411 427.409485 L 392.617493 305.718323 L 320.778564 181.932983 L 288.80542 130.630859 L 280.348999 99.865845 C 277.369171 87.221436 275.194641 76.590698 275.194641 63.624268 L 312.322174 13.20813 L 332.8591 6.604126 L 382.389313 13.20813 L 403.248352 31.328979 L 434.013519 101.71814 L 483.865753 212.537048 L 561.181274 363.221497 L 583.812134 407.919434 L 595.892639 449.315491 L 600.40271 461.959839 L 608.214783 461.959839 L 608.214783 454.711609 L 614.577271 369.825623 L 626.335632 265.61084 L 637.771851 131.516846 L 641.718201 93.745117 L 660.402832 48.483276 L 697.530334 24.000122 L 726.52356 37.852417 L 750.362549 72 L 747.060486 94.067139 L 732.886047 186.201416 L 705.100708 330.52356 L 686.979919 427.167847 L 697.530334 427.167847 L 709.61084 415.087341 L 758.496704 350.174561 L 840.644348 247.490051 L 876.885925 206.738342 L 919.167847 161.71814 L 946.308838 140.29541 L 997.61084 140.29541 L 1035.38269 196.429626 L 1018.469849 254.416199 L 965.637634 321.422852 L 921.825562 378.201538 L 859.006714 462.765259 L 819.785278 530.41626 L 823.409424 535.812073 L 832.75177 534.92627 L 974.657776 504.724915 L 1051.328979 490.872559 L 1142.818848 475.167786 L 1184.214844 494.496582 L 1188.724854 514.147644 L 1172.456421 554.335693 L 1074.604126 578.496765 L 959.838989 601.449829 L 788.939636 641.879272 L 786.845764 643.409485 L 789.261841 646.389343 L 866.255127 653.637634 L 899.194702 655.409424 L 979.812134 655.409424 L 1129.932861 666.604187 L 1169.154419 692.537109 L 1192.671265 724.268677 L 1188.724854 748.429688 L 1128.322144 779.194641 L 1046.818848 759.865845 L 856.590759 714.604126 L 791.355774 698.335754 L 782.335693 698.335754 L 782.335693 703.731567 L 836.69812 756.885986 L 936.322205 846.845581 L 1061.073975 962.81897 L 1067.436279 991.490112 L 1051.409424 1014.120911 L 1034.496704 1011.704712 L 924.885986 929.234924 L 882.604126 892.107544 L 786.845764 811.48999 L 780.483276 811.48999 L 780.483276 819.946289 L 802.550415 852.241699 L 919.087341 1027.409424 L 925.127625 1081.127686 L 916.671204 1098.604126 L 886.469849 1109.154419 L 853.288696 1103.114136 L 785.073914 1007.355835 L 714.684631 899.516785 L 657.906067 802.872498 L 650.979858 806.81897 L 617.476624 1167.704834 L 601.771851 1186.147705 L 565.530212 1200 L 535.328857 1177.046997 L 519.302124 1139.919556 L 535.328857 1066.550537 L 554.657776 970.792053 L 570.362488 894.68457 L 584.536926 800.134277 L 592.993347 768.724976 L 592.429626 766.630859 L 585.503479 767.516968 L 514.22821 865.369263 L 405.825531 1011.865906 L 320.053711 1103.677979 L 299.516815 1111.812256 L 263.919525 1093.369263 L 267.221497 1060.429688 L 287.114136 1031.114136 L 405.825531 880.107361 L 477.422913 786.52356 L 523.651062 732.483276 L 523.328918 724.671265 L 520.590698 724.671265 L 205.288605 929.395935 L 149.154434 936.644409 L 124.993355 914.01355 L 127.973183 876.885986 L 139.409409 864.80542 L 234.201385 799.570435 L 233.879227 799.8927 Z" fill="#d97757"/>
  </svg>
);

export function CopyPageDropdown({ pageUrl, pageTitle }: CopyPageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const extractCleanMarkdown = (element: Element): string => {
    const lines: string[] = [];
    
    // Helper to check if element should be skipped
    const shouldSkip = (el: Element): boolean => {
      const tagName = el.tagName.toLowerCase();
      return (
        el.classList.contains('sl-banner') ||
        el.classList.contains('copy-page-dropdown') ||
        el.classList.contains('pagination-links') ||
        el.classList.contains('edit-on-github') ||
        el.closest('.copy-page-dropdown') ||
        el.closest('astro-island') ||
        tagName === 'button' ||
        tagName === 'nav' ||
        tagName === 'footer' ||
        tagName === 'script' ||
        tagName === 'style' ||
        tagName === 'astro-island' ||
        tagName === 'astro-slot' ||
        tagName === 'astro-static-slot' ||
        tagName === 'template' ||
        tagName === 'noscript' ||
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'svg' ||
        el.getAttribute('aria-hidden') === 'true' ||
        (tagName === 'a' && el.textContent?.includes('Section titled')) ||
        (tagName === 'a' && el.textContent?.includes('Edit page'))
      );
    };

    // Helper to extract inline content with formatting preserved
    const extractInlineContent = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();
      
      if (shouldSkip(el)) return '';
      
      // Handle images
      if (tagName === 'img') {
        const alt = el.getAttribute('alt') || '';
        const src = el.getAttribute('src') || '';
        if (src) {
          const fullUrl = src.startsWith('http') ? src : `https://docs.localstack.cloud${src}`;
          return `\n\n![${alt}](${fullUrl})\n\n`;
        }
        return '';
      }
      
      // Handle inline code
      if (tagName === 'code' && !el.closest('pre')) {
        return `\`${el.textContent}\``;
      }
      
      // Handle bold/strong
      if (tagName === 'strong' || tagName === 'b') {
        const innerContent = Array.from(el.childNodes).map(extractInlineContent).join('');
        return `**${innerContent}**`;
      }
      
      // Handle italic/emphasis
      if (tagName === 'em' || tagName === 'i') {
        const innerContent = Array.from(el.childNodes).map(extractInlineContent).join('');
        return `*${innerContent}*`;
      }
      
      // Handle links
      if (tagName === 'a' && !el.textContent?.includes('Section titled')) {
        const href = el.getAttribute('href');
        const innerContent = Array.from(el.childNodes).map(extractInlineContent).join('');
        if (innerContent && href && !href.startsWith('#')) {
          // Clean URL by removing tracking parameters
          let cleanUrl = href.startsWith('http') ? href : `https://docs.localstack.cloud${href}`;
          try {
            const url = new URL(cleanUrl);
            // Remove common tracking parameters
            ['__hstc', '__hssc', '__hsfp', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
              url.searchParams.delete(param);
            });
            cleanUrl = url.toString();
          } catch (e) {
            // If URL parsing fails, use the original
          }
          return `[${innerContent}](${cleanUrl})`;
        }
        return innerContent;
      }
      
      // Handle line breaks
      if (tagName === 'br') {
        return '\n';
      }
      
      // For other inline elements, just extract children
      return Array.from(el.childNodes).map(extractInlineContent).join('');
    };
    
    // Helper to process list items recursively
    const processListItem = (li: Element, prefix: string, indentLevel: number): string[] => {
      const result: string[] = [];
      const indent = '  '.repeat(indentLevel);
      let mainContent = '';
      let nestedLists: Element[] = [];
      
      // Separate main content from nested lists
      li.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as Element;
          const tagName = el.tagName.toLowerCase();
          if (tagName === 'ul' || tagName === 'ol') {
            nestedLists.push(el);
          } else {
            mainContent += extractInlineContent(child);
          }
        } else {
          mainContent += extractInlineContent(child);
        }
      });
      
      // Clean up main content
      mainContent = mainContent.trim().replace(/\s+/g, ' ');
      
      if (mainContent) {
        result.push(`${indent}${prefix} ${mainContent}`);
      }
      
      // Process nested lists
      nestedLists.forEach(nestedList => {
        const nestedTagName = nestedList.tagName.toLowerCase();
        const nestedItems = nestedList.querySelectorAll(':scope > li');
        nestedItems.forEach((nestedLi, idx) => {
          const nestedPrefix = nestedTagName === 'ol' ? `${idx + 1}.` : '-';
          result.push(...processListItem(nestedLi, nestedPrefix, indentLevel + 1));
        });
      });
      
      return result;
    };

    const processNode = (node: Node, depth: number = 0): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Only add standalone text if it has meaningful content
        const text = node.textContent?.trim();
        if (text && node.parentElement?.tagName.toLowerCase() === 'main') {
          lines.push(text);
        }
        return;
      }
      
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();
      
      if (shouldSkip(el)) return;
      
      // Handle headings
      if (/^h[1-6]$/.test(tagName)) {
        const level = parseInt(tagName[1]);
        const prefix = '#'.repeat(level);
        const text = extractInlineContent(el).replace(/Section titled "[^"]*"/g, '').trim();
        if (text) {
          lines.push('');
          lines.push(`${prefix} ${text}`);
          lines.push('');
        }
        return;
      }
      
      // Handle images
      if (tagName === 'img') {
        const alt = el.getAttribute('alt') || '';
        const src = el.getAttribute('src') || '';
        if (src) {
          // Make relative URLs absolute
          const fullUrl = src.startsWith('http') ? src : `https://docs.localstack.cloud${src}`;
          lines.push('');
          lines.push(`![${alt}](${fullUrl})`);
          lines.push('');
        }
        return;
      }
      
      // Handle figure elements (which often wrap images)
      if (tagName === 'figure') {
        const img = el.querySelector('img');
        if (img) {
          const alt = img.getAttribute('alt') || '';
          const src = img.getAttribute('src') || '';
          if (src) {
            const fullUrl = src.startsWith('http') ? src : `https://docs.localstack.cloud${src}`;
            lines.push('');
            lines.push(`![${alt}](${fullUrl})`);
            lines.push('');
          }
        }
        return;
      }
      
      // Handle code blocks
      if (tagName === 'pre' || el.classList.contains('expressive-code')) {
        const codeEl = el.querySelector('code');
        if (codeEl) {
          const code = codeEl.textContent?.trim() || '';
          const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
          const lang = langClass ? langClass.replace('language-', '') : '';
          lines.push('');
          lines.push('```' + lang);
          lines.push(code);
          lines.push('```');
          lines.push('');
        }
        return;
      }
      
      // Handle inline code (standalone)
      if (tagName === 'code' && !el.closest('pre')) {
        lines.push(`\`${el.textContent}\``);
        return;
      }
      
      // Handle lists
      if (tagName === 'ul' || tagName === 'ol') {
        lines.push('');
        const items = el.querySelectorAll(':scope > li');
        items.forEach((li, idx) => {
          const prefix = tagName === 'ol' ? `${idx + 1}.` : '-';
          const listLines = processListItem(li, prefix, 0);
          lines.push(...listLines);
        });
        lines.push('');
        return;
      }
      
      // Handle paragraphs
      if (tagName === 'p') {
        const content = extractInlineContent(el).trim();
        if (content) {
          lines.push('');
          lines.push(content);
        }
        return;
      }
      
      // Handle blockquotes
      if (tagName === 'blockquote') {
        const content = extractInlineContent(el).trim();
        if (content) {
          lines.push('');
          content.split('\n').forEach(line => {
            lines.push(`> ${line}`);
          });
          lines.push('');
        }
        return;
      }
      
      // Handle tables
      if (tagName === 'table') {
        lines.push('');
        const rows = el.querySelectorAll('tr');
        rows.forEach((row, rowIdx) => {
          const cells = row.querySelectorAll('th, td');
          const cellTexts = Array.from(cells).map(cell => extractInlineContent(cell).trim() || '');
          lines.push('| ' + cellTexts.join(' | ') + ' |');
          if (rowIdx === 0) {
            lines.push('| ' + cellTexts.map(() => '---').join(' | ') + ' |');
          }
        });
        lines.push('');
        return;
      }
      
      // Handle horizontal rules
      if (tagName === 'hr') {
        lines.push('');
        lines.push('---');
        lines.push('');
        return;
      }
      
      // Recursively process children for other elements (div, section, article, etc.)
      el.childNodes.forEach(child => processNode(child, depth + 1));
    };
    
    processNode(element);
    
    // Clean up the output
    return lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
      .replace(/^[\s\n]+/, '')      // Trim start
      .replace(/[\s\n]+$/, '');     // Trim end
  };

  const handleCopyPage = async () => {
    try {
      // Get the main content, specifically the markdown content area
      const mainContent = document.querySelector('.sl-markdown-content') || document.querySelector('main');
      if (mainContent) {
        const markdown = extractCleanMarkdown(mainContent);
        const text = `# ${pageTitle}\n\nSource: ${pageUrl}\n\n${markdown}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setIsOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openInChatGPT = () => {
    const prompt = encodeURIComponent(`Read from ${pageUrl} so I can ask questions about it.`);
    window.open(`https://chatgpt.com/?prompt=${prompt}`, '_blank');
    setIsOpen(false);
  };

  const openInClaude = () => {
    const prompt = encodeURIComponent(`Read from ${pageUrl} so I can ask questions about it.`);
    window.open(`https://claude.ai/new?q=${prompt}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="copy-page-dropdown" ref={dropdownRef}>
      <button
        className="copy-page-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        <span>{copied ? 'Copied!' : 'Copy page'}</span>
        <ChevronDown size={14} className={`chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="copy-page-menu">
          <button className="menu-item" onClick={handleCopyPage}>
            <Copy size={16} />
            <span>Copy page</span>
            <span className="menu-item-desc">Copy page as Markdown for LLMs</span>
          </button>
          
          <div className="menu-divider" />
          
          <button className="menu-item" onClick={openInChatGPT}>
            <ChatGPTIcon />
            <span>Open in ChatGPT</span>
            <ExternalLink size={12} className="external-icon" />
          </button>
          
          <button className="menu-item" onClick={openInClaude}>
            <ClaudeIcon />
            <span>Open in Claude</span>
            <ExternalLink size={12} className="external-icon" />
          </button>
        </div>
      )}

      <style>{`
        .copy-page-dropdown {
          position: relative;
          display: inline-flex;
        }

        .copy-page-button {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background-color: var(--sl-color-gray-6);
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.375rem;
          color: var(--sl-color-gray-2);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .copy-page-button:hover {
          background-color: var(--sl-color-gray-5);
          border-color: var(--sl-color-gray-4);
        }

        .copy-page-button .chevron {
          transition: transform 0.2s ease;
          margin-left: 0.125rem;
        }

        .copy-page-button .chevron.rotated {
          transform: rotate(180deg);
        }

        .copy-page-menu {
          position: absolute;
          top: calc(100% + 0.375rem);
          right: 0;
          min-width: 240px;
          background-color: var(--sl-color-gray-6);
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15);
          z-index: 100;
          padding: 0.375rem;
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem 0.625rem;
          background: none;
          border: none;
          border-radius: 0.375rem;
          color: var(--sl-color-gray-2);
          font-size: 0.8125rem;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.15s ease;
          position: relative;
        }

        .menu-item:hover {
          background-color: var(--sl-color-gray-5);
        }

        .menu-item-desc {
          display: block;
          font-size: 0.6875rem;
          color: var(--sl-color-gray-3);
          position: absolute;
          bottom: 0.25rem;
          left: 2rem;
          line-height: 1;
        }

        .menu-item:has(.menu-item-desc) {
          padding-bottom: 1.25rem;
          flex-wrap: wrap;
        }

        .external-icon {
          margin-left: auto;
          color: var(--sl-color-gray-4);
        }

        .menu-divider {
          height: 1px;
          background-color: var(--sl-color-gray-5);
          margin: 0.375rem 0;
        }

        @media (max-width: 640px) {
          .copy-page-button span:not(.chevron) {
            display: none;
          }
          
          .copy-page-button {
            padding: 0.375rem;
          }
          
          .copy-page-menu {
            right: -0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
