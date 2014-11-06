class Alert < Sequel::Model
  TYPE_COMMUNICATION = "communication"
  TYPE_LOW_BATTERY = "low_battery"

  set_schema do
    String :type, null: false
    DateTime :created_at

    primary_key :id
    foreign_key :user_id, :users

    index [:type, :user_id], unique: true
  end

  create_table if !table_exists?
end
