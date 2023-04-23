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
            const productTemplate = document.querySelector('.product-template');
            const productImg = productTemplate.content.querySelector('.product-img');
            const productTitle = productTemplate.content.querySelector('.product-title');
            const productPrice = productTemplate.content.querySelector('.product-price');
            const productBrand = productTemplate.content.querySelector('.product-brand');

            productImg.src = product.image;
            productImg.alt = product.title;
            productImg.id = product.id;
            productTitle.textContent = product.title;
            productPrice.textContent = '$' + product.regular_price.value;
            productBrand.textContent = 'Brand ' + product.brand;

            const newCard = productTemplate.content.cloneNode(true);

            // //Навешивание eventListener на кнопку купить каждой карточки
            const buyBtn = newCard.querySelector('.add-btn');
            buyBtn.addEventListener('click', (e) => {
                let imgPath = e.target.parentNode.querySelector('.product-img').src;
                let imgPathArr = imgPath.split('/')
                let imgPathArrLength = imgPathArr.length
                let price =  e.target.parentNode.querySelector('.product-price').textContent;

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
let cart;
let cartTotalAmount;     //количество товаров в корзине
let cartTotalSum;        //общая стоимость корзины
let uniqueCartItemsIds;

//Сохранение кол-ва и набранной корзины в LocalStorage

//Обновление корзины после удаления товара
function updateFromLocalStorage() {
    if (!localStorage["items"]) {
        //создание пустого LocalStorage если его нет
        localStorage.setItem('items', []);
        localStorage.setItem("uniqueIdsInCart", []);
        uniqueCartItemsIds = [];
        cart = [];
    }   else {
        //восстановление переменных из LocalStorage
        cart = JSON.parse(localStorage["items"]);
        // cartTotalAmount = cartTotal()[0]; //////////?? обратить внимание
        uniqueCartItemsIds = JSON.parse(localStorage["uniqueIdsInCart"]);
    }
}

updateFromLocalStorage();

//////////////////////////////Итого По Корзине///////////////////////////
function cartTotal() {
    cartTotalAmount = 0;
    cartTotalSum = 0;
    cart.map((item) => {
        cartTotalAmount = cartTotalAmount + item.amount;
        cartTotalSum = cartTotalSum + (item.amount * item.regular_price);
    })
    let iconCart = document.querySelector('.cart-totals');
    iconCart.innerHTML = cartTotalAmount;
}

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

    cartTotal();

    localStorage["items"] = JSON.stringify(cart);
    localStorage["uniqueIdsInCart"] = JSON.stringify(uniqueCartItemsIds);
    let items = JSON.parse(localStorage["items"]); 
}

///////////////////Cart page//////////////////////////////////////////
// let cartTotalSum = 0;    //суммарная стоимость всех

//проверка наличия товаров в localStorage и что мы на странице корзины
if (localStorage["items"] && document.querySelector('.cart-page')) {

    const cartContainer = document.querySelector('.cart-container');
    let items = JSON.parse(localStorage["items"]);

    function renderCartItem() {
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
                    <span class="cart-item__amount">${items[i].amount}</span>
                    <button class="increase-btn" type="button">+</button>
                    <button class="delete-btn" type="button">x</button>
                </div>
                <div class="cart-item__total">
                    
                    <span>$${itemTotalSum.toFixed(2)}</span>
                </div>  
            `
            newItem.innerHTML = cartItemLayout;
            cartContainer.appendChild(newItem);
        }
        cartTotal()
        outputCartTotal(cartTotalAmount, cartTotalSum);
    }

    renderCartItem();

    function changeCartItemAmount(cart) {
        let cartItems = document.querySelectorAll('.cart-item');
        cartItems.forEach((item) => {
            let increaseBtn = item.querySelector('.increase-btn');
            let decreaseBtn = item.querySelector('.decrease-btn');
            let itemTitle = item.querySelector('.cart-item__title span').textContent;
            increaseBtn.addEventListener('click', (e) => {
                for (var i = 0 ; i < cart.length; i++) {
                    if (itemTitle === cart[i].title) {
                        cart[i].amount = cart[i].amount + 1;
                        e.target.parentNode.querySelector("span").textContent = cart[i].amount;
                        e.target.parentNode.parentNode.querySelector(".cart-item__total span").textContent = '$'+cart[i].amount * cart[i].regular_price;

                        let tempArr = JSON.parse(localStorage['items']);
                        tempArr.map((item) => {
                            if (item.id.toString() === cart[i].id.toString()) {
                                item.amount = cart[i].amount;
                            }
                        })
                        localStorage["items"] = JSON.stringify(tempArr);
                    }
                }

                updateFromLocalStorage(); //а тут из локал стор обновляем cart
                cartTotal(); // оно работает с переменной корзины (cart)
                outputCartTotal(cartTotalAmount, cartTotalSum); //отображение в верстке

            })
            decreaseBtn.addEventListener('click', (e) => {
                for (var i = 0 ; i < cart.length; i++) {
                    if (itemTitle === cart[i].title) {
                        e.target.parentNode.querySelector("span").textContent = cart[i].amount;
                        e.target.parentNode.parentNode.querySelector(".cart-item__total span").textContent = '$'+cart[i].amount * cart[i].regular_price;
                        
                        if (cart[i].amount === 1) {
                            removeCartItemView(e.target.parentNode.parentNode);
                            console.log(e.target.parentNode.parentNode);

                        } else {
                            cart[i].amount = cart[i].amount - 1;

                            let tempArr = JSON.parse(localStorage['items']);
                            tempArr.map((item) => {
                                if (item.id.toString() === cart[i].id.toString()) {
                                    item.amount = cart[i].amount;
                                }
                            })
                            localStorage["items"] = JSON.stringify(tempArr);
                        }     
                    }
                }
                
                updateFromLocalStorage(); //а тут из локал стор обновляем cart
                cartTotal(); // оно работает с переменной корзины (cart)
                outputCartTotal(cartTotalAmount, cartTotalSum); //отображение в верстке
            })
        })
    } 

    changeCartItemAmount(items);

    let cartItems = document.querySelectorAll('.cart-item');
    cartItems.forEach((item) => {
        let removeItemBtn = item.querySelector('.delete-btn');
        let removedItem;
        removeItemBtn.addEventListener('click', (e) => {
            removeCartItemView(e.target.parentNode.parentNode);
            removedItem = e.target.parentNode.parentNode;
            let removedItemTitle = removedItem.querySelector('.cart-item__title span').textContent;
            removeCartItemData(removedItemTitle);
            cartTotal();

            outputCartTotal(cartTotalAmount, cartTotalSum);
        });
    })

    //удаляет товар из корзины из localStorage  
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

    //очистка корзины, удаление количества в киокнке корзины, удаление товаров из разметки 
    function clearCart() {
        cart = [];
        localStorage.clear();
        cartTotal();
        cartContainer.innerHTML = '';
        outputCartTotal(cartTotalAmount, cartTotalSum); // или лучше в кнопку clearCartBtn ??
    }

    let clearCartBtn = document.querySelector('.clearcart-btn');
        if(clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
            clearCart();
        })
    }

    //выводит итог Корзины
    function outputCartTotal(amount, sum) {
        let cartItemsAmount = document.querySelector('.cart-products__amount');
        cartItemsAmount.innerHTML = `Your order is: ${amount} items`;
        let cartSum = document.querySelector('.cart-products__sum');
        cartSum.innerHTML = `Total sum: $${sum.toFixed(2)}`;
    } 
}