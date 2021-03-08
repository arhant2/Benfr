const fileInputs = document.getElementsByClassName(
  'js--components--image__add'
);
const removeCheckBoxes = document.getElementsByClassName(
  'js--components--image__remove'
);
const resets = document.getElementsByClassName('js--components--image__reset');

const getElement = (anyInnerElement, query) => {
  const ancestor = anyInnerElement.closest('.js--components--image');
  if (!ancestor) {
    return;
  }
  return ancestor.querySelector(query);
};

const changeStateImage = (anyInnerElement, activateState) => {
  activateState = activateState.toLowerCase();

  const ancestor = anyInnerElement.closest('.js--components--image');
  if (!ancestor) {
    return;
  }
  const { noneImageClass } = ancestor.dataset;
  if (!noneImageClass) {
    return;
  }
  const images = {
    original: ancestor.getElementsByClassName(
      'js--components--image__image-original'
    )[0],
    none: ancestor.getElementsByClassName(
      'js--components--image__image-none'
    )[0],
    current: ancestor.getElementsByClassName(
      'js--components--image__image-current'
    )[0],
  };

  Object.keys(images).forEach((key) => {
    if (activateState === key) {
      images[key].classList.remove(noneImageClass);
    } else {
      images[key].classList.add(noneImageClass);
    }
  });
};

const removedImage = (anyInnerElement) => {
  const removeCheckBox = getElement(
    anyInnerElement,
    '.js--components--image__remove'
  );
  return !!(removeCheckBox && removeCheckBox.checked);
};

Array.from(fileInputs).forEach((fileInput) => {
  fileInput.addEventListener('change', function () {
    let notUploaded = this.files.length === 0;

    if (!notUploaded) {
      const size = this.files[0].size / (1024 * 1024);
      if (size > 5) {
        alert('File larger than 5mb. Cannot upload.');
        notUploaded = true;
      }
    }

    if (notUploaded) {
      console.log('Arhant');
      if (removedImage(this)) {
        changeStateImage(this, 'none');
        return;
      }
      changeStateImage(this, 'original');
      return;
    }

    const reader = new FileReader();

    reader.onload = ((anyInnerElement) => (e) => {
      const imageCurrent = getElement(
        this,
        '.js--components--image__image-current'
      );
      const removeCheckBox = getElement(this, '.js--components--image__remove');
      if (imageCurrent) {
        imageCurrent.src = e.target.result;
      }
      if (removeCheckBox) {
        removeCheckBox.checked = false;
      }
      changeStateImage(this, 'current');
    })(this);

    reader.readAsDataURL(this.files[0]);
  });
});

Array.from(resets).forEach((reset) => {
  reset.addEventListener('click', function () {
    const removeCheckBox = getElement(this, '.js--components--image__remove');
    const fileInput = getElement(this, '.js--components--image__add');

    if (removeCheckBox) {
      removeCheckBox.checked = false;
    }
    if (fileInput) {
      fileInput.value = '';
    }
    changeStateImage(this, 'original');
  });
});

Array.from(removeCheckBoxes).forEach((removeCheckBox) => {
  console.log(removeCheckBox);

  removeCheckBox.addEventListener('change', function () {
    const fileInput = getElement(this, '.js--components--image__add');
    if (fileInput) {
      fileInput.value = '';
    }
    if (this.checked) {
      changeStateImage(this, 'none');
    } else {
      changeStateImage(this, 'original');
    }
  });
});
