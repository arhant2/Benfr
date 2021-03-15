import {
  specificationsTemplate,
  categoriesTemplate,
} from './each-product__template';

const addSpecificationBtn = document.getElementsByClassName(
  'js--page-each-product--specifications__add-btn'
)[0];

const specificationBox = document.getElementsByClassName(
  'js--page-each-product--specifications__box'
)[0];

if (specificationBox) {
  window.addEventListener('click', function (e) {
    if (
      !(
        e.target.matches(
          '.js--page-each-product--specifications__each-remove-btn'
        ) ||
        e.target.matches(
          '.js--page-each-product--specifications__each-remove-btn *'
        )
      )
    ) {
      return;
    }

    const each = e.target.closest(
      '.js--page-each-product--specifications__each'
    );

    if (!each) {
      return;
    }

    each.remove();
  });

  if (addSpecificationBtn) {
    addSpecificationBtn.addEventListener('click', function () {
      specificationBox.insertAdjacentHTML('beforeend', specificationsTemplate);
    });
  }
}

/*
==================================================================================
                              Category
==================================================================================
*/
const category = document.getElementsByClassName(
  'js--page-each-product--category'
)[0];
const categoryInputsContainer = document.getElementsByClassName(
  'js--page-each-product--category__inputs-container'
)[0];
const categoryEachBtns = document.getElementsByClassName(
  'js--page-each-product--category__each-btn'
);

if (category && categoryInputsContainer) {
  window.addEventListener('click', function (e) {
    if (
      !(
        e.target.matches(
          '.js--page-each-product--category__input-remove-btn'
        ) ||
        e.target.matches('.js--page-each-product--category__input-remove-btn *')
      )
    ) {
      return;
    }

    const each = e.target.closest('.js--page-each-product--category__input');

    if (!each) {
      return;
    }

    each.remove();
  });

  Array.from(categoryEachBtns).forEach((btn) => {
    btn.addEventListener('click', function () {
      if (!btn.dataset.value) {
        return;
      }
      const html = categoriesTemplate
        .replace('{%VALUE%}', this.dataset.value)
        .replace('{%NAME%}', this.textContent);

      categoryInputsContainer.insertAdjacentHTML('beforeend', html);
    });
  });
}

export const productFormDataSpecificationsManage = (formData) => {
  const fields = formData.getAll('specifications[{%NUM%}][field]');
  const values = formData.getAll('specifications[{%NUM%}][value]');

  console.log(values);

  for (let i = 0; i < fields.length; ++i) {
    formData.append(`specifications[${i}][field]`, fields[i]);
    formData.append(`specifications[${i}][value]`, values[i]);
  }

  formData.delete('specifications[{%NUM%}][field]');
  formData.delete('specifications[{%NUM%}][value]');
};
