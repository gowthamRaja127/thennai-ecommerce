import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Fleuron } from '../components/Ornaments';
import { usePageTitle } from '../components/PageHeader';

export function NotFoundContent({ title = 'This page has wandered off the sill.' }: { title?: string }) {
  return (
    <section className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-kraft-deep">Error 404</p>
      <h1 className="display mt-6 text-[40px] text-espresso sm:text-[52px]">{title}</h1>
      <Fleuron className="mt-8 w-56" />
      <Link to="/shop" className="btn btn-solid mt-10">
        Return to the shop <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

export function NotFoundPage() {
  usePageTitle('Not found');
  return <NotFoundContent />;
}
