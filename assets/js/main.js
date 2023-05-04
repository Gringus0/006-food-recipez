let BASE_URL= "https://gringus0.github.io/savoryspot/";
let BASE_IMG = "assets/img/";
var url = document.location.pathname;
let emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
let nameOfRecipeRegEx = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/;
let cookPrepServRegEx = /^(0|[1-9][0-9]?|1[0-9]{2}|2[0-9]{2}|300)$/;
// console.log(url);
window.onload = function(){
    setTimeout(function() {
        var loadingScreen = document.getElementById("loading-screen");
        loadingScreen.style.opacity = "0";
        setTimeout(function() {
          loadingScreen.style.display = "none";
        }, 500);
      }, 1300);
    ajaxCB("menu.json", function(result){
        navigation(result);
    });
    footer();

    if (url == "/savoryspot/" || url == "/savoryspot/index.html") {
        
            ajaxCB("categories.json", function(result){
                addToLS("categoriesJSON", result);
            })
        
    }
    else if(url == "/savoryspot/recipes.html"){
        
        
        createRadio("sortDateAdded", ["sort-date-added-asc", "sort-date-added-desc"], ["Ascending", "Descending"]);
        createRadio("sortCookTime", ["sort-time-asc", "sort-time-desc"], ["Ascending", "Descending"]);
        ajaxCB("categories.json", function(result){
            result.forEach(category => {
                createCheckbox(category.name, category.id);
            });
            addToLS("categoriesJSON", result);
            let categoryCheckboxes = document.querySelectorAll('.category');
            categoryCheckboxes.forEach(function(checkbox) {
                checkbox.addEventListener('change', filterChange);
                
            });
            ajaxCB("recipes.json", function(result){
                let select = document.querySelector("#sort-select");
                let selectedIndex = select.selectedIndex;
                let selectedValue = select.options[selectedIndex].value;
                if(selectedValue == 0){
                    writeCardList(result);
                }
                select.addEventListener("change", filterChange);
                
                sortRecipes(result);

                let favourites = [];
                if(localStorage.getItem("favourites")){
                    favourites = getFromLS("favourites");
                }
                // console.log(favourites);
                

                let heartIcons = document.querySelectorAll('.heart-icon');

                favourites.forEach(favourite => {
                    // console.log(favourite);
                    heartIcons.forEach(heartIcon =>{
                        if(heartIcon.parentElement.nextElementSibling.textContent == favourite.title){
                            heartIcon.classList.replace("fa-regular", "fa-solid");
                        }
                    })
                })

                
                
                heartIcons.forEach(heartIcon => {
                    heartIcon.addEventListener("click", function(){
                        if(heartIcon.classList.contains("fa-regular")){
                            heartIcon.classList.replace("fa-regular", "fa-solid");
                            result.forEach(element => {
                                if(heartIcon.parentElement.nextElementSibling.textContent == element.title){
                                    if(!favourites.includes(element)){
                                        element.favourite = true;
                                        favourites.push(element);
                                        addToLS("favourites", favourites);
                                    }
                                    // console.log(favourites);
                                    
                                }
                            })
                        }
                        else{
                            heartIcon.classList.replace("fa-solid", "fa-regular");
                            result.forEach(element => {
                                if(heartIcon.parentElement.nextElementSibling.textContent == element.title){
                                    favourites = favourites.filter(favourite => favourite.title != element.title);
                                    addToLS("favourites", favourites);
                                    // console.log(favourites);
                                }
                            })
                        }
                        
                    })
                    
                });

                document.querySelector("#my-favourites").addEventListener("click", function(){
                    writeCardList(favourites);
                    document.querySelectorAll(".fa-heart").forEach(heartIcon => {
                        heartIcon.classList.replace("fa-regular", "fa-solid");
                    })
                })
                
            })
            
        })
    
        document.querySelector("#search-bar").addEventListener("keyup", search);

        
        


    }
    else if(url == "/savoryspot/submit-recipe.html"){
        ajaxCB("categories.json", function(result){
            addToLS("categoriesJSON", result);
        })
        let categories = getFromLS("categoriesJSON");
        createDDL("category-select","#inputCategory", "category",  categories);
        document.querySelector("#addCategory").addEventListener("click", function(e){
            e.preventDefault();
            createDDL("category-select", "#inputCategory", "category",  categories);
        })

        let description = document.querySelector("#description");
        let charCount = document.querySelector("#description-counter");

        description.addEventListener("keyup", () => {
            charCount.innerText = `${description.value.length}/100 characters`;
            descriptionValidate();
        });

        
        addInput("#addIngredient", "#inputIngredients", "Apples");
        addInput("#addInstruction", "#inputInstructions", "Chop the apples");
        
        validateOnBlur("#email", emailValidate);
        validateOnBlur("#title", nameOfRecipeValidate);
        validateOnBlur("#description", descriptionValidate);
        validateOnBlur("#cooktime", cookTimeValidate);
        validateOnBlur("#preptime", prepTimeValidate);
        validateOnBlur("#number-of-servings", numOfServingsValidate);
        validateOnBlur(".category-select", categoryInputValidate);
        document.querySelector("#formFile").addEventListener("change", fileValidate);
        

        document.querySelector("#submit-recipe").addEventListener("click", function(e){
            e.preventDefault();
            formValidate();
        })
    }
}

function validateOnBlur(id, func){
    document.querySelector(id).addEventListener("blur", function(){
        func();
    })
}

function emailValidate(){
    checkRegEx("#email", emailRegEx);
}

function nameOfRecipeValidate(){
    checkRegEx("#title", nameOfRecipeRegEx);
}

function descriptionValidate(){
    let descriptionValue = document.querySelector("#description").value;
    if(descriptionValue.length < 50 || descriptionValue.length > 100){
        document.querySelector("#description").parentElement.nextElementSibling.classList.remove("hide");
        document.querySelector(`#description`).classList.add("border-danger");
        document.querySelector(`#description`).classList.remove("border-success");
    }
    else {
        document.querySelector("#description").parentElement.nextElementSibling.classList.add("hide");
        document.querySelector(`#description`).classList.remove("border-danger");
        document.querySelector(`#description`).classList.add("border-success");
    }
}

function cookTimeValidate(){
    checkRegEx("#cooktime", cookPrepServRegEx);
}

function prepTimeValidate(){
    checkRegEx("#preptime", cookPrepServRegEx);
}

function numOfServingsValidate(){
    checkRegEx("#number-of-servings", cookPrepServRegEx);
}

function fileValidate(){
    let fileInput = document.querySelector('#formFile');
    if(fileInput.files.length > 0){
        var fileExtension = getFileExtension(fileInput.files[0].name);
    }
    
    if(fileInput.files != null && fileInput.files.length > 0 && fileExtension == "jpg"){
        fileInput.nextElementSibling.classList.add("hide");
        fileInput.classList.remove("border-danger");
        fileInput.classList.add("border-success");
        
    } 
    else{
        fileInput.nextElementSibling.classList.remove("hide");
        fileInput.classList.add("border-danger");
        fileInput.classList.remove("border-success");
    }
}

function categoryInputValidate(){
    let categorySelect = document.querySelector(".category-select");
    let categorySelectValue = categorySelect.value;
    if(categorySelectValue == 0){
        categorySelect.parentElement.previousElementSibling.classList.remove("hide");
        categorySelect.classList.add("border-danger");
        categorySelect.classList.remove("border-success");
    }
    else{
        categorySelect.parentElement.previousElementSibling.classList.add("hide");
        categorySelect.classList.remove("border-danger");
        categorySelect.classList.add("border-success");
    }
}

function formValidate(){
    emailValidate();
    nameOfRecipeValidate();
    descriptionValidate();
    cookTimeValidate();
    prepTimeValidate();
    numOfServingsValidate();
    fileValidate();
    categoryInputValidate();
    checkIngredientsOrInstructions("#ing1", "#ing2", "#ing3");
    checkIngredientsOrInstructions("#ins1", "#ins2", "#ins3");
}

function search(){
    let input = document.querySelector("#search-bar");
    let filter = input.value.toLowerCase();
    let cards = document.querySelectorAll(".card");
    for(let i = 0; i < cards.length; i++){
        let title = cards[i].querySelector(".card-body").querySelector(".card-title");
        let titleValue = title.textContent;
        let categories = cards[i].querySelector(".card-body").querySelector(".card-categories");
        let categoriesValue = categories.textContent;
        if(titleValue.toLowerCase().indexOf(filter) > -1 || categoriesValue.toLowerCase().indexOf(filter) > -1){
            cards[i].style.display = "";
        }
        else{
            cards[i].style.display = "none";
        }
        
    }
    
}

function checkIngredientsOrInstructions(in1, in2, in3){
    let in1Value = document.querySelector(in1).value;
    let in2Value = document.querySelector(in2).value;
    let in3Value = document.querySelector(in3).value;
    if(in1Value == "" || in2Value == "" || in3Value == ""){
        document.querySelector(in1).parentElement.parentElement.previousElementSibling.classList.remove("hide");
    } 
    else{
        document.querySelector(in1).parentElement.parentElement.previousElementSibling.classList.add("hide");
    }
}

function getFileExtension(filename){
    return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
}

function checkRegEx(elementId, regEx){
    let element = document.querySelector(`${elementId}`)
    let elementValue = element.value;
    if(elementValue == "" || elementValue == null ||  !regEx.test(elementValue)){
        element.nextElementSibling.nextElementSibling.classList.remove("hide");
        element.classList.add("border-danger");
        element.classList.remove("border-success");
    }
    else {
        element.nextElementSibling.nextElementSibling.classList.add("hide");
        element.classList.remove("border-danger");
        element.classList.add("border-success");
    }
}

function writeCardList(array){
    let html = ``;
    array = categoryFilter(array);
    for(let item of array){
        let categoriesJSON = getFromLS("categoriesJSON");
        let categories = [];
        html += `<div class="card m-3" style="width: 18rem;">
                    <div class="image-container">
                        
                        
                        <img src="${BASE_IMG}${item.img.src}" class="card-img-top card-image p-3" alt="${item.img.alt}"/>
                        <div class="center"><a href="#" class="btn btn-primary modal-button" data-bs-toggle="modal" data-bs-target="#modal${item.id}">Check it out!</a></div>
                    </div>
                    
                    <div class="card-body">`
                    categoriesJSON.forEach(category => {
                        item.categoryId.forEach(itemCategoryId => {
                            if(category.id == itemCategoryId){
                                categories.push(category.name);
                            }
                        });
                    })
                    let categoryText = categories.join(", ");
                    html += `
                        <div class="heart-icon-container mb-2 text-center">
                            <i class="fa-regular fa-heart fa-xl heart-icon" style="color: #ff0000;"></i>
                            <i class="fa-solid fa-heart fa-xl heart-icon" style="display: none; color: #ff0000;"></i>
                        </div>
                        <h5 class="card-title">${item.title}</h5>
                        
                        <p class="card-text card-categories">${categoryText}</p>
                        <p class="card-text">Prep time: ${item.prep_time} minutes</p>
                        <p class="card-text">Cook time: ${item.cook_time} minutes</p>
                        <p class="card-text">${item.description}</p>
                    </div>
                </div>`
        let modal = `
        <div class="modal fade p-0" id="modal${item.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">${item.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body row">
                        <div class="col-sm-3">
                            <img src="${BASE_IMG}${item.img.src}" class="col-12" alt="${item.img.alt}"/>
                            <small>Date added: ${item.dateAdded}</small>
                            <p class="mt-2">Prep time: ${item.prep_time} minutes</p>
                            <p class="">Cook time: ${item.cook_time} minutes</p>
                            <p class="">Number of servings: ${item.servings}</p>
                        </div>
                        <div class="col-sm-3">
                            <h6>Ingredients:</h6>`
                            item.ingredients.forEach((ingredient, index) => {
                                modal += `
                                <p class="mb-0">${index+1}) ${ingredient}</p>
                                `
                            })
                        modal +=`
                        </div>
                        <div class="col-sm-3">
                            <h6>Instructions:</h6>`
                            item.instructions.forEach((instruction, index) => {
                                modal += `
                                <p class="mb-0">${index+1}) ${instruction}</p>
                                `
                            })
                        modal += `</div>
                        <div class="col-sm-3">
                            <h6>Nutritional information:</h6>
                            <p class="mb-1">Calories: ${item.nutritional_info.calories}kcal</p>
                            <p class="mb-1">Fat: ${item.nutritional_info.fat}g</p>
                            <p class="mb-1">Carbohydrates: ${item.nutritional_info.carbohydrates}g</p>
                            <p class="mb-1">Protein: ${item.nutritional_info.protein}g</p>
                            <p class="mb-1">Sodium: ${item.nutritional_info.sodium}mg</p>
                        </div>
                        
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        `
        html += modal;
        
        
    }
    document.querySelector("#recipe-list").innerHTML = html;
}

function addToLS(name, data){
    localStorage.setItem(name, JSON.stringify(data));
}

function getFromLS(name){
    return JSON.parse(localStorage.getItem(name));
}

function addInput(divInputId, divButtonId, placeholder){
    document.querySelector(`${divInputId}`).addEventListener("click", function(e){
        e.preventDefault();
        document.querySelector(`${divButtonId}`).innerHTML += `<input type="text" class="form-control mb-1" placeholder="${placeholder}"/>`
    })
}

function createCheckbox(name, id){
    let html = `<div class="form-check">
                <input class="form-check-input category" type="checkbox" value="${id}" id="${name}" name="${name.toLowerCase()}"/>
                <label class="form-check-label" for="${name}">${name}</label>
            </div>`        
    document.querySelector("#filter").innerHTML += html;
}

function createRadio(name, idArray, labelArray){
    let html = ``;
    html += `<div id="${name}" class="hide">`
    for(let i = 0; i < idArray.length; i++){
        html += `<div class="form-check">
                        <input class="form-check-input" type="radio" name="${name}" id="${idArray[i]}" value="${idArray[i]}"/>
                        <label class="form-check-label" for="${idArray[i]}">${labelArray[i]}</label>
                    </div>`         
    }
    html += `</div>`
    document.querySelector("#sort").innerHTML += html;
}

function createDDL(selectClass, divId, listName, array){
    let html = ``;
    html += `<select class="form-select ${selectClass}">
                <option value="0">Choose a ${listName}</option>`
                for(let item of array){
                    html += `<option value="${item.name.toLowerCase()}">${item.name}</option>`
                }

                html += `
            </select>`
    document.querySelector(`${divId}`).innerHTML += html;
}

function sortRecipes(array) {
    let select = document.querySelector('#sort-select');
    let sortDateAdded = document.querySelector('#sortDateAdded');
    let sortCookTime = document.querySelector('#sortCookTime');


    

                





    select.addEventListener('change', () => {
        
        let value = select.value;
    
        
        sortDateAdded.classList.add('hide');
        sortCookTime.classList.add('hide');

        
        if (value === 'dateSort') {
            sortDateAdded.classList.remove('hide');
        } else if (value === 'cookPrepSort') {
            sortCookTime.classList.remove('hide');
        }
    });

    
    let sortDateAddedRadios = document.querySelectorAll('[name="sortDateAdded"]');
    let sortCookTimeRadios = document.querySelectorAll('[name="sortCookTime"]');


    sortDateAddedRadios.forEach(radio => {
        
        radio.addEventListener('change', () => {
            
            let value = radio.value;
        
            
            if (value === 'sort-date-added-asc') {
                array.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                writeCardList(array);
                radio.addEventListener("change", search())
            } else if (value === 'sort-date-added-desc') {
                array.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                writeCardList(array);
                radio.addEventListener("change", search())
            }
        
            favourite(array);
            // console.log(array);
        });
        
    });
    
    sortCookTimeRadios.forEach(radio => {
        
        radio.addEventListener('change', () => {
            
            let value = radio.value;
        
            
            if (value === 'sort-time-asc') {
                array.sort((a, b) => a.cook_time + a.prep_time - b.cook_time - b.prep_time);
                writeCardList(array);
                radio.addEventListener("change", search())
            } else if (value === 'sort-time-desc') {
                array.sort((a, b) => b.cook_time + b.prep_time - a.cook_time - a.prep_time);
                writeCardList(array);
                radio.addEventListener("change", search())
            }
        
            favourite(array);
            // console.log(array);
        });
        
    });
    
    return array;
}

function categoryFilter(array) {
    let checkedCategories = [];
    let categoryCheckboxes = document.querySelectorAll('.category:checked');
    categoryCheckboxes.forEach(function(checkbox) {
      checkedCategories.push(parseInt(checkbox.value));
    });
    if (checkedCategories.length !== 0) {
      return array.filter(function(a) {
        return a.categoryId.some(function(b) {
          return checkedCategories.includes(b);
        });
      });
    }

    return array;
}

function navigation(array){
    let header = document.querySelector("header");
    let html = `<nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="index.html" id="nav-title">SavorySpot</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                            <ul class="navbar-nav ms-auto">`;
        for(let item of array){
            html += `<li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="${item.href}">${item.name}</a>
                    </li>`;
        }
                    html += `</ul>
                            
                        </div>
                    </div>
                </nav>`
    header.innerHTML = html;
}

function footer(){
    let html = `
            <div class="d-flex justify-content-center col-8">
                <p class="m-0">Made by:&nbsp</p>
                <a href="https://gringus0.github.io/002-portfolio-website/" class="text-dark">Aleksandar Jovanović 104/21</a>
                <p class="m-0">&copy Visoka ICT Škola</p>
            </div>
            <div class="col-4 d-flex justify-content-evenly align-items-center">
                <a href="https://twitter.com" target="_blank"><i class="fa-brands fa-twitter" style="color: #000000;"></i></a>
                <a href="https://www.instagram.com" target="_blank"><i class="fa-brands fa-instagram" style="color: #000000;"></i></a>
                <a href="https://www.facebook.com" target="_blank"><i class="fa-brands fa-facebook" style="color: #000000;"></i></a>
                <a href="documentation.pdf" target="_blank"><i class="fa-solid fa-file" style="color: #000000;"></i></a>
                <a href="sitemap.xml" target="_blank"><i class="fa-solid fa-sitemap" style="color: #000000;"></i></a>
            <div>`
    document.querySelector("footer").innerHTML = html;
}

function filterChange(){
    ajaxCB("recipes.json", function(result){
        writeCardList(result);
        search();

        favourite(result);

        
    })
}

function favourite(array){
    let favourites = [];
    if(localStorage.getItem("favourites")){
        favourites = getFromLS("favourites");
    }
    // console.log(favourites);
    

    let heartIcons = document.querySelectorAll('.heart-icon');

    favourites.forEach(favourite => {
        // console.log(favourite);
        heartIcons.forEach(heartIcon =>{
            if(heartIcon.parentElement.nextElementSibling.textContent == favourite.title){
                heartIcon.classList.replace("fa-regular", "fa-solid");
            }
        })
    })

    
    
    heartIcons.forEach(heartIcon => {
        heartIcon.addEventListener("click", function(){
            if(heartIcon.classList.contains("fa-regular")){
                heartIcon.classList.replace("fa-regular", "fa-solid");
                array.forEach(element => {
                    if(heartIcon.parentElement.nextElementSibling.textContent == element.title){
                        if(!favourites.includes(element)){
                            element.favourite = true;
                            favourites.push(element);
                            addToLS("favourites", favourites);
                        }
                        console.log(favourites);
                        
                    }
                })
            }
            else{
                heartIcon.classList.replace("fa-solid", "fa-regular");
                array.forEach(element => {
                    if(heartIcon.parentElement.nextElementSibling.textContent == element.title){
                        favourites = favourites.filter(favourite => favourite.title != element.title);
                        addToLS("favourites", favourites);
                        console.log(favourites);
                    }
                })
            }
            
        })
        
    });
}

function ajaxCB(file, result){
    $.ajax({
        url: "assets/data/json/" + file,
        method: "get",
        dataType: "json",
        success: result,
        error: function(xhr, exception){
            console.error(xhr);
            msg = "";
            if(xhr.status === 0){
                msg = "Not connected.";
            }
            else if(xhr.status == 404){
                msg = 'Requested page not found. [404]';
            }
            else if (xhr.status == 500) {
                msg = 'Internal Server Error [500].';
            } 
            else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } 
            else if (exception === 'timeout') {
                msg = 'Timeout error.';
            } 
            else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } 
            else {
                msg = 'Uncaught Error.\n' + xhr.responseText;
            }
            
        }
    })
}