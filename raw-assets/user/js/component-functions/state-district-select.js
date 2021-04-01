import locationDetailsParsed from '../../../../staticData/locationDetailsParsed.json';

Array.from(
  document.getElementsByClassName(
    'js--components-function--state-district-select'
  )
).forEach((stateSelect) => {
  stateSelect.addEventListener('change', function (e) {
    const { districtJsQuery } = this.dataset;
    const state = this.value;

    if (!districtJsQuery || !state || !locationDetailsParsed[state]) {
      return;
    }

    const districtSelect = document.querySelector(districtJsQuery);

    districtSelect.innerHTML = Object.keys(
      locationDetailsParsed[state].districts
    )
      .map((district) => `<option value='${district}'>${district}</option>`)
      .join('');
  });
});
