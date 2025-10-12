export async function getUserLocation() {
  const key = import.meta.env.VITE_IPSTACK_KEY;
  if (!key) throw new Error('Missing VITE_IPSTACK_KEY in src/.env');

  const url = `https://api.ipstack.com/check?access_key=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ipstack HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.info || JSON.stringify(json.error));
  return {
    ip: json.ip,
    city: json.city,
    region: json.region_name || json.region,
    country: json.country_name,
    country_code: json.country_code && json.country_code.toLowerCase(),
    latitude: json.latitude,
    longitude: json.longitude
  };
}
