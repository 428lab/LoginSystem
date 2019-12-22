class userLocation {
    constructor() {

    }

    getCurrentPositionPromise(options) {
        return new Promise(function(resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, reject, options)
        })
    }
    async getLocation() {
        if (navigator.geolocation) {
            try {
                const result = await this.getCurrentPositionPromise()
                return result
            } catch (e) {
                console.error(e)
                throw e
            }
        } else {
            console.log('can not get a location data in this browser.')
            throw null
        }
    }

    distance($lat1, $lon1, $lat2, $lon2, $mode = true) {
        let $radLat1 = $lat1 * (Math.PI / 180)
        let $radLon1 = $lon1 * (Math.PI / 180)
        let $radLat2 = $lat2 * (Math.PI / 180)
        let $radLon2 = $lon2 * (Math.PI / 180)

        let $radLatDiff = $radLat1 - $radLat2

        let $radLonDiff = $radLon1 - $radLon2

        let $radLatAve = ($radLat1 + $radLat2) / 2.0

        // 測地系による値の違い
        let $a = $mode ? 6378137.0 : 6377397.155 // 赤道半径
        let $b = $mode ? 6356752.314140356 : 6356078.963 // 極半径
        let $e2 = $mode ? 0.00669438002301188 : 0.00667436061028297 // 第一離心率^2
        let $a1e2 = $mode ? 6335439.32708317 : 6334832.10663254 // 赤道上の子午線曲率半径

        let $sinLat = Math.sin($radLatAve)
        let $W2 = 1.0 - $e2 * ($sinLat * $sinLat)
        let $M = $a1e2 / (Math.sqrt($W2) * $W2) // 子午線曲率半径M
        let $N = $a / Math.sqrt($W2) // 卯酉線曲率半径

        let $t1 = $M * $radLatDiff
        let $t2 = $N * Math.cos($radLatAve) * $radLonDiff
        let $dist = Math.sqrt($t1 * $t1 + $t2 * $t2)

        return $dist
    }

}

const location = new userLocation()

export default location