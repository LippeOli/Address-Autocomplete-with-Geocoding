import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';

function Autocomplete() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [marker, setMarker] = useState(null);

  const [coordinates, setCoordinates] = useState({
    lat: -22.8722784,
    lng: -46.0669339,
  }); // Coordenadas iniciais

  // Autocomplete States
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Inicializa o mapa uma vez quando o componente é montado
  useEffect(() => {
    mapInstance.current = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    // Adiciona o marcador inicial
    const initialMarker = L.marker([coordinates.lat, coordinates.lng]).addTo(mapInstance.current)
      .bindPopup('Localização inicial')
      .openPopup();
    setMarker(initialMarker);

    return () => {
      // Limpa o mapa ao desmontar o componente
      mapInstance.current.remove();
    };
  }, []);

  // Atualiza o marcador no mapa quando as coordenadas são alteradas
  useEffect(() => {
    if (mapInstance.current && coordinates) {
      updateMarker();
    }
  }, [coordinates]);

  // Função para atualizar o marcador com novas coordenadas
  const updateMarker = () => {
    if (marker) {
      mapInstance.current.removeLayer(marker); // Remove o marcador anterior
    }

    const newMarker = L.marker([coordinates.lat, coordinates.lng]).addTo(mapInstance.current)
      .bindPopup(`Coordenadas: ${coordinates.lat}, ${coordinates.lng}`)
      .openPopup();

    setMarker(newMarker);  // Atualiza o estado com o novo marcador
    mapInstance.current.setView([coordinates.lat, coordinates.lng], 13);  // Centraliza o mapa nas novas coordenadas
  };

  // Função assíncrona para buscar sugestões de endereços com base no valor de `query`.
  const fetchSuggestions = async () => {
    if (query.length > 2) {
      const endpoint = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5&countrycodes=br`;
      try {
        const response = await axios.get(endpoint);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Função chamada quando o usuário seleciona uma sugestão.
  const selectSuggestion = async (suggestion) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    fetchCoordinates(suggestion.display_name);
  };

  // Função assíncrona para buscar as coordenadas (latitude e longitude)
  // de um endereço usando a API OpenCage Geocoding.
  const fetchCoordinates = async (address) => {
    const apiKey = '3f84bf15d01643f5a6dac9ce3905198a'; 
    const endpoint = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
    try {
      const response = await axios.get(endpoint);
      if (response.data && response.data.results.length > 0) {
        setCoordinates(response.data.results[0].geometry);
      } else {
        setCoordinates(null);
        console.error('Nenhuma coordenada encontrada para o endereço fornecido.');
      }
    } catch (error) {
      setCoordinates(null);
      console.error('Erro ao buscar coordenadas:', error);
    }
  };

  return (
    <div>
      <div className="map-container">
        <h1>Mapa com Leaflet</h1>
        <div id="map" ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
      </div>

      <div className="autocomplete-container">
        <h1 className='title'>Encontre o sua localização com</h1>
        <h2 className='subtitle'>Open-Street-Maps e Geocoding</h2>
      
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            fetchSuggestions();
          }}
          placeholder="Digite um endereço"
          onFocus={() => setShowSuggestions(true)}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="suggestion-item"
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
        {coordinates && (
          <div>
          </div>
        )}
      </div>

      <div >
            <h3>Coordenadas:</h3>
            <p>Latitude: {coordinates.lat}</p>
            <p>Longitude: {coordinates.lng}</p>
          </div>
    </div>
  );
}

export default Autocomplete;
