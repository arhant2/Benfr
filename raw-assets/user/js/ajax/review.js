import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import popup from '../component-functions/popup/index';

////////////////////////////////
// Posting/updating of review
////////////////////////////////

// Wraped inside iffe so that the variables donot conflict
(() => {
  const form = document.getElementById('review-form');
  const btn = document.getElementById('review-form-btn');

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      const formData = new FormData(this);

      const data = {
        star: formData.get('star'),
        title: formData.get('title'),
        description: formData.get('description') || '',
      };

      const productId = formData.get('productId');
      const reviewId = formData.get('reviewId');

      if (!productId) {
        handleError('Cannot post/update comment, please try again later!');
        return;
      }

      if (btn) {
        btn.setAttribute('disabled', 'disabled');
      }

      try {
        const res = await axios({
          method: reviewId ? 'PATCH' : 'POST',
          url: `/api/v1/products/${productId}/reviews/${reviewId || ''}`,
          data,
        });

        popup.alert(
          'Success',
          `${
            reviewId ? 'Updated your' : 'Posted your'
          } review successfully! Reload the page to see changes...`,
          () => {
            window.location.reload();
          }
        );
      } catch (err) {
        handleError(err, true);
        if (btn) {
          btn.removeAttribute('disabled');
        }
      }
    });
  }
})();

////////////////////////////////
// Liking/undo-liking of review
////////////////////////////////

Array.from(
  document.getElementsByClassName('js--ajax--review-each__like-btn')
).forEach((likeBtn) => {
  likeBtn.addEventListener('click', function (e) {
    const { reviewId, productId, likedClass } = this.dataset;
    const likeCountElement = this.getElementsByClassName(
      'js--ajax--review-each__like-btn--count'
    )[0];

    if (
      !reviewId ||
      !productId ||
      !likeCountElement ||
      !likedClass ||
      likeCountElement.dataset.likeCount === undefined
    ) {
      popup.alert(
        'Error',
        'Cannot like/unlike the post now, please retry later!'
      );
      return;
    }

    let currentLikeCount = likeCountElement.dataset.likeCount * 1;
    const undo = this.classList.contains(likedClass);

    if (undo) {
      currentLikeCount -= 1;
    } else {
      currentLikeCount += 1;
    }

    likeCountElement.dataset.likeCount = currentLikeCount;

    likeCountElement.textContent = `${currentLikeCount} like${
      currentLikeCount > 1 ? 's' : ''
    }`;

    this.classList.toggle(likedClass);

    (async () => {
      try {
        await axios({
          method: undo ? 'DELETE' : 'POST',
          url: `/api/v1/products/${productId}/reviews/${reviewId}/like/${
            undo ? 'undo' : ''
          }`,
        });
      } catch (err) {}
    })();
  });
});

////////////////////////////////
// Marking of review
////////////////////////////////

Array.from(
  document.getElementsByClassName('js--ajax--review-each--mark-btn')
).forEach((markBtn) => {
  markBtn.addEventListener('click', function (e) {
    const { reviewId, productId } = this.dataset;

    const card = this.closest('.js--ajax--review-each');

    if (!reviewId || !productId || !card) {
      popup.alert(
        'Error',
        'Cannot mark review as inappropriate now, please try again later!'
      );
      return;
    }

    popup.confirm(
      'Confirm marking',
      'Are you sure you want mark the review as inappropriate? This action cannot be undone and doing so will hide this review for you',
      undefined,
      () => {
        card.remove();

        (async () => {
          try {
            await axios({
              method: 'POST',
              url: `/api/v1/products/${productId}/reviews/${reviewId}/mark`,
            });
          } catch (err) {}
        })();
      }
    );
  });
});

////////////////////////////////
// Deleting of review
////////////////////////////////

Array.from(
  document.getElementsByClassName('js--ajax--review-delete-btn')
).forEach((deleteBtn) => {
  deleteBtn.addEventListener('click', async function (e) {
    const { reviewId, productId } = this.dataset;

    if (!reviewId || !productId) {
      popup.alert('Error', 'Cannot delete review now, please try again later!');
      return;
    }

    popup.confirm(
      'Confirm delete',
      'Are you sure, you want to delete this review? This cannot be undone.',
      undefined,
      async () => {
        this.setAttribute('disabled', 'disabled');

        try {
          await axios({
            method: 'DELETE',
            url: `/api/v1/products/${productId}/reviews/${reviewId}`,
          });

          popup.alert(
            'Success',
            'Deleted your review successfully! Reload the page to see changes...',
            () => {
              window.location.reload();
            }
          );
        } catch (err) {
          handleError(err, true);
          if (this) {
            this.removeAttribute('disabled');
          }
        }
      }
    );
  });
});
