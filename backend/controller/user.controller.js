const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const {sendResponseError} = require('../middleware/middleware')
const {checkPassword, newToken} = require('../utils/utility.function')

const signUpUser = async (req, res) => {

  const {email, fullName, userName, password} = req.body
  try {
    const hash = await bcrypt.hash(password, 8)

    await User.create({...req.body, password: hash})
    res.status(201).send({message:'Sucessfully account opened '})
    return
  } catch (err) {
    console.log('Eorror : ', err)
    sendResponseError(500, {message:'Something wrong please try again'}, res)
    return
  }
}

const signInUser = async (req, res) => {
  const {password, email} = req.body
  try {
    const user = await User.findOne({email})
    if (!!!user) {
      sendResponseError(400, {message:'You have to Sign up first !'}, res)
    }

    const same = await checkPassword(password, user.password)
    if (same) {
      let token = newToken(user)
      res.status(200).send({status: 'ok',user_id:user._id, username:user.userName, token})
      return
    }
    sendResponseError(400, {message:'InValid password !'}, res)
  } catch (err) {
    console.log('EROR', err)
    sendResponseError(500, `Error ${err}`, res)
  }
}

const getUser = async (req, res) => {
  res.status(200).send({user: req.user})
}
module.exports = {signUpUser, signInUser, getUser}
