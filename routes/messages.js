const express = require('express');
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require('../models/user');
const Message = require('../models/message');
const { ensureLoggedIn } = require('../middleware/auth');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id',
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      let username = req.user.username;
      let message = await Message.get(req.params.id);
      if (messaage.from_user.username !== username && message.to_user.username !== username) {
        throw new ExpressError('Not allowed to read message', 401);
      }
      return res.json({ message: message })
    } catch (err) {
      return next(err);
    }
  });

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/',
  ensureLoggedIn, async (req, res, next) => {
    try {
      let from_username = req.user.username;
      let { to_username, body } = req.body;
      let message = await Message.create({
        from_username, to_username, message
      });
      return res.json({ message: message })
    } catch (err) {
      return next(err);
    }
  })

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read',
  ensureLoggedIn, async (req, res, next) => {
    try {
      let username = req.user.username;
      let message = await Message.get(req.params.id);
      if (message.to_user.username !== username) {
        throw new ExpressError('Cannot set message too read', 401);
      }
      message = await Message.markRead(req.params.id);
      return res.json({ message });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;