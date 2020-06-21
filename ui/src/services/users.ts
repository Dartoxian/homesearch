import * as firebase from 'firebase/app';
import 'firebase/auth';
import {BASE_URL} from "./config";
import {isUserLoggedIn} from "./firebase";
import {HousePropertyMeta, SentimentType} from "./houses";

export function tryAuthorisedFetch(input: RequestInfo, init?: RequestInit) {
    if (isUserLoggedIn()) {
        return firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
            return fetch(input, {
                ...init,
                headers: {
                    ...(init || {}).headers,
                    'Auth-token': idToken,
                }
            })
        });
    } else {
        return fetch(input, init);
    }
}

export function getFavourites(): Promise<HousePropertyMeta[]> {
    if (!isUserLoggedIn()) {
        console.error("Cannot get favourites when user not logged in");
        return Promise.resolve([]);
    }

    return tryAuthorisedFetch(BASE_URL + '/api/user/favourites', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }).then(r => r.json()).then((r) => r.map(it => ({
        ...it,
        location: JSON.parse(it.location),
    })));
}

export function setSentiment(house_id: number, type: SentimentType) {
    if (!isUserLoggedIn()) {
        console.error("Cannot get favourites when user not logged in");
        return;
    }

    return tryAuthorisedFetch(BASE_URL + `/api/user/sentiment/${type}/${house_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
}

export function removeSentiment(house_id: number) {
    if (!isUserLoggedIn()) {
        console.error("Cannot delete sentiment when user not logged in");
        return;
    }

    return tryAuthorisedFetch(BASE_URL + `/api/user/sentiment/${house_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    });
}