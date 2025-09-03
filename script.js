// Enhanced Image Gallery with Advanced Features
class ImageGallery {
  constructor() {
    this.currentIndex = 0;
    this.currentGallery = [];
    this.isLightboxOpen = false;
    this.currentFilter = 'none';
    this.currentCategory = 'all';
    this.searchQuery = '';
    
    this.init();
  }

  init() {
    this.setupElements();
    this.setupEventListeners();
    this.loadImages();
    this.setupKeyboardNavigation();
    this.setupSearch();
  }

  setupElements() {
    this.galleryItems = document.querySelectorAll('.gallery-item');
    this.galleryImages = document.querySelectorAll('.gallery-item img');
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = document.querySelector('.lightbox-img');
    this.lightboxTitle = document.querySelector('.lightbox-title');
    this.lightboxDescription = document.querySelector('.lightbox-description');
    this.closeBtn = document.querySelector('.close');
    this.prevBtn = document.querySelector('.prev');
    this.nextBtn = document.querySelector('.next');
    this.categoryButtons = document.querySelectorAll('.category-btn');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.loading = document.getElementById('loading');
    
    // Create search input if it doesn't exist
    this.createSearchInput();
  }

  createSearchInput() {
    // Check if search input already exists
    if (document.querySelector('.search-container')) return;
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search images..." class="search-input">
        <button class="search-clear" title="Clear search">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    // Insert after categories
    const categories = document.querySelector('.categories');
    categories.parentNode.insertBefore(searchContainer, categories.nextSibling);
    
    this.searchInput = document.querySelector('.search-input');
    this.searchClear = document.querySelector('.search-clear');
  }

  setupSearch() {
    if (!this.searchInput) return;
    
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.performSearch();
    });
    
    this.searchClear.addEventListener('click', () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.performSearch();
    });
  }

  performSearch() {
    this.currentGallery = [];
    
    this.galleryItems.forEach(item => {
      const title = item.querySelector('.overlay h3')?.textContent.toLowerCase() || '';
      const description = item.querySelector('.overlay p')?.textContent.toLowerCase() || '';
      const category = item.dataset.category;
      
      const matchesSearch = this.searchQuery === '' || 
                           title.includes(this.searchQuery) || 
                           description.includes(this.searchQuery);
      
      const matchesCategory = this.currentCategory === 'all' || category === this.currentCategory;
      
      if (matchesSearch && matchesCategory) {
        item.style.display = 'block';
        this.currentGallery.push(item);
        item.style.animation = 'fadeInUp 0.6s ease-out';
      } else {
        item.style.display = 'none';
      }
    });
    
    // Update search results count
    this.updateSearchResults();
    
    // Show/hide clear button
    if (this.searchClear) {
      if (this.searchQuery) {
        this.searchClear.classList.add('visible');
      } else {
        this.searchClear.classList.remove('visible');
      }
    }
    
    // Show no results message if needed
    this.showNoResultsMessage();
    
    // Reset current index
    this.currentIndex = 0;
  }

  updateSearchResults() {
    const resultsCount = this.currentGallery.length;
    const totalImages = document.querySelectorAll('.gallery-item').length;
    
    // Update or create results counter
    let resultsCounter = document.querySelector('.search-results');
    if (!resultsCounter) {
      resultsCounter = document.createElement('div');
      resultsCounter.className = 'search-results';
      document.querySelector('.search-container').appendChild(resultsCounter);
    }
    
    if (this.searchQuery) {
      resultsCounter.textContent = `Found ${resultsCount} result${resultsCount !== 1 ? 's' : ''} for "${this.searchQuery}"`;
      resultsCounter.style.display = 'block';
    } else {
      resultsCounter.style.display = 'none';
    }
  }

  showNoResultsMessage() {
    // Remove existing no results message
    const existingMessage = document.querySelector('.no-results');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Show message if no results found
    if (this.searchQuery && this.currentGallery.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.innerHTML = `
        <div class="no-results-content">
          <i class="fas fa-search"></i>
          <h3>No images found</h3>
          <p>Try adjusting your search terms or category filter</p>
        </div>
      `;
      document.querySelector('.gallery').appendChild(noResults);
    }
  }

  setupEventListeners() {
    // Gallery item click events
    this.galleryImages.forEach((img, index) => {
      img.addEventListener('click', () => this.openLightbox(index));
    });

    // Lightbox controls
    this.closeBtn.addEventListener('click', () => this.closeLightbox());
    this.prevBtn.addEventListener('click', () => this.navigateImage('prev'));
    this.nextBtn.addEventListener('click', () => this.navigateImage('next'));

    // Category filtering
    this.categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => this.filterByCategory(btn));
    });

    // Image filters
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => this.applyFilter(btn));
    });

    // Reset button
    const resetBtn = document.getElementById('resetGallery');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetGallery());
    }

    // Close lightbox on background click
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.closeLightbox();
      }
    });

    // Touch events for mobile
    this.setupTouchEvents();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!this.isLightboxOpen) return;

      switch(e.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowLeft':
          this.navigateImage('prev');
          break;
        case 'ArrowRight':
          this.navigateImage('next');
          break;
      }
    });
  }

  setupTouchEvents() {
    let startX = 0;
    let endX = 0;

    this.lightbox.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    this.lightbox.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      this.handleSwipe(startX, endX);
    });
  }

  handleSwipe(startX, endX) {
    const threshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.navigateImage('next');
      } else {
        this.navigateImage('prev');
      }
    }
  }

  loadImages() {
    this.showLoading();
    
    // Simulate loading time for better UX
    setTimeout(() => {
      this.hideLoading();
      this.animateGalleryItems();
    }, 1000);
  }

  showLoading() {
    this.loading.style.display = 'block';
  }

  hideLoading() {
    this.loading.style.display = 'none';
  }

  animateGalleryItems() {
    this.galleryItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
      item.style.opacity = '1';
    });
  }

  openLightbox(index) {
    this.currentIndex = index;
    this.isLightboxOpen = true;
    
    const currentItem = this.currentGallery[index] || this.galleryItems[index];
    const img = currentItem.querySelector('img');
    const overlay = currentItem.querySelector('.overlay');
    
    this.lightboxImg.src = img.src;
    this.lightboxImg.alt = img.alt;
    
    if (overlay) {
      this.lightboxTitle.textContent = overlay.querySelector('h3').textContent;
      this.lightboxDescription.textContent = overlay.querySelector('p').textContent;
    }
    
    this.lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Add entrance animation
    this.lightbox.style.opacity = '0';
    setTimeout(() => {
      this.lightbox.style.opacity = '1';
    }, 10);
    
    // Update image counter
    this.updateImageCounter();
  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.lightbox.style.opacity = '0';
    
    setTimeout(() => {
      this.lightbox.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300);
  }

  navigateImage(direction) {
    if (direction === 'next') {
      this.currentIndex = (this.currentIndex + 1) % this.currentGallery.length;
    } else {
      this.currentIndex = (this.currentIndex - 1 + this.currentGallery.length) % this.currentGallery.length;
    }
    
    this.updateLightboxImage();
  }

  updateLightboxImage() {
    const currentItem = this.currentGallery[this.currentIndex];
    const img = currentItem.querySelector('img');
    const overlay = currentItem.querySelector('.overlay');
    
    // Add transition effect
    this.lightboxImg.style.opacity = '0';
    
    setTimeout(() => {
      this.lightboxImg.src = img.src;
      this.lightboxImg.alt = img.alt;
      
      if (overlay) {
        this.lightboxTitle.textContent = overlay.querySelector('h3').textContent;
        this.lightboxDescription.textContent = overlay.querySelector('p').textContent;
      }
      
      this.lightboxImg.style.opacity = '1';
      
      // Update image counter
      this.updateImageCounter();
    }, 150);
  }

  filterByCategory(clickedBtn) {
    const category = clickedBtn.dataset.category;
    
    // Update active button state
    this.categoryButtons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    
    this.currentCategory = category;
    this.currentGallery = [];
    
    this.galleryItems.forEach(item => {
      const itemCategory = item.dataset.category;
      
      if (category === 'all' || itemCategory === category) {
        item.style.display = 'block';
        this.currentGallery.push(item);
        
        // Add entrance animation
        item.style.animation = 'fadeInUp 0.6s ease-out';
      } else {
        item.style.display = 'none';
      }
    });
    
    // Reset current index
    this.currentIndex = 0;
  }

  applyFilter(clickedBtn) {
    const filter = clickedBtn.dataset.filter;
    
    // Update active button state
    this.filterButtons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    
    this.currentFilter = filter;
    
    this.galleryImages.forEach(img => {
      img.style.filter = filter;
      
      // Add smooth transition
      img.style.transition = 'filter 0.3s ease';
    });
  }

  // Utility methods
  getCurrentImageCount() {
    return this.currentGallery.length;
  }

  getCurrentImageIndex() {
    return this.currentIndex + 1;
  }

  // Add image counter to lightbox
  updateImageCounter() {
    const counter = document.createElement('div');
    counter.className = 'image-counter';
    counter.textContent = `${this.getCurrentImageIndex()} / ${this.getCurrentImageCount()}`;
    
    // Remove existing counter
    const existingCounter = document.querySelector('.image-counter');
    if (existingCounter) {
      existingCounter.remove();
    }
    
    this.lightbox.appendChild(counter);
  }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const gallery = new ImageGallery();
  
  // Add some additional features
  console.log('🚀 Beautiful Image Gallery Loaded Successfully!');
  
  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
});

// Add intersection observer for lazy loading
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Add performance monitoring
window.addEventListener('load', () => {
  if ('performance' in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`📊 Page loaded in ${loadTime}ms`);
  }
});
