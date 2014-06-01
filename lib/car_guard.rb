require "sinatra"
require "haml"
require "sass"
require "bootstrap-sass"
require File.expand_path("location", __dir__)

class CarGuard < Sinatra::Base
  configure do
    set :root, File.expand_path("..", __dir__)
  end

  configure :development do
    require "sinatra/reloader"
    register Sinatra::Reloader
  end

  get "/" do
    haml :index
  end

  post "/map/:api_key" do
    request_json = MultiJson.load(request.body.read)
    Location.create(request_json)

    "ok"
  end

  get "/map" do
    Location[api_key: params[:api_key]] ? redirect(to("/map/#{params[:api_key]}")) : halt(404)    
  end

  get "/map/:api_key" do
    @locations = Location.
      where(
        api_key: params[:api_key],
        created_at: (Time.now - 2 * 24 * 60 * 60)..Time.now).
      reverse_order(:created_at)

    haml :map
  end

  get "/car-guard.css" do
    scss :car_guard
  end

  run! if app_file == $0
end
