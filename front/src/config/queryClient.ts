import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

const logError = (
  scope: 'Query' | 'Mutation',
  payload: Record<string, unknown>,
) => {
  console.error(`[ReactQuery][${scope} Error]`, payload);
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logError('Query', {
        error,
        queryKey: query.queryKey,
        meta: query.meta,
      });
    },
  }),

  mutationCache: new MutationCache({
    onError: (error, variables, _context, mutation) => {
      logError('Mutation', {
        error,
        variables,
        mutationKey: mutation.options.mutationKey,
        meta: mutation.options.meta,
      });
    },
  }),

  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});