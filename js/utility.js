

var dbPromise = idb.open('restaurant-store', 1 , function(dbObject){
    if(!dbObject.objectStoreNames.contains('stores')){
        dbObject.createObjectStore('stores', {keyPath : 'id'});
        var reviewSstore = dbObject.createObjectStore('reviewsStore', {keyPath : 'id'});
        reviewSstore.createIndex('restaurant_id', 'restaurant_id');
        dbObject.createObjectStore('review2', { keyPath: 'updatedAt' });
    }
});


function writeData(st, data) {

    return dbPromise
        .then(function (dbObject) {
        var tx = dbObject.transaction(st , 'readwrite');
        var store = tx.objectStore(st);
        store.put(data);
        return tx.complete;
    });

}

function readAllData(st){
    return dbPromise
        .then(function (dbObject) {
            var tx = dbObject.transaction(st,'readonly');
            var store = tx.objectStore(st);
            return store.getAll();
        })
}


function addDataFromFetchApi() {
    return fetch(DBHelper.DATABASE_URL)
        .then(function (response) {
            return response.json();
        }).then(data => {
        for (var key in data) {
        writeData('stores', data[key]);
    }
    return data;
})
}


//Reviews functions for IDB

function writeReviewsData(st,data){

    return dbPromise
        .then(function (dbObject) {
            var tx = dbObject.transaction(st , 'readwrite');
            var store = tx.objectStore(st);
            store.put(data);
            return tx.complete;
        });

}

function readReviewsData(st,id){
    return dbPromise
        .then(function (dbObject) {
            var tx = dbObject.transaction(st,'readonly');
            var store = tx.objectStore(st).index('restaurant_id');

            return store.getAll(id);
        })
}

function addReviewsFromFetchApi(id) {
    return fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
        .then(function (response) {
            return response.json();
        })
        .then(data => {
        for (var key in data) {
        writeReviewsData('reviewsStore', data[key]);
    }
    // return data;
    callback(null,data);
})
.catch(error => {
        // Unable to fetch reviews from the network
        callback(error, null);
})
}


function writeReviewsDataOffline(st,data){

    return dbPromise
        .then(function (dbObject) {
            var tx = dbObject.transaction(st , 'readwrite');
            var store = tx.objectStore(st);
            store.put(data);
            console.log('Offline...Offline...');
            console.log('Offline Mode: Review stored in IDB review2');
            callback(error)
        });

}