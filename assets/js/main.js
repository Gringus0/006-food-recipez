const BASE_URL= "https://gringus0.github.io/savoryspot/";
const BASE_IMG = "assets/img/";
var url = document.location.pathname;
console.log(url);
window.onload = function(){
    ajaxCB("menu.json", function(result){
        navigation(result);
    });
    

    if (url == "/" || url == "/index.html") {
        
    }
    else if(url == "/recipes.html"){
        ajaxCB("recipes.json", function(result){
            writeCardList(result);
        })
        
    }
}

{/* <div class="card" style="width: 18rem;">
    <img src="assets/img/garlic-butter-shrimp.jpg" class="card-img-top" alt="Garlic Butter"/>
    <div class="card-body">
        <h5 class="card-title">Card title</h5>
        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
        <a href="#" class="btn btn-primary">Go somewhere</a>
    </div>
</div> */}

function writeCardList(array){
    let html = ``;
    for(let item of array){
        html += `<div class="card col-4 mx-3" style="width: 18rem;">
                    <img src="${BASE_IMG}${item.img.src}" class="card-img-top" alt="${item.img.alt}"/>
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.description}</p>
                        <a href="#" class="btn btn-primary">Check it out!</a>
                    </div>
                </div>`
    }
    document.querySelector("#recipe-list").innerHTML = html;
}

function navigation(array){
    let header = document.querySelector("header");
    let html = `<nav class="navbar navbar-expand-lg navbar-light bg-light">
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