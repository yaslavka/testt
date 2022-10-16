const ApiError = require("../error/ApiError");

const {
    News,
    NewsImg
  } = require("../models/models");


  class NewsControllers{

      async getBlock(req, res, next) {
        
        const news = await News.findAll({include:{model:NewsImg, as:'img'}});
        return res.json({ items: news });
      }
  }

  
module.exports = new NewsControllers();