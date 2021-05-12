let db
let budgetVersion
// const dbName = 'budgetStorage'
const dbName = 'BudgetDB'
const dbStore = 'BudgetStore'

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
        db.createObjectStore(dbStore, {autoIncrement: true})
    }
}
  
function emptyDatabase() {
       
    let tx = db.transaction([dbStore], 'readwrite')

    const store = tx.objectStore(dbStore)
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
                        transaction = db.transaction([dbStore], 'readwrite')
                        const currentStore = transaction.objectStore(dbStore)
                        currentStore.clear()
                        console.log(`Cleared store from ${dbStore}`);
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

    const transaction = db.transaction(dbStore, 'readwrite')

    const store = transaction.objectStore(dbStore)
    store.add(record)

    console.log('Record saved');
}

window.addEventListener('online', emptyDatabase)