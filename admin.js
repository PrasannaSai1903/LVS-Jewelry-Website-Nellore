import { db, collection, addDoc, getDocs, deleteDoc, doc, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

// ─── DEFAULT PRODUCTS FOR LVS JEWELLERY ───
const defaultProducts = [
  { id: '1', name: 'Eternal Solitaire Ring', category: 'rings', price: '1,85,000', image: 'images/rings.png', badge: 'Bestseller' },
  { id: '2', name: 'Royal Diamond Necklace', category: 'necklaces', price: '3,20,000', image: 'images/necklace.png', badge: 'New' },
  { id: '3', name: 'Sapphire Drop Earrings', category: 'earrings', price: '79,500', image: 'images/earrings.png', badge: '' },
  { id: '4', name: 'Diamond Tennis Bracelet', category: 'bracelets', price: '2,45,000', image: 'images/bracelets.png', badge: 'Limited' },
  { id: '5', name: 'Vintage Halo Ring', category: 'rings', price: '1,19,000', image: 'images/rings.png', badge: '' },
  { id: '6', name: 'Pearl & Diamond Pendant', category: 'necklaces', price: '88,000', image: 'images/necklace.png', badge: 'New' }
];

// ─── FETCH DATABASE ───
async function getProducts() {
  console.log("Fetching products from Firestore...");
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    console.log("Firestore fetch successful, docs count:", querySnapshot.size);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ dbId: doc.id, ...doc.data() });
    });
    return products.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error("Firebase fetch error:", err);
    return [];
  }
}

// Expose services for console debugging
window.db = db;
window.storage = storage;
console.log("Firebase services exposed to window.db and window.storage");

// ─── RENDER ADMIN GRID ───
async function renderAdminProducts() {
  const grid = document.getElementById('adminProductsGrid');
  grid.innerHTML = '<p style="color:var(--text-light);text-align:center;grid-column:1/-1;">Loading from Database...</p>';
  
  const products = await getProducts();
  grid.innerHTML = '';

  if (products.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-light);text-align:center;grid-column:1/-1;font-size:0.9rem;">No products found in Firebase. Try adding one!</p>';
    return;
  }

  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'admin-product-item';
    
    // Create image element separately to handle Base64
    const imageDiv = document.createElement('div');
    imageDiv.className = 'admin-image-container';
    
    const img = document.createElement('img');
    img.className = 'admin-product-img';
    img.loading = 'lazy';
    img.src = p.image;  // This can be Base64 data URL or regular URL
    img.alt = p.name;
    img.onload = function() {
      console.log(`✓ Image loaded: ${p.name}`);
      this.classList.add('loaded');
    };
    img.onerror = function() {
      console.error(`✗ Image failed: ${p.name}`);
      handleAdminImageError(this, p.name);
    };
    
    imageDiv.appendChild(img);
    
    // Create info section
    const infoDiv = document.createElement('div');
    infoDiv.className = 'admin-product-info';
    infoDiv.innerHTML = `
      <h4>${p.name}</h4>
      <p>₹ ${p.price}</p>
      <button class="btn-delete" data-id="${p.dbId}">Delete Product</button>
    `;
    
    item.appendChild(imageDiv);
    item.appendChild(infoDiv);
    grid.appendChild(item);
  });
}

// ─── DELETE PRODUCT EVENT DELEGATION ───
document.getElementById('adminProductsGrid').addEventListener('click', async function(e) {
  if (e.target.classList.contains('btn-delete')) {
    if (confirm("Are you sure you want to delete this product from the database?")) {
      const id = e.target.getAttribute('data-id');
      try {
        await deleteDoc(doc(db, "products", id));
        showToast('🗑️ Product deleted from database!');
        renderAdminProducts();
      } catch (err) {
        console.error("Delete error", err);
        showToast('Error deleting product!');
      }
    }
  }
});

// ─── HANDLE FORM SUBMIT (ADD PRODUCT) ───
document.getElementById('addProductForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  console.log("Form submit started...");
  
  const nameBtn = document.querySelector('button[type="submit"]');
  const originalText = nameBtn.textContent;
  nameBtn.textContent = 'Uploading...';
  nameBtn.style.opacity = '0.7';
  nameBtn.style.pointerEvents = 'none';

  const name = document.getElementById('prodName').value;
  const category = document.getElementById('prodCategory').value;
  const price = document.getElementById('prodPrice').value;
  const fileInput = document.getElementById('prodImage');

  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    console.log("File selected:", file.name, file.size, file.type);
    
    try {
      // Compress image client-side to reduce upload/display time
      const imgEl = new Image();
      const objectURL = URL.createObjectURL(file);
      imgEl.src = objectURL;
      imgEl.onload = async function() {
        try {
          const MAX_WIDTH = 1200; // downscale large images
          const MAX_HEIGHT = 1200;
          let { width, height } = imgEl;
          let targetWidth = width;
          let targetHeight = height;
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            targetWidth = Math.round(width * ratio);
            targetHeight = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(imgEl, 0, 0, targetWidth, targetHeight);

          // Convert to JPEG to reduce size if original is PNG, quality 0.8
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          URL.revokeObjectURL(objectURL);

          console.log('Original size (bytes):', file.size);
          console.log('Compressed length (chars):', compressedDataUrl.length);

          const newProduct = {
            name,
            category,
            price,
            image: compressedDataUrl,
            badge: 'New',
            createdAt: Date.now()
          };

          console.log('Adding compressed image product to Firestore...');
          await addDoc(collection(db, 'products'), newProduct);
          console.log('Firestore SUCCESS!');

          showToast('✨ Product added to Firebase (compressed image)!');
          document.getElementById('addProductForm').reset();
          renderAdminProducts();
        } catch (err) {
          console.error('Firestore/compress error:', err);
          showToast('Error adding product!');
          alert('Error adding product. See console for details.');
        } finally {
          nameBtn.textContent = originalText;
          nameBtn.style.opacity = '1';
          nameBtn.style.pointerEvents = 'auto';
        }
      };
      imgEl.onerror = function(e) {
        URL.revokeObjectURL(objectURL);
        console.error('Image load error', e);
        showToast('Error processing image file');
        nameBtn.textContent = originalText;
        nameBtn.style.opacity = '1';
        nameBtn.style.pointerEvents = 'auto';
      };
    } catch (err) {
      console.error('Error:', err);
      showToast('Error processing image!');
      nameBtn.textContent = originalText;
      nameBtn.style.opacity = '1';
      nameBtn.style.pointerEvents = 'auto';
    }
  } else {
    showToast('Please select an image!');
    nameBtn.textContent = originalText;
    nameBtn.style.opacity = '1';
    nameBtn.style.pointerEvents = 'auto';
  }
});

// ─── TOAST NOTIFICATION ───
let adminToastTimer;
function showToast(msg) {
  const toast = document.getElementById('adminToast');
  clearTimeout(adminToastTimer);
  toast.innerHTML = msg;
  toast.className = 'show';
  toast.style.background = 'var(--gold)';
  toast.style.color = 'var(--black)';
  toast.style.border = 'none';
  
  adminToastTimer = setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}

// ─── ADMIN IMAGE ERROR HANDLER ───
function handleAdminImageError(img, productName) {
  console.error(`✗ Failed to load admin image for: ${productName}`);
  console.error(`  URL: ${img.src}`);
  
  const container = img.parentElement;
  if (container) {
    const placeholder = document.createElement('div');
    placeholder.className = 'admin-image-placeholder';
    placeholder.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #888;
      border-radius: 4px;
    `;
    placeholder.innerHTML = '<div style="font-size:2.5rem;margin-bottom:8px;">📷</div><div style="font-size:0.8rem;text-align:center;width:100%;">Image<br>Failed</div>';
    img.replaceWith(placeholder);
  }
}

// Initialize on load
renderAdminProducts();
