import { useEffect, useState } from 'react';
import { fetchTrainLocations } from '../api/odpt';
import MapView from '../components/MapView';
import '../style/Home.css';

function Home() {
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    fetchTrainLocations().then((data) => {
      console.log('🚈 リアルタイム列車位置データ:', data);
      setTrains(data);
    });
  }, []);

  return (
    <div className="home-container">
      <h1 className="title">🚉 リアルタイム列車位置 + 地図</h1>

      <div className="map-wrapper">
        <MapView />
      </div>

      <h2 className="subtitle">📍 列車位置リスト</h2>
      <ul className="train-list">
        {trains.map((train) => (
          <li key={train['@id']}>
            <div className="railway">{train['odpt:railway']}</div>
            <div className="train-number">列車番号: {train['odpt:trainNumber']}</div>
            <div className="from-station">出発駅: {train['odpt:fromStation']}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
