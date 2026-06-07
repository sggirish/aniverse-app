export function crunchyrollLink(): string {
  const base = process.env.NEXT_PUBLIC_CRUNCHYROLL_AFFILIATE_URL;
  return base ?? "https://www.crunchyroll.com";
}

export function nordvpnLink(): string {
  const base = process.env.NEXT_PUBLIC_NORDVPN_AFFILIATE_URL;
  return base ?? "https://nordvpn.com";
}
