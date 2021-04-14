export default class btnsStateClass {
  constructor(allBtnObjs) {
    this.allBtnObjs = allBtnObjs;
  }

  disableBtns(loadBtnName) {
    this.allBtnObjs.forEach(({ name, btn }) => {
      if (btn) {
        btn.setAttribute('disabled', 'disabled');
        if (name === loadBtnName && btn.dataset.loadClass) {
          btn.classList.add(btn.dataset.loadClass);
        }
      }
    });
  }

  enableBtns() {
    this.allBtnObjs.forEach(({ name, btn }) => {
      if (btn) {
        btn.removeAttribute('disabled');
        if (btn.dataset.loadClass) {
          btn.classList.remove(btn.dataset.loadClass);
        }
      }
    });
  }
}
