import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';
import popup from '../components-function/popup/index';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../components-function/flash-messages';

import btnStatesClass from '../utils/btnsStatesClass';
import singularPluralManager from '../../../../utils/singularPluralManager';
import { productFormDataSpecificationsManage } from '../pages/each-product';

const form = document.getElementById('generic-form');
const saveBtn = document.getElementById('form-save-btn');
const deleteBtn = document.getElementById('form-delete-btn');
const discardBtn = document.getElementById('form-discard-btn');
const idInput = document.getElementById('id');
const id = idInput && idInput.value;
const isNew = !id;

let singularName, pluralName;

const btnStates = new btnStatesClass([
  {
    name: 'save',
    btn: saveBtn,
  },
  {
    name: 'delete',
    btn: deleteBtn,
  },
  {
    name: 'discard',
    btn: discardBtn,
  },
]);

const submitForm = () => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    clearFlashMessages();
    const currentForm = this;

    popup.confirm(
      'Confirm changes',
      'Are you sure, you want to save the changes?',
      undefined,
      async () => {
        const data = new FormData(currentForm);

        if (singularName.small === 'product') {
          productFormDataSpecificationsManage(data);
        }

        const obj = { data };
        if (isNew) {
          obj.url = `/api/v1/${pluralName.small}`;
          obj.method = 'POST';
        } else {
          obj.url = `/api/v1/${pluralName.small}/${id}`;
          obj.method = 'PATCH';
        }

        btnStates.disableBtns('save');

        try {
          const res = await axios(obj);
          clearFlashMessages();

          if (isNew) {
            addFlashMessage(
              'success',
              `Successfully created ${singularName.small}. Reloading...`
            );

            // console.log(res);

            setTimeout(() => {
              window.location.replace(
                `/a/${pluralName.small}/${res.data.data[singularName.small].id}`
              );
            }, 2000);
          } else {
            addFlashMessage(
              'success',
              `Successfully updated ${singularName.small}. Reloading...`
            );
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } catch (err) {
          handleError(err);
          btnStates.enableBtns();
        }
      }
    );
  });
};

const deleteFunction = () => {
  deleteBtn.addEventListener('click', function () {
    clearFlashMessages();

    popup.confirm(
      `Delete ${singularName.capital}`,
      `Are you sure, you want to delete this ${singularName.capital}? Please note that this cannot be undone!`,
      undefined,
      async () => {
        btnStates.disableBtns('delete');

        try {
          const res = await axios({
            method: 'DELETE',
            url: `/api/v1/${pluralName.small}/${id}`,
          });

          addFlashMessage(
            'success',
            `Deleted ${singularName.small} successfully! Reloading...`
          );
          setTimeout(() => {
            window.location.href = `/a/${pluralName.small}`;
          }, 2000);
        } catch (err) {
          handleError(err);
          btnStates.enableBtns();
        }
      }
    );
  });
};

if (form) {
  const singularNameGenericForm = form.dataset.genericFormSingularName;
  const pluralNameGenericForm = form.dataset.genericFormPluralName;

  if (singularNameGenericForm && pluralNameGenericForm) {
    ({ singularName, pluralName } = singularPluralManager(
      singularNameGenericForm,
      pluralNameGenericForm
    ));

    submitForm();
  }

  if (deleteBtn && !isNew) {
    deleteFunction();
  }
}
