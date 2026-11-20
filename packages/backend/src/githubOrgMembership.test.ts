import { findAllowedOrg } from './githubOrgMembership';

function fakeFetch(responses: Record<string, { status: number; body?: any }>) {
  const calls: string[] = [];
  const fn = (async (url: string, init: any) => {
    calls.push(url);
    expect(init.headers.Authorization).toBe('Bearer tok');
    const org = url.split('/').pop()!;
    const r = responses[org] ?? { status: 404 };
    return {
      ok: r.status >= 200 && r.status < 300,
      json: async () => r.body,
    };
  }) as unknown as typeof fetch;
  return { fn, calls };
}

const base = { apiUrl: 'https://ghe.example/api/v3/', accessToken: 'tok' };

describe('findAllowedOrg', () => {
  it('rejects when no orgs are configured', async () => {
    const { fn, calls } = fakeFetch({});
    expect(
      await findAllowedOrg({ ...base, allowedOrgs: [], fetchFn: fn }),
    ).toBeUndefined();
    expect(calls).toEqual([]);
  });

  it('accepts an active member of any allowed org', async () => {
    const { fn, calls } = fakeFetch({
      'Org-B': { status: 200, body: { state: 'active' } },
    });
    expect(
      await findAllowedOrg({
        ...base,
        allowedOrgs: ['Org-A', 'Org-B'],
        fetchFn: fn,
      }),
    ).toBe('Org-B');
    expect(calls).toEqual([
      'https://ghe.example/api/v3/user/memberships/orgs/Org-A',
      'https://ghe.example/api/v3/user/memberships/orgs/Org-B',
    ]);
  });

  it('rejects pending invites, 403 (app not approved) and 404', async () => {
    const { fn } = fakeFetch({
      'Org-A': { status: 200, body: { state: 'pending' } },
      'Org-B': { status: 403 },
    });
    expect(
      await findAllowedOrg({
        ...base,
        allowedOrgs: ['Org-A', 'Org-B', 'Org-C'],
        fetchFn: fn,
      }),
    ).toBeUndefined();
  });
});
