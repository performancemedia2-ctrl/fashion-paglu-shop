const SUPABASE_URL='https://bofvqrfnahkurrkkeiwp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_4EMZsp-cE3HIqvJ2HJcwHw_HfGI3Gez';
const supabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);

const KEY='fashionPagluAdminProducts';
const loginView=document.getElementById('loginView');
const appView=document.getElementById('appView');
const loginForm=document.getElementById('loginForm');
const loginError=document.getElementById('loginError');
const logoutBtn=document.getElementById('logoutBtn');
const form=document.getElementById('productForm');
const catalog=document.getElementById('catalog');
const count=document.getElementById('productCount');

async function isAuthorized(user){
  if(!user)return false;
  const {data,error}=await supabase.from('admin_access').select('user_id').eq('user_id',user.id).maybeSingle();
  return !error&&!!data;
}

function showLogin(message=''){
  appView.style.display='none';
  loginView.style.display='block';
  loginError.textContent=message;
  loginError.style.display=message?'block':'none';
}

function showApp(){
  loginView.style.display='none';
  appView.style.display='block';
  render();
}

async function guard(){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){showLogin();return;}
  if(!(await isAuthorized(session.user))){
    await supabase.auth.signOut();
    showLogin('This account is not authorized for the Fashion Paglu admin panel.');
    return;
  }
  showApp();
}

loginForm.addEventListener('submit',async e=>{
  e.preventDefault();
  loginError.style.display='none';
  const email=document.getElementById('loginEmail').value.trim();
  const password=document.getElementById('loginPassword').value;
  const {data,error}=await supabase.auth.signInWithPassword({email,password});
  if(error){showLogin('Login failed. Please check the email/password.');return;}
  if(!(await isAuthorized(data.user))){
    await supabase.auth.signOut();
    showLogin('Login succeeded, but this account is not authorized for admin access.');
    return;
  }
  showApp();
});

logoutBtn.addEventListener('click',async()=>{await supabase.auth.signOut();showLogin('Logged out.');});

supabase.auth.onAuthStateChange((event,session)=>{
  if(event==='SIGNED_OUT')showLogin();
});

function getProducts(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}
function saveProducts(items){localStorage.setItem(KEY,JSON.stringify(items));render()}
function render(){
  const items=getProducts();
  count.textContent=items.length;
  if(!items.length){catalog.innerHTML='<div class="empty">No products added yet.</div>';return}
  catalog.innerHTML=items.map((p,i)=>`<div class="item"><div><strong>${escapeHtml(p.name)}</strong><span> · ₹${Number(p.price).toLocaleString('en-IN')} · ${escapeHtml(p.category)}</span></div><button class="delete" data-index="${i}">Delete</button></div>`).join('');
  document.querySelectorAll('.delete').forEach(b=>b.onclick=()=>{const a=getProducts();a.splice(Number(b.dataset.index),1);saveProducts(a)});
}
function escapeHtml(s){return String(s||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

form.addEventListener('submit',e=>{
  e.preventDefault();
  const sizes=[...document.querySelectorAll('.checks input:checked')].map(x=>x.value);
  const products=getProducts();
  products.push({name:document.getElementById('name').value.trim(),price:document.getElementById('price').value,category:document.getElementById('category').value,image:document.getElementById('image').value,description:document.getElementById('description').value.trim(),sizes});
  saveProducts(products);form.reset();document.querySelector('.checks input[value="M"]').checked=true;alert('Product saved on this device.');
});

guard();