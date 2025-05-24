
/* eslint-disable require-jsdoc */
'use strict';
const {
  Model, Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
       static associate(models) {
        Todo.belongsTo(models.User,{
          foreignKey: 'userId'
        })

          }

    static addTodo({title, dueDate, userId}) {
      return this.create({title: title, dueDate: dueDate, completed: false,userId});
    }

    static getTodos(userId){
  return this.findAll({ where: { userId } });
}

    static async overdue(userId) {
  const today = new Date().toISOString().split("T")[0];
  return await Todo.findAll({
    where: {
      dueDate: { [Op.lt]: today },
      completed: false,
      userId,
    },
  });
}

   static async dueToday(userId) {
  const today = new Date().toISOString().split("T")[0];
  return await Todo.findAll({
    where: {
      dueDate: { [Op.eq]: today },
      completed: false,
      userId,
    },
  });
} 

   static async dueLater(userId) {
  const today = new Date().toISOString().split("T")[0];
  return await Todo.findAll({
    where: {
      dueDate: { [Op.gt]: today },
      completed: false,
      userId,
    },
  });
}

    static async remove(id) {
      return this.destroy({
        where: {
          id,
        },
      })
    }

    static async completedItems(userId){
      return this.findAll({
        where: {
          completed: true,
          userId,
        }
      })
    }
    setCompletionStatus(receiver) {
      return this.update({ completed: receiver });
    }
    
  }
  Todo.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "Title cannot be null" },
      notEmpty: { msg: "Title cannot be empty" }
    }
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: "Due date cannot be null" },
      isDate: { msg: "Must be a valid date" }
    }
  },
  completed: DataTypes.BOOLEAN,
}, {
  sequelize,
  modelName: 'Todo',
});

  return Todo;
};
