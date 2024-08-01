import React, { useState, useEffect } from "react";
import "../styles/App.css";
const { listPrices } = require("../backend"); // Adjust path as needed

const CommercialOffer_4 = ({
  isVisible,
  selectedProductionName,
  namesAndQuantities,
  selectedProduction,
  selectedDeliveryOption,
  paymentMethod,
  onSaveToPDF, // Добавляем onSaveToPDF в список пропсов
  setIsModalVisible,
}) => {
  const [markupPercentage, setMarkupPercentage] = useState(10);
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemPrices, setItemPrices] = useState([]);
  const [productCosts, setProductCosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let namesOfProduct = namesAndQuantities.map((item) => item[0]);
        let formOfPayment = paymentMethod;
        let nameProduction = selectedProductionName[0];

        const prices = await listPrices(
          namesOfProduct,
          formOfPayment,
          nameProduction
        );

        //console.log("Prices from backend:", prices);

        const updatedProductCosts = prices.map((price) =>
          parseInt(price.replace(/\s+/g, ""), 10)
        );

        const additionalProductCosts = selectedProduction.map((item) =>
          parseInt(item[1].replace(/\s+/g, ""), 10)
        );

        const combinedProductCosts = [
          ...updatedProductCosts,
          ...additionalProductCosts,
        ];

        //console.log("Updated product costs:", combinedProductCosts);

        setProductCosts(combinedProductCosts);

        const updatedPrices = combinedProductCosts.map((cost) =>
          Math.round(cost * (1 + markupPercentage / 100))
        );

        setItemPrices(updatedPrices);

        const total = updatedPrices.reduce((acc, price, index) => {
          const quantity =
            index < namesAndQuantities.length
              ? namesAndQuantities[index]?.[1] || 1
              : selectedProduction[index - namesAndQuantities.length]?.[2] || 1;
          return acc + price * quantity;
        }, 0);
        setTotalPrice(total);
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      }
    };

    fetchData();
  }, [
    namesAndQuantities,
    selectedProduction,
    selectedProductionName,
    paymentMethod,
    markupPercentage,
  ]);


  const handlePercentageChange = (e) => {
    const newMarkupPercentage = parseFloat(e.target.value);
    if (!isNaN(newMarkupPercentage)) {
      setMarkupPercentage(newMarkupPercentage);

      const updatedPrices = productCosts.map((cost) =>
        Math.round(cost * (1 + newMarkupPercentage / 100))
      );

      selectedProduction.forEach((item, index) => {
        const cost = parseInt(item[1].replace(/\s+/g, ""), 10);
        const priceIndex = index + namesAndQuantities.length;
        updatedPrices[priceIndex] = Math.round(cost * (1 + newMarkupPercentage / 100));
      });

      setItemPrices(updatedPrices);

      const total = updatedPrices.reduce((acc, price, index) => {
        const quantity =
          index < namesAndQuantities.length
            ? namesAndQuantities[index]?.[1] || 1
            : selectedProduction[index - namesAndQuantities.length]?.[2] || 1;
        return acc + price * quantity;
      }, 0);
      setTotalPrice(total);
    }
  };


  const handleModal = () => {
    setIsModalVisible(true);
  
    const dataToSave = namesAndQuantities.map((item, index) => ({
      index: index + 1,
      name: item[0],
      quantity: item[1],
      unit: 'шт', // Предполагаем, что единица измерения всегда 'шт'
      price: itemPrices[index],
      cost: itemPrices[index] * item[1],
      totalCost: productCosts[index]
    }));
  
    selectedProduction.forEach((item, index) => {
      const rowIndex = index + namesAndQuantities.length;
      dataToSave.push({
        index: rowIndex + 1,
        name: selectedDeliveryOption,
        quantity: item[2],
        unit: 'рейс', // Предполагаем, что единица измерения для производства 'рейс'
        price: itemPrices[rowIndex],
        cost: itemPrices[rowIndex] * item[2],
        totalCost: productCosts[rowIndex]
      });
    });
    onSaveToPDF(dataToSave);
  };
  

  const handlePriceChange = (index, e) => {
    const newPrices = [...itemPrices];
    const newPrice = parseFloat(e.target.value);
    if (!isNaN(newPrice)) {
      newPrices[index] = newPrice;
      setItemPrices(newPrices);

      const total = newPrices.reduce((acc, price, index) => {
        const quantity =
          index < namesAndQuantities.length
            ? namesAndQuantities[index]?.[1] || 1
            : selectedProduction[index - namesAndQuantities.length]?.[2] || 1;
        return acc + price * quantity;
      }, 0);
      setTotalPrice(total);
    }
  };

  const formatPrice = (price) => {
    if (typeof price !== "undefined") {
      return Math.round(price)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    return "";
  };

  const marginPercentage = (sellingPrice, costPrice) => {
    if (costPrice === 0) {
      return "";
    }
    const margin = ((sellingPrice - costPrice) / costPrice) * 100;
    return `${margin.toFixed(0)}%`;
  };

  return (
    <section
      id="commercial-offer"
      className="commercial-offer-section"
      style={{
        display: isVisible ? "block" : "none",
        padding: "20px",
        margin: "1.25rem 5vw",
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        overflowX: "auto",
      }}
    >
      <div className="header-container">
        <h2>Коммерческое предложение</h2>
        <h3 id="selected-production">Выбрано производство {selectedProductionName}</h3>
      </div>
      <div className="markup-container">
        <label>Введите процент накрутки</label>
        <input
          type="number"
          id="markup-percentage"
          min="0"
          placeholder=""
          value={markupPercentage}
          onChange={handlePercentageChange}
          style={{
            width: "90px",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "3px",
            fontSize: "0.875rem",
            boxSizing: "border-box",
          }}
        />
        <label>%</label>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1.25rem" }}>
        <thead id="kp-table-head">
          <tr>
            <th>№</th>
            <th>Наименование товара</th>
            <th>Количество</th>
            <th>Ед.измерения</th>
            <th>Цена (руб.)</th>
            <th>Стоимость (руб.)</th>
            <th>Себестоимость (руб.)</th>
            <th>Маржа</th>
          </tr>
        </thead>
        <tbody id="kp-table-body">
          {namesAndQuantities.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item[0]}</td>
              <td>{item[1]}</td>
              <td>шт</td>
              <td>
                <input
                  type="number"
                  className="price-textbox"
                  min="0"
                  step="100"
                  value={itemPrices[index]}
                  onChange={(e) => handlePriceChange(index, e)}
                  style={{
                    padding: "0.5rem",
                    fontSize: "1rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </td>
              <td>{formatPrice(itemPrices[index] * item[1])}</td>
              <td>{formatPrice(productCosts[index])}</td>
              <td>{marginPercentage(itemPrices[index], productCosts[index])}</td>
            </tr>
          ))}
          {selectedProduction.map((item, index) => (
            <tr key={index + namesAndQuantities.length}>
              <td>{index + 1 + namesAndQuantities.length}</td>
              <td>{selectedDeliveryOption}</td>
              <td>{item[2].toString()}</td>
              <td>рейс</td>
              <td>
                <input
                  type="number"
                  className="price-textbox"
                  min="0"
                  step="100"
                  value={itemPrices[index + namesAndQuantities.length]}
                  onChange={(e) => handlePriceChange(index + namesAndQuantities.length, e)}
                  style={{
                    padding: "0.5rem",
                    fontSize: "1rem",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </td>
              <td>{formatPrice(itemPrices[index + namesAndQuantities.length] * item[2])}</td>
              <td>{formatPrice(productCosts[index + namesAndQuantities.length])}</td>
              <td>
                {marginPercentage(
                  itemPrices[index + namesAndQuantities.length],
                  productCosts[index + namesAndQuantities.length]
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5" className="center-button">
              <button onClick={handleModal} id="kp-download">
                <i className="material-icons">save_alt</i>
                Сохранить в PDF
              </button>
            </td>
            <td id="cost-total" colSpan="3">
              Итого: {formatPrice(totalPrice)} руб.
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
};

export default CommercialOffer_4;
