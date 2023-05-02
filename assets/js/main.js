const BASE_URL= "https://gringus0.github.io/savoryspot/";
const BASE_IMG = "assets/img/";
var url = document.location.pathname;
console.log(url);
// let categories =  getFromLS("");
window.onload = function(){
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
        ajaxCB("recipes.json", function(result){
            let select = document.querySelector("#sort-select");
            let selectedIndex = select.selectedIndex;
            let selectedValue = select.options[selectedIndex].value;
            if(selectedValue == 0){
                writeCardList(result);
            }
            sortRecipes(result);
        })
        
        createRadio("sortDateAdded", ["sort-date-added-asc", "sort-date-added-desc"], ["Ascending", "Descending"]);
        createRadio("sortCookTime", ["sort-time-asc", "sort-time-desc"], ["Ascending", "Descending"])
        ajaxCB("categories.json", function(result){
            result.forEach(category => {
                createCheckbox(category.name, category.id);
            });
            addToLS("categoriesJSON", result);
            const categoryCheckboxes = document.querySelectorAll('.category');
            categoryCheckboxes.forEach(function(checkbox) {
                checkbox.addEventListener('change', filterChange);
            });
        })
        
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
        
        addInput("#addIngredient", "#inputIngredients", "Apples");
        addInput("#addInstruction", "#inputInstructions", "Chop the apples");
        
        let emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        let nameOfRecipeRegEx = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/;
        let cookPrepServRegEx = /^(0|[1-9][0-9]?|1[0-9]{2}|2[0-9]{2}|300)$/


        
        document.querySelector("#submit-recipe").addEventListener("click", function(e){
            e.preventDefault();
            checkRegEx("#email", emailRegEx);
            checkRegEx("#title", nameOfRecipeRegEx);
            let descriptionValue = document.querySelector("#description").value;
            if(descriptionValue.length < 50){
                document.querySelector("#description").nextElementSibling.nextElementSibling.classList.remove("hide");
            }
            else {
                document.querySelector("#description").nextElementSibling.nextElementSibling.classList.add("hide");
            }
            checkRegEx("#cooktime", cookPrepServRegEx);
            checkRegEx("#preptime", cookPrepServRegEx);
            checkRegEx("#number-of-servings", cookPrepServRegEx);

            
            let fileInput = document.querySelector('#formFile');
            if(fileInput.files.length > 0){
                var fileExtension = getFileExtension(fileInput.files[0].name);
            }
            
            if(fileInput.files != null && fileInput.files.length > 0 && fileExtension == "jpg"){
                fileInput.nextElementSibling.classList.add("hide");
            } 
            else{
                fileInput.nextElementSibling.classList.remove("hide");
            }


            let categorySelectValue = document.querySelector(".category-select").value;
            if(categorySelectValue == 0){
                document.querySelector(".category-select").parentElement.previousElementSibling.classList.remove("hide");
            }
            else{
                document.querySelector(".category-select").parentElement.previousElementSibling.classList.add("hide");
            }


            

            checkIngredientsOrInstructions("#ing1", "#ing2", "#ing3");
            checkIngredientsOrInstructions("#ins1", "#ins2", "#ins3");
        })
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
    let elementValue = document.querySelector(`${elementId}`).value;
    if(elementValue == "" || elementValue == null ||  !regEx.test(elementValue)){
        document.querySelector(`${elementId}`).nextElementSibling.nextElementSibling.classList.remove("hide");
    }
    else {
        document.querySelector(`${elementId}`).nextElementSibling.nextElementSibling.classList.add("hide");
    }
}

function writeCardList(array){
    let html = ``;
    array = categoryFilter(array);
    for(let item of array){
        let categoriesJSON = getFromLS("categoriesJSON");
        let categories = [];
        html += `<div class="card col-4 mx-3" style="width: 18rem;">
                    <div class="image-container">
                        <img src="${BASE_IMG}${item.img.src}" class="card-img-top card-image" alt="${item.img.alt}"/>
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
                    html += `<h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${categoryText}</p>
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
                        <div class="col-3">
                            <img src="${BASE_IMG}${item.img.src}" class="col-12" alt="${item.img.alt}"/>
                            <small>Date added: ${item.dateAdded}</small>
                            <p class="mt-2">Prep time: ${item.prep_time} minutes</p>
                            <p class="">Cook time: ${item.cook_time} minutes</p>
                            <p class="">Number of servings: ${item.servings}</p>
                        </div>
                        <div class="col-3">
                            <h6>Ingredients:</h6>`
                            item.ingredients.forEach((ingredient, index) => {
                                modal += `
                                <p class="mb-0">${index+1}) ${ingredient}</p>
                                `
                            })
                        modal +=`
                        </div>
                        <div class="col-3">
                            <h6>Instructions:</h6>`
                            item.instructions.forEach((instruction, index) => {
                                modal += `
                                <p class="mb-0">${index+1}) ${instruction}</p>
                                `
                            })
                        modal += `</div>
                        <div class="col-3">
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
        document.querySelector(`${divButtonId}`).innerHTML += `<input type="text" class="form-control mb-1" placeholder="${placeholder}">`
    })
}

function createCheckbox(name, id){
    let html = `<div class="form-check">
                <input class="form-check-input category" type="checkbox" value="${id}" id="${name}" name="${name.toLowerCase()}">
                <label class="form-check-label" for="${name}">${name}</label>
            </div>`        
    document.querySelector("#filter").innerHTML += html;
}

function createRadio(name, idArray, labelArray){
    let html = ``;
    html += `<div id="${name}" class="hide">`
    for(let i = 0; i < idArray.length; i++){
        html += `<div class="form-check">
                        <input class="form-check-input" type="radio" name="${name}" id="${idArray[i]}" value="${idArray[i]}">
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
    const select = document.querySelector('#sort-select');
    const sortDateAdded = document.querySelector('#sortDateAdded');
    const sortCookTime = document.querySelector('#sortCookTime');

    
    select.addEventListener('change', () => {
        
        const value = select.value;
    
        
        sortDateAdded.classList.add('hide');
        sortCookTime.classList.add('hide');

        
        if (value === 'dateSort') {
            sortDateAdded.classList.remove('hide');
        } else if (value === 'cookPrepSort') {
            sortCookTime.classList.remove('hide');
        }
    });

    
    const sortDateAddedRadios = document.querySelectorAll('[name="sortDateAdded"]');
    const sortCookTimeRadios = document.querySelectorAll('[name="sortCookTime"]');


    sortDateAddedRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            
            const value = radio.value;
        
            
            if (value === 'sort-date-added-asc') {
                array.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                writeCardList(array);
            } else if (value === 'sort-date-added-desc') {
                array.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                writeCardList(array);
            }
        
            
            console.log(array);
        });
    });
    
    sortCookTimeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            
            const value = radio.value;
        
            
            if (value === 'sort-time-asc') {
                array.sort((a, b) => a.cook_time + a.prep_time - b.cook_time - b.prep_time);
                writeCardList(array);
            } else if (value === 'sort-time-desc') {
                array.sort((a, b) => b.cook_time + b.prep_time - a.cook_time - a.prep_time);
                writeCardList(array);
            }
        
            
            console.log(array);
        });
    });
    
    return array;
}

function categoryFilter(array) {
    let checkedCategories = [];
    const categoryCheckboxes = document.querySelectorAll('.category:checked');
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
                            <form class="d-flex">
                                <input class="form-control me-2" type="search" placeholder="Search for recipes" aria-label="Search">
                                <button class="btn btn-outline-success" type="submit">Search</button>
                            </form>
                        </div>
                    </div>
                </nav>`
    header.innerHTML = html;
}

function footer(){
    let html = `<p class="m-0">Made by:&nbsp</p>
                <a href="#" class="text-dark">Aleksandar Jovanović 104/21</a>
                <p class="m-0">&copy Visoka ICT Škola</p>`
    document.querySelector("footer").innerHTML = html;
}

function filterChange(){
    ajaxCB("recipes.json", function(result){
        writeCardList(result);
    })
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






// document.addEventListener("click", function(event) {
//     if (event.target.classList.contains("modal-button")) {
//         // code to display modal goes here
//         let card = event.target.closest(".card");
//         let title = card.querySelector(".card-title").textContent;
//         let description = card.querySelector(".card-text").textContent;
//         // etc. for other data attributes you need
//         let modalHTML = `
//                         <div class="modal">
//                             <div class="modal-dialog">
//                                 <div class="modal-content">
//                                     <div class="modal-header">
//                                         <h5 class="modal-title">${title}</h5>
//                                         <button type="button" class="close" data-dismiss="modal">&times;</button>
//                                     </div>
//                                     <div class="modal-body">
//                                         <p>${description}</p>
//                                         <!-- add other data attributes here as needed -->
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     `;

//         document.body.insertAdjacentHTML("beforeend", modalHTML);

//     }
// });