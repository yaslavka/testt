const ApiError = require("../error/ApiError");
const jwt_decode = require("jwt-decode");
const { Op } = require("sequelize");

const {
    User
  } = require("../models/models");


  class StructureControllers{

      async structure(req, res, next) {

        const { limit, offset } = req.query;
        const { authorization } = req.headers;
        const token = authorization.slice(7);
        const decodeToken = jwt_decode(token);
        const user = await User.findOne({
          where: { username: decodeToken.username },
        });
        const result = await User.findAll({
          where:{referal_id: user.id, id: {[Op.not]: 1} }
        })
        return res.json({ items: result });

      }
      async project(req, res, next) {
        const {id} = req.query;

        const user =await User.findOne( id );
        const balance = {before: user.balance, after: user.balance}
        let val = 9
        const a ={0:0}
        const b = {0:1}
        const ab= {0: {a, b,}}


        const denomination = a
        const request_id= {id: 1000}
        const next_request_id = Math.floor(Math.random() * request_id.id)
        const paytable = {
          1: {
            5:2,
            6: 5,
            7: 10,
            8: 18,
            9: 24,
            10: 27,
            11: 30,
            12: 30,
            13: 37,
            14: 37,
            15: 50
          },
          2: {
            5: 1.2,
            6: 3,
            7: 6,
            8: 10,
            9: 12.5,
            10: 16,
            11: 20,
            12: 20,
            13: 30,
            14: 30,
            15: 35
          },
          3: {
            5: 1,
            6: 2.5,
            7: 5,
            8: 8,
            9: 10,
            10: 12.5,
            11: 15,
            12: 15,
            13: 20,
            14: 20,
            15: 25
          },
          4: {
            5: 0.7,
            6: 1.2,
            7: 2.5,
            8: 3.5,
            9: 7,
            10: 11,
            11: 12.5,
            12: 12.5,
            13: 15,
            14: 15,
            15: 20
          },
          5: {
            5: 0.5,
            6: 1,
            7: 2,
            8: 3,
            9: 6,
            10: 8,
            11: 9,
            12: 9,
            13: 10,
            14: 10,
            15: 12
          },
          6: {
            5: 0.4,
            6: 0.8,
            7: 1.5,
            8: 2.5,
            9: 4.5,
            10: 5.5,
            11: 6,
            12: 6,
            13: 7,
            14: 7,
            15: 8
          },
          7: {
            5: 0.3,
            6: 0.7,
            7: 1.2,
            8: 2,
            9: 3.5,
            10: 3.8,
            11: 4.5,
            12: 4.5,
            13: 5,
            14: 5,
            15: 6
          },
          8: {
            5: 0.2,
            6: 0.5,
            7: 1,
            8: 1.5,
            9: 2.5,
            10: 2.7,
            11: 3,
            12: 3,
            13: 3.5,
            14: 3.5,
            15: 5
          },
          0: {}
        }
        const bets = {
          1:{
            0: 0.1,
            1: 0.2,
            2: 0.3,
            3: 0.5,
            4: 0.7,
            5: 1,
            6: 2,
            7: 3,
            8: 5,
            9: 7.5,
            10: 10,
            11: 20,
            12: 30,
            13: 50,
            14: 75,
            15: 100,
            16: 200,
            17: 300,
            18: 500
          }
        }
        const directory={
          paytable,
          rtp: 96.33
        }
        const symbols = {
          0:{
            0:{
              code: Math.floor(Math.random() * val)
            },
            1: {
              code: Math.floor(Math.random() * val)
            },
            2: {
              code: Math.floor(Math.random() * val)
            },
            3: {
              code: Math.floor(Math.random() * val)
            },
            4: {
              code: Math.floor(Math.random() * val)
            },
            5: {
              code: Math.floor(Math.random() * val)
            },
            6: {
              code: Math.floor(Math.random() * val)
            },
          },
          1:{
            0:{
              code: Math.floor(Math.random() * val)
            },
            1: {
              code: Math.floor(Math.random() * val)
            },
            2: {
              code: Math.floor(Math.random() * val)
            },
            3: {
              code: Math.floor(Math.random() * val)
            },
            4: {
              code: Math.floor(Math.random() * val)
            },
            5: {
              code: Math.floor(Math.random() * val)
            },
            6: {
              code: Math.floor(Math.random() * val)
            },
          },
          2:{
            0:{
              code: Math.floor(Math.random() * val)
            },
            1: {
              code: Math.floor(Math.random() * val)
            },
            2: {
              code: Math.floor(Math.random() * val)
            },
            3: {
              code: Math.floor(Math.random() * val)
            },
            4: {
              code: Math.floor(Math.random() * val)
            },
            5: {
              code: Math.floor(Math.random() * val)
            },
            6: {
              code: Math.floor(Math.random() * val)
            },
          },
          3:{
            0:{
              code: Math.floor(Math.random() * val)
            },
            1: {
              code: Math.floor(Math.random() * val)
            },
            2: {
              code: Math.floor(Math.random() * val)
            },
            3: {
              code: Math.floor(Math.random() * val)
            },
            4: {
              code: Math.floor(Math.random() * val)
            },
            5: {
              code: Math.floor(Math.random() * val)
            },
            6: {
              code: Math.floor(Math.random() * val)
            },
          },
          4:{
            0:{
              code: Math.floor(Math.random() * val)
            },
            1: {
              code: Math.floor(Math.random() * val)
            },
            2: {
              code: Math.floor(Math.random() * val)
            },
            3: {
              code: Math.floor(Math.random() * val)
            },
            4: {
              code: Math.floor(Math.random() * val)
            },
            5: {
              code: Math.floor(Math.random() * val)
            },
            6: {
              code: Math.floor(Math.random() * val)
            },

          },
          5:{
            0:{
              code: Math.floor(Math.random() * val)
            },
            1: {
              code: Math.floor(Math.random() * val)
            },
            2: {
              code: Math.floor(Math.random() * val)
            },
            3: {
              code: Math.floor(Math.random() * val)
            },
            4: {
              code: Math.floor(Math.random() * val)
            },
            5: {
              code: Math.floor(Math.random() * val)
            },
            6: {
              code: Math.floor(Math.random() * val)
            },
          },
          6:{
            0:{
              code: Math.floor(Math.random() * val)
            },
            1: {
              code: Math.floor(Math.random() * val)
            },
            2: {
              code: Math.floor(Math.random() * val)
            },
            3: {
              code: Math.floor(Math.random() * val)
            },
            4: {
              code: Math.floor(Math.random() * val)
            },
            5: {
              code: Math.floor(Math.random() * val)
            },
            6: {
              code: Math.floor(Math.random() * val)
            },
          }
        }
        const pos ={

        }
        const drop = {symbols:{},}
        const init = {bet:bets["1"]["10"], fixed_bet:bets["1"]["5"],ranges:{bet:bets, denomination:b},currency: "DEMO", restorestate: false, next_request_id, directory, symbols }
        if (init){
          return res.json({balance, denomination,init });
        }
        if (!init){
          return res.json({balance, denomination,drop });
        }


    }
  }

  
module.exports = new StructureControllers();