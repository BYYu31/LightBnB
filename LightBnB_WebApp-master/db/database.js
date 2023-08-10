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
  // let resolvedUser = null;
  // for (const userId in users) {
  //   const user = users[userId];
  //   if (user.email.toLowerCase() === email.toLowerCase()) {
  //     resolvedUser = user;
  //   }
  // }
  // return Promise.resolve(resolvedUser);
  return pool.
    query(
      `
    SELECT * FROM users WHERE email = $1
    `, [email]
    )
    .then(result => {
      console.log('get user with email');
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
  return pool.
    query(
      `
    SELECT * FROM users WHERE id = $1
    `, [id]
    )
    .then(result => {
      console.log('get users with id');
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
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);

  //   INSERT INTO  users (name, email, password)
  // VALUES 
  // ('Eva Stanley', 'sebastianguerra@ymail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.')
  return pool.
    query(
      `
    INSERT INTO users (name, email, password)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `, [user.name, user.email, user.password]
    )
    .then(result => {
      console.log('test for add user', result.rows[0]);
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
  return pool.
    query(
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
      console.log('test for reservations');
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
  return pool
    .query(
      `
    SELECT * FROM properties
    LIMIT $1
    `, [limit]
    )
    .then(result => {
      // console.log(result.rows);
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
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
