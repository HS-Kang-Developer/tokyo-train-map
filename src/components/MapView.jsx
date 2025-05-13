import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { fetchStations, fetchTrainLocations, fetchCrowdedTrains } from '../api/odpt';


function DynamicStationMarkers({ stations }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => {
      setZoom(map.getZoom());
    };
    map.on('zoomend', onZoom);

    return () => {
      map.off('zoomend', onZoom);
    };
  }, [map]);

  const getRadiusByZoom = (zoomLevel) => {

    return Math.max(1, (zoomLevel - 9) * 0.8);
  };

  return (
    <>
      {stations.map((station) => (
        <CircleMarker
          key={station['owl:sameAs']}
          center={[station['geo:lat'], station['geo:long']]}
          radius={getRadiusByZoom(zoom)}
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.7 }}
        >
          <Popup>{station['odpt:stationTitle']?.ja}</Popup>
        </CircleMarker>
      ))}
    </>
  );
}

function MapView() {
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [crowdedTrains, setCrowdedTrains] = useState([]);
  const [progress, setProgress] = useState(0);

  const getCrowdColor = (text) => {
    if (!text) return 'gray';
    if (text.includes('遅延') || text.includes('混雑')) return 'red';
    if (text.includes('やや混雑') || text.includes('注意')) return 'orange';
    if (text.includes('平常') || text.includes('通常')) return 'green';
    return 'gray';
  };

  // 역 데이터 로드
  useEffect(() => {
    fetchStations().then((data) => {
      const valid = data.filter(s => s['geo:lat'] && s['geo:long']);
      setStations(valid);
    });
  }, []);

  // 혼잡도 데이터 로드
  useEffect(() => {
    fetchCrowdedTrains().then((data) => {
      setCrowdedTrains(data);
    });
  }, []);

  // 열차 위치 실시간 업데이트
  useEffect(() => {
    const update = () => {
      fetchTrainLocations().then((data) => {
        // console.log('🚈 열차 위치 업데이트:', data);
        setTrains(data);
      });
    };
    update(); // 최초 호출
    const interval = setInterval(update, 5000); // 5초마다 갱신
    return () => clearInterval(interval);
  }, []);

  // 부드러운 이동 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev + 0.01 > 1 ? 0 : prev + 0.01));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const interpolate = (from, to, t) => {
    const lat = from['geo:lat'] + (to['geo:lat'] - from['geo:lat']) * t;
    const lng = from['geo:long'] + (to['geo:long'] - from['geo:long']) * t;
    return [lat, lng];
  };

  return (
    <MapContainer center={[35.6812, 139.7671]} zoom={11} style={{ height: '700px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔹 역 마커 (줌 따라 크기 변경) */}
      <DynamicStationMarkers stations={stations} />

      {/* 🔹 열차 위치 표시 */}
      {trains.map((train) => {
        const fromStation = stations.find(s => s['owl:sameAs'] === train['odpt:fromStation']);
        const toStation = stations.find(s => s['owl:sameAs'] === train['odpt:toStation']);

        if (!fromStation) return null;

        const crowdInfo = crowdedTrains.find(info => info['odpt:railway'] === train['odpt:railway']);
        const crowdColor = getCrowdColor(crowdInfo?.['odpt:trainInformationText']?.ja);

        const pos = toStation
          ? interpolate(fromStation, toStation, progress)
          : [fromStation['geo:lat'], fromStation['geo:long']];

        return (
          <CircleMarker
            key={train['@id']}
            center={pos}
            radius={8}
            pathOptions={{ color: crowdColor, fillOpacity: 0.9 }}
          >
            <Popup>
              🚆 {train['odpt:trainNumber']}<br />
              📍 {fromStation['odpt:stationTitle']?.ja}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

export default MapView;
