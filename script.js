let pizzaData = pizzaJson;
let cart = [];

let pizzaQt = 1;
let selectedPizza = '';

const PIZZA_DEFAULT_SIZE_INDEX = '2';
const DISCOUNT_RATE = 0.1;

const s = (el)=>document.querySelector(el);
const sa = (el)=>document.querySelectorAll(el);

/*
*
Pizza list init 
*
*/

pizzaData.map((i,k) => { 
	const pizzaItem = s('.models .pizza-item').cloneNode(true);

	pizzaItem.setAttribute('data-key', k);

	pizzaItem.querySelector('.pizza-item--img img').src = i.img;
	pizzaItem.querySelector('.pizza-item--name').innerHTML = i.name;
	pizzaItem.querySelector('.pizza-item--desc').innerHTML = i.description;

	const price = getPizzaPrice(i.id, PIZZA_DEFAULT_SIZE_INDEX);
	pizzaItem.querySelector('.pizza-item--price').innerHTML = "R$ "+price;

	pizzaItem.querySelector('a').addEventListener('click', (e)=>{
		e.preventDefault();

		const pizzaKey = e.target.closest('.pizza-item').getAttribute('data-key');

		selectedPizza = pizzaData[pizzaKey];
		pizzaQt = 1;
		 

		const modalWindow = s('.pizzaWindowArea');

		modalWindow.querySelector('.pizzaBig img').src = selectedPizza.img;
		modalWindow.querySelector('.pizzaInfo h2').innerHTML = selectedPizza.name;
		modalWindow.querySelector('.pizzaInfo--desc').innerHTML = selectedPizza.description;
		modalWindow.querySelector('.pizzaInfo--actualPrice').innerHTML = "R$ "+
		getPizzaPrice(i.id, PIZZA_DEFAULT_SIZE_INDEX);

		resetModalItems();
		openModal();
	});
	s('.pizza-area').append(pizzaItem);
});

sa('.pizzaInfo--cancelMobileButton, .pizzaInfo--cancelButton').forEach((item) => {
	item.addEventListener('click', closeModal);
});




/*
*
Utility methods
*
*/
function getPizzaSizeName(size){

		switch(size){
				case '0':
					return 'B';
					break;
				case '1':
					return 'P';
					break;
				case '2':
					return 'M';
					break;
				case '3':
					return 'G'
			}
		return '';
}

function getPizzaPrice(id, size){

	const pizza = pizzaData.find(pizza=>pizza.id == id);

	switch(size){
				case '0':
					return pizza.price['broto'].toFixed(2);
					break;
				case '1':
					return pizza.price['pequena'].toFixed(2);
					break;
				case '2':
					return pizza.price['media'].toFixed(2);
					break;
				case '3':
					return pizza.price['grande'].toFixed(2);
					break;
				default:
					return '';
			}

}

/*
*
*Window events
*
*/

window.onscroll = function(){ 
	
	if(window.scrollY > 200){ 
		s('.top-bar').classList.add('top-bar--fixed');
	}
	else{
		s('.top-bar').classList.remove('top-bar--fixed');
	}

}  


/*
*
Modal Events and methods
*
*/
s('.pizzaInfo--qtmenos').addEventListener('click', ()=>{
	if(pizzaQt > 1){
		pizzaQt--;
		s('.pizzaWindowArea .pizzaInfo--qt').innerHTML = pizzaQt;
	}
});

s('.pizzaInfo--qtmais').addEventListener('click', ()=>{
	pizzaQt++;
	s('.pizzaWindowArea .pizzaInfo--qt').innerHTML = pizzaQt;
});

sa('.pizzaWindowArea .pizzaInfo--size').forEach((pizzaSize)=>{
	pizzaSize.addEventListener('click', (e)=>{
		s('.pizzaWindowArea .pizzaInfo--size.selected')?.classList.remove('selected');
		pizzaSize.classList.add('selected');

		const sizeId = e.target.getAttribute('data-key');
		s('.pizzaWindowArea .pizzaInfo--actualPrice').innerHTML = "R$ "+getPizzaPrice(selectedPizza.id, sizeId);;
	});
});

s('.pizzaInfo--addButton').addEventListener('click', ()=>{
	
	const id = selectedPizza.id;
	const size = s('.pizzaWindowArea .pizzaInfo--size.selected').getAttribute('data-key');

	const identifier = id+'@'+size;

	const itemIndex = cart.findIndex((item)=>item.identifier === identifier);
	if(itemIndex > -1){
		cart[itemIndex].qt += pizzaQt;
	}else{
		cart.push({
			identifier,
			id,
			size,
			qt: pizzaQt
		});
	}
	closeModal();
	updateCart();
	window.scrollTo(0,0);
});

s('.menu-openner').addEventListener('click', ()=>{
	if(cart.length > 0)
		s('aside').style.left = '0vw';
});

s('.menu-closer').addEventListener('click', ()=>{
	s('aside').style.left = '100vw';
});


s('.purchaseSuccessModal').addEventListener('click', (e)=>{
	s('.purchaseSuccessModal').style.display = 'none';
	document.body.style.overflowY = 'auto'; 
});



function closeModal(){
	const modal = s('.pizzaWindowArea');
	modal.style.opacity = 0;
	setTimeout(() => {
		modal.style.display = 'none';
	}, 200);
	document.body.style.overflow = 'auto';
}

function openModal(){
	const modal = s('.pizzaWindowArea');
	modal.style.opacity = 0.5;
	modal.style.display = 'flex';
	setTimeout(()=>{
		modal.style.opacity = 1
	}, 200);
	document.body.style.overflow = 'hidden';
}

//put the size and qt of pizza to default values
function resetModalItems(){
	
	const modal = s('.pizzaWindowArea');
	modal.querySelector('.pizzaInfo--qt').innerHTML = pizzaQt;
	modal.querySelector('.pizzaInfo--size.selected')?.classList.remove('selected');
	modal.querySelectorAll('.pizzaInfo--size')[PIZZA_DEFAULT_SIZE_INDEX]?.classList.add('selected');

}


/*
*
Cart Events and methods
*
*/


s('.cart--finalize').addEventListener('click', ()=>{
		s('.purchaseSuccessModal').style.display = 'flex';
		document.body.style.overflowY = 'hidden'; 
		finalizePurchase();
});

function finalizePurchase(){
	cart = [];
	updateCart();	
}

function updateCart(){

	let discount = 0;
	let subtotal = 0;
	let total = 0;

	s('.menu-openner span').innerHTML = cart.length;

	if(cart.length > 0){
		s('aside').classList.add('show');
	}else{
		s('aside').classList.remove('show');
		s('aside').style.left = '100vw';

	}
	s('.cart--area .cart').innerHTML = '';

	//Append each cart-item in the cart area
	for(let i in cart){

		//Get the data of selected pizza from the list
		const pizza = pizzaData.find(pizza=>pizza.id === cart[i].id);

		const cartItem = s('.cart--item').cloneNode(true);
		const pizzaPrice = getPizzaPrice(cart[i].id, cart[i].size);

		subtotal += pizzaPrice * cart[i].qt;

		let pizzaSize = getPizzaSizeName(cart[i].size);
		const pizzaDesc = `${pizza.name} (${pizzaSize})`; 

		cartItem.querySelector('img').src = pizza.img;
		cartItem.querySelector('.cart--item-nome').innerHTML = pizzaDesc;
		cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;

		//Add event click
		cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', ()=>{

			if(cart[i].qt > 1){
				cart[i].qt--; 
				cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
			}else{
				cart.splice(i, 1);
			}
			updateCart();
		});
		cartItem.querySelector('.cart--item-qtmais').addEventListener('click', ()=>{
			
			cart[i].qt++; 
			cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
			updateCart();		
		});

		;

		s('.cart--area .cart').append(cartItem);
	}

	discount = subtotal * DISCOUNT_RATE;
	total = subtotal - discount;

	s('.cart--area .subtotal span:last-child').innerHTML = `R$ ${subtotal.toFixed(2)}`;	
	s('.cart--area .desconto span:last-child').innerHTML = `R$ ${discount.toFixed(2)}`;
	s('.cart--area .total span:last-child').innerHTML = `R$ ${total.toFixed(2)}`;
}
