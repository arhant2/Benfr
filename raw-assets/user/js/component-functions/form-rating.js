const getValue = (anyElement) => {
  const rating = anyElement.closest('.js--components-function--form-rating');
  let ans = 0;
  Array.from(
    rating.querySelectorAll(
      '.js--components-function--form-rating__label input'
    )
  ).forEach((el, i) => {
    if (el.checked) {
      ans = i + 1;
    }
  });
  return ans;
};

const setValue = (anyElement, value) => {
  const rating = anyElement.closest('.js--components-function--form-rating');

  const { selectedLabelClass } = rating.dataset;

  if (!selectedLabelClass) {
    return;
  }

  // console.log(selectedLabelClass);

  Array.from(
    rating.querySelectorAll('.js--components-function--form-rating__label')
  ).forEach((label, i) => {
    // console.log('ha: ', label);

    // console.log(i, value, i < value);

    if (i < value) {
      label.classList.add(selectedLabelClass);
    } else {
      label.classList.remove(selectedLabelClass);
    }
  });
};

Array.from(
  document.getElementsByClassName('js--components-function--form-rating')
).forEach((rating) => {
  const labels = rating.getElementsByClassName(
    'js--components-function--form-rating__label'
  );

  if (!rating.dataset.selectedLabelClass || labels.length !== 5) {
    return;
  }

  Array.from(labels).forEach((label, i) => {
    label.dataset.radioNumberJavascript = i + 1;

    label.addEventListener('mouseover', function (e) {
      setValue(this, this.dataset.radioNumberJavascript);
    });

    label.addEventListener('mouseout', function (e) {
      setValue(this, getValue(this));
    });
  });
});
