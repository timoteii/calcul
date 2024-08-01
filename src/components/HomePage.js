import React, { Component } from "react";
import "../styles/App.css";
import Header from "./Header";
import BasicInfo_1 from "./BasicInfo_1";
import Products_2 from "./Products_2";
import CostComparison_3 from "./CostComparison_3";
import CommercialOffer_4 from "./CommercialOffer_4";

class HomePage extends Component {
constructor(props) {
    super(props);
    this.state = {
      isProductsSectionVisible: false,
      selectedSubsection: "",
      selectedDeliveryOption: "",
      isCostComparisonVisible: false,
      isCommercialOfferVisible: false,
      isModalVisible: false, // Изначально модальное окно невидимо
      paymentMethod: "",
      clientCoordinates: "",
      totalWeight: "",
      namesAndQuantities: [],
      selectedProduction: [],
      selectedProductionName: "",
      rowCount: 0, // Инициализируем rowCount в state
      modalFormData: null, // Новое состояние для данных, которые передадим в ModalForm5
    };
  }

  handleRowCountChange = (count) => {
    this.setState({ rowCount: count });
    console.log("Number of rows:", count);
  };

  // Метод для открытия/закрытия модального окна
  toggleModalVisibility = () => {
    this.setState((prevState) => ({
      isModalVisible: !prevState.isModalVisible,
    }));
  };

  handleSubsectionChange = (selectedSubsection) => {
    this.setState({
      selectedSubsection,
      isProductsSectionVisible: selectedSubsection !== "",
    });
  };

  handleDeliveryChange = (selectedDeliveryOption) => {
    this.setState({ selectedDeliveryOption });
  };

  handlePaymentChange = (paymentMethod) => {
    this.setState({ paymentMethod });
  };

  handleSelectedProduction = (data) => {
    // Проверяем, отличается ли выбранное производство от текущего
    if (this.state.selectedProduction.length > 0 && this.state.selectedProduction[0] !== data[0]) {
      // Очищаем массив selectedProduction
      this.setState({
        selectedProduction: [data],
        selectedProductionName: [data[0]],
      });
    } else {
      // Добавляем в selectedProduction, если это первый выбор или тот же продукт
      this.setState((prevState) => ({
        selectedProduction: [data],
        selectedProductionName: [data[0]],
      }));
    }
  };

  handleConvertCoordinates = (clientCoordinates) => {
    this.setState({ clientCoordinates });
  };

  handleTotalWeightChange = (totalWeight) => {
    this.setState({ totalWeight });
  };

  handleNamesAndQuantitiesChange = (namesAndQuantities) => {
    this.setState({ namesAndQuantities });
  };

  handleCommercialOfferVisibility = (isVisible) => {
    this.setState({ isCommercialOfferVisible: isVisible });
  };

  render() {
    const {
      isProductsSectionVisible,
      selectedSubsection,
      selectedDeliveryOption,
      isCostComparisonVisible,
      isCommercialOfferVisible,
      paymentMethod,
      clientCoordinates,
      totalWeight,
      namesAndQuantities,
      selectedProduction,
      selectedProductionName,
      isModalVisible,
      modalFormData,
    } = this.state;

    const handleSaveToPDF = (data) => {
      // Здесь можно обработать или сохранить данные, полученные из CommercialOffer_4
      //console.log("Сохранение данных в PDF:", data);
      // Пример обработки данных:
      // ... код обработки данных
      this.setState({ modalFormData: data });
    };
    
    return (
      <div className="HomePage">
        <Header />
        <BasicInfo_1
          subsectionOptions={this.state.subsectionOptions}
          onSubsectionChange={this.handleSubsectionChange}
          selectedDeliveryOption={this.state.selectedDeliveryOption}
          onDeliveryChange={this.handleDeliveryChange}
          paymentMethod={this.state.paymentMethod}
          onPaymentChange={this.handlePaymentChange}
          clientCoordinates={this.state.clientCoordinates}
          onCoordinatesChange={this.handleConvertCoordinates}
          setIsCostComparisonVisible={(value) =>
            this.setState({ isCostComparisonVisible: value })
          }
        />
        <Products_2
          isProductsSectionVisible={isProductsSectionVisible}
          selectedSubsection={selectedSubsection}
          onTotalWeightChange={this.handleTotalWeightChange}
          onNamesAndQuantitiesChange={this.handleNamesAndQuantitiesChange}
        />
        <CostComparison_3
          selectedSubsection={selectedSubsection}
          selectedDeliveryOption={selectedDeliveryOption}
          isCostComparisonVisible={isCostComparisonVisible}
          paymentMethod={paymentMethod}
          clientCoordinates={clientCoordinates}
          totalWeight={totalWeight}
          namesAndQuantities={namesAndQuantities}
          toggleCommercialOfferVisibility={this.handleCommercialOfferVisibility}
          selectedProduction={selectedProduction}
          onSelectedProduction={this.handleSelectedProduction}
          onRowCountChange={this.handleRowCountChange} // Передаем новый пропс
        />
        <CommercialOffer_4
          isVisible={isCommercialOfferVisible}
          selectedProduction={selectedProduction}
          selectedProductionName={selectedProductionName}
          namesAndQuantities={namesAndQuantities}
          selectedDeliveryOption={selectedDeliveryOption}
          paymentMethod={paymentMethod}
          setIsModalVisible={(value) =>
            this.setState({ isModalVisible: value })
          }
          onSaveToPDF={handleSaveToPDF} // Передача колбэка в CommercialOffer_4
        />
      </div>
    );
   }
  }

  export default HomePage;