const mainImage=document.getElementById('mainProductImage');
document.querySelectorAll('.thumb').forEach(button=>{button.addEventListener('click',()=>{document.querySelectorAll('.thumb').forEach(item=>item.classList.remove('active'));button.classList.add('active');mainImage.src=button.dataset.image})});

document.querySelectorAll('.sizes button').forEach(button=>{button.addEventListener('click',()=>{document.querySelectorAll('.sizes button').forEach(item=>item.classList.remove('selected'));button.classList.add('selected')})});

let bagCount=0;
const bagCountEl=document.getElementById('bagCount');
document.getElementById('addBag').addEventListener('click',()=>{const selected=document.querySelector('.sizes button.selected');if(!selected){alert('Please select a size first.');return}bagCount=1;bagCountEl.textContent=bagCount;document.getElementById('addBag').innerHTML='ADDED TO BAG ✓';});

document.querySelectorAll('a[href^="#"]').forEach(link=>{link.addEventListener('click',e=>{const target=document.querySelector(link.getAttribute('href'));if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth'})}})});