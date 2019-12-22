export const strict = false

import firebase from "@/plugins/firebase"
const db = firebase.firestore()
export const state = () => ({
    userAccount: {},
})

export const getters = {
    isAuthenticated(state) {
        return !!state.userAccount && !!state.userAccount.uid
    },
    getUserId(state) {
        return state.userAccount ? state.userAccount.uid : null
    },
    getUser(state) {
        return state.userAccount ? state.userAccount : null
    },
}

export const actions = {
    googleAuth() {
        return new Promise((resolve, reject) => {
            firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider())
                .then(() => {
                    resolve()
                })
                .catch((err) => reject(err))
        })
    },
    twitterAuth() {
        return new Promise((resolve, reject) => {
            firebase.auth().signInWithRedirect(new firebase.auth.TwitterAuthProvider())
                .then(() => {
                    resolve()
                })
                .catch((err) => reject(err))
        })
    },
    mailAndPasswordCreate({}, payload) {
        return new Promise((resolve, reject) => {
            firebase.auth().createUserWithEmailAndPassword(payload.mailaddress, payload.password)
                .then(() => {
                    resolve()
                }).catch((err) => { reject(err) })
        })
    },
    mailAndPasswordAuth({}, payload) {
        return new Promise((resolve, reject) => {
            firebase.auth().signInWithEmailAndPassword(payload.mailaddress, payload.password)
                .then(() => {
                    resolve()
                }).catch((err) => { reject(err) })
        })
    },
    logout({ commit }) {
        return new Promise((resolve, reject) => {
            firebase.auth().signOut()
                .then(() => {
                    commit('clearUser')
                    resolve()
                })
        })
    },
    setUser({ commit }, payload) {
        commit("setUser", payload)
    },
    clearUser({ commit }) {
        commit("clearUser")
    }
}

export const mutations = {
    setUser(state, payload) {
        state.userAccount = payload
    },
    clearUser(state) {
        state.userAccount = {}
    },
}