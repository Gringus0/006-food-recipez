const BASE_URL= "https://gringus0.github.io/savoryspot/";
const BASE_IMG = "assets/img/";
var url = document.location.pathname;
console.log(url);
let categories =  getFromLS("");
window.onload = function(){
    ajaxCB("menu.json", function(result){
        navigation(result);
    });
    footer();

    if (url == "/savoryspot/" || url == "/savoryspot/index.html") {
        
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
}

function addToLS(name, data){
    localStorage.setItem(name, JSON.stringify(data));
}

function getFromLS(name){
    return JSON.parse(localStorage.getItem(name));
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

function createDDL(){
    let html = ``;
    html += `<select class="form-select" aria-label="Default select example">
                <option selected>Open this select menu</option>
                <option value="dateSort">Date</option>
                <option value="cookPrepSort">Cook + Prep time</option>
            </select>`
    document.querySelector("#sort").innerHTML += html;
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

function writeCardList(array){
    let html = ``;
    array = categoryFilter(array);
    for(let item of array){
        let categoriesJSON = getFromLS("categoriesJSON");
        let categories = [];
        html += `<div class="card col-4 mx-3" style="width: 18rem;">
                    <img src="${BASE_IMG}${item.img.src}" class="card-img-top" alt="${item.img.alt}"/>
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
                        <a href="#" class="btn btn-primary">Check it out!</a>
                    </div>
                </div>`
    }
    document.querySelector("#recipe-list").innerHTML = html;
}

function navigation(array){
    let header = document.querySelector("header");
    let html = `<nav class="navbar navbar-expand-lg navbar-light bg-light sticky-top">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#" id="nav-title">SavorySpot</a>
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