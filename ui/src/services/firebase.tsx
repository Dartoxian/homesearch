import * as firebase from 'firebase/app';
import 'firebase/auth';
import React from "react";

export function initializeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyCWVg-CSk5ef2gBgxzDEE0n0UY9WnvEK5s",
        authDomain: "homesearch-280907.firebaseapp.com",
        databaseURL: "https://homesearch-280907.firebaseio.com",
        projectId: "homesearch-280907",
        storageBucket: "homesearch-280907.appspot.com",
        messagingSenderId: "978194553907",
        appId: "1:978194553907:web:f31800572cd8ec1cf65746"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged(resolve);
    });
}

export function isUserLoggedIn() {
    return firebase.auth().currentUser !== null;
}

export function signOut() {
    firebase.auth().signOut();
}