import React, { Component } from 'react';
import axios from 'axios'; // Import Axios for making HTTP requests
import '../styles/App.css';
import { fetchDataFromServerDelivery, fetchDataFromServerSubsection, fetchDataFromServerName } from '../fetches';

class BasicInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientCoordinates: 'Здесь будут координаты',
      urlGoogleMaps: 'http://www.example.com',
      locationInputValue: '',
      deliveryOptions: [],
      subsectionOptions: [],
      selectedSubsection: '',
      selectedDeliveryOption: '',
      paymentMethod: '',
      locationType: 'coordinates' // Default to coordinates
    };
  }

  componentDidMount() {
    this.loadDeliveryData();
    this.loadSubsectionData();
    fetchDataFromServerName();
  }

  loadDeliveryData() {
    fetchDataFromServerDelivery()
      .then((deliveryOptions) => {
        this.setState({ deliveryOptions });
      })
      .catch((error) => {
        console.error("Ошибка при загрузке данных для доставки:", error);
      });
  }

  loadSubsectionData() {
    fetchDataFromServerSubsection()
      .then((subsectionOptions) => {
        this.setState({ subsectionOptions });
      })
      .catch((error) => {
        console.error("Ошибка при загрузке данных для подраздела:", error);
      });
  }

  handleConvertCoordinates = () => {
    const { locationInputValue, locationType } = this.state;

    if (locationType === 'coordinates') {
      const coordinatesRegex = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}, ?-?((1[0-7][0-9]|[1-9]?[0-9])\.{1}\d{1,6}|180\.{1}0{1,6})$/;
      if (coordinatesRegex.test(locationInputValue)) {
        const clientCoordinates = locationInputValue;
        this.setState({
          clientCoordinates,
          urlGoogleMaps: `https://www.google.com/maps?q=${locationInputValue}`,
        });
        this.props.onCoordinatesChange(clientCoordinates);
      } else {
        alert('Введите корректные координаты.');
      }
    } else if (locationType === 'address') {
      // Perform address geocoding using Nominatim API
      axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationInputValue)}&format=json&limit=1`)
        .then(response => {
          if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            const clientCoordinates = `${lat}, ${lon}`;
            const urlGoogleMaps = `https://www.google.com/maps?q=${lat},${lon}`;
            this.setState({
              clientCoordinates,
              urlGoogleMaps,
            });
            this.props.onCoordinatesChange(clientCoordinates);
          } else {
            alert('Адрес не найден.');
          }
        })
        .catch(error => {
          console.error('Ошибка при выполнении запроса к Nominatim API:', error);
          alert('Произошла ошибка при обработке адреса.');
        });
    } else {
      alert('Выберите тип местоположения.');
    }
  };

  handleInputChange = (event) => {
    this.setState({ locationInputValue: event.target.value });
  };

  handleSubsectionChange = (event) => {
    const selectedSubsection = event.target.value;

    if (this.state.selectedDeliveryOption && this.state.clientCoordinates !== 'Здесь будут координаты') {
      this.setState({ selectedSubsection });
      this.props.onSubsectionChange(selectedSubsection);
      this.props.setIsCostComparisonVisible(true);
    } else {
      alert('Выберите корректный способ доставки и введите корректные координаты.');
      this.props.setIsCostComparisonVisible(false);
    }
  };

  handleDeliveryChange = (event) => {
    const selectedDeliveryOption = event.target.value;
    this.setState({ selectedDeliveryOption });
    this.props.onDeliveryChange(selectedDeliveryOption);

    if (this.state.selectedSubsection && this.state.clientCoordinates !== 'Здесь будут координаты') {
      this.props.setIsCostComparisonVisible(true);
    } else {
      this.props.setIsCostComparisonVisible(false);
    }
  };

  handlePaymentMethodChange = (event) => {
    const paymentMethod = event.target.value;
    this.setState({ paymentMethod });
    this.props.onPaymentChange(paymentMethod);
  };

  handleLocationTypeChange = (event) => {
    const locationType = event.target.value;
    this.setState({ locationType, locationInputValue: '' }); // Clear input value when switching type
  };

  render() {
    const { clientCoordinates, urlGoogleMaps, deliveryOptions, subsectionOptions, locationType } = this.state;
  
    // Function to format coordinates to six decimal places
    const formatCoordinates = (coordinates) => {
      if (!coordinates) return ''; // Если координаты пустые, возвращаем пустую строку
      const coordsArray = coordinates.split(',');
      if (coordsArray.length !== 2) return ''; // Проверяем, что координаты состоят из двух частей (широта и долгота)
      
      const lat = parseFloat(coordsArray[0].trim()).toFixed(6);
      const lon = parseFloat(coordsArray[1].trim()).toFixed(6);
  
      if (isNaN(lat) || isNaN(lon)) return ''; // Проверяем, что полученные значения являются числами
  
      return `${lat}, ${lon}`;
    };
  
    return (
      <section id="basic-info">
        <h2>Базовая информация</h2>
        <div className="form-group">
          <div className="sub-block">
            <div className="radio-group">
              <input
                type="radio"
                id="coordinates"
                name="location"
                value="coordinates"
                checked={locationType === 'coordinates'}
                onChange={this.handleLocationTypeChange}
              />
              <label htmlFor="coordinates">Координаты</label>
              <input
                type="radio"
                id="address"
                name="location"
                value="address"
                checked={locationType === 'address'}
                onChange={this.handleLocationTypeChange}
              />
              <label htmlFor="address">Адрес</label>
            </div>
            <input
              type="text"
              id="location-input"
              name="location-input"
              placeholder={locationType === 'coordinates' ? '12.345678, 90.123456' : 'Введите адрес'}
              value={this.state.locationInputValue}
              onChange={this.handleInputChange}
            />
            <button id="buttonAddressCoordinates" onClick={this.handleConvertCoordinates}>
              Преобразовать
            </button>
            <div className="coordinates-and-map">
              <label id="coordinates-label" style={{ color: '#888' }}>
                {formatCoordinates(clientCoordinates)}
              </label>
              <a
                id="urlGoogleMaps"
                href={urlGoogleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="google-maps-button"
              >
                <span><i className="material-icons">location_on</i></span>
              </a>
            </div>
          </div>
  
          <div className="sub-block">
            <label htmlFor="payment-method">Форма оплаты</label>
            <select id="payment-method" name="payment-method" onChange={this.handlePaymentMethodChange}>
              <option value="bank-transfer">Безналичный расчет</option>
              <option value="cash">Наличные</option>
            </select>
          </div>
          <div className="sub-block">
            <label>Тип материала</label>
            <label className="blue">ЖБИ Изделия</label>
          </div>
          <div className="sub-block">
            <label htmlFor="dropdownListDelivery">Способ доставки</label>
            <select id="dropdownListDelivery" onChange={this.handleDeliveryChange}>
              <option disabled selected>Выберите опцию</option>
              {deliveryOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="sub-block">
            <label htmlFor="material-section">Подраздел материала</label>
            <select
              name="material-subtype[]"
              className="material-subtype"
              id="material-section"
              onChange={this.handleSubsectionChange}
              disabled={!this.state.selectedDeliveryOption || this.state.clientCoordinates === 'Здесь будут координаты'}
            >
              <option disabled selected>Выберите опцию</option>
              {subsectionOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </section>
    );
  }
  
}

export default BasicInfo;
