import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

if (!firebase.apps.length) {
    let config = require("~/config.json")
    if (!config || !config.firebase) {
        firebase.initializeApp({
            firebase: firebase.credential.applicationDefault()
        });
    } else {
        firebase.initializeApp({...config.firebase })
    }
}

export default firebase