let DB;

//Interface selectors
const form = document.querySelector("form"),
  petName = document.querySelector("#pet"),
  petOwner = document.querySelector("#client"),
  phoneNumber = document.querySelector("#phone"),
  date = document.querySelector("#date"),
  time = document.querySelector("#time"),
  symptoms = document.querySelector("#symptoms"),
  dates = document.querySelector("#dates"),
  admin = document.querySelector("#admin");


//wait for the DOM ready
document.addEventListener('DOMContentLoaded', () => {
  //create database
  let createDB = window.indexedDB.open('dates', 1);

  //If there is an error send it to console
  createDB.onerror = function() {
    //console.log('error');
  }
  //If all is ok
  createDB.onsuccess = function() {
    //console.log('there is ok');

    //Assign to database
    DB = createDB.result
    //console.log(DB);

    showDates();
  }

  //This method only runs one time
  createDB.onupgradeneeded = function(e) {
    
    let db = e.target.result;

    //Def object store
    let objectStore = db.createObjectStore('dates', { keyPath: 'key', autoIncrement: true } );

    //Create index and fields of database
    objectStore.createIndex('pet', 'pet', { unique: false });
    objectStore.createIndex('client', 'client', { unique: false });
    objectStore.createIndex('phone', 'phone', { unique: false });
    objectStore.createIndex('date', 'date', { unique: false });
    objectStore.createIndex('time', 'time', { unique: false });
    objectStore.createIndex('symptoms', 'symptoms', { unique: false });
  }
  //When the form is send
  form.addEventListener('submit', addData);

  function addData(e) {
    e.preventDefault();

    const newDate = {
      pet: petName.value,
      client: petOwner.value,
      phone: phoneNumber.value,
      date: date.value,
      time: time.value,
      symptoms: symptoms.value
    }
    //console.log(newDate);

    //Index Db transactions
    let transaction = DB.transaction(['dates'], 'readwrite');
    let objectStore = transaction.objectStore('dates');
    console.log(objectStore);

    let request = objectStore.add(newDate);

    request.onsuccess = () => {
      form.reset();
    }
    transaction.oncomplete = () => {
      //console.log('added date');
      showDates();//set new date
    }
    transaction.onerror = () => {
      console.log('error');
    }
  }

  function showDates() {
    //clear previous appointments
    while(dates.firstChild) {
      dates.removeChild(dates.firstChild); 
    }

    //Create object store
    let objectStore = DB.transaction('dates').objectStore('dates');

    objectStore.openCursor().onsuccess = function(e) {
      let cursor = e.target.result;

      //console.log(cursor);
      if (cursor) {
        let dateHTML = document.createElement('li');
        dateHTML.setAttribute('data-dates-id', cursor.value.key);
        dateHTML.classList.add('list-group-item');

        dateHTML.innerHTML = `
          <p class = 'font-weight-bold'>Pet: <span class = 'font-weight-normal'>${cursor.value.pet}</span></p>
          <p class = 'font-weight-bold'>Client: <span class = 'font-weight-normal'>${cursor.value.client}</span></p>
          <p class = 'font-weight-bold'>Phone: <span class = 'font-weight-normal'>${cursor.value.phone}</span></p>
          <p class = 'font-weight-bold'>Date: <span class = 'font-weight-normal'>${cursor.value.date}</span></p>
          <p class = 'font-weight-bold'>Time: <span class = 'font-weight-normal'>${cursor.value.time}</span></p>
          <p class = 'font-weight-bold'>Symptoms: <span class = 'font-weight-normal'>${cursor.value.symptoms}</span></p>
        `;
        //button delete
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete', 'btn', 'btn-danger');
        deleteButton.innerHTML = '<span aria-hidden = "true">X</span> Delete';
        deleteButton.onclick = deleteDate;
        dateHTML.appendChild(deleteButton);


        dates.appendChild(dateHTML);

        cursor.continue();
      }else {
        if (!dates.firstChild){
          admin.textContent = 'Add an appointment to get started'
          let list = document.createElement('p');
          list.classList.add('text-center');
          list.textContent = 'There are no data';
          dates.appendChild(list);
        }else{
          admin.textContent = 'Manage your appointments';
        }
      }
    }
  }

  function deleteDate(e) {
    //console.log(e.target.parentElement.getAttribute("data-dates-id"));

    let dateId =Number( e.target.parentElement.getAttribute('data-dates-id'));
    //console.log((dateId));

    let transaction = DB.transaction(['dates'], 'readwrite');
    let objectStore = transaction.objectStore('dates');

    let request = objectStore.delete(dateId);

    transaction.oncomplete = () => {
      e.target.parentElement.parentElement.removeChild(e.target.parentElement);
      

      if (!dates.firstChild){
        admin.textContent = 'Add an appointment to get started'
        let list = document.createElement('p');
        list.classList.add('text-center');
        list.textContent = 'There are no data';
        dates.appendChild(list);
      }else{
        admin.textContent = 'Manage your appointments';
      }
    }
  }
})