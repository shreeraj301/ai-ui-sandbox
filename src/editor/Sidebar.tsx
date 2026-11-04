import { useRef, useState, type CSSProperties } from 'react';
import { Library } from './Library';
import { Tabs } from './Tabs';
import { TokenList } from './TokenList';

type Section = 'components' | 'tokens';

const SECTIONS = [
  { id: 'components', label: 'Components' },
  { id: 'tokens', label: 'Tokens' },
] as const;

/** Left panel: what the page can be built from. Components to add, tokens to tune. */
export function Sidebar({ userVars }: { userVars: CSSProperties }) {
  const [section, setSection] = useState<Section>('components');
  const panel = useRef<HTMLElement>(null);
  // Both tabs share one scrolling panel, so each tab starts at its top.
  const show = (next: Section) => {
    setSection(next);
    if (panel.current) panel.current.scrollTop = 0;
  };
  return (
    <aside className="panel library" aria-label="Components and tokens" ref={panel}>
      <Tabs
        idPrefix="sidebar"
        label="Sidebar sections"
        tabs={SECTIONS}
        value={section}
        onChange={show}
      />
      <div
        role="tabpanel"
        id={`sidebar-panel-${section}`}
        aria-labelledby={`sidebar-tab-${section}`}
      >
        {section === 'components' ? (
          <Library userVars={userVars} />
        ) : (
          <TokenList userVars={userVars} />
        )}
      </div>
    </aside>
  );
}
