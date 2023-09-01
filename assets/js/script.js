'use strict';

const sidebar = document.querySelector('.sidebar');
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

const addPointOnMap = document.createElement('button');
addPointOnMap.textContent = `Add point on map`;
const addPracticeOnMap = document.createElement('button');
addPracticeOnMap.textContent = `Add practice on map`;

const divBtns = document.createElement('div');
divBtns.style.display = 'grid';
divBtns.style.columnGap = '20px';
divBtns.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
divBtns.appendChild(addPracticeOnMap);
divBtns.appendChild(addPointOnMap);
sidebar.insertAdjacentElement('beforeend', divBtns);

const inputInfoOnPopup = inputEle => {
  inputEle.style.backgroundColor = 'transparent';
  inputEle.style.color = 'white';
  inputEle.style.border = '1px';
  inputEle.style.resize = 'none';
  inputEle.style.overflow = 'hidden';
  inputEle.style.fontSize = '100%';
  inputEle.placeholder = 'Note';

  setTimeout(() => {
    inputEle.focus();
  }, 0);

  inputEle.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';

    const uniqueId = `${this.dataset.lat}-${this.dataset.lng}`;
    localStorage.setItem(`textareaContent_${uniqueId}`, this.value);
  });

  return inputEle;
};

const myStreetlati = 31.028331;
const myStreetLong = 31.3716236;

const option = {
  enableHighAccuracy: true,
  timeout: 1000,
  maximumAge: 0,
};

const error = err => {
  console.error(`ERROR ${err} ${err.code} ${err.message}`);
};

const success = pos => {
  //   console.log(pos);
  const crds = pos.coords;
  const latitude = crds.latitude;
  const longitude = crds.longitude;

  localStorage.setItem('latitude', latitude);
  localStorage.setItem('longitude', longitude);
};

navigator.geolocation.getCurrentPosition(success, error, option);

const lati = +localStorage.getItem('latitude');
const long = +localStorage.getItem('longitude');
console.log(`lati ${lati}`);
console.log(`long ${long}`);

//
// MAP
const map = L.map('map').setView([myStreetlati, myStreetLong], 14);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

const originalMarkerMap = arrPosition => {
  L.marker(arrPosition)
    .addTo(map)
    .bindPopup(
      L.popup({
        autoClose: false,
        closeOnClick: false,
        className: 'leaflet-popup',
      })
    )
    .setPopupContent(`Your position`)
    .openPopup();
};

const circleMarkerMap = (arrPosition, popupContent, className) => {
  L.circle(arrPosition, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 30,
  })
    .addTo(map)
    .bindPopup(
      L.popup({
        autoClose: false,
        closeOnClick: false,
        className: className,
      })
    )
    .setPopupContent(popupContent)
    .openPopup();
};
map.createPane('workout');

//
//
//
originalMarkerMap([myStreetlati, myStreetLong]);

let deleteBtns = [];
const storedPoints = JSON.parse(localStorage.getItem('mapPoints')) ?? [];
console.log(storedPoints);
async function printPointsStored(points) {
  await map.eachLayer(layer => {
    if (layer instanceof L.CircleMarker) {
      map.removeLayer(layer);
    }
  });
  await points.forEach(point => {
    const textArea = inputInfoOnPopup(document.createElement('textarea'));
    const uniqueId = `${point[0]}-${point[1]}`;
    const savedContent = localStorage.getItem(`textareaContent_${uniqueId}`);
    textArea.value = savedContent ?? '';

    textArea.dataset.lat = point[0];
    textArea.dataset.lng = point[1];

    circleMarkerMap([point[0], point[1]], textArea, `leaflet-popup`);
    textArea
      .closest('.leaflet-popup-content-wrapper')
      .addEventListener('click', function () {
        map.setView([point[0], point[1]], 14);
      });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('deltePointBtn');
    textArea.insertAdjacentElement('afterend', deleteBtn);
    deleteBtns.push({
      btn: deleteBtn,
      lat: point[0],
      lng: point[1],
    });

    const dateSpan = document.createElement('span');
    dateSpan.classList.add('dateSpan');
    dateSpan.textContent = point[2];
    textArea
      .closest('.leaflet-popup-content')
      .insertAdjacentElement('afterend', dateSpan);

    deleteBtn.addEventListener('click', function () {
      const point = deleteBtns.find(ele => ele.btn === this);

      const { lat, lng } = point;

      const uniqueId = `${lat}-${lng}`;
      localStorage.removeItem(`textareaContent_${uniqueId}`);

      const storedPoints = JSON.parse(localStorage.getItem('mapPoints'));
      const updatedPoints = storedPoints.filter(
        ele => ele[0] !== lat && ele[1] !== lng
      );

      localStorage.setItem('mapPoints', JSON.stringify(updatedPoints));

      deleteBtns = deleteBtns.filter(ele => ele.btn !== this);

      turnSaveProgressBtn(updatedPoints);

      printPointsStored(updatedPoints);
    });
  });
}
printPointsStored(storedPoints);

const saveProgressBtn = document.createElement('button');
saveProgressBtn.classList.add('saveProgressBtn');
saveProgressBtn.textContent = 'save';
sidebar.insertAdjacentElement('afterbegin', saveProgressBtn);

const mapPoints = [];
function addMarker(event) {
  const now = new Date();
  const optionsDate = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  };
  const locale = navigator.language;
  const dateFormatter = new Intl.DateTimeFormat(locale, optionsDate).format(
    now
  );

  const newPoints = [[event.latlng.lat, event.latlng.lng, dateFormatter]];

  const storedPoints = JSON.parse(localStorage.getItem('mapPoints')) ?? [];
  const updatedPoints = [...storedPoints, ...newPoints];

  localStorage.setItem('mapPoints', JSON.stringify(updatedPoints));

  console.log(event);
  circleMarkerMap(
    [event.latlng.lat, event.latlng.lng],
    inputInfoOnPopup(document.createElement('textarea')),
    `leaflet-popup`
  );

  console.log(updatedPoints.length);
  console.log(updatedPoints);
  turnSaveProgressBtn(updatedPoints);
  printPointsStored(updatedPoints);
}

let doThis = true;
let sidebarNotesActivated = true;
addPointOnMap.addEventListener('click', function (event) {
  if (doThis) {
    event.target.style.backgroundColor = 'cadetblue';
    addPracticeOnMap.style.backgroundColor = 'white';
    form.classList.add('hidden');
    map.addEventListener('click', addMarker);

    toastr.options = {
      positionClass: 'toast-bottom-right',
      progressBar: true,
      preventDuplicates: true,
    };
    toastr.info(
      `Don't forget to press outside the note area so the sidebar will update automatically`,
      'Hey There!'
    );

    if (sidebarNotesActivated) {
      document.querySelectorAll('.note').forEach(ele => {
        ele.classList.remove('hidden');
      });
    }
  } else {
    event.target.style.backgroundColor = 'white';
    document.querySelectorAll('.note').forEach(ele => {
      ele.classList.add('hidden');
    });
    map.removeEventListener('click', addMarker);
  }
  doThis = !doThis;
  sidebarNotesActivated = !sidebarNotesActivated;
});

// add Notes to sidebar
const sidebarNotes = () => {
  const sidebarContentNotes = (lat, lng, noteContent, date) => `
  <li class="note" data-id="${lat}-${lng}">
  <span class="textArea__value"><textarea>${noteContent ?? ''}</textarea></span>
  <h2 class="note__date">${date} </h2>
  </li>
`;

  JSON.parse(localStorage.getItem('mapPoints')).forEach(point => {
    const uniqueId = `${point[0]}-${point[1]}`;
    const noteContent = localStorage.getItem(`textareaContent_${uniqueId}`);
    containerWorkouts.insertAdjacentHTML(
      'beforeend',
      sidebarContentNotes(point[0], point[1], noteContent, point[2])
    );

    const textArea = document.querySelector(
      `li[data-id="${uniqueId}"] textarea`
    );
    if (textArea) {
      const [lat, lng] = uniqueId.split('-');
      textArea.dataset.lat = lat;
      textArea.dataset.lng = lng;
      textArea.value = noteContent ?? '';
      inputInfoOnPopup(textArea);

      textArea.addEventListener('change', () => {
        printPointsStored(storedPoints);
      });
    }

    document.querySelectorAll('.note').forEach(ele => {
      ele.addEventListener('click', event => {
        const lnglatNote = event.target.closest('.note').dataset.id;
        map.setView(lnglatNote.split('-'), 14);
      });
    });
  });
  document.querySelectorAll('.note').forEach(ele => {
    ele.classList.add('hidden');
  });
};
sidebarNotes();

const turnSaveProgressBtn = updatedPoints => {
  if (document.querySelectorAll('.note').length === updatedPoints.length) {
    console.log('yes');
    saveProgressBtn.style.backgroundColor = 'cadetblue';
  } else {
    console.log('no');
    saveProgressBtn.style.backgroundColor = 'red';
    saveProgressBtn.addEventListener('click', () => {
      location.reload();
    });
  }
};

window.addEventListener('load', () => {
  document.querySelectorAll('.note').forEach(ele => {
    ele.classList.remove('hidden');
  });
});
