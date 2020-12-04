import * as firebase from 'firebase';
import '@firebase/auth';
import '@firebase/firestore';

const firebaseConfig = {
    apiKey: '[KEY HERE]',
    authDomain: "[AUTH DOMAIN HERE]",
    databaseURL: "[DATABASE URL HERE]",
    projectId: "[PROJECT ID HERE]",
    storageBucket: "[STORAGE BUCKET HERE]",
    messagingSenderId: "[MESSAGING SENDER ID HERE]",
    appId: "[APP ID HERE]",
    measurementId: "[MEASUREMENT ID HERE]"
};

if(!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


export {firebase};