class MauGallery {
  constructor(galleryElement, options = {}) {
    this.gallery = galleryElement;
    this.options = Object.assign(MauGallery.defaults, options);
    this.tagsCollection = [];

    this.init();
  }

  static defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: 'galleryLightbox',
    showTags: true,
    tagsPosition: 'bottom',
    navigation: true
  };

  init() {
    this.createRowWrapper();
    this.gallery.style.display = 'block';
    if (this.options.lightBox) {
      this.createLightBox();
    }
    this.setupListeners();

    const items = this.gallery.querySelectorAll('.gallery-item');
    items.forEach(item => {
      this.responsiveImageItem(item);
      this.wrapItemInColumn(item, this.options.columns);
      this.moveItemInRowWrapper(item);
      

      const tag = item.dataset.galleryTag;
      if (this.options.showTags && tag && !this.tagsCollection.includes(tag)) {
        this.tagsCollection.push(tag);
      }
    });

    if (this.options.showTags) {
      this.showItemTags();
    }

    if (this.options.lightBox) {
      this.createLightBox();
    }
    this.setupListeners();



    this.gallery.style.opacity = 0;
    setTimeout(() => {
      this.gallery.style.transition = 'opacity 0.5s';
      this.gallery.style.opacity = 1;
    }, 10);
  }

  createRowWrapper() {
    if (!this.gallery.firstElementChild?.classList.contains('row')) {
      const row = document.createElement('div');
      row.className = 'gallery-items-row row';
      this.gallery.appendChild(row);
    }
  }

  wrapItemInColumn(item, columns) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('item-column', 'mb-4');

    if (typeof columns === 'number') {
      wrapper.classList.add(`col-${Math.ceil(12 / columns)}`);
    } else if (typeof columns === 'object') {
      if (columns.xs) wrapper.classList.add(`col-${Math.ceil(12 / columns.xs)}`);
      if (columns.sm) wrapper.classList.add(`col-sm-${Math.ceil(12 / columns.sm)}`);
      if (columns.md) wrapper.classList.add(`col-md-${Math.ceil(12 / columns.md)}`);
      if (columns.lg) wrapper.classList.add(`col-lg-${Math.ceil(12 / columns.lg)}`);
      if (columns.xl) wrapper.classList.add(`col-xl-${Math.ceil(12 / columns.xl)}`);
    }

    item.parentNode.insertBefore(wrapper, item);
    wrapper.appendChild(item);
  }

  moveItemInRowWrapper(item) {
    const row = this.gallery.querySelector('.gallery-items-row');
    row.appendChild(item.closest('.item-column') || item);
  }

  responsiveImageItem(item) {
    if (item.tagName === 'IMG') {
      item.classList.add('img-fluid');
    }
  }

  createLightBox() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = this.options.lightboxId;
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');

    modal.innerHTML = `
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-body">
            ${this.options.navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : ''}
            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clic"/>
            ${this.options.navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : ''}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  setupListeners() {
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        if (this.options.lightBox && item.tagName === 'IMG') {
          this.openLightBox(item);
        }
      });
    });

    document.querySelectorAll('.gallery .nav-link').forEach(link => {
      link.addEventListener('click', this.filterByTag.bind(this));
    });

    document.querySelector('.gallery').addEventListener('click', e => {
      if (e.target.classList.contains('mg-prev')) this.prevImage();
      if (e.target.classList.contains('mg-next')) this.nextImage();
    });

    document.addEventListener('click', e => {
      const modal = document.getElementById(this.options.lightboxId);
      if (!modal) return;
      
      if (e.target === modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
      }
    });

    document.addEventListener('click', e => {
  if (e.target.classList.contains('mg-prev')) {
    this.prevImage();
  }
  if (e.target.classList.contains('mg-next')) {
    this.nextImage();
  }
});



  }

  openLightBox(item) {
    const modal = document.getElementById(this.options.lightboxId);
    const lightboxImage = modal.querySelector('.lightboxImage');
    lightboxImage.setAttribute('src', item.getAttribute('src'));
    modal.classList.add('show');
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    modal.focus();
  }

  getFilteredImages() {
    const activeTag = document.querySelector('.tags-bar .active-tag')?.dataset.imagesToggle || 'all';
    const allImages = Array.from(document.querySelectorAll('.item-column img'));
    return activeTag === 'all'
      ? allImages
      : allImages.filter(img => img.dataset.galleryTag === activeTag);
  }

  prevImage() {
    const lightboxImage = document.querySelector('.lightboxImage');
    const currentSrc = lightboxImage.getAttribute('src');
    const images = this.getFilteredImages();
    const index = images.findIndex(img => img.getAttribute('src') === currentSrc);
    const prevIndex = (index - 1 + images.length) % images.length;
    lightboxImage.setAttribute('src', images[prevIndex].getAttribute('src'));
  }

  nextImage() {
    const lightboxImage = document.querySelector('.lightboxImage');
    const currentSrc = lightboxImage.getAttribute('src');
    const images = this.getFilteredImages();
    const index = images.findIndex(img => img.getAttribute('src') === currentSrc);
    const nextIndex = (index + 1) % images.length;
    lightboxImage.setAttribute('src', images[nextIndex].getAttribute('src'));
  }

  showItemTags() {
    const tagBar = document.createElement('ul');
    tagBar.className = 'my-4 tags-bar nav nav-pills';
    tagBar.innerHTML = `
      <li class="nav-item">
        <span class="nav-link active active-tag" data-images-toggle="all">Tous</span>
      </li>
    `;

    this.tagsCollection.forEach(tag => {
      tagBar.innerHTML += `
        <li class="nav-item">
          <span class="nav-link" data-images-toggle="${tag}">${tag}</span>
        </li>
      `;
    });

    if (this.options.tagsPosition === 'bottom') {
      this.gallery.appendChild(tagBar);
    } else if (this.options.tagsPosition === 'top') {
      this.gallery.insertBefore(tagBar, this.gallery.firstChild);
    } else {
      console.error(`Unknown tags position: ${this.options.tagsPosition}`);
    }
  }

  filterByTag(event) {
    const clicked = event.target;
    if (clicked.classList.contains('active-tag')) return;

    document.querySelectorAll('.active-tag').forEach(tag => tag.classList.remove('active', 'active-tag'));
    clicked.classList.add('active-tag');

    const tag = clicked.dataset.imagesToggle;
    document.querySelectorAll('.gallery-item').forEach(item => {
      const column = item.closest('.item-column');
      column.style.display = 'none';

      if (tag === 'all' || item.dataset.galleryTag === tag) {
        column.style.display = 'block';
        column.style.transition = 'opacity 0.3s';
        column.style.opacity = 1;
      }
    });
  }
}