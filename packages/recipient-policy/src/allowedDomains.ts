export function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/\.+$/, "");
}

export function getEmailDomain(email: string): string | null {
  const trimmed = email.trim();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return null;
  const local = trimmed.slice(0, atIndex);
  const domain = normalizeDomain(trimmed.slice(atIndex + 1));
  if (!local || !domain || /\s/.test(trimmed) || !domain.includes(".")) return null;
  return domain;
}

export function isAllowedDomain(domain: string, allowedDomains: string[], allowSubdomains: boolean): boolean {
  const normalized = normalizeDomain(domain);
  return allowedDomains.map(normalizeDomain).some((allowed) => {
    if (normalized === allowed) return true;
    return allowSubdomains && normalized.endsWith(`.${allowed}`);
  });
}
