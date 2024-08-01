import React, { useEffect, useState } from "react";
import "../styles/App.css";
const { getProductionData } = require("../backend"); // Подстройте путь при необходимости

const CostComparison_3 = ({
  isCostComparisonVisible,
  selectedDeliveryOption,
  paymentMethod,
  clientCoordinates,
  totalWeight,
  namesAndQuantities,
  toggleCommercialOfferVisibility,
  onSelectedProduction,
  onRowCountChange, // Новый пропс для передачи количества строк
}) => {
  const [productionData, setProductionData] = useState([]);
   // Состояние для отслеживания выбранной строки

  useEffect(() => {
    const fetchData = async () => {
      if (isCostComparisonVisible) {
        try {
          let sposob_dostavki = selectedDeliveryOption;
          let forma_oplati = paymentMethod;
          let kuda_edem = clientCoordinates;
          let obshaya_massa = parseFloat(totalWeight).toFixed(2);
          let spisok = namesAndQuantities;
          let res = await getProductionData(
            spisok,
            kuda_edem,
            forma_oplati,
            sposob_dostavki,
            obshaya_massa
          ); // Используем await для дожидания результата

          const replaceNaN = (data) => {
            return data.map(row => 
              row.map(value => 
                value === 'NaN' ? 'нет данных' : value
              )
            );
          };

          res = replaceNaN(res);
          setProductionData(res); // Сохраняем данные в состоянии

          // Установка выбранной строки по умолчанию (первая строка)


          // Передача количества строк в родительский компонент
          onRowCountChange(res.length);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      }
    };

    fetchData();
  }, [
    isCostComparisonVisible,
    selectedDeliveryOption,
    paymentMethod,
    clientCoordinates,
    totalWeight,
    namesAndQuantities,
    onRowCountChange, // Указываем зависимость для функции, чтобы она вызывалась при обновлении данных
  ]);

  const handleRowSelect = (index) => {
    
    handleDisplayKP(index); // Передаем индекс в функцию для отображения КП
  };

  const handleDisplayKP = async (index) => {
    if (index >= 0 && index < productionData.length) {
      // Проверяем, что индекс находится в пределах допустимых значений
      const selectedProductionData = [
        productionData[index][0], // Производство
        productionData[index][3], // Цена за рейс
        productionData[index][4], // Кол-во рейсов
      ];

      // Call parent function to add selected production data
      onSelectedProduction(selectedProductionData);

      // Toggle CommercialOffer visibility
      toggleCommercialOfferVisibility(true);

      // Wait for the DOM update before scrolling
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Scroll down to the section
      const section = document.getElementById("commercial-offer");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <section
      id="cost-comparison"
      className="cost-comparison-section"
      style={{ display: isCostComparisonVisible ? 'block' : 'none' }}
    >
      <h2>Сравнение стоимости производств</h2>
      <table>
        <thead>
          <tr>
            <th>Производство</th>
            <th>Расстояние, км</th>
            <th>Сумма материалов</th>
            <th>Цена за рейс</th>
            <th>Кол-во рейсов</th>
            <th>Общая сумма</th>
            <th>Выбрать</th>
          </tr>
        </thead>
        <tbody id="table-body">
          {productionData.map((row, index) => (
            <tr key={index}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
              <td>{row[3]}</td>
              <td>{row[4]}</td>
              <td>{row[5]}</td>
              <td>
                <input
                  type="radio"
                  name="selectedRow"
                  onChange={() => handleRowSelect(index)}
                  //checked={selectedRow === index}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default CostComparison_3;
