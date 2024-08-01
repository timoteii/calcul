import React, { useState } from "react";
import "../styles/App.css";
import { fetchPdf } from '../fetches';

const ModalForm_5 = ({ onClose, isModalVisible, modalFormData }) => {
  const [companyName, setCompanyName] = useState("tsk_monolit");
  const [managerName, setManagerName] = useState("");
  const [managerSurname, setManagerSurname] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRadioChange = (e) => {
    setCompanyName(e.target.value);
  };

  const handleDownload = async (e) => {
    e.preventDefault();

    // Calculate total cost from modalFormData
    const totalCost = modalFormData.reduce((acc, item) => {
      return acc + item.cost;
    }, 0);
    const namesArray = modalFormData.map(item => item.name);
    const quantityArray = modalFormData.map(item => {
      return item.quantity.toString();
    });
    const unitArray = modalFormData.map(item => item.unit);

    const costArray = modalFormData.map(item => {
      return item.cost.toLocaleString('ru-RU'); // Используйте 'ru-RU' для российского формата
    });
    const priceArray = modalFormData.map(item => {
      return item.price.toLocaleString('ru-RU'); // Используйте 'ru-RU' для российского формата
    });

    const d2s = (date) => {
      const day = ('0' + date.getDate()).slice(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }

    const d3s = (date) => {
      const year = date.getFullYear();
      const day = ('0' + date.getDate()).slice(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      return `${year}-${day}/${month}`;
    }

    let today = new Date();
    let docID;
    switch (companyName) {
      case "tsk_monolit":
        docID = modalFormData.length <= 7
          ? "187PdkKW_PPB4L6sXZE48d0a0vbq2c6dQLV11FIr4mHc"
          : modalFormData.length < 19
            ? "184wpizP-4LCtjHkbRzXR1iIDnsfmC9Vfm19oKvmfMWQ"
            : "15irwt090brpUoxRa_U53kjQR6_d6XjDKbKrF6d7nJdw";
        break;
      case "td_monolit":
        docID = modalFormData.length <= 7
          ? "1Y62H_TBiYWiSw46wxjfyRRrlrO7l_7F_pHlul0zPcZc"
          : modalFormData.length < 19
            ? "1LMeOn_noQhcZH_5QPnO6VwnrDxkiSOU2bMqvR-Lv7u0"
            : "179W15E19vkenVUE7eHpjK2xxgUWP_BiVasyhw7HoVWs";
        break;
      case "velesark":
        docID = modalFormData.length <= 7
          ? "17IxU4SSkMA4i2TzkSdOkosnTiLNbBOBVTHXJEJNXq3o"
          : modalFormData.length < 19
            ? "1C2zsJwQQ7azkChVTrdLbogHiQsYcXCloOctbkCEqAs8"
            : "19cJTlyuGe2sRdkPg5meXjmC8r7XyqHNFsLM-sFTO_ac";
        break;
      case "monolit47":
        docID = modalFormData.length <= 7
          ? "1uNVLT9rFgbfRHc4DbxseUSBCdNif0M2LmEIFuZXsXjo"
          : modalFormData.length < 19
            ? "163A1C3zDS2L8qt-P8ZhFQIKa_UYWbuBkPwNnVm4Fy_E"
            : "1sTIFFG6XXZ6O98NmVNuxhTyI8MXy5Cco2vXU2nlLrgg";
        break;
      case "egida":
        docID = modalFormData.length <= 7
          ? "10Dl1YO6X8LxIGWods8g8h5gMhNWrZgNbsSagycTmTuI"
          : modalFormData.length < 19
            ? "1H8x8K1mB-2DkShGaGbQRUV5jdIT2r7hRdNAxIAFlYCQ"
            : "1TpURgdBS0Wv3QhOSLAy1C7ptli74mahfXMsVJ__LxxM";
        break;
      case "atlant":
        docID = modalFormData.length <= 7
          ? "17IxU4SSkMA4i2TzkSdOkosnTiLNbBOBVTHXJEJNXq3o"
          : modalFormData.length < 19
            ? "1C2zsJwQQ7azkChVTrdLbogHiQsYcXCloOctbkCEqAs8"
            : "19cJTlyuGe2sRdkPg5meXjmC8r7XyqHNFsLM-sFTO_ac";
        break;
      default:
        docID = "17IxU4SSkMA4i2TzkSdOkosnTiLNbBOBVTHXJEJNXq3o";
    }

    const replacements = [
      { placeholder: '{NAME}', value: managerName },
      { placeholder: '{SURNAME}', value: managerSurname },
      { placeholder: '{NUMBER PHONE}', value: managerPhone },
      { placeholder: '{EMAIL}', value: managerEmail },
      { placeholder: '{TEXT1}', value: text1 },
      { placeholder: '{TEXT2}', value: text2 },
      { placeholder: '{TOTAL}', value: totalCost.toLocaleString('ru-RU') }, 
      ...Array.from({ length: 33 }, (_, index) => ({ placeholder: `{${index + 1}G}`, value: index < namesArray.length ? namesArray[index] : '' })),
      ...Array.from({ length: 33 }, (_, index) => ({ placeholder: `{${index + 1}K}`, value: index < quantityArray.length ? quantityArray[index] : '' })),
      ...Array.from({ length: 33 }, (_, index) => ({ placeholder: `{${index + 1}E}`, value: index < unitArray.length ? unitArray[index] : '' })),
      ...Array.from({ length: 33 }, (_, index) => ({ placeholder: `{${index + 1}P}`, value: index < priceArray.length ? priceArray[index] : '' })),
      ...Array.from({ length: 33 }, (_, index) => ({ placeholder: `{${index + 1}T}`, value: index < costArray.length ? costArray[index] : '' })),
      { placeholder: '{TODAY1}', value: d2s(today)},
      { placeholder: '{TODAY2}', value: d3s(today)},
    ];

    onClose(); // Закрыть модальное окно сразу

    // Показывать загрузку
    setIsLoading(true);

    // Запускаем запрос
    setTimeout(async () => {
      await fetchPdf(docID, replacements);
      setIsLoading(false); // Скрыть загрузку после 10 секунд
    }, 10000);
  };

  return (
    <>
      <div id="myModal" className="modal" style={{ display: isModalVisible ? 'block' : 'none' }}>
        <div className="modal-content">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <h3>Настройка КП</h3>
          <div className="modal-form">
            <div className="input-group">
              <label>Имя менеджера:</label>
              <input 
                type="text" 
                name="manager-name" 
                placeholder="Иван" 
                value={managerName} 
                onChange={(e) => setManagerName(e.target.value)} 
              />
            </div>
            <div className="input-group">
              <label>Фамилия менеджера:</label>
              <input 
                type="text" 
                name="manager-surname" 
                placeholder="Иванов" 
                value={managerSurname} 
                onChange={(e) => setManagerSurname(e.target.value)} 
              />
            </div>
            <div className="input-group">
              <label>Телефон менеджера:</label>
              <input 
                type="text" 
                name="manager-phone" 
                placeholder="8-900-000-00-00" 
                value={managerPhone} 
                onChange={(e) => setManagerPhone(e.target.value)} 
              />
            </div>
            <div className="input-group">
              <label>Почта менеджера:</label>
              <input 
                type="text" 
                name="manager-email" 
                placeholder="manager@yandex.ru" 
                value={managerEmail} 
                onChange={(e) => setManagerEmail(e.target.value)} 
              />
            </div>
            <div className="radio-group-modal">
              <label>
                <input
                  type="radio"
                  name="companyName"
                  value="tsk_monolit"
                  checked={companyName === "tsk_monolit"}
                  onChange={handleRadioChange}
                />
                <img
                  src="https://i.postimg.cc/tYcYXH0T/tsk-monolit.png"
                  alt="ТСК Монолит"
                  onClick={() => setCompanyName("tsk_monolit")}
                />
              </label>
              <label>
                <input
                  type="radio"
                  name="companyName"
                  value="td_monolit"
                  checked={companyName === "td_monolit"}
                  onChange={handleRadioChange}
                />
                <img
                  src="https://i.postimg.cc/56yXd2RT/td-monolit.png"
                  alt="ТД Монолит"
                  onClick={() => setCompanyName("td_monolit")}
                />
              </label>
              <label>
                <input
                  type="radio"
                  name="companyName"
                  value="velesark"
                  checked={companyName === "velesark"}
                  onChange={handleRadioChange}
                />
                <img
                  src="https://i.postimg.cc/Cdy7xWgc/velesark.png"
                  alt="Велесарк"
                  onClick={() => setCompanyName("velesark")}
                />
              </label>
              <label>
                <input
                  type="radio"
                  name="companyName"
                  value="monolit47"
                  checked={companyName === "monolit47"}
                  onChange={handleRadioChange}
                />
                <img
                  src="https://i.postimg.cc/DmBSMXB1/monolit47.png"
                  alt="Монолит 47"
                  onClick={() => setCompanyName("monolit47")}
                />
              </label>
              <label>
                <input
                  type="radio"
                  name="companyName"
                  value="egida"
                  checked={companyName === "egida"}
                  onChange={handleRadioChange}
                />
                <img
                  src="https://i.postimg.cc/tYQM8sJC/egida.png"
                  alt="Эгида"
                  onClick={() => setCompanyName("egida")}
                />
              </label>
              <label>
                <input
                  type="radio"
                  name="companyName"
                  value="atlant"
                  checked={companyName === "atlant"}
                  onChange={handleRadioChange}
                />
                <img
                  src="https://i.postimg.cc/Z5Qkxq4g/atlant.png"
                  alt="ГК Атлант"
                  onClick={() => setCompanyName("atlant")}
                />
              </label>
            </div>
            <div className="input-group">
              <label>Текст 1:</label>
              <textarea
                name="text1"
                placeholder="Текст 1"
                value={text1}
                onChange={(e) => setText1(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Текст 2:</label>
              <textarea
                name="text2"
                placeholder="Текст 2"
                value={text2}
                onChange={(e) => setText2(e.target.value)}
              />
            </div>
            <button onClick={handleDownload}>Скачать КП</button>
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="loading-popup">
          <div className="loading-popup-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Загрузка...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalForm_5;
