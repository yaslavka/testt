const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const { User, Key, Matrix_Table, Matrix } = require("../models/models");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");

const generateJwt = (id, email, username, first_name, last_name, referral) => {
  return jwt.sign(
    {
      id,
      email: email,
      first_name: first_name,
      last_name: last_name,
      referral: referral,
      username: username,
    },
    process.env.SECRET_KEY,
    { expiresIn: "24h" }
  );
};

async function highCheck(level, user, idCreateUser) {
  const parent = await User.findOne({ where: { id: user.referal_id } });
  const parentSecond =
    parent.id === parent.referal_id
      ? parent
      : await User.findOne({ where: { id: parent.referal_id } });
  const parentThird =
    parentSecond.id === parentSecond.referal_id
      ? parentSecond
      : await User.findOne({
          where: { id: parentSecond.referal_id },
        });
  let bool = false;

  switch (level) {
    case "1":
      if (user.referal_id === idCreateUser) {
        bool = true;
      }
      break;
    case "2":
      if (parent.referal_id === idCreateUser) {
        bool = true;
      }
      break;
    case "3":
      if (parentSecond.referal_id === idCreateUser) {
        bool = true;
      }
      break;
    case "4":
      if (parentThird.referal_id === idCreateUser) {
        bool = true;
      }
      break;
  }
  return bool;
}

class UserController {
  async registration(req, res, next) {
    const {
      email,
      first_name,
      last_name,
      password,
      phone,
      referral,
      username,
    } = req.body;

    if (
      !email ||
      !password ||
      !last_name ||
      !first_name ||
      !phone ||
      !referral ||
      !username
    ) {
      return next(ApiError.badRequest("Не все поля заполнены"));
    }
    const candidate =
      (await User.findOne({ where: { email } || { username } })) || null;
    if (candidate) {
      return next(ApiError.badRequest("Такой пользователь уже существует"));
    }
    const hashPassword = await bcrypt.hash(password, 5);
    const referralUser = await User.findOne({ where: { username: referral } });
    if (!referralUser) {
      return next(ApiError.badRequest("Такой пользователь не существует"));
    }
    const user = await User.create({
      email,
      username,
      first_name,
      last_name,
      password: hashPassword,
      phone,
      referal_id: referralUser.id,
    });
    // const basket = await Basket.create({userId: user.id})
    const access_token = generateJwt(
      user.id,
      user.email,
      user.username,
      user.first_name,
      user.last_name,
      user.referral
    );
    return res.json({ access_token });
  }
  async addKey(req, res, next) {
    const { username, level, password, phone } = req.body;
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const decodeToken = jwt_decode(token);
    let bool;

    if (!level || !password || !phone || !username) {
      return next(ApiError.badRequest("Не все поля заполнены"));
    }
    const userId = (
      await User.findOne({ where: { username: decodeToken.username } })
    )?.id;
    const userKey = await User.findOne({ where: { username } });
    if (!userKey) {
      return next(ApiError.badRequest("Такой пользователь не существует"));
    }

    if (phone !== userKey.phone) {
      return next(ApiError.badRequest("У этого пользователя другой телефон"));
    }

    if (userId !== 1) {
      await highCheck(level, userKey, userId).then((data) => (bool = data));
      if (!bool) {
        return next(
          ApiError.badRequest(
            `Вы не можете создать лицензию ${level} уровня для этого пользователя`
          )
        );
      }
      const candidate = await Matrix_Table.findAll({
        where: { userId: userId },
      });
      const countCandidate = candidate.length;
      if (countCandidate === 0) {
        return next(
          ApiError.badRequest(`Вы не можете создать лицензию ${level} уровня`)
        );
      }

      const keyDublicate = await Key.findOne({ where: { userId, level } });
      console.log(keyDublicate);
      if (keyDublicate) {
        return next(
          ApiError.badRequest(
            `Вы уже создали лицензию ${level} уровня для этого пользователя`
          )
        );
      }
      const countKeys = (
        await Key.findAll({ where: { userId, level: countCandidate } })
      ).length;
      if (countKeys < 4 && level <= countCandidate) {
        const hashPassword = await bcrypt.hash(password, 5);
        const key = await Key.create({
          username,
          password: hashPassword,
          phone,
          userId,
          level,
        });
        return res.json(key);
      } else {
        return next(ApiError.badRequest("Вы не можете создать лицензию"));
      }
    } else {
      const hashPassword = await bcrypt.hash(password, 5);
      const key = await Key.create({
        username,
        password: hashPassword,
        phone,
        userId,
        level,
      });
      return res.json(key);
    }
  }
  async activeKey(req, res, next) {
    const { username, password, phone } = req.body;
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const decodeToken = jwt_decode(token);

    if (!password || !phone || !username) {
      return next(ApiError.badRequest("Не все поля заполнены"));
    }
    const userToken = await User.findOne({
      where: { username: decodeToken.username },
    });
    const user = await User.findOne({ where: { username, phone } });
    if (!user) {
      return next(ApiError.badRequest("Такой пользователь не существует"));
    }
    const candidate = await Matrix_Table.findAll({
      where: { userId: userToken.id },
    });
    const level = candidate.length + 1;
    const key = await Key.findOne({
      where: { username: userToken.username, userId: user.id, level },
    });

    const parentLevel = await Matrix_Table.findAll({
      where: { userId: userToken.referal_id },
    });

    if (!key) {
      return next(ApiError.badRequest("Такой Лицензии не существует"));
    }
    if (username !== decodeToken.username && key.phone !== userToken.phone) {
      return next(
        ApiError.badRequest("лицензию пытается использовать другой пользователь")
      );
    }
    let comparePassword = bcrypt.compareSync(password, key.password);
    if (!comparePassword) {
      return next(ApiError.badRequest("Неправильная лицензия"));
    }

    const matrix_parent_id = await Matrix.findAll({
      where: { userId: userToken.referal_id },
    });

    const userChildes = await Matrix_Table.findAll({
      where: { matrix_parent_id: null },
      include: { model: User, as: "user", where: { referal_id: userToken.id } },
    });
    const userChildesMatrix = await Matrix.findAll({
      where: { parent_id: null },
      include: { model: User, as: "user", where: { referal_id: userToken.id } },
    });

    const keyDublicate = await Matrix_Table.findOne({
      where: { userId: { userId: userToken.id, type_matrix_id: key.level } },
    });

    if (keyDublicate) {
      return next(ApiError.badRequest("Вы уже активировали эту лицензию"));
    }

    if (parentLevel.length >= level) {
      const active_key = await Matrix_Table.create({
        can_buy: true,
        is_active: true,
        count: 1,
        userId: userToken.id,
        type_matrix_id: key.level,
        matrix_parent_id: matrix_parent_id[key.level - 1].id,
      });
      const matrixValue = await Matrix.create({
        side_matrix: 0,
        parent_id: matrix_parent_id[key.level - 1].id,
        userId: userToken.id,
      });
      if (userChildes.length > 0) {
        userChildes.map(async (i) => {
          i.matrix_parent_id = matrixValue.id;
          let update = {
            id: i.dataValues.id,
            is_active: i.dataValues.id,
            can_buy: i.dataValues.can_buy,
            count: i.dataValues.count,
            matrix_parent_id: i.dataValues.matrix_parent_id,
            type_matrix_id: i.dataValues.type_matrix_id,
          };
          await Matrix_Table.update(update, { where: { id: i.id } });
        });
        userChildesMatrix.map(async (i) => {
          i.parent_id = matrixValue.id;
          let update = {
            id: i.dataValues.id,
            matrix_essence: i.dataValues.matrix_essence,
            side_matrix: i.dataValues.side_matrix,
            parent_id: i.dataValues.parent_id,
          };
          await Matrix.update(update, { where: { id: i.id } });
        });
      }
    } else {
      const active_key = await Matrix_Table.create({
        can_buy: true,
        is_active: true,
        count: 1,
        userId: userToken.id,
        type_matrix_id: key.level,
        matrix_parent_id: null,
      });
      const matrixValue = await Matrix.create({
        side_matrix: 0,
        parent_id: null,
        userId: userToken.id,
      });
      if (userChildes.length > 0) {
        userChildes.map(async (i) => {
          i.matrix_parent_id = matrixValue.id;
          let update = {
            id: i.dataValues.id,
            is_active: i.dataValues.id,
            can_buy: i.dataValues.can_buy,
            count: i.dataValues.count,
            matrix_parent_id: i.dataValues.matrix_parent_id,
            type_matrix_id: i.dataValues.type_matrix_id,
          };
          await Matrix_Table.update(update, { where: { id: i.id } });
        });
        userChildesMatrix.map(async (i) => {
          i.parent_id = matrixValue.id;
          let update = {
            id: i.dataValues.id,
            matrix_essence: i.dataValues.matrix_essence,
            side_matrix: i.dataValues.side_matrix,
            parent_id: i.dataValues.parent_id,
          };
          await Matrix.update(update, { where: { id: i.id } });
        });
      }
    }

    return res.json(true);
  }
  async login(req, res, next) {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return next(ApiError.internal("Такой пользователь не найден"));
    }
    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.internal("Неверный пароль"));
    }
    const access_token = generateJwt(
      user.id,
      user.email,
      user.username,
      user.first_name,
      user.last_name,
      user.referral
    );
    const w = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return res.json({ access_token, w });
  }
  async inviter(req, res, next) {
    const { username } = req.query;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return next(ApiError.internal("Такой пользователь не найден"));
    }
    let result = {
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
    };
    return res.json(result);
  }
  async user(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    try {
      const { username } = jwt_decode(token);
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return next(ApiError.internal("Такой пользователь не найден"));
      }
      const matrixUser = await Matrix_Table.findAll({
        where: { userId: user.id },
      });
      let referal;
      const parent = await User.findOne({ where: { id: user.referal_id } });
      const parentSecond =
        parent.id === parent.referal_id
          ? parent
          : await User.findOne({ where: { id: parent.referal_id } });
      const parentThird =
        parentSecond.id === parentSecond.referal_id
          ? parentSecond
          : await User.findOne({
              where: { id: parentSecond.referal_id },
            });
      const parentFour =
        parentThird.id === parentThird.referal_id
          ? parentSecond
          : await User.findOne({
              where: { id: parentThird.referal_id },
            });
      switch (matrixUser.length) {
        case 0:
          referal = parent;
          break;
        case 1:
          referal = parentSecond;
          break;
        case 2:
          referal = parentThird;
          break;
        case 3:
          referal = parentFour;
          break;
        case 4:
          referal = parent;
          break;
        default:
          break;
      }

      user.dataValues.referal = referal;
      return res.json(user);
    } catch (error) {
      return next(ApiError.internal(error));
    }
  }

  async avatar(req, res, next) {
    const { avatar } = req.files;
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const decodeToken = jwt_decode(token);
    const user = await User.findOne({
      where: { username: decodeToken.username },
    });
    let fileName = uuid.v4() + ".jpg";
    avatar.mv(path.resolve(__dirname, "..", "files", "images", fileName));
    let update = { avatar: fileName };
    await User.update(update, { where: { id: user.id } });
    return res.json("Аватар успешно загружен");
  }

  async fio(req, res, next) {
    const { firstName, lastName } = req.body;
    if (!firstName && !lastName) {
      return next(ApiError.internal("Поля не заполнены"));
    }
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const decodeToken = jwt_decode(token);
    const user = await User.findOne({
      where: { username: decodeToken.username },
    });
    let update = {}
    if (!firstName && lastName){
      update = { last_name: lastName };
    } else if (firstName && !lastName){
      update = {first_name: firstName };
    } else {
      update = { last_name: lastName, first_name: firstName };
    }
    const updatedUser = await User.update(update, { where: { id: user.id } });
    return res.json(updatedUser)
  }
  async links(req, res, next) {
    const { instagram, telegram, vk } = req.body;
    if (!instagram && !telegram && !vk) {
      return next(ApiError.internal("Поля не заполнены"));
    }
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const decodeToken = jwt_decode(token);
    let update = {}
    if (!instagram && !telegram && vk){
      update = {vkontakte:vk}
    } else if(!instagram && telegram && !vk){
      update = {telegram}
    } else if(instagram && !telegram && !vk){
      update = {instagram}
    } else if (instagram && telegram && !vk){
      update = {instagram, telegram}
    } else if (instagram && !telegram && vk){
      update = {instagram, vkontakte:vk}
    } else if (!instagram && telegram && vk){
      update = {telegram, vkontakte:vk}
    } else {
      update = {telegram, instagram, vkontakte:vk}
    }
    const user = await User.findOne({
      where: { username: decodeToken.username },
    });
    const updatedUser = await User.update(update, { where: { id: user.id } });
    return res.json(updatedUser)
  }

  async description (req, res, next){
    const { description } = req.body;
    if (!description) {
      return next(ApiError.internal("Поля не заполнены"));
    }
    const { authorization } = req.headers;
    const token = authorization.slice(7);
    const decodeToken = jwt_decode(token);
    const user = await User.findOne({
      where: { username: decodeToken.username },
    });
    let update = {description}
    const updatedUser = await User.update(update, { where: { id: user.id } });
    return res.json(updatedUser)
  }

  // async restorePassword(req, res, next){
  //   const {password} = req.body;
  //   console.log(req.body);
  //   const { authorization } = req.headers;
  //   const token = authorization.slice(7);
  //   const decodeToken = jwt_decode(token);
  //   const user = await User.findOne({
  //     where: { username: decodeToken.username },
  //   });
  //   const hashPassword = await bcrypt.hash(password, 5);
  //   let update = {password:hashPassword}
  //   await User.update(update, { where: { id: user.id } });
  // }
}

module.exports = new UserController();
