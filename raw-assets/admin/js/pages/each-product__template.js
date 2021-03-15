export const specificationsTemplate = `
<div
  class="form__group-outer-remove js--page-each-product--specifications__each"
>
  <div class="form__group form__group--partition-1-2">
    <div>
      <input
        type="text"
        name="specifications[{%NUM%}][field]"
        class="form-group-input form__input--single-line u-width-full"
        placeholder="Title"
        minlength=2 
        maxlength=25
        required
      />
    </div>
    <div>
      <textarea
        name="specifications[{%NUM%}][value]"
        class="form-group-input form__input--textarea u-width-full"
        placeholder="Write a description here..."
        rows="2"
        minlength=2
        maxlength=75
        required
      ></textarea>
    </div>
  </div>
  <button
    type="button"
    class="btn btn--text btn--red tooltip js--page-each-product--specifications__each-remove-btn"
    data-tooltip-direction="right"
  >
    <i class="far fa-trash-alt"></i>
    <div class="tooltip__element tooltip__element--right">Delete</div>
  </button>
</div>
`;

export const categoriesTemplate = `
<div
class="form-tags__inputs-each-outer js--page-each-product--category__input"
>
<input
  type="text"
  class="form-tags__inputs-input"
  value="{%VALUE%}"
  name="categoriesIdString[]"
  readonly
/>
<span class="form-tags__inputs-text">{%NAME%}</span>
<button
  type="button"
  class="form-tags__inputs-remove-btn js--page-each-product--category__input-remove-btn"
>
  &Cross;
</button>
</div>
`;
