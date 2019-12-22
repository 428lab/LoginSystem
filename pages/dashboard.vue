<template>
  <loading v-if="!!loading" status="取得中"></loading>
  <div v-else>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div class="container">
        <div class="text-white">在籍中</div>
        <button class="btn btn-secondary" @click="doLogout()">
          ログアウト
        </button>
      </div>
    </nav>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <button class="btn btn-secondary">非表示領域</button>
      </div>
    </nav>
    <div class="mt-4 px-4">
      <!-- <h3>在籍中</h3> -->
      <div v-for="(user, id) in users" :key="id" class="d-flex mt-3">
        <div class="w-25 mr-3">
          <img :src="user.image" class="img-fluid" />
        </div>
        <div>
          <p>{{ user.name }}</p>
          <p>{{ $moment(user.checkin).format('YYYY/MM/DD HH:mm') }}</p>
        </div>
      </div>
    </div>
    <div class="my-5 pt-5">
      <span class="text-white">高さ調整用</span>
    </div>

    <div class="fixed-bottom">
      <div class="fixed-bottom-shadow"></div>
      <div class="pt-3 px-4 pb-3 bg-white border-top">
        <div class="form-row">
          <div class="col-6">
            <nuxt-link
              class="btn btn-primary btn-block text-white"
              to="/userconfig"
            >
              <i class="fas fa-cog fa-fw"></i>
              ユーザー設定
            </nuxt-link>
          </div>
          <div class="col-6" v-if="!checked">
            <nuxt-link
              class="btn btn-success btn-block text-white"
              to="/check"
            >
              <i class="fas fa-cog fa-fw"></i>
              チェックイン
            </nuxt-link>
          </div>
          <div class="col-6" v-else>
            <button
              class="btn btn-dark btn-block text-white"
              @click="checkout()"
            >
              <i class="fas fa-cog fa-fw"></i>
              チェックアウト
            </button>
          </div>
        </div>
      </div>
      <div class="text-center p-3 bg-dark text-white">
        Copyright (c) 2019 - T.Shinohara
      </div>
    </div>
    <b-modal v-model="modalShow" title="BootstrapVue" hide-header hide-footer>
      <h2 class="my-4">エリア外です</h2>
      <p>ラボ在籍システムから自動的にチェックアウトされます。</p>
      <!-- <p><small>※画面を閉じてもチェックアウトされます。</small></p> -->
      <nuxt-link
        class="btn btn-success btn-block text-white"
        to="/check"
      >
        <i class="fas fa-cog fa-fw"></i>
        再チェックイン
      </nuxt-link>
      <button
        class="btn btn-dark btn-block text-white"
        @click="checkout(); modalShow = false"
      >
        <i class="fas fa-cog fa-fw"></i>
        チェックアウト
      </button>
    </b-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import firebase from '~/plugins/firebase'
import location from '~/plugins/location'

import loading from '~/components/Loading'

const db = firebase.firestore()

export default {
  layout: 'single',
  components: {
    loading
  },
  async asyncData() {
    return {
      users: [],
      checked: false,
      checkedId: '',
      loading: true,
      modalShow: false
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'getUserId', 'getUser'])
  },
  methods: {
    ...mapActions(['logout']),
    doLogout() {
      this.logout()
        .then(() => {
          this.$router.push('/')
        })
        .catch((err) => console.log(err))
    },
    async checkout() {
      let data = {
        checkout: new Date()
      }
      await db
        .collection('checkin')
        .doc(this.checkedId)
        .update(data)
      this.getCheckUsers()
      this.getCheckStatus()
    },
    async getCheckUsers() {
      this.users = []
      let users = await db
        .collection('checkin')
        .where('checkout', '==', '')
        .get()
      await Promise.all([
        await users.forEach(async (doc) => {
          let data = doc.data()
          let userdata = await db
            .collection('users')
            .doc(data.id)
            .get()
          let temp = {
            name: userdata.data().name,
            image: userdata.data().image,
            id: data.id,
            checkin: data.checkin.toDate()
          }
          this.users.push(temp)
        })
      ])
    },
    async getCheckStatus() {
      let size = 0
      let users = await db
        .collection('checkin')
        .where('checkout', '==', '')
        .where('id', '==', this.getUserId)
        .get()
        .then(snap => {
          size = snap.size // will return the collection size
          snap.forEach(data => {
            this.checkedId = data.id;
          })
        });
      if (size > 0) {
        this.checked = true
      } else {
        this.checked = false
      }
    },
    async getLocation(debugState = "") {
      if(debugState != "") {
        this.gps = debugState
        return
      }
      try {
        const position = await location.getLocation()
        let vector = location.distance(
          process.env.LOCATION_LAT,
          process.env.LOCATION_LON,
          position.coords.latitude,
          position.coords.longitude
        )
        if (vector <= 60.0) {
          this.gps = 'ok'
        } else {
          this.gps = 'outarea'
        }
      } catch (e) {
        console.error(e)
        this.gps = 'failed'
      }
    }
  },
  async mounted() {
    setTimeout(async () => {
      if (!this.isAuthenticated) {
        this.$router.push('/')
      }
      await this.getCheckUsers()
      await this.getCheckStatus()
      await this.getLocation()
      if( this.gps != 'ok' && this.checked == true ){
        this.modalShow = true;
      }
      this.loading = false
    })
  }
}
</script>

