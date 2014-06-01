require "sinatra"
require "haml"
require "multi_json"
require "sass"
require "bootstrap-sass"

class CarGuard < Sinatra::Base
  LOCATIONS_FILE_NAME = "locations.json"

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

  post "/" do
    saved_locations.has_key?(params[:api_key].to_sym) ? redirect(to("/map/#{params[:api_key]}")) : halt(404)
  end

  post "/map/:api_key" do
    response = MultiJson.load(request.body.read, symbolize_keys: true).merge(created: (Time.now.to_f * 1000).to_i)

    locations = saved_locations
    locations[params[:api_key].to_sym] << response
    File.open(LOCATIONS_FILE_NAME, "w") { |f| f.puts MultiJson.dump(locations, pretty: true) }

    "ok"
  end

  get "/map/:api_key" do
    @locations = saved_locations[params[:api_key].to_sym].sort_by {|i| i[:time] }
    haml :map
  end

  get "/car-guard.css" do
    scss :car_guard
  end

  private

  def saved_locations
    locations = File.exists?(LOCATIONS_FILE_NAME) ? MultiJson.load(File.read(LOCATIONS_FILE_NAME), symbolize_keys: true) : {}
    locations.default_proc = proc do |hash, key|
      hash[key] = []
    end
    locations
  end

  run! if app_file == $0
end
