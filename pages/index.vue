<template>
  <loading v-if="!!loading" status="ログイン中"></loading>
  <div class="p-0" v-else>
    <div class="container pt-5">
      <h1 class="text-center mt-5">ロゴ予定地</h1>
      <h2 class="text-center mt-5">四谷ラボ</h2>
      <h4 class="text-center mt-1">ログインシステム</h4>
      <div class="mt-5 px-5">
        <button class="btn btn-success btn-block" @click="googleLogin()">
          <i class="fab fa-google fa-fw"></i> Googleでログイン
        </button>
      </div>
    </div>
    <!-- <hr />
    <div class="text-center pt-5">
      <nuxt-link to="/about">About</nuxt-link>
      <span>｜</span>
      <nuxt-link to="/contact">お問い合わせ</nuxt-link>
    </div>
    <div class="p-3 text-center">Copyright (c) 2019 T.Shinohara</div> -->
  </div>

</template>

<script>
import { mapActions, mapGetters } from "vuex";
import firebase from "@/plugins/firebase";

import loading from "~/components/Loading";

const db = firebase.firestore();

export default {
  components: {
    loading
  },
    methods: {
    ...mapActions([
      "isAuthenticated",
      "googleAuth",
      "setUser",
    ]),
    ...mapGetters([
        "getUserConfig"
    ]),
    googleLogin() {
      this.googleAuth()
        .then(() => console.log("resloved"))
        .catch(err => console.log(err));
    },
  },
  data() {
    return {
      loading: true,
      status: ""
    };
  },
  async mounted() {
    //認証後はトップに移動
    let user = await new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged(user => resolve(user));
    });

    if (user) {
      const { uid, email, displayName, emailVerified, photoURL } = user;
      this.setUser({ uid, email, displayName, emailVerified, photoURL });
      let userData = await db
        .collection("users")
        .doc(user.uid)
        .get();
      if (!userData.data()) {
        let data = {
          "name": user.displayName,
          "image": user.photoURL,
        }
        await db
          .collection("users")
          .doc(user.uid)
          .set(data);
        console.log("new user")
      } else {
        console.log("logged in")
      }
      this.$router.push("/dashboard");
    }
    this.loading = false;
  }

}
</script>

<style>
</style>
