import { db, collection, addDoc, getDocs, deleteDoc, doc } from './firebase-config.js';

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
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ dbId: doc.id, ...doc.data() });
    });
    return products.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error("Firebase fetch error", err);
    return [];
  }
}

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
    const reader = new FileReader();

    reader.onload = async function(e) {
      const base64Image = e.target.result;
      
      const newProduct = {
        name: name,
        category: category,
        price: price,
        image: base64Image,
        badge: 'New',
        createdAt: Date.now()
      };

      try {
        await addDoc(collection(db, "products"), newProduct);
        showToast('✨ Product added to Firebase!');
        document.getElementById('addProductForm').reset();
        renderAdminProducts();
      } catch (err) {
        console.error("Firebase add error", err);
        showToast('Error adding to database!');
      }
      
      nameBtn.textContent = originalText;
      nameBtn.style.opacity = '1';
      nameBtn.style.pointerEvents = 'auto';
    };
    reader.readAsDataURL(file);
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
