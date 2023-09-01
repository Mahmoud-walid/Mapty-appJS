'use strict';

addPracticeOnMap.addEventListener('click', async function (event) {
  if (doThis) {
    map.removeEventListener('click', addMarker);
    event.target.style.backgroundColor = 'cadetblue';
    addPointOnMap.style.backgroundColor = 'white';
    form.classList.remove('hidden');

    document.querySelectorAll('.note').forEach(ele => {
      ele.classList.add('hidden');
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      const valueType = inputType.value;
      if (valueType === 'running') {
        circleMarkerMap(
          [map._lastCenter.lat + 0.258, map._lastCenter.lng + 0.278],
          () => {
            return `${inputDistance.value} and ${inputDuration.value} and ${inputCadence.value}`;
          },
          `running-popup`
        );
      }
      if (valueType === 'cycling') {
        circleMarkerMap(
          [map._lastCenter.lat + 0.21, map._lastCenter.lng + 0.17],
          () => {
            return `${inputDistance.value} and ${inputDuration.value} and ${inputElevation.value}`;
          },
          `cycling-popup`
        );
      }
      inputDistance.value =
        inputDuration.value =
        inputCadence.value =
        inputElevation.value =
          '';
    });

    inputType.addEventListener('change', function (event) {
      inputElevation
        .closest('.form__row')
        .classList.toggle('form__row--hidden');
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    });
  } else {
    event.target.style.backgroundColor = 'white';
    form.classList.add('hidden');
  }
  doThis = !doThis;
  sidebarNotesActivated = !sidebarNotesActivated;
});
