<template>
  <div class="container pt-5">
    <h1 class="text-center mt-5">ロゴ予定地</h1>
    <div class="text-center">
      <div v-if="gps == 'getting'">
        <button class="btn">
          位置情報 取得中
        </button>
      </div>
      <div v-else-if="gps == 'failed'">
        <button class="btn btn-dark mt-4" @click="getLocation">
          位置情報を再取得
        </button>
      </div>
      <div v-else-if="gps == 'outarea'">
        <button class="btn btn-dark mt-4">
          位置情報が取得できません
        </button>
      </div>
      <div v-else-if="gps == 'ok'">
        <button class="btn mt-4">
          位置情報 取得OK
        </button>
      </div>
    </div>
    <div class="text-center">
      <button class="btn btn-success mt-4" @click="checkin" v-if="location">
        チェックイン
      </button>
      <button class="btn btn-success mt-4" v-else disabled>
        チェックイン
      </button>
    </div>
    <div class="text-center">
      <nuxt-link class="btn btn-success mt-4" to="/dashboard"
        >ダッシュボードへ戻る</nuxt-link
      >
    </div>
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
      gps: 'getting',
      location: false,
      loading: true
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
    async checkin() {
      let data = {
        checkin: new Date(),
        checkout: '',
        id: this.getUserId,
        name: this.getUser.displayName,
        image: this.getUser.photoURL
      }
      let ref = await db.collection('checkin').add(data)
      let users = await db
        .collection('checkin')
        .where('checkout', '==', '')
        .where('id', '==', this.getUserId)
        .get()
      this.$router.push('/checked')
    },
    async getLocation() {
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
          this.location = true
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
      this.getLocation()
      this.loading = false
    })
  }
}
</script>

