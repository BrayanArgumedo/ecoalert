import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapLeafletProps {
  lat: number;
  lon: number;
  label?: string;
  height?: number;
  onScrollLock?: () => void;
  onScrollUnlock?: () => void;
}

export default function MapLeaflet({ lat, lon, label = '', height = 190, onScrollLock, onScrollUnlock }: MapLeafletProps) {
  const popup = label ? `marker.bindPopup(${JSON.stringify(label)}).openPopup();` : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lon}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);
    var icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41],
      popupAnchor: [1, -34], shadowSize: [41, 41]
    });
    var marker = L.marker([${lat}, ${lon}], { icon: icon }).addTo(map);
    ${popup}
  </script>
</body>
</html>`;

  return (
    <View
      style={{ height, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f3f4f6' }}
      onTouchStart={onScrollLock}
      onTouchEnd={onScrollUnlock}
      onTouchCancel={onScrollUnlock}
    >
      <WebView
        source={{ html }}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        renderLoading={() => (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
            <ActivityIndicator color="#16a34a" />
          </View>
        )}
        startInLoadingState
      />
    </View>
  );
}
