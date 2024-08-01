import React, { useEffect, useState, useRef, useCallback } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import "../styles/App.css";
import { fetchDataFromServerName } from "../fetches";

const Products_2 = ({
  isProductsSectionVisible,
  selectedSubsection,
  setIsCostComparisonVisible,
  onTotalWeightChange,
  onNamesAndQuantitiesChange
}) => {
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [rows, setRows] = useState([
    { selectedItem: null, quantity: "", materialSubtype: "", materialMass: "0", materialSummMass: "" }
  ]);
  const [totalWeight, setTotalWeight] = useState(0);

  const selectRef = useRef(null);

  const updateTotalMass = useCallback(() => {
    const itemMassCells = document.querySelectorAll(".item-mass");
    let totalSumMass = 0;

    itemMassCells.forEach(cell => {
      const row = cell.closest("tr");
      const quantity = parseFloat(row.querySelector('input[name="quantity[]"]').value) || 0;
      const itemMass = parseFloat(cell.textContent) || 0;
      const totalMassCell = row.querySelector('.total-mass');
      const totalMass = quantity * itemMass;
      totalMassCell.textContent = totalMass.toFixed(2);
      totalSumMass += totalMass;
    });

    document.getElementById("total-sum-mass").textContent = totalSumMass.toFixed(2);
    setTotalWeight(totalSumMass);
    onTotalWeightChange(totalSumMass);
  }, [onTotalWeightChange]);

  const updateNamesAndQuantities = useCallback(() => {
    const namesAndQuantities = rows.map(row => [
      row.selectedItem ? row.selectedItem.label : "",
      row.quantity ? parseFloat(row.quantity) : 0
    ]);
    onNamesAndQuantitiesChange(namesAndQuantities);
  }, [rows, onNamesAndQuantitiesChange]);

  useEffect(() => {
    if (selectedSubsection) {
      fetchDataFromServerName()
        .then((categories) => {
          const options = categories[selectedSubsection]?.map(item => ({ value: item[0], label: item[0] })) || [];
          setItemNameOptions(options);
          setRows(rows => rows.map((row, index) => ({
            ...row,
            selectedItem: index === 0 && options.length > 0 ? options[0] : row.selectedItem
          })));
        })
        .catch((error) => {
          console.error("Ошибка при загрузке данных:", error);
          Swal.fire({
            icon: "error",
            title: "Ошибка",
            text: "Ошибка при загрузке данных. Пожалуйста, повторите попытку позже.",
          });
        });
    }
  }, [selectedSubsection]);

  useEffect(() => {
    updateTotalMass();
    updateNamesAndQuantities(); // Update names and quantities whenever rows change
  }, [rows, updateTotalMass, updateNamesAndQuantities]); // Include dependencies here

  const updateItemMass = (itemName, row, quantity) => {
    fetchDataFromServerName()
      .then((categories) => {
        const foundItem = Object.entries(categories).find(([category]) => category === selectedSubsection)?.[1]
          .find(([name]) => name === itemName)?.[1];
        const itemMass = foundItem ? parseFloat(foundItem) : 0;
        const totalMass = itemMass;
        const itemMassCell = row.querySelector(".item-mass");
        itemMassCell.textContent = totalMass.toFixed(2);

        setRows(rows => rows.map(row => {
          if (row.selectedItem && row.selectedItem.value === itemName) {
            return {
              ...row,
              materialMass: totalMass.toFixed(2)
            };
          }
          return row;
        }));

        updateTotalMass();
      })
      .catch((error) => {
        console.error("Ошибка при загрузке данных:", error);
        Swal.fire({
          icon: "error",
          title: "Ошибка",
          text: "Ошибка при загрузке данных. Пожалуйста, повторите попытку позже.",
        });
      });
  };

  const updateSubtypes = () => {
    const selectedMaterial = document.getElementById("material-section").value;
    const subtypesDropdowns = document.querySelectorAll("#products-table-body .material-subtype");
    subtypesDropdowns.forEach(select => {
      select.innerHTML = "";
      const option = document.createElement("option");
      option.text = selectedMaterial;
      option.value = selectedMaterial;
      select.appendChild(option);
    });
  };

  const handleItemNameChange = (selectedOption, index) => {
    setRows(rows => rows.map((row, i) => ({
      ...row,
      selectedItem: i === index ? selectedOption : row.selectedItem
    })));
    updateSubtypes();
    updateItemMass(selectedOption.value, document.querySelectorAll(".item-mass")[index].closest("tr"), rows[index].quantity);
  };

  const handleQuantityChange = (event, index) => {
    const { value } = event.target;
    validateQuantity(value, index);
    updateItemMass(rows[index].selectedItem?.value, document.querySelectorAll(".item-mass")[index].closest("tr"), value);
  };

  const validateQuantity = (value, index) => {
    const cleanedValue = value.replace(/[^\d]/g, '');

    if (cleanedValue !== '') {
      const numberValue = parseInt(cleanedValue, 10);
      const finalValue = Math.min(numberValue, 1000000);

      const updatedRows = [...rows];
      updatedRows[index].quantity = finalValue.toString();
      setRows(updatedRows);
    } else {
      const updatedRows = [...rows];
      updatedRows[index].quantity = '';
      setRows(updatedRows);
    }
  };

  const addRow = () => {
    setRows([...rows, {
      selectedItem: itemNameOptions.length > 0 ? itemNameOptions[0] : null,
      quantity: "",
      materialSubtype: "",
      materialMass: "0",
      materialSummMass: "0"
    }]);
  };

  const deleteRow = index => setRows(rows => rows.filter((_, i) => i !== index));

  const copyRow = index => {
    setRows(rows => {
      const newRow = { ...rows[index] };
      return [...rows.slice(0, index + 1), newRow, ...rows.slice(index + 1)];
    });
  };

  return (
    <section id="products" className="products-section" style={{ display: isProductsSectionVisible ? "block" : "none" }}>
      <h2>Товары</h2>
      <table className="products-table">
        <thead>
          <tr>
            <th>Подраздел материала</th>
            <th>Наименование</th>
            <th>Количество</th>
            <th>Единица измерения</th>
            <th>Масса изделия</th>
            <th>Общая масса</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="products-table-body">
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <select
                  name="material-subtype[]"
                  className="material-subtype"
                  value={row.materialSubtype}
                  onChange={(event) => {
                    const { value } = event.target;
                    setRows(rows => rows.map((row, i) => ({
                      ...row,
                      materialSubtype: i === index ? value : row.materialSubtype
                    })));
                  }}
                  id="material-section"
                  disabled
                >
                  <option disabled selected>
                    Выберите опцию
                  </option>
                </select>
              </td>
              <td>
                <div className="autocomplete-wrapper">
                  <Select
                    ref={selectRef}
                    options={itemNameOptions}
                    value={row.selectedItem}
                    onChange={(selectedOption) => handleItemNameChange(selectedOption, index)}
                    placeholder="Выберите наименование"
                  />
                </div>
              </td>
              <td>
                <input
                  type="number"
                  name="quantity[]"
                  value={row.quantity}
                  onChange={(event) => handleQuantityChange(event, index)}
                  placeholder=""
                  onInput={() => {}}
                />
              </td>
              <td>шт</td>
              <td className="item-mass">{row.materialMass}</td>
              <td id={`total-mass-${index}`} className="total-mass">{(row.quantity * parseFloat(row.materialMass)).toFixed(2)}</td>
              <td className="btn-group">
                <button className="delete-row" onClick={() => deleteRow(index)}>
                  <i className="material-icons">delete</i>
                </button>
                <button className="copy-row" onClick={() => copyRow(index)}>
                  <i className="material-icons">content_copy</i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5"></td>
            <td id="total-sum-mass">{totalWeight.toFixed(2)}</td>
            <td>
              <button className="add-row-btn" onClick={addRow}>
                Новая строка
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
      {/* <button id="buttonCompareProduction" className="productions" onClick={handleCompareProduction}>
        Сравнить производства
      </button> */}
    </section>
  );
};

export default Products_2;
