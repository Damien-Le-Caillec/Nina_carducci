document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('.gallery');
  new MauGallery(gallery, {
    columns: 3,
    lightBox: true,
    showTags: true,
    tagsPosition: 'top',
    navigation: true
  });
});