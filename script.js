let sortableColumns = ["name", "capital", "population"];
let filterableColumns = ["name", "capital", "region"];
let limitList = [10, 25, 50, 100];
let isHeaderFixed = false;
let isPaginated = true;
let data = [];
let pageIndex = 1;
let pageLimit = 10;
let sortClicked = true;
const tbody = document.getElementById("tableBody");
let btn_next = document.getElementById("btn_next");
let btn_prev = document.getElementById("btn_prev");
let para = document.querySelectorAll("p");
function getDataFromServer() {
  const http = new XMLHttpRequest();
  http.open("GET", "https://restcountries.eu/rest/v2/all");
  http.send();
  http.onreadystatechange = function () {
    //when request is success and ready
    if (this.readyState == 4 && this.status == 200) {
      //   console.log(this.responseText);
      data = JSON.parse(this.responseText);
      configureTable();
    }
  };
}
getDataFromServer();
function configureTable() {
  if (data.length != 0) {
    let inputs = document.querySelectorAll("th input");
    for (let i = 0; i < para.length; i++) {
      if (sortableColumns.indexOf(para[i].id) != -1) {
        para[i].addEventListener("click", () => sortResult(para[i].id));
        para[i].style.cursor = "pointer";
      }
    }
    for (let i = 0; i < inputs.length; i++) {
      if (filterableColumns.indexOf(inputs[i].name) == -1) {
        inputs[i].style.visibility = "hidden";
      }
    }
    const select = document.querySelector("select");
    for (let i = 0; i < limitList.length; i++) {
      const option = document.createElement("option");
      option.value = limitList[i];
      option.innerText = limitList[i];
      select.appendChild(option);
    }
    updateRow(data, pageLimit);
    updatePaginationButton();
    createPageNumber();
  }
}
function createSortArrow(prop) {
  // console.log(para);
  for (let i = 0; i < para.length; i++) {
    if (para[i].id == prop) {
      if (sortClicked) {
        let upArrow = document.createElement("span");
        upArrow.setAttribute("class", "arrowUp");
        upArrow.innerHTML = "&#9650;";
        para[i].appendChild(upArrow);
      } else {
        let downArrow = document.createElement("span");
        downArrow.setAttribute("class", "arrowDown");
        downArrow.innerHTML = "&#9660;";
        para[i].appendChild(downArrow);
      }
    }
  }
}
function removeSortArrow() {
  let span = document.querySelectorAll("span");
  for (let i = 0; i < span.length; i++) {
    span[i].innerHTML = "";
  }
}
function updateStyleForFixedHeader() {
  if (!isHeaderFixed) tbody.style.overflow = "inherit";
  else {
    const th = document.querySelectorAll("thead th");
    const td = document.querySelectorAll("td");
    for (let i = 0; i < th.length; i++) {
      th[i].style.width = "190px";
    }
    for (let i = 0; i < td.length; i++) {
      td[i].style.width = "190px";
    }
  }
}
function changeLimit(limit) {
  //   console.log(limit);
  resetRow();
  pageLimit = limit;
  updateRow(data);
  resetAllVariable();
}
function updateRow(input) {
  updateRecordsLength(input);
  for (
    let k = (pageIndex - 1) * pageLimit;
    k < pageIndex * pageLimit && k < input.length;
    k++
  ) {
    createRow(k, input);
  }
}
function createRow(k, input) {
  const tr = document.createElement("tr");
  for (let i = 0; i < 5; i++) {
    const td = document.createElement("td");
    switch (i) {
      case 0:
        let code = input[k].alpha3Code;
        if (code == "") code = "Not Available";
        td.innerText = code;
        break;
      case 1:
        let name = input[k].name;
        if (name == "") name = "Not Available";
        td.innerText = name;
        break;
      case 2:
        let capital = input[k].capital;
        if (capital == "") capital = "Not Available";
        td.innerText = capital;
        break;
      case 3:
        let region = input[k].region;
        if (region == "") region = "Not Available";
        td.innerText = region;
        break;
      case 4:
        let population = input[k].population;
        if (population == "") population = "Not Available";
        td.innerText = population;
        break;
    }

    tr.appendChild(td);
  }
  tbody.appendChild(tr);
  updateStyleForFixedHeader();
}
function resetRow() {
  document.querySelectorAll("tr").forEach((e, k) => {
    if (k > 0) e.parentNode.removeChild(e);
  });
}
function sortResult(column) {
  resetRow();
  removeSortArrow();
  sortClicked = sortClicked ? false : true;
  const start = (pageIndex - 1) * pageLimit;
  const end = pageLimit * pageIndex;
  configureSort(column, data.slice(start, end));
}
function configureSort(prop, input) {
  createSortArrow(prop);
  if (sortClicked) {
    input.sort((a, b) => {
      if (a[prop] > b[prop]) return 1;
      if (a[prop] < b[prop]) return -1;
      return 0;
    });
  } else {
    input.sort((a, b) => {
      if (b[prop] > a[prop]) return 1;
      if (b[prop] < a[prop]) return -1;
      return 0;
    });
  }
  updateRow(input);
  updateRecordsLength(data);
}
function globalSearch(input) {
  resetRow();
  if (input == "") {
    updateRow(data);
    removeNoResult();
  } else {
    const start = (pageIndex - 1) * pageLimit;
    const end = pageLimit * pageIndex;
    const res = data.slice(start, end).filter((d) => {
      if (
        d.alpha3Code.toLowerCase().includes(input.toLowerCase()) ||
        d.name.toLowerCase().includes(input.toLowerCase()) ||
        d.capital.toLowerCase().includes(input.toLowerCase()) ||
        d.region.toLowerCase().includes(input.toLowerCase()) ||
        d.population.toString().includes(input)
      )
        return true;
    });
    if (res.length == 0) noResult();
    else {
      updateRecordsLength(res);
      for (let k = 0; k < res.length; k++) {
        createRow(k, res);
      }
      removeNoResult();
    }
  }
}
function filter(column, value) {
  //   console.log(column);
  //   console.log(value);
  resetRow();
  if (value == "") {
    updateRow(data);
    removeNoResult();
  } else {
    const start = (pageIndex - 1) * pageLimit;
    const end = pageLimit * pageIndex;
    const result = configureFilter(column, value, data.slice(start, end));
    // console.log(result);
    if (result.length == 0) noResult();
    else {
      updateRecordsLength(result);
      for (let k = 0; k < result.length; k++) {
        createRow(k, result);
      }
      removeNoResult();
    }
  }
}
function configureFilter(prop, value, result) {
  return result.filter((res) => {
    if (prop == "population") {
      if (res[prop].toString().includes(value)) return true;
    } else {
      if (res[prop].toLowerCase().includes(value.toLowerCase())) return true;
    }
  });
}
function noResult() {
  removeNoResult();
  const div = document.createElement("div");
  div.setAttribute("id", "noResult");
  const p = document.createElement("p");
  p.innerText = "No result found";
  div.appendChild(p);
  const table = document.querySelector("table");
  table.appendChild(div);
  updateRecordsLength([]);
}
function removeNoResult() {
  const noRDiv = document.getElementById("noResult");
  if (noRDiv != null) noRDiv.remove();
}
function updateRecordsLength(input) {
  removeRecordsLength();
  const recordBox = document.getElementById("records");
  let dataLength = document.createElement("p");
  dataLength.setAttribute("id", "dataLength");
  dataLength.innerText = `Showing ${(pageIndex - 1) * pageLimit + 1} to ${
    pageLimit * pageIndex > input.length ? input.length : pageLimit * pageIndex
  } of ${input.length} entries`;
  if (input.length == 0) dataLength.innerText = "Showing 0 results";
  recordBox.appendChild(dataLength);
}
function removeRecordsLength() {
  const length = document.getElementById("dataLength");
  if (length != null) length.remove();
}
function prev() {
  if (pageIndex > 1) {
    pageIndex--;
    changePage(pageIndex);
  }
}
function next() {
  if (pageIndex < numPages()) {
    pageIndex++;
    changePage(pageIndex);
  }
}
function changePage(page) {
  resetAllVariable();
  resetPageNumber();
  // Validate page
  if (page < 1) page = 1;
  if (page > numPages()) page = numPages();

  resetRow();
  updateRow(data);
  createPageNumber();
  updatePaginationButton();
}
function createPageNumber() {
  let div = document.getElementById("pageNumber");
  for (
    let i = pageIndex + 1;
    i < pageIndex + 6 && i < data.length / pageLimit;
    i++
  ) {
    let button = document.createElement("button");
    button.innerText = i;
    button.addEventListener("click", () => jumpToPage(i));
    div.appendChild(button);
  }
}
function resetPageNumber() {
  let div = document.getElementById("pageNumber");
  div.innerText = "";
}
function jumpToPage(number) {
  pageIndex = number * 1;
  changePage(pageIndex);
}
function updatePaginationButton() {
  if (isPaginated) {
    if (pageIndex == 1) {
      btn_prev.disabled = true;
      btn_prev.style.cursor = "not-allowed";
    } else {
      btn_prev.disabled = false;
      btn_prev.style.cursor = "pointer";
    }

    if (pageIndex == numPages()) {
      btn_next.disabled = true;
      btn_next.style.cursor = "not-allowed";
    } else {
      btn_next.disabled = false;
      btn_next.style.cursor = "pointer";
    }
  } else {
    const navigation = document.getElementById("navigation");
    const limitContainer = document.getElementsByClassName("limitContainer");
    navigation.style.visibility = "hidden";
    limitContainer[0].style.visibility = "hidden";
  }
}
function numPages() {
  return Math.ceil(data.length / pageLimit);
}
function resetAllVariable() {
  const inputs = document.querySelectorAll("input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = "";
  }
}
