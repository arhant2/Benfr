const form = document.getElementsByClassName(
  'js--components-function--search__form'
)[0];
const input = document.getElementsByClassName(
  'js--components-function--search__input'
)[0];
const btn = document.getElementsByClassName(
  'js--components-function--search__btn'
)[0];

// alert('Connected');

if (form && input && btn) {
  const showInput = input.dataset.showClass;

  if (showInput) {
    btn.querySelectorAll('*').forEach((el) => {
      el.addEventListener('click', function (e) {
        if (!input.classList.contains(showInput)) {
          input.classList.add(showInput);
          return;
        } else if (input.value !== '') {
          // console.log(input.value);
          window.location.href = `/products/search/${input.value}`;
          // form.submit();
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value !== '') {
        // console.log(input.value);
        window.location.href = `/products/search/${input.value}`;
        // form.submit();
      }
    });

    window.addEventListener('click', function (e) {
      // console.log(e.target);
      if (!e.target.matches('.js--components-function--search__form *')) {
        input.classList.remove(showInput);
      }
    });
  }
}
