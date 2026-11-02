import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { Fleuron } from '../components/Ornaments';

/** Shown when a page fails to render or its code cannot be loaded (e.g. an old tab after a new deploy). */
export function RouteError() {
  const error = useRouteError();
  const chunkFailed = error instanceof TypeError && /dynamically imported module|Importing a module script failed/i.test(error.message);
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="grid min-h-svh place-items-center bg-linen px-6 text-center">
      <div className="max-w-md">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-kraft-deep">{notFound ? 'Error 404' : 'Something went wrong'}</p>
        <h1 className="display mt-5 text-[40px] text-espresso">
          {chunkFailed ? 'A newer version of the store is ready.' : notFound ? 'This page could not be found.' : 'This page could not be shown.'}
        </h1>
        <Fleuron className="mx-auto mt-8 w-56" />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="btn btn-solid">
            Reload
          </button>
          <Link to="/" className="btn btn-line">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
