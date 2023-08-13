const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require('pg');

/// Users

const pool = new Pool({
  users: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
  .query(
      `
    SELECT * FROM users WHERE email = $1
    `, [email]
    )
    .then(result => {
      return result.rows[0];
    })
    .catch(err => console.error(err.message));
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  // return Promise.resolve(users[id]);
  return pool
  .query(
      `
    SELECT * FROM users WHERE id = $1
    `, [id]
    )
    .then(result => {
      return result.rows[0];
    })
    .catch(err => console.error(err.message));
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  return pool
  .query(
      `
    INSERT INTO users (name, email, password)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `, [user.name, user.email, user.password]
    )
    .then(result => {
      return result.rows[0];
    })
    .catch(err => console.error(err.message));
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  // return getAllProperties(null, 2);
  return pool
  .query(
      `
    SELECT reservations.*, property_reviews.*, avg(property_reviews.rating) as average_rating
    FROM property_reviews
    JOIN reservations ON reservations.id = property_reviews.reservation_id
    JOIN properties ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    GROUP BY reservations.id, properties.title, properties.cost_per_night
    ORDER BY start_date ASC
    LIMIT $2;
    `, [guest_id, limit]
    )
    .then(result => {
      return result.rows;
    })
    .catch(err => console.error(err.message));
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE 1 = 1
  `

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND city LIKE $${queryParams.length}`;
  } 
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `AND owner_id = $${queryParams.length}`;
  } 
  if (options.minimum_price_per_night ) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    queryString += ` AND cost_per_night >= $${queryParams.length}`;
  }
  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryString += ` AND cost_per_night <= $${queryParams.length}`;
  }

  queryString += 
  `
  GROUP BY properties.id
  `
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `

  return pool
    .query(queryString, queryParams)
    .then(result => {
      return result.rows;
    })
    .catch(err => console.log(err.message)
    );
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  // const propertyId = Object.keys(properties).length + 1;
  // property.id = propertyId;
  // properties[propertyId] = property;
  // return Promise.resolve(property);
  return pool
  .query(
    `
    INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code, active)
    VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
    `, [
      property.owner_id, 
      property.title, 
      property.description, 
      property.thumbnail_photo_url, 
      property.cover_photo_url, 
      property.cost_per_night * 100, 
      property.parking_spaces, 
      property.number_of_bathrooms, 
      property.number_of_bedrooms, 
      property.country, 
      property.street, 
      property.city, 
      property.province, 
      property.post_code,
      true
    ]
  )
  .then(result => {
    return result.rows[0];
  })
  .catch(err => console.error(err.message));
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
