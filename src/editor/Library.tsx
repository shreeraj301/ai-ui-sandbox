import { useMemo, useState, type CSSProperties } from 'react';
import { componentList } from '../registry/registry';
import type { Category } from '../registry/types';
import { useEditor } from './store';

const categories: Category[] = ['Foundations', 'Forms', 'Content'];

/** The component list in the Components tab of the sidebar. */
export function Library({ userVars }: { userVars: CSSProperties }) {
  const [query, setQuery] = useState('');
  const addComponent = useEditor((state) => state.addComponent);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return componentList;
    return componentList.filter(
      (definition) =>
        definition.name.toLowerCase().includes(q) ||
        definition.description.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      <div className="search">
        <label className="visually-hidden" htmlFor="library-search">
          Search components
        </label>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.5-4.5" />
        </svg>
        <input
          id="library-search"
          type="search"
          placeholder={`Search ${componentList.length} components`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <p className="panel__empty">No component matches “{query.trim()}”.</p>
      ) : (
        categories.map((category) => {
          const items = filtered.filter((definition) => definition.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} aria-label={category}>
              <h3 className="section-label">{category}</h3>
              <ul className="library__list">
                {items.map((definition) => (
                  <li key={definition.type}>
                    <button
                      type="button"
                      className="library__item"
                      onClick={() => addComponent(definition.type)}
                    >
                      <span className="library__preview" style={userVars} aria-hidden="true">
                        <span className={`lp lp--${definition.type}`} />
                      </span>
                      <span className="library__text">
                        <span className="library__name">{definition.name}</span>
                        <span className="library__desc">{definition.description}</span>
                      </span>
                      <span className="visually-hidden">, add to the page</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </>
  );
}
