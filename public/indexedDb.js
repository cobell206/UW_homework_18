let db
let budgetVersion
// const dbName = 'budgetStorage'
const dbName = 'BudgetDB'

var request = indexedDB.open(dbName, budgetVersion || 21)

function checkForIndexedDb() {
    if (!window.indexedDB) {
      console.log("Your browser doesn't support a stable version of IndexedDB.");
      return false;
    }
    return true;
  }

request.onupgradeneeded = function (event) {
    const { oldVersion } = event
    const newVersion = event.newVersion || db.version

    db = event.target.result
    if (db.objectStoreNames.length === 0) {
        db.createObjectStore(dbName, {autoIncrement: true})
    }
}
  
function emptyDatabase() {
       
    let tx = db.transaction([dbName], 'readwrite')

    const store = tx.objectStore(dbName)
    const getAll = store.getAll()

    getAll.onsuccess = function () {

        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }
            })
                .then((response) => response.json())
                .then((res) => {
                    if (res.length !== 0) {
                        transaction = db.transaction([dbName], 'readwrite')
                        const currentStore = transaction.objectStore(dbName)
                        currentStore.clear()
                        console.log(`Cleared store from ${dbName}`);
                    }
                })
        }
    }
}

request.onsuccess = function (event) {
    db = event.target.result
    if (navigator.onLine) {
        console.log('Back online');
        emptyDatabase()
    }
}

  
const saveRecord = (record) => {

    const transaction = db.transaction(dbName, 'readwrite')

    const store = transaction.objectStore(dbName)
    store.add(record)

    console.log('Record saved');
}

window.addEventListener('online', emptyDatabase)