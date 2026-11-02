import { Fragment, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — thennai` : 'thennai — Zero-Dirt Windowsill Herb Kits from Erode';
  }, [title]);
}

interface Props {
  crumbs?: { label: string; to?: string }[];
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
}

/** Breadcrumb + display heading used at the top of storefront pages. */
export function PageHeader({ crumbs = [], eyebrow, title, children }: Props) {
  return (
    <header className="mx-auto max-w-[1280px] px-6 pb-10 pt-10 sm:px-10 lg:pb-14 lg:pt-14">
      {crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.2em] text-umber">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-espresso">
                Home
              </Link>
            </li>
            {crumbs.map((c) => (
              <Fragment key={c.label}>
                <li aria-hidden className="text-line">/</li>
                <li>
                  {c.to ? (
                    <Link to={c.to} className="hover:text-espresso">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-espresso">
                      {c.label}
                    </span>
                  )}
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
      )}
      {eyebrow && <p className="eyebrow mt-10">{eyebrow}</p>}
      <h1 className={`display text-[44px] text-espresso sm:text-[60px] ${eyebrow ? 'mt-5' : 'mt-8'}`}>{title}</h1>
      {children}
    </header>
  );
}
