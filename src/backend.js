let data = null;
const kmCache = {};

async function getProductionData(
  spisok,
  kuda_edem,
  forma_oplati,
  sposob_dostavki,
  obshaya_massa
) {
  try {
    //console.log(data);
    if (data === null ) {
      // Делаем запрос к серверу Express, чтобы получить данные из Google Sheets
      const response = await fetch("http://localhost:3001/api/data"); // Замените на реальный URL сервера Express

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      data = await response.json();
    }
    
    // Извлекаем необходимые данные из объекта response
    const all_values = data.stockSheet; // Пример извлечения данных
    const data_proizvodstv = data.productionSheet;
    const data_dostavok = data.deliverySheet;

    //console.log(spisok);
    var spisok2 = [];
    for (let i = 0; i < spisok.length; i++) {
      spisok2.push(spisok[i][0]);
    }
    var proizvodstva = filterProductionsByAllProducts(all_values, spisok2);
    //console.log(proizvodstva);

    var tolko_proizv = [];
    for (let i = 0; i < data_proizvodstv.length; i++) {
      tolko_proizv.push(data_proizvodstv[i][0]);
    }

    var indices = [];
    for (var i = 0; i < tolko_proizv.length; i++) {
      if (proizvodstva.includes(tolko_proizv[i])) {
        indices.push(i);
      }
    }

    var koordinati = [];
    for (let i = 0; i < indices.length; i++) {
      koordinati.push(data_proizvodstv[indices[i]][1]);
    }

    var rasstoyaniya = await Promise.all(
      koordinati.map((value) => KM(value, kuda_edem))
    );

    var vse_summi_mat = [];

    for (let p = 0; p < proizvodstva.length; p++) {
      let sum = 0;

      for (let i = 0; i < spisok2.length; i++) {
        var pervi_tovar = spisok[i][0];
        var pervii_kolvo = spisok[i][1];
        var pervie_proizvodstvo = proizvodstva[p];
        //var vse_vmeste = [pervie_proizvodstvo, pervi_tovar, pervii_kolvo];

        // Находим цену напрямую из all_values
        var cena = 0;
        for (let j = 0; j < all_values.length; j++) {
          if (
            all_values[j][1] === pervie_proizvodstvo &&
            all_values[j][2] === pervi_tovar
          ) {
            var nomer_stolbca = forma_oplati === "cash" ? 4 : 5;
            cena = all_values[j][nomer_stolbca];
            break;
          }
        }
        cena = parseInt(cena.replace(/\s/g, ""));
        pervii_kolvo = parseInt(pervii_kolvo);
        sum = sum + parseInt(cena) * parseInt(pervii_kolvo);
      }

      vse_summi_mat.push(sum);
    }

    var filter_dostavka = data_dostavok.filter(function (row) {
      return row[0] === sposob_dostavki;
    });
    var max_vmestimost = filter_dostavka[0][1];
    var minimalka = filter_dostavka[0][2];
    var rub_za_km = filter_dostavka[0][3];

    var vse_ceni_za_reis = [];
    for (let i = 0; i < rasstoyaniya.length; i++) {
      var cena_za_reis = Number(
        Number(minimalka) + Number(rub_za_km * rasstoyaniya[i])
      );
      vse_ceni_za_reis.push(cena_za_reis);
    }
    //console.log(vse_ceni_za_reis);

    var skolko_reisov = Math.ceil(
      Number(Number(obshaya_massa) / Number(max_vmestimost))
    );
    var dlina = proizvodstva.length;
    var vse_skolko_reisov = [];
    for (let i = 0; i < dlina; i++) {
      vse_skolko_reisov.push(Number(skolko_reisov));
    }

    //onsole.log(vse_skolko_reisov);

    var vse_obchie_summi = [];
    for (let i = 0; i < dlina; i++) {
      var obhsaya_summa = Number(
        Number(vse_summi_mat[i]) +
          Number(Number(vse_ceni_za_reis[i]) * Number(vse_skolko_reisov[i]))
      );
      vse_obchie_summi.push(obhsaya_summa);
    }
    //alert(vse_obchie_summi);

    var tablica = [];
    for (let i = 0; i < proizvodstva.length; i++) {
      // alert(proizvodstva[i])
      // alert(rasstoyaniya[i]);
      // alert(vse_summi_mat[i]);
      // alert(vse_ceni_za_reis[i]);
      // alert(vse_skolko_reisov[i]);
      // alert(vse_obchie_summi[i]);
      var mini_tablica = [
        proizvodstva[i],
        formatNumberWithSpaces(rasstoyaniya[i]),
        formatNumberWithSpaces(vse_summi_mat[i]),
        formatNumberWithSpaces(vse_ceni_za_reis[i]),
        formatNumberWithSpaces(vse_skolko_reisov[i]),
        formatNumberWithSpaces(vse_obchie_summi[i]),
      ];
      //alert(formatNumberWithSpaces(rasstoyaniya[i]));
      //alert(formatNumberWithSpaces(vse_summi_mat[i]));
      //console.log(mini_tablica);
      tablica.push(mini_tablica);
    }
    sort_array(tablica);
    //console.log(tablica);
    //alert(tablica);
    return tablica;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Проброс ошибки для обработки
  }
}

function filterProductionsByAllProducts(data, targetProducts) {
  //console.log(data);
  //console.log(targetProducts);
  var productionMap = {};
  for (var i = 1; i < data.length; i++) {
    var production = data[i][1];
    var product = data[i][2];
    if (!productionMap[production]) {
      productionMap[production] = [];
    }
    productionMap[production].push(product);
  }
  var filteredProductions = [];
  for (let production in productionMap) {
    if (
      targetProducts.every((product) =>
        productionMap[production].includes(product)
      )
    ) {
      filteredProductions.push(production);
    }
  }
  return filteredProductions;
}

function sort_array(array) {
  var array2 = array.sort((a, b) => a[a.length - 1] - b[b.length - 1]);
  return array2;
}
async function KM(origin, destination) {
  const cacheKey = `${origin}-${destination}`;
  if (kmCache[cacheKey]) {
    return kmCache[cacheKey];
  }

  var url =
    "http://213.139.209.22:5000/route/v1/driving" +
    "/" +
    encodeURIComponent(origin.split(", ")[1]) +
    "," +
    encodeURIComponent(origin.split(", ")[0]) +
    ";" +
    encodeURIComponent(destination.split(", ")[1]) +
    "," +
    encodeURIComponent(destination.split(", ")[0]);

  try {
    const response = await fetch(url);
    const data = await response.json();
    var distance = (data.routes[0].distance / 1000).toFixed(0);
    var distance2 = (Number(distance) + 5).toFixed(0);
    const result = Number(distance2);
    kmCache[cacheKey] = result; // Cache the result
    return result;
  } catch (error) {
    console.error("Ошибка при запросе расстояния:", error);
    return 0; // В случае ошибки возвращаем 0
  }
}

function formatNumberWithSpaces(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

async function listPrices(namesOfProduct, formOfPayment, nameProduction) {
  try {
    // Делаем запрос к серверу Express, чтобы получить данные из Google Sheets
    const response = await fetch("http://localhost:3001/api/data"); // Замените на реальный URL сервера Express

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    // Извлекаем необходимые данные из объекта response
    const all_values = data.stockSheet; // Пример извлечения данных
    var array = [];
    
    // Function to filter rows based on nameProduction and first_name_of_product
    const filterRows = (row) => {
      return row[1] === nameProduction && row[2] === first_name_of_product;
    };
   
    
    for (let i = 0; i < namesOfProduct.length; i++) {
      var first_name_of_product = namesOfProduct[i];
      
      // Use Array.prototype.find to get the first matching row
      const filter_ceni = all_values.find(filterRows);
      if (!filter_ceni) {
        throw new Error(`Product ${first_name_of_product} not found in ${nameProduction}`);
      }
      
      var nomer_stolbca = formOfPayment === "cash" ? 4 : 5;
      var cena = filter_ceni[nomer_stolbca];
      array.push(cena);
      //console.log("Cena", cena);
    }
    //console.log("Массив цен ", array);
    return array;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Проброс ошибки для обработки
  }
}


// Для Node.js экспортируем функцию
module.exports = {
  getProductionData: getProductionData,
  listPrices: listPrices,
};
