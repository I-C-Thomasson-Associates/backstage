/*
 * ICTA: sign-in is only allowed for active members of an allowlisted GitHub org.
 * Fails closed: no orgs configured, API errors and non-members are all rejected.
 */
export async function findAllowedOrg(options: {
  apiUrl: string;
  accessToken: string;
  allowedOrgs: string[];
  fetchFn?: typeof fetch;
}): Promise<string | undefined> {
  const { apiUrl, accessToken, allowedOrgs, fetchFn = fetch } = options;
  for (const org of allowedOrgs) {
    const res = await fetchFn(
      `${apiUrl.replace(/\/$/, '')}/user/memberships/orgs/${encodeURIComponent(
        org,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      },
    );
    if (res.ok && (await res.json())?.state === 'active') {
      return org;
    }
  }
  return undefined;
}
