/** User class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at)
       VALUES ($1, $2, $3, $4, $5, current_timestamp)
       RETURNING username, password`,
      [username, hashedPassword, first_name, last_name, phone]
    );
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT username, password 
       FROM users
       WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];
    return await bcrypt.compare(password, user.password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users 
       SET last_login_at = current_timestamp
       WHERE username = $1
       RETURNING username, last_login_at`,
      [username]
    );
    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 404)
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone
       FROM users`
    );
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
       FROM users
       WHERE username = $1`,
      [username]
    );
    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 404)
    }
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at, m.to_username,
              u.first_name, u.last_name, u.phone
       FROM messages m
       JOIN users AS u ON to_username = username
       WHERE from_username = $1`,
      [username]
    );
    let messages = result.rows.map(val => ({
      id: val.id,
      body: val.body,
      sent_at: val.sent_at,
      read_at: val.read_at,
      to_user: {
        username: val.to_username,
        first_name: val.first_name,
        last_name: val.last_name,
        phone: val.phone
      }
    }));
    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id, m.body, m.sent_at, m.read_at, m.from_username,
              u.first_name, u.last_name, u.phone
       FROM messages m
       JOIN users AS u ON from_username = username
       WHERE to_username = $1`,
      [username]
    );
    let messages = result.rows.map(val => ({
      id: val.id,
      body: val.body,
      sent_at: val.sent_at,
      read_at: val.read_at,
      from_user: {
        username: val.from_username,
        first_name: val.first_name,
        last_name: val.last_name,
        phone: val.phone
      }
    }));
    return messages;
  }
}


module.exports = User;