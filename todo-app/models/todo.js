"use strict";

module.exports = (sequelize, DataTypes) => {
  const Todo = sequelize.define("Todo", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Todo.addTodo = async function ({ title, dueDate }) {
    return await Todo.create({ title, dueDate });
  };

  Todo.getTodos = async function () {
    return await Todo.findAll({ order: [["id", "ASC"]] });
  };

  Todo.setCompletionStatus = async function (id, completed) {
    const todo = await Todo.findByPk(id);
    if (!todo) throw new Error("Todo not found");
    return await todo.update({ completed });
  };

  Todo.deleteTodo = async function (id) {
    const todo = await Todo.findByPk(id);
    if (!todo) throw new Error("Todo not found");
    return await todo.destroy();
  };

  return Todo;
};
