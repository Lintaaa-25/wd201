'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {}

    static async addTodo({ title, dueDate }) {
      return await this.create({ title, dueDate, completed: false });
    }

    static async setCompletionStatus(id, completed) {
      const todo = await this.findByPk(id);
      if (!todo) throw new Error('Todo not found');
      return await todo.update({ completed });
    }

    static async deleteTodo(id) {
      return await this.destroy({ where: { id } });
    }

    static async getTodos() {
      const today = new Date().toISOString().split('T')[0];
      const allTodos = await this.findAll({ order: [['id', 'ASC']] });

      return {
        overdue: allTodos.filter(todo => todo.dueDate < today && !todo.completed),
        dueToday: allTodos.filter(todo => todo.dueDate === today && !todo.completed),
        dueLater: allTodos.filter(todo => todo.dueDate > today && !todo.completed),
        completed: allTodos.filter(todo => todo.completed)
      };
    }
  }

  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: { notEmpty: true }
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'Todo'
    }
  );
  return Todo;
};
