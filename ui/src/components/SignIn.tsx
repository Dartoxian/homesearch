import * as firebase from 'firebase/app';
import 'firebase/auth';
import {H3} from "@blueprintjs/core";
import {StyledFirebaseAuth} from "react-firebaseui";
import * as React from "react";

export const SignIn = () => {
    const uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
            // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: () => false
        }
    };

    return (
        <div>
            <H3>Homesearch</H3>
            <p>Please sign-in:</p>
            <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        </div>
    )
}