const BASE_URL = process.env.REACT_APP_BASE_URL;
//|| "http://localhost:3001";

export function fetchDataFromServerDelivery(key = "deliverySheet") {
  return fetch(`${BASE_URL}/api/data`)
    .then((response) => response.json())
    .then((data) => {
      if (data.hasOwnProperty(key)) {
        let value = data[key];
        value = value.slice(1);
        let filteredValues = value.map((arr) => arr[0]);
        return filteredValues;
      } else {
        throw new Error(`Ключ '${key}' не найден в данных.`);
      }
    })
    .catch((error) => {
      console.error("Ошибка при получении данных:", error);
      throw error;
    });
}

export function fetchDataFromServerSubsection(key = "directorySheet") {
  return fetch(`${BASE_URL}/api/data`)
    .then((response) => response.json())
    .then((data) => {
      if (data.hasOwnProperty(key)) {
        let value = data[key];
        value = value.slice(1);
        let filteredValues = value.map((arr) => arr[11]);
        filteredValues = filteredValues.filter((optionText) => optionText && optionText.trim() !== "");
        return filteredValues;
      } else {
        throw new Error(`Ключ '${key}' не найден в данных.`);
      }
    })
    .catch((error) => {
      console.error("Ошибка при получении данных:", error);
      throw error;
    });
}

export function fetchDataFromServerName(key = "stockSheet") {
  return fetch(`${BASE_URL}/api/data`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      let categories = {};
      if (data.hasOwnProperty(key)) {
        for (let i = 1; i < data[key].length; i++) {
          // Добавляем проверку на наличие данных, чтобы избежать ошибок доступа к несуществующим элементам
          if (data[key][i][2] && data[key][i][7] && data[key][i][3]) {
            let itemName = data[key][i][2]; // Название товара (столбец C)
            let itemWeight = parseFloat(data[key][i][7].replace(',', '.')); // Масса товара (столбец H)
            let category = data[key][i][3]; // Категория (столбец D)
        
            if (isNaN(itemWeight)) {
              itemWeight = ''; // Если не число, присваиваем пустую строку
            }
            
            if (!categories[category]) {
              categories[category] = [];
            }
        
            let isDuplicate = categories[category].some(item => item[0] === itemName);
            if (!isDuplicate) {
              categories[category].push([itemName, itemWeight]);
            }

          }
        }
        
        return categories;
      } else {
        alert(`Ключ '${key}' не найден в данных.`);
        return null;
      }
    })
    .catch((error) => {
      console.error("Ошибка при получении данных:", error);
      // Обработка ошибок, если нужно
      throw error; // Пробрасываем ошибку дальше для обработки выше
    });
}

// Функция для загрузки PDF файла по его ID с сервера и его скачивания
export const fetchPdf = async (docID, replacements) => {
  try {
    const templateId = docID;
    const folderId = '1Pr_vkqZcvdtmls2BcdvgjlUGbhrdG1Pg';

    const response = await fetch(`${BASE_URL}/api/create-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateId, folderId, replacements }),
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    const base64Pdf = await response.text();
    const pdfBlob = base64toBlob(base64Pdf, 'application/pdf');
    const url = URL.createObjectURL(pdfBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'downloaded_pdf.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error fetching PDF:', error);
  }
};

// Функция для преобразования base64 строки в Blob объект
const base64toBlob = (base64Data, contentType) => {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: contentType });
};

/*
export const fetchCopyPDF = async (fileId, folderId) => {
  fetch(`${BASE_URL}/api/copy/${fileId}/${folderId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Copied file ID:', data.copiedFileId);
      // Делайте что-то с полученным ID скопированного файла
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      // Обработка ошибок
    });
}
*/
