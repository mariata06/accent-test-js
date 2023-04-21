import data from '../products.json' assert { type: "json" };

//Для страницы Товаров
if(document.querySelector('.product-list')) {
    //Activate Filter
    function renderFilter(brands_array) {
        const brandList = document.querySelector('.brand-list');

        for (const brand of brands_array) {
            const brandItem = document.querySelector('.brand-item');
            const brandLabel = brandItem.content.querySelector('.brand-title');
            const brandInput = brandItem.content.querySelector('.checkbox');

            brandLabel.textContent = brand.title;
            brandLabel.htmlFor = brand.code;
            brandInput.id = brand.id;
            brandInput.name = brand.code;

            const newBrand = brandItem.content.cloneNode(true);
            brandList.appendChild(newBrand);
        } 
    }

    async function getFilterData() {
        const requestURL = 'brands.json';
        const request = new Request(requestURL);

        const response = await fetch(request);
        const brands = await response.json();
        renderFilter(brands);
    }

    getFilterData();

    //Checked Brands and render New card items
    function getCheckedBrands() {
        let brandCheckbox = document.querySelectorAll('.checkbox');
        let brandChecked = [];
        
        for (let i = 0; i < brandCheckbox.length; i++) {
            if (brandCheckbox[i].checked) {
                brandChecked.push(brandCheckbox[i].id);
            }
        }
    return brandChecked;
    }

    //проверка чекнутых чекбоксов и ререндеринга карточек товаров
    function productsUpdate() {
        let checkedBrandsIds = getCheckedBrands();

        if(checkedBrandsIds.length === 0) {
            dataChecked = data;
        } else {
            dataChecked = data.filter((d) => checkedBrandsIds.includes(d.brand.toString()));
        }

        //обновление кол-ва страниц при изменении фильтрации (dataChecked)
        numberOfPages = Math.ceil(dataChecked.length / itemsPerPage)
        renderCards(paginate(dataChecked, itemsPerPage)[0]);
    }

    //применение фильтрации брендов (выделенных чекбоксов)
    const filterBtn = document.querySelector('.filter-btn');

    filterBtn.addEventListener('click', () => {
        productsUpdate();
    })

    //сброс фильтров
    const clearFilterBtn = document.querySelector('.clear-btn');

    clearFilterBtn.addEventListener('click', () => {
        let brandCheckbox = document.querySelectorAll('.checkbox');

        for (let i = 0; i < brandCheckbox.length; i++) {
            if (brandCheckbox[i].checked) {
                brandCheckbox[i].checked = false;
            }
        }
        productsUpdate();
    })

    //Pagination products by 6 items
    const paginate = (products, itemsPerPage) => {
        const pages = Math.ceil(products.length / itemsPerPage);
        const newProducts = Array.from({ length: pages }, (_, index) => {
            const start = index * itemsPerPage;
            return products.slice(start, start + itemsPerPage)
        })
        return newProducts 
    }

    let dataChecked = data
    let pageNumber = 0;
    const itemsPerPage = 6;

    let numberOfPages = Math.ceil(dataChecked.length / itemsPerPage);

    function renderCards(products_array) {
        const productList = document.querySelector('.product-list');
        productList.innerHTML = '';
        
        for (const product of products_array) {
            const productCard = document.querySelector('.product-card');
            const productImg = productCard.content.querySelector('.product-img');
            const productTitle = productCard.content.querySelector('.product-title');
            const productPrice = productCard.content.querySelector('.product-price');
            const productBrand = productCard.content.querySelector('.product-brand');

            productImg.src = product.image;
            productImg.alt = product.title;
            productImg.id = product.id;
            productTitle.textContent = product.title;
            productPrice.textContent = '$' + product.regular_price.value;
            productBrand.textContent = 'Brand ' + product.brand;

            const newCard = productCard.content.cloneNode(true);

            //Навешивание eventListener на кнопку купить каждой карточки
            const buyButton = newCard.querySelector('.add-btn');
            console.log(buyButton)
            buyButton.addEventListener('click', (e) => {
                let imgPath = e.target.parentNode.querySelector('.product-img').src;
                let imgPathArr = imgPath.split('/')
                let imgPathArrLength = imgPathArr.length

                let price =  e.target.parentNode.querySelector('.product-price').textContent;
                // console.log(price.split('$')[1])

                let cartItem = {
                    "id": e.target.parentNode.querySelector('.product-img').id,
                    "title": e.target.parentNode.querySelector('.product-title').textContent,
                    "regular_price": price.split('$')[1],
                    "image": '/'+imgPathArr[imgPathArrLength-2]+'/'+imgPathArr[imgPathArrLength-1],
                    "brand": e.target.parentNode.querySelector('.product-brand').textContent,
                    "amount": 1
                }

                addToCart(cartItem); 
            })

            productList.appendChild(newCard);
        } 
    }

    renderCards(paginate(dataChecked, itemsPerPage)[pageNumber]);

    // Add event listeners to the prev button
    const prevPage2 = document.querySelector('.prev');
    prevPage2.addEventListener('click', (e) => {
        e.preventDefault();

        if (pageNumber > 0) {
            pageNumber--;
            renderCards(paginate(dataChecked, itemsPerPage)[pageNumber]);
        }
    });

    // Add event listeners to the next button
    const nextPage2 = document.querySelector(".next");
    nextPage2.addEventListener("click", (e) => {
        e.preventDefault();
        
        if (pageNumber < numberOfPages - 1) {
            pageNumber++;
            renderCards(paginate(dataChecked, itemsPerPage)[pageNumber]);
        }
    });
}

//Activate Cart
// const addBtns = document.querySelectorAll('.add-btn');

let cart;
let cartTotalAmount; //кол-во
let uniqueCartItemsIds;

//Сохранение кол-ва и набранной корзины в LocalStorage

//Обновление корзины после удаления товара
if (!localStorage["items"]) {
    //создание пустого LocalStorage если его нет
    localStorage.setItem('items', []);
    localStorage.setItem("uniqueIdsInCart", []);
    uniqueCartItemsIds = [];
    cart = [];
}   else {
    //восстановление переменных из LocalStorage
    cart = JSON.parse(localStorage["items"]);
    cartTotalAmount = countTotalAmount();
    uniqueCartItemsIds = JSON.parse(localStorage["uniqueIdsInCart"]);
}


function countTotalAmount() {
    cartTotalAmount = 0;
    cart.map((item) => {
        cartTotalAmount = cartTotalAmount + item.amount;
    })

    let iconCart = document.querySelector('.cart-totals');
    iconCart.innerHTML = cartTotalAmount;
}

let rez = countTotalAmount();
console.log(rez);

function addToCart(addedProduct) {
    // увеличение количества если такой товар уже есть в корзине
    if (uniqueCartItemsIds.includes(addedProduct.id)) {
        cart.map((item) => {
            if(item.id === addedProduct.id) {
                item.amount += 1;
            }
        });
    } else {
        // а если в корзине нет этого товара (addedProduct), добавляем его
        cart.push(addedProduct); 
        // сбор уинкальных id товаров в корзине (без повторов id)
        uniqueCartItemsIds.push(addedProduct.id);
    }

    countTotalAmount();

    localStorage["items"] = JSON.stringify(cart);
    localStorage["uniqueIdsInCart"] = JSON.stringify(uniqueCartItemsIds);
    let items = JSON.parse(localStorage["items"]); 
    console.log(items);
}

function clearCart() {
    cart = [];
    localStorage.clear();
    countTotalAmount();
    cartTotalSum = 0;
    removeCartItemView();
}

let clearCartBtn = document.querySelector('.clearcart-btn');
    if(clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
        clearCart();
    })
}

///////////////////Cart page
// let cartTotalSum = 0;    //суммарная стоимость всех

//проверка наличия товаров в localStorage и что мы на странице корзины
if (localStorage["items"] && document.querySelector('.cart-page')) {

    const cartContainer = document.querySelector('.cart-container');
    let items = JSON.parse(localStorage["items"]);

    function renderCartItem() {
        let cartTotalSum = 0;
        for (let i = 0; i < items.length; i++) {
            const newItem = document.createElement('div');
            newItem.classList.add('cart-item');
            
            let itemTotalSum = items[i].regular_price * items[i].amount;
            let cartItemLayout = '';
            cartItemLayout = `
                <div class="cart-item__title">
                    <img src="${items[i].image}">
                    <span>${items[i].title}</span>
                </div>
                <div>
                    <span>$${items[i].regular_price}</span>
                </div>
                <div class="cart-item__btns">
                    <button class="decrease-btn" type="button">-</button>
                    <span>${items[i].amount}</span>
                    <button class="increase-btn" type="button">+</button>
                    <button class="delete-btn" type="button">x</button>
                </div>
                <div class="cart-item__total">
                    <span>$${itemTotalSum.toFixed(2)}</span>
                </div>  
            `
            newItem.innerHTML = cartItemLayout;
            cartContainer.appendChild(newItem);
            cartTotalSum = cartTotalSum + itemTotalSum;
            console.log(cartTotalSum);
        }
        let cartSum = document.querySelector('.cart-products__sum');
        cartSum.innerHTML = `Total sum: $${cartTotalSum.toFixed(2)}`
    }

    renderCartItem();

    let cartItemsAmount = document.querySelector('.cart-products__amount');
    cartItemsAmount.innerHTML = `Your order is: ${cartTotalAmount} items`;

    let cartItems = document.querySelectorAll('.cart-item');
    cartItems.forEach((item) => {
        let removeItemBtn = item.querySelector('.delete-btn');
        removeItemBtn.addEventListener('click', (e) => {
            removeCartItemView(e.target.parentNode.parentNode);
            let removedItem = e.target.parentNode.parentNode;
            let removedItemTitle = removedItem.querySelector('.cart-item__title span').textContent;
            removeCartItemData(removedItemTitle);
            countTotalAmount();
        });
    })

    function removeCartItemData(title) {
        // нахожу id удаленного товара по СТАРОЙ(!) корзине
        let removedItemId;
        cart.map((item) => {
            if (item.title === title) {
                removedItemId = item.id
            }
        })
        
        // обновляем переменные корзины и массив уникальных id товаров
        let newCart = cart.filter((item) => item.id !== removedItemId) 
        cart = newCart
        let newUniqueIds = uniqueCartItemsIds.filter((id) => id !== removedItemId);
        uniqueCartItemsIds = newUniqueIds
        
        // обновляем по ним localStorage
        localStorage.setItem('items', JSON.stringify(cart));
        localStorage.setItem('uniqueIdsInCart', JSON.stringify(uniqueCartItemsIds));
    }

    function removeCartItemView(item) {
        cartContainer.removeChild(item);
    }
}