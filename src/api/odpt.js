const API_KEY = import.meta.env.VITE_ODPT_API_KEY;

export async function fetchTrainLocations() {
  const url = `https://api.odpt.org/api/v4/odpt:Train?acl:consumerKey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Train API failed: ${res.status}`);
  return await res.json();
}

export async function fetchStations() {
  const url = `https://api.odpt.org/api/v4/odpt:Station?acl:consumerKey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Station API failed: ${res.status}`);
  return await res.json();
}

export async function fetchCrowdedTrains() {
  const url = `https://api.odpt.org/api/v4/odpt:TrainInformation?acl:consumerKey=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    console.log('🚦 혼잡도 열차 데이터:', data);

    const filtered = data.filter(info =>
      info['odpt:trainInformationText']?.ja
    );

    return filtered;
  } catch (err) {
    console.error('[fetchCrowdedTrains] API 호출 실패:', err);
    return [];
  }
}

export async function fetchRailwayShapes() {
  const url = `https://api.odpt.org/api/v4/odpt:RailwayShape?acl:consumerKey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RailwayShape API failed: ${res.status}`);
  return await res.json();
}
