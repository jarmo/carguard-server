var EncryptedLocations = {
  decryptAll: function(locations) {
    var dfd = $.Deferred()

    askForPassword().done(function(password) {
      var decryptedLocations = _(locations).map(function(location) {
        try {
          var decrypted = JSON.parse(decrypt(location.salt, location.iv, password, location.data))
        } catch(e) {
          return dfd.reject()
        }
        return _({created: location.created}).extend(decrypted)
      })

      dfd.resolve(decryptedLocations)
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
      alertify.prompt("Find the car", function(ok, password) {
        ok ? dfd.resolve(password.trim()) : dfd.reject()
      }, "enter secret");

      return dfd;
    }
  }
}
