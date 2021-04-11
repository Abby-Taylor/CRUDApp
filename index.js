/*begin with a class for basic building block of what we are creating--dog
we are adding dogs and we will track each dog's meal; use empty array*/
class Dog {
    constructor(name) {
        this.name = name;
        this.meals = [];
    }

    addMeal(mealType, quantity) {
        this.meals.push(new Meal(mealType, quantity));
    }
}

//create Meals; each meal will have  mealType and quantity//
class Meal {
    constructor(mealType, quantity) {
        this.mealType = mealType;
        this.quantity = quantity;
    }
}
function myPost(url, instance) {
    return $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        data: JSON.stringify(instance),
        contentType: "application/json"
    })
}
//change each day//
let url = "https://crudcrud.com/api/8b97215cb4454ee08d8c9925321ef2a4/dogs";

function makeInitial() {
    let luna = new Dog('Luna');
    let meal = new Meal('Breakfast', 'one cup');
    luna.meals.push(meal);
    myPost(url, luna).then((resp) => console.log(resp));
}
function myPut(url, instance) {
    return $.ajax({
        url: url,
        type: 'PUT',
        data: JSON.stringify(instance),
        contentType: "application/json"
    });
}
/*create class for Dog Service or how we will send HTTP requests;
this URL will have to be updated within a day*/
class DogService {
    static url = "https://crudcrud.com/api/8b97215cb4454ee08d8c9925321ef2a4/dogs";

    /* now create our methods that will be used in the app; do this for all CRUD operations;
        we need to have a way to return all the dogs we have created so start with get all dogs;
        this method doesn't need a parameter, as it will return all dogs */
    static getAllDogs() {
        return $.get(this.url);
    }

    /*method for returning specific dogs*/
    static getDog(id) {
        return $.get(`${this.url}/${id}`);
    }

    /*method to create dog; changed(?) this post call to make compatible with api site; I worked on fixing this
    for multiple hours and never was able to*/
    static createDog(dog) {
        return $.ajax(this.url, {
            url: this.url,
            type: "POST",
            dataType: "json",
            data: JSON.stringify(dog),
            contentType: "application/json"
        });
    }

    /*update/put request: put 'modifies' some part of an existing posted object to the API */
    static updateDog(dog) {
        console.log(dog);
        console.log('Inside updateDog');
        console.log(`${this.url}`);
        console.log(`/${dog._id}`);
        console.log(`${this.url}/${dog._id}`);
        return $.ajax({
            url: `${this.url}/${dog._id}`,
            dataType: "json",
            data: JSON.stringify(dog),
            contentType: "application/json",
            type: "PUT"
        });
    }

    static deleteDog(id) {
        console.log('Inside deleteDog');
        console.log(`${this.url}`);
        console.log(`/${id}`);
        console.log(`${this.url}/${id}`);
        return $.ajax(`${this.url}/${id}`, {
            crossDomain: true,
            type: "DELETE"
        });
    }
}

//next class will be what we use to render items to the DOM; use methods from service class to do this//
class DOMManager {
    static dogs = [];

    static getAllDogs() {
        DogService.getAllDogs().then(
            dogs => this.render(dogs)
        );
    }

    static createDog(name) {
        DogService.createDog(new Dog(name)).then(
            () => DogService.getAllDogs()
        ).then(
            dogs => this.render(dogs)
        );
    }

    //delete a dog, but then send new HTTP request and re-render remaining dogs in the service//
    static deleteDog(id) {
        DogService.deleteDog(id).then(
            () => DogService.getAllDogs()
        ).then(
            dogs => this.render(dogs)
        );
    }

    static addMeal(id) {
        for (let dog of DOMManager.dogs) {
            if (dog._id == id) {
                dog.meals.push(new Meal(
                    $(`#${dog._id}-mealType-name`).val(),
                    $(`#${dog._id}-mealType-quantity`).val()
                ));

                DogService.updateDog(dog).then(
                    () => DogService.getAllDogs()
                ).then(
                    dogs => this.render(dogs)
                );
            }
        }
    }

    static deleteMeal(dogId, mealId) {
        for (let dog of this.dogs) {
            if (dog._id == dogId) {
                for (let meal of dogs.meals) {
                    if (meal._id == mealId) {
                        dog.meals.splice(dog.meals.indexOf(meal), 1);
                        DogService.updateDog(dog).then(
                            () => DogService.getAllDogs()
                        ).then(
                            dogs => this.render(dogs)
                        );
                    }
                }
            }
        }
    }

    //when we loop through the dogs, this will render each to the DOM in it's own card/div
    static render(dogs) {
        this.dogs = dogs;
        $('#app').empty();
        for (let dog of dogs) {
            $('#app').prepend(
                `<div id="${dog._id} class="card">
                    <div class="card-header">
                        <h2>${dog.name}'s Meals</h2>
                    <div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${dog._id}-mealType-name" class="form-control" placeholder="Meal Type">
                                </div>
                                <div class="col-sm">
                                <input type="text" id="${dog._id}-mealType-quantity" class="form-control" placeholder="Quantity">
                                </div>
                            </div>
                            <br>
                            <button id="${dog._id}-new-meal" onclick="DOMManager.addMeal('${dog._id}')" class="btn btn-success form-control">I fed this doggo.</button>
                            <br>
                            <button class="btn btn-danger form-control" onclick="DOMManager.deleteDog('${dog._id}')">This dog has checked out!</button>
                        </div>
                    </div>
                </div><br>
                `
            );

            for (let meal of dog.meals) {
                $(`#${dog._id}`).find('.card-body').append(
                    `<p>
                        <span id="meal-${meal._id}"><strong>Name: </strong> ${meal.mealType}</span>
                        <span id="meal-${meal._id}"><strong>Quantity: </strong> ${meal.quantity}</span>
                        <button class="btn btn-primary" onclick="DOMManager.deleteMeal('${dog._id}', '${meal._id}')"<Delete Meal</button>
                    </p>`
                );
            }
        }
    }
}

$('#create-new-dog').on("click", () => {
    DOMManager.createDog($('#new-dog-name').val());
    $('#new-dog-name').val('');
});

DOMManager.getAllDogs();