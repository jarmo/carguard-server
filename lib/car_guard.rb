require "json"
require "sinatra"
require "haml"
require "sass"
require "bootstrap-sass"
require "securerandom"
require "rufus-scheduler"
require File.expand_path("emailer", __dir__)
require File.expand_path("database", __dir__)
require File.expand_path("user", __dir__)
require File.expand_path("location", __dir__)

class CarGuard < Sinatra::Base
  configure do
    set :root, File.expand_path("..", __dir__)

    Rufus::Scheduler.new.every "30m" do
      expired_communication_time = Time.now - 6 * 60 * 60 - 15 * 60

      User.where("email is not null").each do |user|
        last_location = user.locations_dataset.order(:created_at).last
        next unless last_location

        if !user.last_alert_time && last_location.created_at <= expired_communication_time
          Emailer.alert(user.email, user.api_key)
          user.last_alert_time = Time.now
          user.save
        elsif user.last_alert_time && last_location.created_at > expired_communication_time
          user.last_alert_time = nil
          user.save
          Emailer.alert_restore(user.email, user.api_key)
        end
      end
    end
  end

  configure :development do
    require "sinatra/reloader"
    register Sinatra::Reloader

    set :port, 7500
    set :bind, "0.0.0.0"
  end

  get "/" do
    haml :index
  end

  post "/register" do
    api_key = SecureRandom.uuid
    user_params = JSON.parse(request.body.read)
    User.create(user_params.merge(api_key: api_key))

    Emailer.welcome(user_params["email"], api_key) if user_params["email"]

    api_key
  end

  get "/map/:api_key" do
    @api_key = params[:api_key]
    haml :index
  end

  post "/map/:api_key" do
    user = User.find(api_key: params[:api_key])
    halt 404 unless user

    user.add_location JSON.parse(request.body.read)

    "ok"
  end

  get "/locations/:api_key/?:to?" do
    user = User.find(api_key: params[:api_key])
    halt 404 unless user

    query = user.locations_dataset.
      order(:created_at).
      reverse

    if params[:to]
      query.
        where("created_at < ?", Time.at(params[:to].to_i / 1000)).
        first(5).
        to_json(except: :api_key)
    else
      [query.first].
        compact.
        to_json(except: :api_key)
    end
  end

  get "/car-guard.css" do
    scss :car_guard
  end

  run! if app_file == $0
end
