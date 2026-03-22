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
    item.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div class="admin-product-info">
        <h4>${p.name}</h4>
        <p>₹ ${p.price}</p>
        <button class="btn-delete" data-id="${p.dbId}">Delete Product</button>
      </div>
    `;
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
      if (!storage) {
        console.error("Storage object is missing!");
        throw new Error("Firebase Storage service is not initialized. Check your firebase-config.js exports.");
      }

      // 1. Upload to Firebase Storage
      // Use simple filename to avoid encoding issues
      const cleanFileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const storagePath = `products/${Date.now()}_${cleanFileName}`;
      console.log("Starting upload to storage... Bucket:", storage.app.options.storageBucket);
      console.log("Path:", storagePath);
      
      const storageRef = ref(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRef, file);
      console.log("Upload SUCCESS! Snapshot:", snapshot);
      
      // 2. Get Download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Public URL:", downloadURL);
      
      // 3. Save to Firestore
      const newProduct = {
        name, category, price,
        image: downloadURL,
        badge: 'New',
        createdAt: Date.now()
      };

      console.log("Adding to Firestore...");
      await addDoc(collection(db, "products"), newProduct);
      console.log("Firestore SUCCESS!");
      
      showToast('✨ Product added to Firebase!');
      document.getElementById('addProductForm').reset();
      renderAdminProducts();
    } catch (err) {
      console.error("EXPERT DIAGNOSTIC - Firebase Failure:", err);
      let errorMsg = "Error adding product!";
      
      if (err.code === 'storage/unauthorized') {
        errorMsg = "Storage Error: Access Denied. Check your Firebase Storage Rules!";
      } else if (err.code === 'storage/retry-limit-exceeded') {
        errorMsg = "Storage Error: Timeout. Check your internet connection or bucket settings.";
      } else if (err.code === 'storage/unknown') {
        errorMsg = "Storage Error: Unknown error. Check if Firebase Storage is enabled in the console.";
      } else if (err.message) {
        errorMsg = `Error: ${err.message}`;
      }
      
      showToast(errorMsg);
      alert(errorMsg + "\nCheck the browser console (F12) for the full technical log.");
    } finally {
      console.log("Resetting button state.");
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

// Initialize on load
renderAdminProducts();
