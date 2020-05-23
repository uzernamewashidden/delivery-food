'use strict';

const buttonAuth = document.querySelector('.button-auth'),
  modalAuth = document.querySelector('.modal-auth'),
  closeAuth = document.querySelector('.close-auth'),
  cartButton = document.querySelector('#cart-button'),
  modal = document.querySelector('.modal'),
  close = document.querySelector('.close'),
  logInForm = document.querySelector('#logInForm'),
  loginInput = document.querySelector('#login'),
  userName = document.querySelector('.user-name'),
  buttonOut = document.querySelector('.button-out'),
  cardsResraurants = document.querySelector('.cards-restaurants'),
  containerPromo = document.querySelector('.container-promo'),
  restaurants = document.querySelector('.restaurants'),
  menu = document.querySelector('.menu'),
  logo = document.querySelector('.logo'),
  cardsMenu = document.querySelector('.cards-menu'),
  listCart = document.querySelector('.modal-body'),
  modalPrice = document.querySelector('.modal-pricetag'),
  buttonClearCart = document.querySelector('.clear-cart'),
  restaurantTitle = document.querySelector('.restaurant-title'),
  rating = document.querySelector('.rating'),
  minPrice = document.querySelector('.price'),
  category = document.querySelector('.category');

let login = localStorage.getItem('login');

const cart = [];

const valid = (str) => {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};

const getData = async function(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Ошибка по адресу ${url}, статус ошибки ${response.status}!');
  }

  return await response.json();
};

const toggleModal = () => {
  modal.classList.toggle('is-open');
};

const toggleModalAuth = () => {
  loginInput.style.borderColor = '';
  modalAuth.classList.toggle('is-open');
};

const returnMain = () => {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
};

const authorized = () => {

  const logOut = () => {
    login = null;
    localStorage.removeItem('login');   

    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';

    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  };

  userName.textContent = login;

  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';

  buttonOut.addEventListener('click', logOut);

}

const notAuthorized = () => {

  const logIn = (event) => {
    event.preventDefault();
    
    if (valid(loginInput.value)) {
      login = loginInput.value.trim();
      localStorage.setItem('login', login);

      toggleModalAuth();

      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
    
      logInForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderColor = 'red';
      loginInput.value = '';
    }
  };

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
};

const checkAuth = () => login ? authorized() : notAuthorized();


const createCardRestaurant = restaurant => {
  const { image, kitchen, name, price, stars, products, time_of_delivery: timeOfDelivery } = restaurant;

  const card = `
  <a href="#" class="card card-restaurant" 
  data-products="${products}" data-info="${[name, price, stars, kitchen]}">
    <img src="${image}" alt="${name}" class="card-image"/>

    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title">${name}</h3>
        <span class="card-tag tag">${timeOfDelivery} мин</span>
    </div>

    <div class="card-info">
      <div class="rating">
      ${stars}
      </div>
      <div class="price">От ${price} ₽</div>
      <div class="category">${kitchen}</div>
    </div>

    </div>
  </a>
  `;

  cardsResraurants.insertAdjacentHTML('beforeend', card);
};

const createCardGood = (goods) => {
  const { description, id, image, name, price } = goods;
  const card = document.createElement('div');
  card.className = 'card';
  card.id = id;

  card.innerHTML = `
      <img src="${image}" alt="${name}" class="card-image"/>
      <div class="card-text">
        <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>

      <div class="card-info">
        <div class="ingredients">${description}</div>
      </div>

      <div class="card-buttons">
        <button class="button button-primary button-add-cart">
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price card-price-bold">${price} ₽</strong>
      </div>
    </div>
  `;

  cardsMenu.insertAdjacentElement('beforeend', card);
};

const openGoods = (event) => {
  const target = event.target,
    restaurant = target.closest('.card-restaurant');

  if (restaurant) {
    if (login) {
      const info = restaurant.dataset.info.split(',');
      const [ name, price, stars, kitchen ] = info;

      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      restaurantTitle.textContent = name;
      rating.textContent = stars;
      minPrice.textContent = `От ${price} ₽`;
      category.textContent = kitchen;

      getData(`./db/${restaurant.dataset.products}`).then(data => {
        data.forEach(createCardGood);
      });
    } else {
      toggleModalAuth();
    }
    
  }  
};

const addToCart = (event) => {
  const target = event.target;
  console.log(target);
  const buttonAddToCart = target.closest('.button-add-cart');

  if (buttonAddToCart) {
    const card = target.closest('.card'),
      title = card.querySelector('.card-title-reg').textContent,
      cost = card.querySelector('.card-price').textContent,
      id = card.id;

    const food = cart.find(item => item.id === id);

    if (food) {
      food.count += 1;
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1
      });
    }
  }
};

const renderCart = () => {
  listCart.textContent = '';

  cart.forEach(({ id, title, cost, count }) => {
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id=${id}>-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id=${id}>+</button>
        </div>
      </div>
    `;

    listCart.insertAdjacentHTML('afterbegin', itemCart);
  });

  const totalPrice = cart.reduce((res, item) => {
    return res + (parseFloat(item.cost) * item.count);
  }, 0);

  modalPrice.textContent = totalPrice + ' ₽';
};

// Изменить количество товаров в корзине
const changeCount = (event) => {
  const target = event.target;

  if (target.classList.contains('counter-button')) {
    const food = cart.find(item => {
      return item.id === target.dataset.id;
    });

    if (target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    }

    if (target.classList.contains('counter-plus')) food.count++;
    renderCart();
  }
};

const init = () => {

  getData('./db/partners.json').then(function(data){
    data.forEach(createCardRestaurant);
  });

  cartButton.addEventListener('click', () => {
    renderCart();
    toggleModal();
  });

  buttonClearCart.addEventListener('click', () => {
    cart.length = 0;
    renderCart();
  });

  listCart.addEventListener('click', changeCount);

  cardsMenu.addEventListener('click', addToCart);

  close.addEventListener('click', toggleModal);

  cardsResraurants.addEventListener('click', openGoods); 

  logo.addEventListener('click', function() {
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
  });

  checkAuth();


  // swiper init
  new Swiper('.swiper-container', {
    loop: true,
    autoplay: true
  });
};

init();