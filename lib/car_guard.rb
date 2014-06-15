require "json"
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

  get "/map/:api_key" do
    @api_key = params[:api_key]
    haml :index
  end

  post "/map/:api_key" do
    Location.create(JSON.parse(request.body.read).merge(api_key: params[:api_key]))

    "ok"
  end

  get "/locations/:api_key/?:to?" do
    search_params = {api_key: params[:api_key]}

    if params[:to]
      Location.
        where(search_params).
        where("created_at < ?", Time.at(params[:to].to_i / 1000)).
        order(:created_at).
        reverse.first(5).to_json(except: :api_key)
    else
      [
        Location.
          where(search_params).
          order(:created_at).
          reverse.
          first
      ].compact.to_json(except: :api_key)
    end
  end

  get "/car-guard.css" do
    scss :car_guard
  end

  run! if app_file == $0
end
