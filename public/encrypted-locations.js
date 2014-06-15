var EncryptedLocations = {
  decryptAll: function(locations, password) {
    var dfd = $.Deferred()

    new Parallel(locations, {evalPath: "/vendor/eval.js", maxWorkers: 8, env: {password: password}})
      .require("/vendor/crypto-js/aes.js")
      .require("/vendor/crypto-js/pbkdf2.js")
      .require("//underscorejs.org/underscore-min.js")
      .require(decrypt)
      .require(generateKey).map(function(location) {
      try {
        var decrypted = JSON.parse(decrypt(location.salt, location.iv, global.env.password, location.data))
        return _({created_at: location.created_at}).extend(decrypted)
      } catch (ignored) {}
    }).then(function(decryptedLocations) {
      _(decryptedLocations).compact().length ? dfd.resolve(decryptedLocations) : dfd.reject()
    })

    return dfd

    function decrypt(salt, iv, password, cipherText) {
      var key = generateKey(salt, password)
      var cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(cipherText)
      })

      var decrypted = CryptoJS.AES.decrypt(
        cipherParams,
        key,
        {iv: CryptoJS.enc.Hex.parse(iv)}
      )

      return decrypted.toString(CryptoJS.enc.Utf8)
    }

    function generateKey(salt, password) {
      return CryptoJS.PBKDF2(
               password, 
               CryptoJS.enc.Hex.parse(salt),
               {keySize: 128 / 32, iterations: 10000}
             )
    }

    function askForPassword() {
      var dfd = $.Deferred()
      alertify.prompt("Find your car", function(ok, password) {
        _.defer(function() {
          ok ? dfd.resolve(password.trim()) : dfd.reject()
        })
      }, "secret")

      return dfd
    }
  }
}
