require "mail"

class Emailer
  class << self
    def alert(email, api_key)
      send(email, "Communication Alert", "CarGuard hasn't had any communication with your Android app in a while. Is everything ok?

Check out last communication at http://carguard.me/map/#{api_key}")
    end

    def alert_restore(email, api_key)
      send(email, "Communication Restored", "Just to let you know that CarGuard has restored communication with your Android app again. No need to worry anymore.

Check out last communication at http://carguard.me/map/#{api_key}")
    end

    def low_battery_alert(email, api_key)
      send(email, "Low Battery", "Your Android device seems to have a low battery. Do something quick!

Check out last communication at http://carguard.me/map/#{api_key}")
    end

    def low_battery_alert_restore(email, api_key)
      send(email, "Normal Battery", "Just to let you know that your Android device seems to have normal battery again. No need to worry anymore.

Check out last communication at http://carguard.me/map/#{api_key}")
    end

    def welcome(email, api_key)
      send(email, "Welcome", "Welcome to CarGuard!

Head to http://carguard.me/map/#{api_key} for your car location.

PS! Make sure to write down secret from your phone - otherwise locations are not visible for you.")
    end

    private

    def send(email, subject, body)
      ::Mail.deliver do
        delivery_method :smtp, {
          address: "smtp.mandrillapp.com",
          domain: "heroku.com", 
          port: 587,
          enable_ssl: true,
          user_name: ENV["MANDRILL_USERNAME"],
          password: ENV["MANDRILL_APIKEY"]
        }

        to email
        from "no-reply@carguard.me"
        subject subject
        body body
      end
    end
  end
end
