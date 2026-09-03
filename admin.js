const SUPABASE_URL='https://bofvqrfnahkurrkkeiwp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_4EMZsp-cE3HIqvJ2HJcwHw_HfGI3Gez';
const supabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);

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

async function showApp(){
  loginView.style.display='none';
  appView.style.display='block';
  await render();
}

async function guard(){
  try{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session){showLogin();return;}
    if(!(await isAuthorized(session.user))){
      await supabase.auth.signOut();
      showLogin('This account is not authorized for the Fashion Paglu admin panel.');
      return;
    }
    await showApp();
  }catch(error){
    showLogin('Admin service could not be loaded. Please refresh the page.');
  }
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
  await showApp();
});

logoutBtn.addEventListener('click',async()=>{await supabase.auth.signOut();showLogin('Logged out.');});

supabase.auth.onAuthStateChange((event)=>{
  if(event==='SIGNED_OUT')showLogin();
});

async function getProducts(){
  const {data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false});
  if(error)throw error;
  return data||[];
}

async function render(){
  try{
    const items=await getProducts();
    count.textContent=items.length;
    if(!items.length){catalog.innerHTML='<div class="empty">No products added yet.</div>';return;}
    catalog.innerHTML=items.map(p=>`<div class="item"><div><strong>${escapeHtml(p.name)}</strong><span> · ₹${Number(p.price).toLocaleString('en-IN')} · ${escapeHtml(p.category)}</span></div><button class="delete" data-id="${p.id}">Delete</button></div>`).join('');
    document.querySelectorAll('.delete').forEach(button=>button.addEventListener('click',async()=>{
      if(!confirm('Delete this product?'))return;
      const {error}=await supabase.from('products').delete().eq('id',button.dataset.id);
      if(error){alert('Could not delete the product.');return;}
      await render();
    }));
  }catch(error){
    catalog.innerHTML='<div class="empty">Could not load products. Please refresh and try again.</div>';
  }
}

function escapeHtml(s){return String(s||'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]))}

form.addEventListener('submit',async e=>{
  e.preventDefault();
  const sizes=[...document.querySelectorAll('.checks input:checked')].map(x=>x.value);
  if(!sizes.length){alert('Please select at least one size.');return;}
  const product={
    name:document.getElementById('name').value.trim(),
    price:Number(document.getElementById('price').value),
    category:document.getElementById('category').value,
    image:document.getElementById('image').value.trim(),
    description:document.getElementById('description').value.trim(),
    sizes,
    active:true
  };
  const {error}=await supabase.from('products').insert(product);
  if(error){alert('Product could not be saved. Please check admin access and try again.');return;}
  form.reset();
  document.querySelector('.checks input[value="M"]').checked=true;
  await render();
  alert('Product saved to the Fashion Paglu database.');
});

guard();