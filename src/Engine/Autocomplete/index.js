import React, { useState } from 'react';
import axios from 'axios';
import './styles.css'


function Autocomplete(){

  //constants
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

    
   // Função assíncrona para buscar sugestões de endereços com base no valor de `query`.
   const fetchSuggestions = async () => {
    // Se o comprimento de `query` for maior que 2, fazemos a requisição.
    if (query.length > 2) {
      // Definimos a URL do endpoint usando o valor de `query` para buscar sugestões.
      const endpoint = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5&countrycodes=br`;
      try {
        // Fazemos uma requisição GET usando `axios`.
        const response = await axios.get(endpoint);
        // Atualizamos o estado `suggestions` com os dados retornados.
        setSuggestions(response.data);
      } catch (error) {
        // Se ocorrer um erro na requisição, ele é capturado aqui.
        console.error('Erro ao buscar sugestões:', error);
      }
    } else {
      // Se `query` tiver 2 caracteres ou menos, limpamos as sugestões.
      setSuggestions([]);
    }
  };

  // Função chamada quando o usuário seleciona uma sugestão.
  const selectSuggestion = async (suggestion) => {
    // Atualizamos `query` com o valor do endereço selecionado.
    setQuery(suggestion.display_name);
    // Ocultamos as sugestões.
    setShowSuggestions(false);
    // Chamamos a função `fetchCoordinates` para obter as coordenadas do endereço.
    fetchCoordinates(suggestion.display_name);
  };

  // Função assíncrona para buscar as coordenadas (latitude e longitude)
  // de um endereço usando a API OpenCage Geocoding.
  const fetchCoordinates = async (address) => {
    // Chave da API para autenticação.
    const apiKey = '3f84bf15d01643f5a6dac9ce3905198a'; 
    // URL do endpoint, incluindo o endereço como parâmetro.
    const endpoint = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;
    try {
      // Fazemos uma requisição GET para obter as coordenadas.
      const response = await axios.get(endpoint);
      // Se a resposta contém resultados, atualizamos `coordinates`.
      if (response.data && response.data.results.length > 0) {
        setCoordinates(response.data.results[0].geometry);
      } else {
        // Se não houver resultados, definimos `coordinates` como `null`.
        setCoordinates(null);
        console.error('Nenhuma coordenada encontrada para o endereço fornecido.');
      }
    } catch (error) {
      // Se ocorrer um erro na requisição, ele é capturado aqui.
      setCoordinates(null);
      console.error('Erro ao buscar coordenadas:', error);
    }
  };


  return (
    <div className="autocomplete-container">

        <div className='name'>
            <h1 className='title'>Encontre o sua localização com</h1>
            <h2 className='subtitle'>Open-Street-Maps e Geocoding</h2>
      
        </div>
      
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
          <h3>Coordenadas:</h3>
          <p>Latitude: {coordinates.lat}</p>
          <p>Longitude: {coordinates.lng}</p>
        </div>
      )}
    </div>
  );
}


export default Autocomplete;
